package handlers

import (
	"net/http"

	"fintrack/backend/config"
	"fintrack/backend/models"

	"github.com/gin-gonic/gin"
)

type BudgetInput struct {
	CategoryID uint    `json:"category_id" binding:"required"`
	Amount     float64 `json:"amount" binding:"required,gt=0"`
	Month      string  `json:"month" binding:"required"`
}

func GetBudgets(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	month := c.Query("month")

	query := config.DB.Where("user_id = ?", userID)
	if month != "" {
		query = query.Where("month = ?", month)
	}

	var budgets []models.Budget
	query.Find(&budgets)
	c.JSON(http.StatusOK, budgets)
}

func CreateBudget(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input BudgetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	budget := models.Budget{
		UserID:     userID,
		CategoryID: input.CategoryID,
		Amount:     input.Amount,
		Month:      input.Month,
	}

	if result := config.DB.Create(&budget); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create budget"})
		return
	}

	c.JSON(http.StatusCreated, budget)
}

func UpdateBudget(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var budget models.Budget
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "budget not found"})
		return
	}

	var input BudgetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	budget.CategoryID = input.CategoryID
	budget.Amount = input.Amount
	budget.Month = input.Month

	config.DB.Save(&budget)
	c.JSON(http.StatusOK, budget)
}

func DeleteBudget(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var budget models.Budget
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "budget not found"})
		return
	}

	config.DB.Delete(&budget)
	c.JSON(http.StatusOK, gin.H{"message": "budget deleted"})
}