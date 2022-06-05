BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 00000001

CREATE SCHEMA IF NOT EXISTS v;

CREATE SCHEMA IF NOT EXISTS cache;

CREATE EXTENSION IF NOT EXISTS rum;

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS btree_gin;

CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS
        $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';;

CREATE TYPE role AS ENUM ('user', 'manager', 'admin');

CREATE TABLE users (
    user_id SERIAL NOT NULL, 
    username TEXT NOT NULL, 
    email TEXT NOT NULL, 
    role role DEFAULT 'user' NOT NULL, 
    is_verified BOOLEAN DEFAULT 'False' NOT NULL, 
    salt TEXT NOT NULL, 
    password TEXT NOT NULL, 
    is_active BOOLEAN DEFAULT 'True' NOT NULL, 
    is_superuser BOOLEAN DEFAULT 'False' NOT NULL, 
    last_global_notification_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    last_personal_notification_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_last_personal_notification_at ON users (last_personal_notification_at);

CREATE INDEX ix_users_role ON users (role);

CREATE UNIQUE INDEX ix_users_username ON users (username);

CREATE INDEX ix_users_last_global_notification_at ON users (last_global_notification_at);

CREATE TRIGGER update_user_modtime
            BEFORE UPDATE
            ON users
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();;

CREATE TABLE profiles (
    profile_id SERIAL NOT NULL, 
    full_name TEXT, 
    phone_number TEXT, 
    bio TEXT DEFAULT '', 
    image TEXT, 
    user_id INTEGER NOT NULL, 
    PRIMARY KEY (profile_id), 
    FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE password_reset_requests (
    password_reset_request_id SERIAL NOT NULL, 
    email TEXT, 
    message TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    PRIMARY KEY (password_reset_request_id), 
    UNIQUE (email), 
    FOREIGN KEY(email) REFERENCES users (email) ON DELETE CASCADE
);

CREATE TRIGGER update_user_request_modtime
            BEFORE UPDATE
            ON password_reset_requests
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();;

CREATE TABLE global_notifications (
    global_notification_id SERIAL NOT NULL, 
    sender TEXT, 
    receiver_role role NOT NULL, 
    title TEXT NOT NULL, 
    body TEXT NOT NULL, 
    label TEXT NOT NULL, 
    link TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    PRIMARY KEY (global_notification_id), 
    FOREIGN KEY(sender) REFERENCES users (email) ON DELETE CASCADE
);

CREATE INDEX ix_global_notifications_created_at ON global_notifications (created_at);

CREATE INDEX ix_global_notifications_updated_at ON global_notifications (updated_at);

CREATE INDEX ix_global_notifications_receiver_role ON global_notifications (receiver_role);

CREATE TYPE event_type AS ENUM ('is_update', 'is_create');

CREATE TABLE personal_notifications (
    personal_notification_id SERIAL NOT NULL, 
    sender TEXT, 
    receiver_email TEXT NOT NULL, 
    title TEXT NOT NULL, 
    body TEXT NOT NULL, 
    label TEXT NOT NULL, 
    link TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT TIMEZONE('utc', CURRENT_TIMESTAMP) NOT NULL, 
    PRIMARY KEY (personal_notification_id), 
    FOREIGN KEY(sender) REFERENCES users (email) ON DELETE CASCADE, 
    FOREIGN KEY(receiver_email) REFERENCES users (email) ON DELETE CASCADE
);

CREATE INDEX ix_personal_notifications_created_at ON personal_notifications (created_at);

CREATE INDEX ix_personal_notifications_updated_at ON personal_notifications (updated_at);

INSERT INTO alembic_version (version_num) VALUES ('00000001') RETURNING alembic_version.version_num;

COMMIT;

