package hazards

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/roadeye/backend/pkg/models"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, hazard *models.Hazard) error {
	query := `
		INSERT INTO hazards (id, user_id, type, latitude, longitude, image_url, severity, description, reported_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING created_at, updated_at
	`

	return r.db.QueryRowContext(
		ctx, query,
		hazard.ID, hazard.UserID, hazard.Type, hazard.Latitude, hazard.Longitude,
		hazard.ImageURL, hazard.Severity, hazard.Description, hazard.ReportedBy,
	).Scan(&hazard.CreatedAt, &hazard.UpdatedAt)
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*models.Hazard, error) {
	query := `
		SELECT id, user_id, type, latitude, longitude, image_url, severity, description,
		       is_verified, verify_count, reported_by, created_at, updated_at
		FROM hazards
		WHERE id = $1
	`

	hazard := &models.Hazard{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&hazard.ID, &hazard.UserID, &hazard.Type, &hazard.Latitude, &hazard.Longitude,
		&hazard.ImageURL, &hazard.Severity, &hazard.Description, &hazard.IsVerified,
		&hazard.VerifyCount, &hazard.ReportedBy, &hazard.CreatedAt, &hazard.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("hazard not found")
	}
	if err != nil {
		return nil, err
	}

	return hazard, nil
}

func (r *Repository) GetNearby(ctx context.Context, lat, lon, radiusKm float64, limit int) ([]*models.Hazard, error) {
	query := `
		SELECT id, user_id, type, latitude, longitude, image_url, severity, description,
		       is_verified, verify_count, reported_by, created_at, updated_at,
		       ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 as distance
		FROM hazards
		WHERE ST_DWithin(
			location,
			ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
			$3 * 1000
		)
		ORDER BY distance ASC
		LIMIT $4
	`

	rows, err := r.db.QueryContext(ctx, query, lon, lat, radiusKm, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hazards []*models.Hazard
	for rows.Next() {
		hazard := &models.Hazard{}
		var distance float64

		err := rows.Scan(
			&hazard.ID, &hazard.UserID, &hazard.Type, &hazard.Latitude, &hazard.Longitude,
			&hazard.ImageURL, &hazard.Severity, &hazard.Description, &hazard.IsVerified,
			&hazard.VerifyCount, &hazard.ReportedBy, &hazard.CreatedAt, &hazard.UpdatedAt,
			&distance,
		)
		if err != nil {
			return nil, err
		}

		hazard.Distance = &distance
		hazards = append(hazards, hazard)
	}

	return hazards, rows.Err()
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM hazards WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return fmt.Errorf("hazard not found")
	}

	return nil
}

func (r *Repository) VerifyHazard(ctx context.Context, hazardID, userID uuid.UUID) error {
	query := `
		INSERT INTO hazard_verifications (hazard_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (hazard_id, user_id) DO NOTHING
	`

	_, err := r.db.ExecContext(ctx, query, hazardID, userID)
	return err
}

func (r *Repository) GetUsersNearby(ctx context.Context, lat, lon, radiusKm float64) ([]uuid.UUID, error) {
	// This would typically query a user_locations table that tracks recent user positions
	// For now, return empty slice - implement based on your user location tracking strategy
	return []uuid.UUID{}, nil
}
