-- Initialization script for PostgreSQL database
-- This file is automatically executed when the PostgreSQL container starts for the first time

-- Database ludora and user ludora_user are already created by environment variables
-- No additional initialization needed - Prisma migrations will handle schema creation

-- Optional: You can add custom initialization here if needed
SELECT 'PostgreSQL database initialized successfully for Ludora API' AS status;