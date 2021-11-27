--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4
-- Dumped by pg_dump version 13.3

-- Started on 2021-11-25 17:17:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


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

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 200 (class 1259 OID 49748)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

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
    AS integer
    START WITH 1
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
    AS integer
    START WITH 1
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
    AS integer
    START WITH 1
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
    role character varying(255) DEFAULT 'user'::character varying NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    salt text NOT NULL,
    password text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_superuser boolean DEFAULT false NOT NULL,
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
    AS integer
    START WITH 1
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

ALTER TABLE ONLY public.global_notifications ALTER COLUMN id SET DEFAULT nextval('public.global_notifications_id_seq'::regclass);


--
-- TOC entry 2885 (class 2604 OID 333736)
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- TOC entry 2889 (class 2604 OID 333756)
-- Name: pwd_reset_req id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pwd_reset_req ALTER COLUMN id SET DEFAULT nextval('public.pwd_reset_req_id_seq'::regclass);


--
-- TOC entry 2877 (class 2604 OID 333713)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3051 (class 0 OID 49748)
-- Dependencies: 200
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
824585145a4a
\.


--
-- TOC entry 3059 (class 0 OID 333774)
-- Dependencies: 208
-- Data for Name: global_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_notifications (id, sender, receiver_role, title, body, label, link, created_at, updated_at) FROM stdin;
1	admin@myapp.com	user	Test notification 1	\n                This is test notification 1.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 1	https://www.google.com	2021-11-25 14:15:54.75364	2021-11-25 14:15:54.75364
2	admin@myapp.com	user	Test notification 2	\n                This is test notification 2.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 2	https://www.google.com	2021-11-25 13:15:54.763341	2021-11-25 13:15:54.763341
3	admin@myapp.com	user	Test notification 3	\n                This is test notification 3.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 3	https://www.google.com	2021-11-25 12:15:54.768756	2021-11-25 12:15:54.768756
4	admin@myapp.com	user	Test notification 4	\n                This is test notification 4.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 4	https://www.google.com	2021-11-25 11:15:54.7882	2021-11-25 11:15:54.7882
5	admin@myapp.com	user	Test notification 5	\n                This is test notification 5.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 5	https://www.google.com	2021-11-25 10:15:54.796141	2021-11-25 10:15:54.796141
6	admin@myapp.com	user	Test notification 6	\n                This is test notification 6.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 6	https://www.google.com	2021-11-25 09:15:54.812034	2021-11-25 09:15:54.812034
7	admin@myapp.com	user	Test notification 7	\n                This is test notification 7.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 7	https://www.google.com	2021-11-25 08:15:54.822003	2021-11-25 08:15:54.822003
8	admin@myapp.com	user	Test notification 8	\n                This is test notification 8.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 8	https://www.google.com	2021-11-25 07:15:54.838369	2021-11-25 07:15:54.838369
9	admin@myapp.com	user	Test notification 9	\n                This is test notification 9.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 9	https://www.google.com	2021-11-25 06:15:54.849429	2021-11-25 06:15:54.849429
10	admin@myapp.com	user	Test notification 10	\n                This is test notification 10.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 10	https://www.google.com	2021-11-25 05:15:54.86456	2021-11-25 05:15:54.86456
11	admin@myapp.com	user	Test notification 11	\n                This is test notification 11.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 11	https://www.google.com	2021-11-25 04:15:54.881102	2021-11-25 04:15:54.881102
12	admin@myapp.com	user	Test notification 12	\n                This is test notification 12.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 12	https://www.google.com	2021-11-25 03:15:54.891471	2021-11-25 03:15:54.891471
13	admin@myapp.com	user	Test notification 13	\n                This is test notification 13.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 13	https://www.google.com	2021-11-25 02:15:54.906396	2021-11-25 02:15:54.906396
14	admin@myapp.com	user	Test notification 14	\n                This is test notification 14.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 14	https://www.google.com	2021-11-25 01:15:54.914263	2021-11-25 01:15:54.914263
15	admin@myapp.com	user	Test notification 15	\n                This is test notification 15.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 15	https://www.google.com	2021-11-25 00:15:54.922105	2021-11-25 00:15:54.922105
16	admin@myapp.com	user	Test notification 16	\n                This is test notification 16.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 16	https://www.google.com	2021-11-24 23:15:54.937533	2021-11-24 23:15:54.937533
17	admin@myapp.com	user	Test notification 17	\n                This is test notification 17.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 17	https://www.google.com	2021-11-24 22:15:54.945866	2021-11-24 22:15:54.945866
18	admin@myapp.com	user	Test notification 18	\n                This is test notification 18.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 18	https://www.google.com	2021-11-24 21:15:54.961749	2021-11-24 21:15:54.961749
19	admin@myapp.com	user	Test notification 19	\n                This is test notification 19.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 19	https://www.google.com	2021-11-24 20:15:54.971964	2021-11-24 20:15:54.971964
20	admin@myapp.com	user	Test notification 20	\n                This is test notification 20.\n\n                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should\n                come out nicely in the frontend nevertheless.\n                	Test label 20	https://www.google.com	2021-11-24 19:15:54.985255	2021-11-24 19:15:54.985255
\.


