-- The 4 expiry cleanup triggers compared `expires_at` (a timezone-naive column, written using
-- UTC-numbered digits by the app) against bare `NOW()`, which Postgres implicitly casts to a
-- naive timestamp using the *session* timezone. On a session set to a non-UTC zone (this DB's
-- session timezone is Africa/Kigali, UTC+2), that cast shifts NOW()'s digits forward by the
-- zone offset, making every not-yet-expired token look already expired by roughly that offset —
-- deleted by the very next UPDATE on the table, well before its real expiry. Comparing against
-- `NOW() AT TIME ZONE 'UTC'` instead produces a naive timestamp using UTC digits, matching how
-- `expires_at` is actually stored, regardless of the session's timezone setting.

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
    RETURNS TRIGGER AS $cleanup_sessions_func$
BEGIN
    DELETE FROM sessions
    WHERE expires_at < (NOW() AT TIME ZONE 'UTC')
      AND is_valid = TRUE;
    RETURN NULL;
END;
$cleanup_sessions_func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
    RETURNS TRIGGER AS $cleanup_verify_func$
BEGIN
    DELETE FROM verification_tokens
    WHERE expires_at < (NOW() AT TIME ZONE 'UTC')
      AND used = FALSE;
    RETURN NULL;
END;
$cleanup_verify_func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_two_factor_tokens()
    RETURNS TRIGGER AS $cleanup_2fa_func$
BEGIN
    DELETE FROM two_factor_temp_tokens
    WHERE expires_at < (NOW() AT TIME ZONE 'UTC')
      AND used = FALSE;
    RETURN NULL;
END;
$cleanup_2fa_func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
    RETURNS TRIGGER AS $cleanup_pwd_func$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expires_at < (NOW() AT TIME ZONE 'UTC')
      AND used = FALSE;
    RETURN NULL;
END;
$cleanup_pwd_func$ LANGUAGE plpgsql;
