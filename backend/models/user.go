package models

import "time"

type User struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time  `json:"-"`
	UpdatedAt   time.Time  `json:"-"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
	DisplayName string     `gorm:"not null" json:"display_name"`
	Email       string     `gorm:"uniqueIndex;not null" json:"email"`
	Password    string     `gorm:"not null" json:"-"`
	Currency    string     `gorm:"default:USD" json:"currency"`
	DateFormat  string     `gorm:"default:MM/DD/YYYY" json:"date_format"`
}