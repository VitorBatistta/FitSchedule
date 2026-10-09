CREATE TABLE personal_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  can_manage_students BOOLEAN NOT NULL DEFAULT true,
  can_manage_appointments BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT personal_trainers_email_unique UNIQUE (email)
);

CREATE INDEX idx_personal_trainers_name ON personal_trainers(name);
CREATE INDEX idx_personal_trainers_active ON personal_trainers(active);
