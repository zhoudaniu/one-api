package controller

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/songquanpeng/one-api/common/ctxkey"
	"github.com/songquanpeng/one-api/common/logger"
	"github.com/songquanpeng/one-api/model"
)

type CreateOrderRequest struct {
	Amount int `json:"amount" binding:"required,min=1,max=100000"`
}

type CreateOrderResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Amount      string `json:"amount"`
		Address     string `json:"address"`
		ExpiredTime int64  `json:"expired_time"`
	} `json:"data"`
}

// CreateTopUpOrder 创建充值订单
func CreateTopUpOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
		})
		return
	}

	userId := c.GetInt(ctxkey.Id)

	// 调用外部钱包API创建订单
	walletAPI := "http://api.smartlinking.ai/one-api/wallet/top-up/order"

	// 构建请求体
	reqBody, err := json.Marshal(map[string]int{
		"amount": req.Amount,
	})
	if err != nil {
		logger.Error(c, "构建请求体失败: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建订单失败",
		})
		return
	}

	httpReq, err := http.NewRequestWithContext(context.Background(), "POST", walletAPI, bytes.NewBuffer(reqBody))
	if err != nil {
		logger.Error(c, "创建请求失败: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建订单失败",
		})
		return
	}

	// 复制原始请求的 Cookie
	httpReq.Header.Set("Content-Type", "application/json")
	if cookie, err := c.Cookie("session"); err == nil {
		httpReq.Header.Set("Cookie", "session="+cookie)
	}

	// 设置超时，跟随重定向，跳过SSL验证
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return nil
		},
	}
	resp, err := client.Do(httpReq)
	if err != nil {
		logger.Error(c, "调用钱包API失败: "+err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "调用钱包API失败: " + err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error(c, "读取钱包API响应失败: "+err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "读取响应失败",
		})
		return
	}

	logger.Info(c, fmt.Sprintf("钱包API响应状态: %d, 响应: %s", resp.StatusCode, string(body)))

	// 检查响应状态码
	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": fmt.Sprintf("钱包API返回错误: %d", resp.StatusCode),
		})
		return
	}

	var walletResp CreateOrderResponse
	if err := json.Unmarshal(body, &walletResp); err != nil {
		logger.Error(c, "解析响应失败: "+err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "解析响应失败",
		})
		return
	}

	if walletResp.Code != 200 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": walletResp.Message,
		})
		return
	}

	// 保存订单到数据库
	order := &model.TopUpOrder{
		UserId:     userId,
		Amount:     req.Amount,
		Address:    walletResp.Data.Address,
		ExpireTime: time.Now().Unix() + walletResp.Data.ExpiredTime,
		Status:     model.TopUpOrderStatusPending,
	}

	if err := model.CreateTopUpOrder(order); err != nil {
		logger.Error(c, "保存订单失败: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建订单失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"order_id":     order.Id,
			"amount":       walletResp.Data.Amount,
			"address":      walletResp.Data.Address,
			"expired_time": walletResp.Data.ExpiredTime,
		},
	})
}

// GetTopUpOrderStatus 查询充值订单状态
func GetTopUpOrderStatus(c *gin.Context) {
	orderId := c.Param("id")
	if orderId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "订单ID不能为空",
		})
		return
	}

	var order model.TopUpOrder
	if err := model.DB.First(&order, "id = ?", orderId).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "订单不存在",
		})
		return
	}

	userId := c.GetInt(ctxkey.Id)
	if order.UserId != userId {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "无权访问此订单",
		})
		return
	}

	// 检查是否已过期
	if order.Status == model.TopUpOrderStatusPending && time.Now().Unix() > order.ExpireTime {
		model.UpdateTopUpOrderStatus(order.Id, model.TopUpOrderStatusExpired)
		order.Status = model.TopUpOrderStatusExpired
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"order_id": order.Id,
			"amount":   order.Amount,
			"address":  order.Address,
			"status":   order.Status,
			"expire_time": order.ExpireTime,
		},
	})
}

// WebhookTopUpCallback 钱包支付回调（供外部调用）
func WebhookTopUpCallback(c *gin.Context) {
	var req struct {
		Address string `json:"address"`
		Status  string `json:"status"`
		Amount  string `json:"amount"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	// 根据地址查找订单
	order, err := model.GetPendingTopUpOrderByAddress(req.Address)
	if err != nil {
		logger.Error(c, fmt.Sprintf("查找订单失败: %s", err.Error()))
		c.JSON(http.StatusOK, gin.H{
			"code":    200,
			"message": "ok",
		})
		return
	}

	// 更新订单状态
	if err := model.UpdateTopUpOrderStatus(order.Id, model.TopUpOrderStatusPaid); err != nil {
		logger.Error(c, fmt.Sprintf("更新订单状态失败: %s", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新状态失败",
		})
		return
	}

	// 给用户增加额度（金额 * quota_per_unit）
	// TODO: 根据实际的 quota_per_unit 计算
	quota := int64(order.Amount) * 500000 // 默认 1元 = 500000 quota
	if err := model.IncreaseUserQuota(order.UserId, quota); err != nil {
		logger.Error(c, fmt.Sprintf("增加用户额度失败: %s", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "增加额度失败",
		})
		return
	}

	// 记录充值日志
	ctx := context.Background()
	model.RecordLog(ctx, order.UserId, model.LogTypeTopup,
		fmt.Sprintf("在线充值 %d 元", order.Amount))

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "ok",
	})
}
