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

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--
-- XXX: must remove from dump file
-- CREATE SCHEMA public;
ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3065 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--
COMMENT ON SCHEMA public IS 'standard public schema';

--
-- TOC entry 209 (class 1255 OID 333707)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--
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

--
-- TOC entry 208 (class 1259 OID 333774)
-- Name: global_notifications; Type: TABLE; Schema: public; Owner: postgres
--
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

--
-- TOC entry 207 (class 1259 OID 333772)
-- Name: global_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.global_notifications_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.global_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 3066 (class 0 OID 0)
-- Dependencies: 207
-- Name: global_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.global_notifications_id_seq OWNED BY public.global_notifications.id;

--
-- TOC entry 204 (class 1259 OID 333733)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--
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

--
-- TOC entry 203 (class 1259 OID 333731)
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.profiles_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.profiles_id_seq OWNER TO postgres;

--
-- TOC entry 3067 (class 0 OID 0)
-- Dependencies: 203
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;

--
-- TOC entry 206 (class 1259 OID 333753)
-- Name: pwd_reset_req; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.pwd_reset_req (
  id integer NOT NULL,
  email text,
  message text,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL,
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, CURRENT_TIMESTAMP) NOT NULL
);

ALTER TABLE public.pwd_reset_req OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 333751)
-- Name: pwd_reset_req_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.pwd_reset_req_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.pwd_reset_req_id_seq OWNER TO postgres;

--
-- TOC entry 3068 (class 0 OID 0)
-- Dependencies: 205
-- Name: pwd_reset_req_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.pwd_reset_req_id_seq OWNED BY public.pwd_reset_req.id;

--
-- TOC entry 202 (class 1259 OID 333710)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--
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

--
-- TOC entry 201 (class 1259 OID 333708)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.users_id_seq
  AS integer START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3069 (class 0 OID 0)
-- Dependencies: 201
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

--
-- TOC entry 2892 (class 2604 OID 333777)
-- Name: global_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.global_notifications
  ALTER COLUMN id SET DEFAULT nextval('public.global_notifications_id_seq'::regclass);

--
-- TOC entry 2885 (class 2604 OID 333736)
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.profiles
  ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);

--
-- TOC entry 2889 (class 2604 OID 333756)
-- Name: pwd_reset_req id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.pwd_reset_req
  ALTER COLUMN id SET DEFAULT nextval('public.pwd_reset_req_id_seq'::regclass);

--
-- TOC entry 2877 (class 2604 OID 333713)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.users
  ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

--
-- TOC entry 2910 (class 2606 OID 333784)
-- Name: global_notifications global_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.global_notifications
  ADD CONSTRAINT global_notifications_pkey PRIMARY KEY (id);

--
-- TOC entry 2904 (class 2606 OID 333744)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

--
-- TOC entry 2906 (class 2606 OID 333765)
-- Name: pwd_reset_req pwd_reset_req_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_email_key UNIQUE (email);

--
-- TOC entry 2908 (class 2606 OID 333763)
-- Name: pwd_reset_req pwd_reset_req_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_pkey PRIMARY KEY (id);

--
-- TOC entry 2902 (class 2606 OID 333725)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- TOC entry 2911 (class 1259 OID 333791)
-- Name: ix_global_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX ix_global_notifications_created_at ON public.global_notifications USING btree (created_at);

--
-- TOC entry 2912 (class 1259 OID 333792)
-- Name: ix_global_notifications_receiver_role; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX ix_global_notifications_receiver_role ON public.global_notifications USING btree (receiver_role);

--
-- TOC entry 2913 (class 1259 OID 333793)
-- Name: ix_global_notifications_updated_at; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX ix_global_notifications_updated_at ON public.global_notifications USING btree (updated_at);

--
-- TOC entry 2897 (class 1259 OID 333727)
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--
CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

--
-- TOC entry 2898 (class 1259 OID 333729)
-- Name: ix_users_last_notification_at; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX ix_users_last_notification_at ON public.users USING btree (last_notification_at);

--
-- TOC entry 2899 (class 1259 OID 333726)
-- Name: ix_users_role; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX ix_users_role ON public.users USING btree (ROLE);

--
-- TOC entry 2900 (class 1259 OID 333728)
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--
CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);

--
-- TOC entry 2914 (class 1259 OID 333790)
-- Name: notifications_created_at_receiver_role; Type: INDEX; Schema: public; Owner: postgres
--
CREATE INDEX notifications_created_at_receiver_role ON public.global_notifications USING btree (created_at, receiver_role);

--
-- TOC entry 2919 (class 2620 OID 333750)
-- Name: profiles update_profiles_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

--
-- TOC entry 2918 (class 2620 OID 333730)
-- Name: users update_user_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--
CREATE TRIGGER update_user_modtime
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

--
-- TOC entry 2920 (class 2620 OID 333771)
-- Name: pwd_reset_req update_user_request_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--
CREATE TRIGGER update_user_request_modtime
  BEFORE UPDATE ON public.pwd_reset_req
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column ();

--
-- TOC entry 2917 (class 2606 OID 333785)
-- Name: global_notifications global_notifications_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.global_notifications
  ADD CONSTRAINT global_notifications_sender_fkey FOREIGN KEY (sender) REFERENCES public.users (email) ON DELETE CASCADE;

--
-- TOC entry 2915 (class 2606 OID 333745)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.profiles
  ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

--
-- TOC entry 2916 (class 2606 OID 333766)
-- Name: pwd_reset_req pwd_reset_req_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.pwd_reset_req
  ADD CONSTRAINT pwd_reset_req_email_fkey FOREIGN KEY (email) REFERENCES public.users (email) ON DELETE CASCADE;