--
-- TOC entry 3055 (class 0 OID 333733)
-- Dependencies: 204
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, phone_number, bio, image, user_id, created_at, updated_at) FROM stdin;
1	\N	\N	\N	\N	1	2021-11-25 15:15:50.260785	2021-11-25 15:15:50.260785
2	\N	\N	\N	\N	2	2021-11-25 15:15:50.457925	2021-11-25 15:15:50.457925
3	\N	\N	\N	\N	3	2021-11-25 15:15:50.640629	2021-11-25 15:15:50.640629
4	\N	\N	\N	\N	4	2021-11-25 15:15:50.816621	2021-11-25 15:15:50.816621
5	\N	\N	\N	\N	5	2021-11-25 15:15:50.996932	2021-11-25 15:15:50.996932
6	\N	\N	\N	\N	6	2021-11-25 15:15:51.188169	2021-11-25 15:15:51.188169
7	\N	\N	\N	\N	7	2021-11-25 15:15:51.372587	2021-11-25 15:15:51.372587
8	\N	\N	\N	\N	8	2021-11-25 15:15:51.57071	2021-11-25 15:15:51.57071
9	\N	\N	\N	\N	9	2021-11-25 15:15:51.757972	2021-11-25 15:15:51.757972
10	\N	\N	\N	\N	10	2021-11-25 15:15:51.939184	2021-11-25 15:15:51.939184
11	\N	\N	\N	\N	11	2021-11-25 15:15:52.129514	2021-11-25 15:15:52.129514
12	\N	\N	\N	\N	12	2021-11-25 15:15:52.315379	2021-11-25 15:15:52.315379
13	\N	\N	\N	\N	13	2021-11-25 15:15:52.506251	2021-11-25 15:15:52.506251
14	\N	\N	\N	\N	14	2021-11-25 15:15:52.692049	2021-11-25 15:15:52.692049
15	\N	\N	\N	\N	15	2021-11-25 15:15:52.873154	2021-11-25 15:15:52.873154
16	\N	\N	\N	\N	16	2021-11-25 15:15:53.071207	2021-11-25 15:15:53.071207
17	\N	\N	\N	\N	17	2021-11-25 15:15:53.263012	2021-11-25 15:15:53.263012
18	\N	\N	\N	\N	18	2021-11-25 15:15:53.446478	2021-11-25 15:15:53.446478
19	\N	\N	\N	\N	19	2021-11-25 15:15:53.629319	2021-11-25 15:15:53.629319
20	\N	\N	\N	\N	20	2021-11-25 15:15:53.816955	2021-11-25 15:15:53.816955
21	\N	\N	\N	\N	21	2021-11-25 15:15:54.008914	2021-11-25 15:15:54.008914
22	\N	\N	\N	\N	22	2021-11-25 15:15:54.19998	2021-11-25 15:15:54.19998
23	\N	\N	\N	\N	23	2021-11-25 15:15:54.377975	2021-11-25 15:15:54.377975
24	\N	\N	\N	\N	24	2021-11-25 15:15:54.553884	2021-11-25 15:15:54.553884
25	\N	\N	\N	\N	25	2021-11-25 15:15:54.739803	2021-11-25 15:15:54.739803
\.


