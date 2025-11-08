package models

import (
	"time"

	"github.com/google/uuid"
)

type HazardType string

const (
	HazardTypePothole      HazardType = "pothole"
	HazardTypeDebris       HazardType = "debris"
	HazardTypeAccident     HazardType = "accident"
	HazardTypeConstruction HazardType = "construction"
	HazardTypeOther        HazardType = "other"
)

type HazardSeverity string

const (
	HazardSeverityLow    HazardSeverity = "low"
	HazardSeverityMedium HazardSeverity = "medium"
	HazardSeverityHigh   HazardSeverity = "high"
)

type Hazard struct {
	ID          uuid.UUID      `json:"id" db:"id"`
	UserID      uuid.UUID      `json:"user_id" db:"user_id"`
	Type        HazardType     `json:"type" db:"type"`
	Latitude    float64        `json:"latitude" db:"latitude"`
	Longitude   float64        `json:"longitude" db:"longitude"`
	ImageURL    *string        `json:"image_url,omitempty" db:"image_url"`
	Severity    HazardSeverity `json:"severity" db:"severity"`
	Description *string        `json:"description,omitempty" db:"description"`
	IsVerified  bool           `json:"verified" db:"is_verified"`
	VerifyCount int            `json:"verify_count" db:"verify_count"`
	ReportedBy  *string        `json:"reported_by,omitempty" db:"reported_by"`
	CreatedAt   time.Time      `json:"timestamp" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
	Distance    *float64       `json:"distance,omitempty" db:"distance"`
}

type HazardCreate struct {
	Type        HazardType     `json:"type" validate:"required,oneof=pothole debris accident construction other"`
	Latitude    float64        `json:"latitude" validate:"required,latitude"`
	Longitude   float64        `json:"longitude" validate:"required,longitude"`
	Severity    HazardSeverity `json:"severity" validate:"required,oneof=low medium high"`
	Description *string        `json:"description,omitempty" validate:"omitempty,max=500"`
	ImageBase64 *string        `json:"imageBase64,omitempty"`
}

type HazardQuery struct {
	Latitude  float64  `json:"lat" validate:"required,latitude"`
	Longitude float64  `json:"lon" validate:"required,longitude"`
	Radius    *float64 `json:"radius,omitempty" validate:"omitempty,min=0.1,max=50"`
	Limit     *int     `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
}

type DetectionRequest struct {
	ImageBase64 string  `json:"imageBase64" validate:"required"`
	Latitude    float64 `json:"latitude" validate:"required,latitude"`
	Longitude   float64 `json:"longitude" validate:"required,longitude"`
}

type DetectionResponse struct {
	Detected   bool    `json:"detected"`
	Hazard     *Hazard `json:"hazard,omitempty"`
	Confidence float64 `json:"confidence,omitempty"`
}
