-- Seed data for development/testing
-- Password for all test users: "password123" (bcrypt hash)

INSERT INTO users (id, username, email, password_hash, points) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'john_doe', 'john@example.com', '$2a$10$rqYvN8Z8Z8Z8Z8Z8Z8Z8ZeN8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 120),
    ('550e8400-e29b-41d4-a716-446655440001', 'jane_smith', 'jane@example.com', '$2a$10$rqYvN8Z8Z8Z8Z8Z8Z8Z8ZeN8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 85),
    ('550e8400-e29b-41d4-a716-446655440002', 'bob_wilson', 'bob@example.com', '$2a$10$rqYvN8Z8Z8Z8Z8Z8Z8Z8ZeN8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 45)
ON CONFLICT (id) DO NOTHING;

-- Sample hazards in different locations
INSERT INTO hazards (id, user_id, type, latitude, longitude, severity, description, is_verified, verify_count) VALUES
    ('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'pothole', 37.7749, -122.4194, 'high', 'Large pothole on main street', true, 5),
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'debris', 37.7750, -122.4195, 'medium', 'Fallen tree branch blocking lane', true, 3),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'construction', 37.7751, -122.4196, 'low', 'Road work ahead', false, 1),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'accident', 37.7752, -122.4197, 'high', 'Minor collision, lane blocked', true, 4),
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'pothole', 37.7753, -122.4198, 'medium', 'Deep pothole near intersection', false, 2)
ON CONFLICT (id) DO NOTHING;
