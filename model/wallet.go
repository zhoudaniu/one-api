package model

import (
	"time"
)

type TopUpOrder struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	UserId      int    `json:"user_id" gorm:"index"`
	Amount      int    `json:"amount"`                // 充值金额（元）
	Address     string `json:"address"`               // 充值地址
	ExpireTime  int64  `json:"expire_time"`           // 过期时间戳
	Status      int    `json:"status" gorm:"default:1"` // 1=待支付, 2=已支付, 3=已过期
	CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime"`
	PaidAt      int64  `json:"paid_at"`               // 支付时间
}

const (
	TopUpOrderStatusPending = 1
	TopUpOrderStatusPaid    = 2
	TopUpOrderStatusExpired = 3
)

func CreateTopUpOrder(order *TopUpOrder) error {
	return DB.Create(order).Error
}

func GetTopUpOrderById(id int) (*TopUpOrder, error) {
	var order TopUpOrder
	err := DB.First(&order, "id = ?", id).Error
	return &order, err
}

func GetTopUpOrderByIdAndUserId(id int, userId int) (*TopUpOrder, error) {
	var order TopUpOrder
	err := DB.First(&order, "id = ? AND user_id = ?", id, userId).Error
	return &order, err
}

func UpdateTopUpOrderStatus(id int, status int) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == TopUpOrderStatusPaid {
		updates["paid_at"] = time.Now().Unix()
	}
	return DB.Model(&TopUpOrder{}).Where("id = ?", id).Updates(updates).Error
}

func GetPendingTopUpOrderByAddress(address string) (*TopUpOrder, error) {
	var order TopUpOrder
	err := DB.First(&order, "address = ? AND status = ?", address, TopUpOrderStatusPending).Error
	return &order, err
}
