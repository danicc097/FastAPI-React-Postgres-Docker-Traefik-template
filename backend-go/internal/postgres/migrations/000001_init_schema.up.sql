SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
  pg_catalog.set_config('search_path', '', FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

-- XXX: must remove from dump file
CREATE SCHEMA IF NOT EXISTS public;

ALTER SCHEMA public OWNER TO postgres;

COMMENT ON SCHEMA public IS 'standard public schema';

CREATE FUNCTION public.update_updated_at_column ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.update_updated_at_column () OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.global_notifications (
  id integer NOT NULL,
  sender text,
  receiver_role character varying(255) NOT NULL,
  title character varying(255) NOT NULL,
  body text NOT NULL,
  label character varying(255) NOT NULL,
  link character varying(255),
  created_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL
);

ALTER TABLE public.global_notifications OWNER TO postgres;

CREATE SEQUENCE public.global_notifications_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.global_notifications_id_seq OWNER TO postgres;

ALTER SEQUENCE public.global_notifications_id_seq OWNED BY public.global_notifications.id;

CREATE TABLE public.profiles (
  id integer NOT NULL,
  full_name text,
  phone_number text,
  bio text DEFAULT ''::text,
  image text,
  user_id integer,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL
);

ALTER TABLE public.profiles OWNER TO postgres;

CREATE SEQUENCE public.profiles_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.profiles_id_seq OWNER TO postgres;

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;

CREATE TABLE public.pwd_reset_req (
  id integer NOT NULL,
  email text,
  message text,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL
);

ALTER TABLE public.pwd_reset_req OWNER TO postgres;

CREATE SEQUENCE public.pwd_reset_req_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.pwd_reset_req_id_seq OWNER TO postgres;

ALTER SEQUENCE public.pwd_reset_req_id_seq OWNED BY public.pwd_reset_req.id;

CREATE TABLE public.users (
  id integer NOT NULL,
  username text NOT NULL,
  email text NOT NULL,
  role character varying(255) DEFAULT 'user' ::character varying NOT NULL,
  is_verified boolean DEFAULT FALSE NOT NULL,
  salt text NOT NULL,
  password text NOT NULL,
  is_active boolean DEFAULT TRUE NOT NULL,
  is_superuser boolean DEFAULT FALSE NOT NULL,
  last_notification_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;

CREATE SEQUENCE public.users_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.users_id_seq OWNER TO postgres;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY public.global_notifications
  ALTER COLUMN id SET DEFAULT nextval('public.global_notifications_id_seq'::regclass);

ALTER TABLE ONLY public.profiles
  ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);

ALTER TABLE ONLY public.pwd_reset_req
  ALTER COLUMN id SET DEFAULT nextval('public.pwd_reset_req_id_seq'::regclass);

ALTER TABLE ONLY public.users
  ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

ALTER TABLE ONLY public.global_notifications
  ADD CONSTRAINT global_notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_email_key UNIQUE (email);

ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE INDEX ix_global_notifications_created_at ON public.global_notifications USING btree (created_at);

CREATE INDEX ix_global_notifications_receiver_role ON public.global_notifications USING btree (receiver_role);

CREATE INDEX ix_global_notifications_updated_at ON public.global_notifications USING btree (updated_at);

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

CREATE INDEX ix_users_last_notification_at ON public.users USING btree (last_notification_at);

CREATE INDEX ix_users_role ON public.users USING btree (ROLE);

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);

CREATE INDEX notifications_created_at_receiver_role ON public.global_notifications USING btree (created_at, receiver_role);

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

CREATE TRIGGER update_user_modtime
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

CREATE TRIGGER update_user_request_modtime
  BEFORE UPDATE ON public.pwd_reset_req
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

ALTER TABLE ONLY public.global_notifications
  ADD CONSTRAINT global_notifications_sender_fkey FOREIGN KEY (sender) REFERENCES public.users (email) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
  ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_email_fkey FOREIGN KEY (email) REFERENCES public.users (email) ON DELETE CASCADE;

