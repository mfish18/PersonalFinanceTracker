package handlers

import (
	"net/http"

	"fintrack/backend/config"
	"fintrack/backend/models"

	"github.com/gin-gonic/gin"
)

type TransactionInput struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
}

func GetTransactions(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var transactions []models.Transaction
	config.DB.Where("user_id = ?", userID).Order("date desc").Find(&transactions)
	c.JSON(http.StatusOK, transactions)
}

func CreateTransaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input TransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction := models.Transaction{
		UserID:      userID,
		Amount:      input.Amount,
		Category:    input.Category,
		Description: input.Description,
		Date:        input.Date,
		Type:        input.Type,
	}

	if result := config.DB.Create(&transaction); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create transaction"})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

func UpdateTransaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var transaction models.Transaction
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	var input TransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction.Amount = input.Amount
	transaction.Category = input.Category
	transaction.Description = input.Description
	transaction.Date = input.Date
	transaction.Type = input.Type

	config.DB.Save(&transaction)
	c.JSON(http.StatusOK, transaction)
}

func DeleteTransaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var transaction models.Transaction
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	config.DB.Delete(&transaction)
	c.JSON(http.StatusOK, gin.H{"message": "transaction deleted"})
}