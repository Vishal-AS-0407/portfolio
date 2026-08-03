/*
# Create contact_messages table (single-tenant, no auth)

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, optional - sender name)
  - `email` (text, optional - sender email)
  - `subject` (text, not null - message subject)
  - `message` (text, not null - message body)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_messages`.
- Allow anon + authenticated INSERT only (public can submit messages).
- No SELECT/UPDATE/DELETE for anon or authenticated (messages are private to the site owner).
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);