-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = ON;
-- SELECT
--   pg_catalog.set_config('search_path', '', FALSE);
-- SET check_function_bodies = FALSE;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = OFF;
-- XXX: must remove from dump file
CREATE SCHEMA IF NOT EXISTS public;

--use public as default schema
SET search_path = public, pg_catalog;

ALTER SCHEMA public OWNER TO postgres;

COMMENT ON SCHEMA public IS 'standard public schema';

CREATE FUNCTION update_updated_at_column ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION update_updated_at_column () OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE "global_notifications" (
    "id" integer NOT NULL,
    "sender" text,
    "receiver_role" CHARACTER VARYING(255) NOT NULL,
    "title" CHARACTER VARYING(255) NOT NULL,
    "body" text NOT NULL,
    "label" CHARACTER VARYING(255) NOT NULL,
    "link" CHARACTER VARYING(255),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL
);

ALTER TABLE "global_notifications" OWNER TO postgres;

CREATE SEQUENCE "global_notifications_id_seq"
AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER TABLE "global_notifications_id_seq" OWNER TO postgres;

ALTER SEQUENCE "global_notifications_id_seq" OWNED BY global_notifications.id;

CREATE TABLE "profiles" (
    "id" integer NOT NULL,
    "full_name" text,
    "phone_number" text,
    "bio" text DEFAULT ''::text,
    "image" text,
    "user_id" integer,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL
);

ALTER TABLE "profiles" OWNER TO postgres;

CREATE SEQUENCE "profiles_id_seq"
AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER TABLE "profiles_id_seq" OWNER TO postgres;

ALTER SEQUENCE "profiles_id_seq" OWNED BY profiles.id;

CREATE TABLE "pwd_reset_req" (
    "id" integer NOT NULL,
    "email" text,
    "message" text,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL
);

ALTER TABLE "pwd_reset_req" OWNER TO postgres;

CREATE SEQUENCE "pwd_reset_req_id_seq"
AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER TABLE "pwd_reset_req_id_seq" OWNER TO postgres;

ALTER SEQUENCE "pwd_reset_req_id_seq" OWNED BY pwd_reset_req.id;

CREATE TABLE "users" (
    "id" integer NOT NULL,
    "username" text NOT NULL,
    "email" text NOT NULL,
    "role" CHARACTER VARYING(255) DEFAULT 'user' ::CHARACTER VARYING NOT NULL,
    "is_verified" boolean DEFAULT FALSE NOT NULL,
    "salt" text NOT NULL,
    "password" text NOT NULL,
    "is_active" boolean DEFAULT TRUE NOT NULL,
    "is_superuser" boolean DEFAULT FALSE NOT NULL,
    "last_notification_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone(
        'utc' ::text, current_timestamp
    ) NOT NULL
);

ALTER TABLE "users" OWNER TO postgres;

CREATE SEQUENCE "users_id_seq"
AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER TABLE "users_id_seq" OWNER TO postgres;

ALTER SEQUENCE "users_id_seq" OWNED BY users.id;

ALTER TABLE ONLY "global_notifications"
ALTER COLUMN "id" SET DEFAULT nextval('global_notifications_id_seq'::regclass);

ALTER TABLE ONLY "profiles"
ALTER COLUMN "id" SET DEFAULT nextval('profiles_id_seq'::regclass);

ALTER TABLE ONLY "pwd_reset_req"
ALTER COLUMN "id" SET DEFAULT nextval('pwd_reset_req_id_seq'::regclass);

ALTER TABLE ONLY "users"
ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq'::regclass);

ALTER TABLE ONLY "global_notifications"
ADD CONSTRAINT global_notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY "profiles"
ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY "pwd_reset_req"
ADD CONSTRAINT pwd_reset_req_email_key UNIQUE (email);

ALTER TABLE ONLY "pwd_reset_req"
ADD CONSTRAINT pwd_reset_req_pkey PRIMARY KEY (id);

ALTER TABLE ONLY "users"
ADD CONSTRAINT users_pkey PRIMARY KEY (id);


CREATE INDEX ix_global_notifications_receiver_role ON "global_notifications" USING btree(
    "receiver_role"
);

CREATE UNIQUE INDEX ix_users_email ON "users" USING btree("email");

CREATE INDEX ix_users_last_notification_at ON "users" USING btree(
    "last_notification_at"
);

CREATE INDEX ix_users_role ON "users" USING btree("role");

CREATE UNIQUE INDEX ix_users_username ON "users" USING btree("username");


CREATE TRIGGER "update_profiles_modtime"
BEFORE UPDATE ON "profiles"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER "update_user_modtime"
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER "update_user_request_modtime"
BEFORE UPDATE ON "pwd_reset_req"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

ALTER TABLE ONLY "global_notifications"
ADD CONSTRAINT global_notifications_sender_fkey FOREIGN KEY (
    sender
) REFERENCES users (email) ON DELETE CASCADE;

ALTER TABLE ONLY "profiles"
ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (
    user_id
) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE ONLY "pwd_reset_req"
ADD CONSTRAINT pwd_reset_req_email_fkey FOREIGN KEY (
    email
) REFERENCES users (email) ON DELETE CASCADE;
