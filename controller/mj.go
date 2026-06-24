package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/songquanpeng/one-api/common/config"
)

// Midjourney 日志结构体
type MjLog struct {
	ID           int64  `json:"id"`
	UserId       int64  `json:"user_id"`
	ChannelId    int64  `json:"channel_id"`
	SubmitTime   int64  `json:"submit_time"`
	StartTime    int64  `json:"start_time"`
	EndTime      int64  `json:"end_time"`
	Type         string `json:"type"`
	Status       string `json:"status"`
	Prompt       string `json:"prompt"`
	PromptEn     string `json:"prompt_en"`
	Description  string `json:"description"`
	Mode         string `json:"mode"`
	AspectRatio  string `json:"aspect_ratio"`
	Index        int    `json:"index"`
	Progress     string `json:"progress"`
	MjId         string `json:"mj_id"`
	ActionButton string `json:"action_button"`
	FailReason   string `json:"fail_reason"`
	Code         int    `json:"code"`
	ImageUrl     string `json:"image_url"`
}

// GetMidjourneyLogs 管理员获取所有 Midjourney 日志
func GetMidjourneyLogs(c *gin.Context) {
	// 检查绘图功能是否启用
	config.OptionMapRWMutex.RLock()
	enableDrawing := config.OptionMap["EnableDrawing"]
	config.OptionMapRWMutex.RUnlock()

	if enableDrawing != "true" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "绘图功能未启用",
		})
		return
	}

	// 返回空数据列表（当前版本暂不支持 Midjourney 日志存储）
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    []MjLog{},
		"total":   0,
	})
}

// GetMidjourneyLogsSelf 普通用户获取自己的 Midjourney 日志
func GetMidjourneyLogsSelf(c *gin.Context) {
	// 检查绘图功能是否启用
	config.OptionMapRWMutex.RLock()
	enableDrawing := config.OptionMap["EnableDrawing"]
	config.OptionMapRWMutex.RUnlock()

	if enableDrawing != "true" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "绘图功能未启用",
		})
		return
	}

	// 返回空数据列表（当前版本暂不支持 Midjourney 日志存储）
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    []MjLog{},
		"total":   0,
	})
}