--
-- TOC entry 3057 (class 0 OID 333753)
-- Dependencies: 206
-- Data for Name: pwd_reset_req; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pwd_reset_req (id, email, message, created_at, updated_at) FROM stdin;
1	testuser1@mail.com	This is a test message	2021-11-25 15:15:54.74511	2021-11-25 15:15:54.74511
\.


--
-- TOC entry 3053 (class 0 OID 333710)
-- Dependencies: 202
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, role, is_verified, salt, password, is_active, is_superuser, last_notification_at, created_at, updated_at) FROM stdin;
1	admin	admin@myapp.com	admin	t	$2b$12$/AJmnGXsKDB7bEznorjRBe	$2b$12$UExdSg5iHP3MPZdpJzun.e0URuWbsO0cvXf5gSGbuhtKZK6.Zq3me	t	t	2021-11-25 15:15:50.255463	2021-11-25 15:15:50.255463	2021-11-25 15:15:50.268297
2	manager	manager@myapp.com	manager	t	$2b$12$MkVFCdT/0KIm1rq37GK.Eu	$2b$12$m6pDOzzwSzT5Gu03oW8eYuUr55IEckNiWmGmlrz1sOPUmxmAfNoYe	t	f	2021-11-25 15:15:50.452905	2021-11-25 15:15:50.452905	2021-11-25 15:15:50.463721
3	verified	verified@myapp.com	user	t	$2b$12$BSJRBWPxc7LHzISPmoExde	$2b$12$YhedBZsICZYniTWQ2U/QwuY0EyVIkXXlndLtY605So5m6c..e9fRC	t	f	2021-11-25 15:15:50.637869	2021-11-25 15:15:50.637869	2021-11-25 15:15:50.637869
4	unverified	unverified@myapp.com	user	f	$2b$12$kVsKezF9GpTw764xH/DOP.	$2b$12$oTmjLq.PYLGTYV4mBMy5.ONTrYMiS6yHlpKrAE6ieL.MNFUp9yUaS	t	f	2021-11-25 15:15:50.812414	2021-11-25 15:15:50.812414	2021-11-25 15:15:50.812414
5	unverified2	unverified2@myapp.com	user	f	$2b$12$qi8UGsD/T02KjqASNg9A.e	$2b$12$B.N20vVTndky5qONsvQfNefMqFmL9t0t504Bn5oj9mdjX/Ilj13YC	t	f	2021-11-25 15:15:50.994069	2021-11-25 15:15:50.994069	2021-11-25 15:15:50.994069
6	testuser0	testuser0@mail.com	user	t	$2b$12$9mEiz0Jgy6UxtgqAEK2gTO	$2b$12$.fmuiRp3NNll9ijcoYLyRObMyova4OO4Iyx6PGqD/KBCnIdtUe44m	t	f	2021-11-25 15:15:51.185397	2021-11-25 15:15:51.185397	2021-11-25 15:15:51.185397
7	testuser1	testuser1@mail.com	user	t	$2b$12$gi0AH7/1tYpY9znTkQe/OO	$2b$12$oAPdM0wvk70lXo64G4XS8uUP9LEMjfGeSTf6qQX3r9jSPXY6JS8Z6	t	f	2021-11-25 15:15:51.369289	2021-11-25 15:15:51.369289	2021-11-25 15:15:51.369289
8	testuser2	testuser2@mail.com	user	t	$2b$12$pxMacbePViKryD237iBree	$2b$12$tko2gL26dkXru0UxfU.dYunBaZI8Wc822oGiwKJSB7A9sftgoAOdC	t	f	2021-11-25 15:15:51.566807	2021-11-25 15:15:51.566807	2021-11-25 15:15:51.566807
9	testuser3	testuser3@mail.com	user	t	$2b$12$iWDKQ0OHbZwQ5tpT6MNxtO	$2b$12$gP3N/DuKqnNJU3kblxopw.5961Z8oX4r5FMS/fAU4NPdhfI6vQnmi	t	f	2021-11-25 15:15:51.754012	2021-11-25 15:15:51.754012	2021-11-25 15:15:51.754012
10	testuser4	testuser4@mail.com	user	t	$2b$12$Agh2Acn2X1g1DkNWI.plZu	$2b$12$dbJ/14v7dPmAxNEE3zGQae6Gsjha330ms1Qv2sOm.yAmiQoHHOGBO	t	f	2021-11-25 15:15:51.932323	2021-11-25 15:15:51.932323	2021-11-25 15:15:51.932323
11	testuser5	testuser5@mail.com	user	t	$2b$12$dtQ4e7GCTUyWX0DnDR42c.	$2b$12$tFJkswbQbxedjdc57JCQQuJIrwj5txehzcGPPPWEU3dq1iycbcAqu	t	f	2021-11-25 15:15:52.126166	2021-11-25 15:15:52.126166	2021-11-25 15:15:52.126166
12	testuser6	testuser6@mail.com	user	t	$2b$12$xzM2ikrQhGFAfBNC6iSKVe	$2b$12$2G.HB3qwJt1X18v54vFLTun0LFmhRESMNRbuzjhMes.Mm5I7klJk2	t	f	2021-11-25 15:15:52.312095	2021-11-25 15:15:52.312095	2021-11-25 15:15:52.312095
13	testuser7	testuser7@mail.com	user	t	$2b$12$hLyHW4IMS.BDvm3t5jLCj.	$2b$12$U0DZE0M7euRrY1oa15SjEektu6oASNM1PLDfTVeMnJNK7pwbzvvcW	t	f	2021-11-25 15:15:52.499679	2021-11-25 15:15:52.499679	2021-11-25 15:15:52.499679
14	testuser8	testuser8@mail.com	user	t	$2b$12$24OcWua55e/z5Iactx12xu	$2b$12$hpSAA3lfkaN4Lf4D0sUKUuLGQ8P9rKAZH0YUgUFOTzf.Aoj/jNhVO	t	f	2021-11-25 15:15:52.68904	2021-11-25 15:15:52.68904	2021-11-25 15:15:52.68904
15	testuser9	testuser9@mail.com	user	t	$2b$12$Pz/dLQ4Dv.wDMrn7N0I8Ku	$2b$12$nNEE2LqcM4YDe6TdvSTYfuHJWHA0OhCfwSnhDse1wClLUMb.FdITa	t	f	2021-11-25 15:15:52.867831	2021-11-25 15:15:52.867831	2021-11-25 15:15:52.867831
16	testuser10	testuser10@mail.com	user	t	$2b$12$KONgL12YeFf7vQRlB8OFpe	$2b$12$K9IYgvKNX8USNN.4Q07TW.VVFfTKeEZcchBOE7udpky8ex8FvzGRe	t	f	2021-11-25 15:15:53.068253	2021-11-25 15:15:53.068253	2021-11-25 15:15:53.068253
17	testuser11	testuser11@mail.com	user	t	$2b$12$.MDU4ovE0iADDtfGzOnSy.	$2b$12$XjSzVENJJCXUi99OVmPtL.lIQZCZz4MzAvI6MygIxej36WiHcZt3i	t	f	2021-11-25 15:15:53.260013	2021-11-25 15:15:53.260013	2021-11-25 15:15:53.260013
18	testuser12	testuser12@mail.com	user	t	$2b$12$FqrHfWCHxdqTTGyxpTE8Re	$2b$12$te3JB8gYKDinRlP0bX2nlOi/YC5UrHUKg6QGVtQQWtuZ0Pv21Jd0C	t	f	2021-11-25 15:15:53.443228	2021-11-25 15:15:53.443228	2021-11-25 15:15:53.443228
19	testuser13	testuser13@mail.com	user	t	$2b$12$Xxdtky4np6p0J84ChD1Tde	$2b$12$CtZaURhXNDOXoYb9LwYP/e9J0uxEc/xUhKptbyry80mFZLPuIX0GC	t	f	2021-11-25 15:15:53.626024	2021-11-25 15:15:53.626024	2021-11-25 15:15:53.626024
20	testuser14	testuser14@mail.com	user	t	$2b$12$SXBQyUJQvWQNeGP2E2AWuu	$2b$12$tlZWjFt0stWgCVnlZsBbBO/gZ9wWtjhu5D6ph2OdFshciDRqQH30q	t	f	2021-11-25 15:15:53.813533	2021-11-25 15:15:53.813533	2021-11-25 15:15:53.813533
21	testuser15	testuser15@mail.com	user	t	$2b$12$m2tZiJQybsi/uU.pml9qt.	$2b$12$mPV7ewMnpxVqw1X4Jl6n6.2yk833MxGKIQExHk4peF1oZXRphPHoO	t	f	2021-11-25 15:15:54.00607	2021-11-25 15:15:54.00607	2021-11-25 15:15:54.00607
22	testuser16	testuser16@mail.com	user	t	$2b$12$byQ9N0qGQnCF7faS4PH3le	$2b$12$vKX6U/wxXuNglSjxO45.aeQF.tFrO06xb..ALLBdsg.ZhUn4iQx1K	t	f	2021-11-25 15:15:54.194054	2021-11-25 15:15:54.194054	2021-11-25 15:15:54.194054
23	testuser17	testuser17@mail.com	user	t	$2b$12$3HHEIxXWSU9okcF6AkukFO	$2b$12$fBBMYxt21u/L8SvqnjKk7OcsPgnJqxvWw4KtkkECJwlAbO4kzzjaS	t	f	2021-11-25 15:15:54.375063	2021-11-25 15:15:54.375063	2021-11-25 15:15:54.375063
24	testuser18	testuser18@mail.com	user	t	$2b$12$CFl6VJkBu2EkqHb3nqavZ.	$2b$12$/wd6GcbbsuPanoVyHGA0Ve8taULGYPzdvGyYqigopCI7SqF219Rdu	t	f	2021-11-25 15:15:54.549183	2021-11-25 15:15:54.549183	2021-11-25 15:15:54.549183
25	testuser19	testuser19@mail.com	user	t	$2b$12$kBTzMndBQe8tZawzCs5W0u	$2b$12$qXfvqrS50BBL54qzE6awNOluL94lZ/yso21gPGjWXey7/Cmq1c8ZK	t	f	2021-11-25 15:15:54.737217	2021-11-25 15:15:54.737217	2021-11-25 15:15:54.737217
\.


