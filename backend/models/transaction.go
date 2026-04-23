package models

import "time"

type Transaction struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time  `json:"-"`
	UpdatedAt   time.Time  `json:"-"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
	UserID      uint       `gorm:"not null" json:"user_id"`
	Amount      float64    `gorm:"not null" json:"amount"`
	Category    string     `gorm:"not null" json:"category"`
	Description string     `json:"description"`
	Date        string     `gorm:"not null" json:"date"`
	Type        string     `gorm:"not null" json:"type"`
}