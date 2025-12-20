CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL
);