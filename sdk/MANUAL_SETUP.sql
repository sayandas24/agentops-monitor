-- Manual Setup: Insert test user and project directly into Supabase
-- Copy and paste these queries into Supabase SQL Editor

-- 1. Insert a test user
-- Password is: testpassword123 (hashed with bcrypt)
INSERT INTO users (id, email, hashed_password, full_name, is_active, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'test@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfL0P.Gvs2',
    'Test User',
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert a test project with API key
INSERT INTO projects (id, name, description, api_key, is_active, owner_id, created_at)
VALUES (
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    'Test Project',
    'Project for SDK testing',
    'agentops_test_key_12345678901234567890',
    true,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NOW()
) ON CONFLICT (api_key) DO NOTHING;

-- 3. Verify the data was inserted
SELECT 
    u.email,
    p.name as project_name,
    p.api_key
FROM users u
JOIN projects p ON p.owner_id = u.id
WHERE u.email = 'test@example.com';

-- ============================================
-- YOUR API KEY TO USE IN SDK:
-- agentops_test_key_12345678901234567890
-- ============================================
