package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/roadeye/backend/internal/auth"
	"github.com/roadeye/backend/internal/db"
	"github.com/roadeye/backend/internal/handlers"
	"github.com/roadeye/backend/internal/hazards"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Database configuration
	dbConfig := db.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "roadeye"),
		Password: getEnv("DB_PASSWORD", "roadeye_password"),
		DBName:   getEnv("DB_NAME", "roadeye_db"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}

	// Connect to database
	database, err := db.NewPostgresDB(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Initialize JWT manager
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key")
	tokenExpiry, _ := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	refreshExpiry, _ := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h"))
	jwtManager := auth.NewJWTManager(jwtSecret, tokenExpiry, refreshExpiry)

	// Initialize repositories
	hazardRepo := hazards.NewRepository(database)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(database, jwtManager)
	hazardHandler := handlers.NewHazardHandler(hazardRepo)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public routes
	r.Group(func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(jwtManager.AuthMiddleware)

		// Auth routes
		r.Get("/auth/profile", authHandler.GetProfile)

		// Hazard routes
		r.Post("/hazards/report", hazardHandler.Create)
		r.Get("/hazards", hazardHandler.GetNearby)
		r.Get("/hazards/{id}", hazardHandler.GetByID)
		r.Post("/hazards/{id}/verify", hazardHandler.Verify)
		r.Delete("/hazards/{id}", hazardHandler.Delete)
	})

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
