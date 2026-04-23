package models

import "time"

type Budget struct {
	ID         uint       `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time  `json:"-"`
	UpdatedAt  time.Time  `json:"-"`
	DeletedAt  *time.Time `gorm:"index" json:"-"`
	UserID     uint       `gorm:"not null" json:"user_id"`
	CategoryID uint       `gorm:"not null" json:"category_id"`
	Amount     float64    `gorm:"not null" json:"amount"`
	Month      string     `gorm:"not null" json:"month"`
}