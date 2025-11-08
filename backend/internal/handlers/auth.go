package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/roadeye/backend/internal/auth"
	"github.com/roadeye/backend/pkg/models"
)

type AuthHandler struct {
	db         *sql.DB
	jwtManager *auth.JWTManager
}

func NewAuthHandler(db *sql.DB, jwtManager *auth.JWTManager) *AuthHandler {
	return &AuthHandler{
		db:         db,
		jwtManager: jwtManager,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.UserCreate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create user
	user := &models.User{
		ID:           uuid.New(),
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Points:       0,
	}

	query := `
		INSERT INTO users (id, username, email, password_hash, points)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`

	err = h.db.QueryRow(query, user.ID, user.Username, user.Email, user.PasswordHash, user.Points).
		Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		http.Error(w, "Email or username already exists", http.StatusConflict)
		return
	}

	// Generate tokens
	token, err := h.jwtManager.GenerateToken(user.ID, user.Email)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, _ := h.jwtManager.GenerateRefreshToken(user.ID, user.Email)

	response := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.UserLogin
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user by email
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, points, avatar, created_at, updated_at
		FROM users WHERE email = $1
	`

	err := h.db.QueryRow(query, req.Email).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.Points, &user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Check password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate tokens
	token, err := h.jwtManager.GenerateToken(user.ID, user.Email)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, _ := h.jwtManager.GenerateRefreshToken(user.ID, user.Email)

	response := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user := &models.User{}
	query := `
		SELECT id, username, email, points, avatar, created_at, updated_at
		FROM users WHERE id = $1
	`

	err := h.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Username, &user.Email, &user.Points,
		&user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"user": user})
}
