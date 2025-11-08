package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/roadeye/backend/internal/auth"
	"github.com/roadeye/backend/internal/hazards"
	"github.com/roadeye/backend/pkg/models"
)

type HazardHandler struct {
	repo *hazards.Repository
}

func NewHazardHandler(repo *hazards.Repository) *HazardHandler {
	return &HazardHandler{repo: repo}
}

func (h *HazardHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.HazardCreate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	hazard := &models.Hazard{
		ID:          uuid.New(),
		UserID:      userID,
		Type:        req.Type,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		Severity:    req.Severity,
		Description: req.Description,
		IsVerified:  false,
		VerifyCount: 0,
	}

	// TODO: Handle image upload if ImageBase64 is provided
	// Upload to S3 and set hazard.ImageURL

	if err := h.repo.Create(r.Context(), hazard); err != nil {
		http.Error(w, "Failed to create hazard", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteStatus(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"hazard": hazard})
}

func (h *HazardHandler) GetNearby(w http.ResponseWriter, r *http.Request) {
	latStr := r.URL.Query().Get("lat")
	lonStr := r.URL.Query().Get("lon")
	radiusStr := r.URL.Query().Get("radius")

	if latStr == "" || lonStr == "" {
		http.Error(w, "lat and lon parameters required", http.StatusBadRequest)
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		http.Error(w, "Invalid latitude", http.StatusBadRequest)
		return
	}

	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		http.Error(w, "Invalid longitude", http.StatusBadRequest)
		return
	}

	radius := 5.0 // default 5km
	if radiusStr != "" {
		radius, err = strconv.ParseFloat(radiusStr, 64)
		if err != nil {
			http.Error(w, "Invalid radius", http.StatusBadRequest)
			return
		}
	}

	limit := 100
	hazards, err := h.repo.GetNearby(r.Context(), lat, lon, radius, limit)
	if err != nil {
		http.Error(w, "Failed to fetch hazards", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"hazards": hazards})
}

func (h *HazardHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid hazard ID", http.StatusBadRequest)
		return
	}

	hazard, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Hazard not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"hazard": hazard})
}

func (h *HazardHandler) Verify(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	hazardID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid hazard ID", http.StatusBadRequest)
		return
	}

	if err := h.repo.VerifyHazard(r.Context(), hazardID, userID); err != nil {
		http.Error(w, "Failed to verify hazard", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Hazard verified"})
}

func (h *HazardHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	hazardID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid hazard ID", http.StatusBadRequest)
		return
	}

	// TODO: Check if user owns the hazard before deleting
	_ = userID

	if err := h.repo.Delete(r.Context(), hazardID); err != nil {
		http.Error(w, "Failed to delete hazard", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Hazard deleted"})
}
