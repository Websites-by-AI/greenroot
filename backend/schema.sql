-- Private reminder data only: no patient records, documents, drafts or notes.
CREATE TABLE IF NOT EXISTS subscribers (
 key_hash TEXT PRIMARY KEY,
 email TEXT NOT NULL,
 locale TEXT NOT NULL DEFAULT 'en',
 verified INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 0,
 verify_hash TEXT,
 verify_expires TEXT,
 unsubscribe_hash TEXT NOT NULL,
 unsubscribe_cipher TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 consent_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sub_email ON subscribers(email);
CREATE UNIQUE INDEX IF NOT EXISTS sub_verify ON subscribers(verify_hash);
CREATE UNIQUE INDEX IF NOT EXISTS sub_unsubscribe ON subscribers(unsubscribe_hash);
CREATE TABLE IF NOT EXISTS jobs (
 key_hash TEXT NOT NULL,
 id TEXT NOT NULL,
 lead_id TEXT NOT NULL,
 label TEXT NOT NULL,
 step TEXT NOT NULL,
 due TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt TEXT NOT NULL,
 lease_until TEXT,
 last_error TEXT,
 provider_id TEXT,
 sent_at TEXT,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(key_hash,id)
);
CREATE INDEX IF NOT EXISTS jobs_due ON jobs(status,due,next_attempt);
CREATE TABLE IF NOT EXISTS limits (bucket TEXT NOT NULL,period INTEGER NOT NULL,n INTEGER NOT NULL,PRIMARY KEY(bucket,period));
CREATE TABLE IF NOT EXISTS delivery_log (key_hash TEXT NOT NULL,job_id TEXT NOT NULL,provider_id TEXT NOT NULL,accepted_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS log_time ON delivery_log(accepted_at);
