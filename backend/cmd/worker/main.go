package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/roadeye/backend/internal/db"
)

type HazardNotificationJob struct {
	HazardID  string  `json:"hazard_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Type      string  `json:"type"`
	Severity  string  `json:"severity"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to Redis
	redisClient := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_HOST", "localhost") + ":" + getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	// Connect to database
	dbConfig := db.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "roadeye"),
		Password: getEnv("DB_PASSWORD", "roadeye_password"),
		DBName:   getEnv("DB_NAME", "roadeye_db"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}

	database, err := db.NewPostgresDB(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	log.Println("Worker started, listening for jobs...")

	// Subscribe to hazard notification channel
	pubsub := redisClient.Subscribe(ctx, "hazard:notifications")
	defer pubsub.Close()

	ch := pubsub.Channel()

	for msg := range ch {
		var job HazardNotificationJob
		if err := json.Unmarshal([]byte(msg.Payload), &job); err != nil {
			log.Printf("Failed to unmarshal job: %v", err)
			continue
		}

		log.Printf("Processing notification for hazard %s", job.HazardID)
		
		// Process notification job
		if err := processNotification(ctx, database, &job); err != nil {
			log.Printf("Failed to process notification: %v", err)
		}
	}
}

func processNotification(ctx context.Context, db *db.DB, job *HazardNotificationJob) error {
	// TODO: Implement notification logic
	// 1. Find users within radius using PostGIS
	// 2. Get their device tokens
	// 3. Send FCM notifications
	// 4. Log notifications in database
	
	log.Printf("Would send notifications for %s hazard at (%.6f, %.6f)",
		job.Type, job.Latitude, job.Longitude)
	
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
