package handlers

import (
	"net/http"

	"fintrack/backend/config"
	"fintrack/backend/models"

	"github.com/gin-gonic/gin"
)

type CategoryInput struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color" binding:"required"`
	Type  string `json:"type" binding:"required,oneof=income expense both"`
}

func GetCategories(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var categories []models.Category
	config.DB.Where("user_id = ?", userID).Find(&categories)
	c.JSON(http.StatusOK, categories)
}

func CreateCategory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var input CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		UserID: userID,
		Name:   input.Name,
		Color:  input.Color,
		Type:   input.Type,
	}

	if result := config.DB.Create(&category); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

func UpdateCategory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var category models.Category
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&category); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}

	var input CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category.Name = input.Name
	category.Color = input.Color
	category.Type = input.Type

	config.DB.Save(&category)
	c.JSON(http.StatusOK, category)
}

func DeleteCategory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	id := c.Param("id")

	var category models.Category
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&category); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}

	config.DB.Delete(&category)
	c.JSON(http.StatusOK, gin.H{"message": "category deleted"})
}