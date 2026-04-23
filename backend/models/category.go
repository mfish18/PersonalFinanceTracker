package models

import "time"

type Category struct {
	ID        uint       `gorm:"primarykey" json:"id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `gorm:"index" json:"-"`
	UserID    uint       `gorm:"not null" json:"user_id"`
	Name      string     `gorm:"not null" json:"name"`
	Color     string     `gorm:"default:#6b7280" json:"color"`
	Type      string     `gorm:"not null" json:"type"`
}