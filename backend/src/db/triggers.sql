-- Audit Triggers
CREATE SEQUENCE IF NOT EXISTS audit_logs_id_seq;

CREATE OR REPLACE FUNCTION audit_log_trigger()
    RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;

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
    RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_stage_history_trigger ON applications;
CREATE TRIGGER application_stage_history_trigger
    AFTER UPDATE OF current_stage_id ON applications
    FOR EACH ROW
EXECUTE FUNCTION application_stage_history_trigger();

-- Status update triggers
CREATE OR REPLACE FUNCTION application_notification_trigger()
    RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_notification_trigger ON applications;
CREATE TRIGGER application_notification_trigger
    AFTER UPDATE OF current_stage_id ON applications
    FOR EACH ROW
EXECUTE FUNCTION application_notification_trigger();

-- Project update notification trigger
CREATE OR REPLACE FUNCTION project_update_notification_trigger()
    RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;