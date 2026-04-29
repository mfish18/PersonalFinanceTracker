package handlers

import (
	"net/http"

	"fintrack/backend/config"
	"fintrack/backend/models"

	"github.com/gin-gonic/gin"
)

type ProfileInput struct {
	DisplayName string `json:"display_name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
}

type PreferencesInput struct {
	Currency   string `json:"currency" binding:"required"`
	DateFormat string `json:"date_format" binding:"required"`
}

func GetProfile(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func UpdateProfile(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.DisplayName = input.DisplayName
	user.Email = input.Email
	config.DB.Save(&user)
	c.JSON(http.StatusOK, user)
}

func UpdatePreferences(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input PreferencesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.Currency = input.Currency
	user.DateFormat = input.DateFormat
	config.DB.Save(&user)
	c.JSON(http.StatusOK, user)
}