-- Initialize InBot database with pgvector extension

-- Create pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create uuid extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions
SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');

