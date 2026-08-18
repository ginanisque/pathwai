CREATE TABLE IF NOT EXISTS pathwai_agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id STRING NOT NULL,
  kind STRING NOT NULL CHECK (kind IN ('profile', 'constraint', 'preference', 'conversation', 'action_plan')),
  content STRING NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  embedding VECTOR(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX pathwai_memories_user_updated_idx (user_id, updated_at DESC)
);

CREATE VECTOR INDEX IF NOT EXISTS pathwai_memories_embedding_idx
ON pathwai_agent_memories (embedding);
