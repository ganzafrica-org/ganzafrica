-- Audit Triggers
CREATE SEQUENCE IF NOT EXISTS audit_logs_id_seq;

CREATE OR REPLACE FUNCTION audit_log_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        changes,
        ip_address,
        created_at
    ) VALUES (
                 nextval('audit_logs_id_seq'),
                 current_setting('app.current_user_id', TRUE)::bigint,
                 TG_OP,
                 TG_TABLE_NAME,
                 NEW.id,
                 jsonb_build_object(
                         'old', to_jsonb(OLD),
                         'new', to_jsonb(NEW)
                 ),
                 current_setting('app.current_ip_address', TRUE),
                 NOW()
             );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users audit trigger
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION audit_log_trigger();

-- Roles/permissions audit trigger
DROP TRIGGER IF EXISTS audit_roles_trigger ON roles;
CREATE TRIGGER audit_roles_trigger
    BEFORE UPDATE ON roles
    FOR EACH ROW
EXECUTE FUNCTION audit_log_trigger();

DROP TRIGGER IF EXISTS audit_permissions_trigger ON permissions;
CREATE TRIGGER audit_permissions_trigger
    BEFORE UPDATE ON permissions
    FOR EACH ROW
EXECUTE FUNCTION audit_log_trigger();

-- Application stage history trigger
CREATE OR REPLACE FUNCTION application_stage_history_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO application_stage_history (
        application_id,
        stage_id,
        status,
        updated_by,
        created_at
    ) VALUES (
                 NEW.id,
                 NEW.current_stage_id,
                 'pending',
                 current_setting('app.current_user_id', TRUE)::bigint,
                 NOW()
             );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_stage_history_trigger ON applications;
CREATE TRIGGER application_stage_history_trigger
    AFTER UPDATE OF current_stage_id ON applications
    FOR EACH ROW
EXECUTE FUNCTION application_stage_history_trigger();

-- Status update triggers
CREATE OR REPLACE FUNCTION application_notification_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        read,
        created_at
    ) VALUES (
                 NEW.applicant_id,
                 'application_update',
                 'Application Status Updated',
                 jsonb_build_object(
                         'application_id', NEW.id,
                         'job_posting_id', NEW.job_posting_id,
                         'stage_id', NEW.current_stage_id
                 ),
                 FALSE,
                 NOW()
             );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_notification_trigger ON applications;
CREATE TRIGGER application_notification_trigger
    AFTER UPDATE OF current_stage_id ON applications
    FOR EACH ROW
EXECUTE FUNCTION application_notification_trigger();

-- Project update notification trigger
CREATE OR REPLACE FUNCTION project_update_notification_trigger()
    RETURNS TRIGGER AS $$
DECLARE
    member RECORD;
BEGIN
    FOR member IN
        SELECT user_id
        FROM project_members
        WHERE project_id = NEW.project_id
        LOOP
            INSERT INTO notifications (
                user_id,
                type,
                title,
                content,
                read,
                created_at
            ) VALUES (
                         member.user_id,
                         'project_update',
                         'New Project Update',
                         jsonb_build_object(
                                 'project_id', NEW.project_id,
                                 'update_id', NEW.id,
                                 'author_id', NEW.author_id
                         ),
                         FALSE,
                         NOW()
                     );
        END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_update_notification_trigger ON project_updates;
CREATE TRIGGER project_update_notification_trigger
    AFTER INSERT ON project_updates
    FOR EACH ROW
EXECUTE FUNCTION project_update_notification_trigger();

-- Milestone completion trigger
CREATE OR REPLACE FUNCTION milestone_completion_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update fellow progress tracking here
        -- This is a placeholder for more complex logic
        NULL; -- Placeholder to ensure valid function
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS milestone_completion_trigger ON fellow_milestone_progress;
CREATE TRIGGER milestone_completion_trigger
    AFTER UPDATE OF status ON fellow_milestone_progress
    FOR EACH ROW
EXECUTE FUNCTION milestone_completion_trigger();

-- Security triggers
CREATE OR REPLACE FUNCTION soft_delete_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    RETURN NULL; -- Prevents the delete
END;
$$ LANGUAGE plpgsql;

-- Add soft delete triggers for important tables
DROP TRIGGER IF EXISTS prevent_user_delete_trigger ON users;
CREATE TRIGGER prevent_user_delete_trigger
    BEFORE DELETE ON users
    FOR EACH ROW
EXECUTE FUNCTION soft_delete_trigger();

DROP TRIGGER IF EXISTS prevent_fellow_delete_trigger ON fellows;
CREATE TRIGGER prevent_fellow_delete_trigger
    BEFORE DELETE ON fellows
    FOR EACH ROW
EXECUTE FUNCTION soft_delete_trigger();

DROP TRIGGER IF EXISTS prevent_project_delete_trigger ON projects;
CREATE TRIGGER prevent_project_delete_trigger
    BEFORE DELETE ON projects
    FOR EACH ROW
EXECUTE FUNCTION soft_delete_trigger();

-- Reporting hierarchy validation
CREATE OR REPLACE FUNCTION validate_reporting_hierarchy()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id = NEW.reports_to_id THEN
        RAISE EXCEPTION 'User cannot report to themselves';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_reporting_hierarchy_trigger ON reporting_lines;
CREATE TRIGGER validate_reporting_hierarchy_trigger
    BEFORE INSERT OR UPDATE ON reporting_lines
    FOR EACH ROW
EXECUTE FUNCTION validate_reporting_hierarchy();

-- User role compatibility validation
CREATE OR REPLACE FUNCTION validate_user_role_compatibility()
    RETURNS TRIGGER AS $$
BEGIN
    -- Add role compatibility logic here
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_role_compatibility_trigger ON user_roles;
CREATE TRIGGER validate_user_role_compatibility_trigger
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW
EXECUTE FUNCTION validate_user_role_compatibility();

-- Cleanup triggers
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
    RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM sessions
    WHERE expires_at < NOW()
      AND is_valid = TRUE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_expired_sessions_trigger ON sessions;
CREATE TRIGGER cleanup_expired_sessions_trigger
    AFTER UPDATE ON sessions
EXECUTE FUNCTION cleanup_expired_sessions();

-- Add cleanup triggers for verification_tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
    RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM verification_tokens
    WHERE expires_at < NOW()
      AND used = FALSE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_expired_verification_tokens_trigger ON verification_tokens;
CREATE TRIGGER cleanup_expired_verification_tokens_trigger
    AFTER UPDATE ON verification_tokens
EXECUTE FUNCTION cleanup_expired_verification_tokens();

-- Add cleanup triggers for two_factor_temp_tokens
CREATE OR REPLACE FUNCTION cleanup_expired_two_factor_tokens()
    RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM two_factor_temp_tokens
    WHERE expires_at < NOW()
      AND used = FALSE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_expired_two_factor_tokens_trigger ON two_factor_temp_tokens;
CREATE TRIGGER cleanup_expired_two_factor_tokens_trigger
    AFTER UPDATE ON two_factor_temp_tokens
EXECUTE FUNCTION cleanup_expired_two_factor_tokens();

-- Add cleanup triggers for password_reset_tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
    RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW()
      AND used = FALSE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_expired_password_reset_tokens_trigger ON password_reset_tokens;
CREATE TRIGGER cleanup_expired_password_reset_tokens_trigger
    AFTER UPDATE ON password_reset_tokens
EXECUTE FUNCTION cleanup_expired_password_reset_tokens();