--
-- TOC entry 3070 (class 0 OID 0)
-- Dependencies: 207
-- Name: global_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_notifications_id_seq', 20, true);


--
-- TOC entry 3071 (class 0 OID 0)
-- Dependencies: 203
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profiles_id_seq', 25, true);


--
-- TOC entry 3072 (class 0 OID 0)
-- Dependencies: 205
-- Name: pwd_reset_req_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pwd_reset_req_id_seq', 1, true);


--
-- TOC entry 3073 (class 0 OID 0)
-- Dependencies: 201
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 25, true);


--
-- TOC entry 2896 (class 2606 OID 49752)
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


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

CREATE INDEX ix_users_role ON public.users USING btree (role);


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

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 2918 (class 2620 OID 333730)
-- Name: users update_user_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 2920 (class 2620 OID 333771)
-- Name: pwd_reset_req update_user_request_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_request_modtime BEFORE UPDATE ON public.pwd_reset_req FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 2917 (class 2606 OID 333785)
-- Name: global_notifications global_notifications_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_notifications
    ADD CONSTRAINT global_notifications_sender_fkey FOREIGN KEY (sender) REFERENCES public.users(email) ON DELETE CASCADE;


--
-- TOC entry 2915 (class 2606 OID 333745)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 2916 (class 2606 OID 333766)
-- Name: pwd_reset_req pwd_reset_req_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pwd_reset_req
    ADD CONSTRAINT pwd_reset_req_email_fkey FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE;


-- Completed on 2021-11-25 17:17:46

--
-- PostgreSQL database dump complete
--

