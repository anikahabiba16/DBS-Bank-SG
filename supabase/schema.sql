-- ============================================================
-- SECTION: SCHEMA
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: admin_auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."admin_auth" (
    "username" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "totp_secret" "text" DEFAULT ''::"text",
    "totp_configured" boolean DEFAULT false NOT NULL,
    "session_token" "text",
    "session_expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: customer_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."customer_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_phone" "text" NOT NULL,
    "user_name" "text",
    "sender" "text" NOT NULL,
    "message_type" "text" NOT NULL,
    "content" "text",
    "audio_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_read" boolean DEFAULT false,
    "image_url" "text",
    CONSTRAINT "customer_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'voice'::"text", 'image'::"text", 'file'::"text"]))),
    CONSTRAINT "customer_messages_sender_check" CHECK (("sender" = ANY (ARRAY['customer'::"text", 'admin'::"text"])))
);

ALTER TABLE ONLY "public"."customer_messages" REPLICA IDENTITY FULL;


--
-- Name: promotion_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."promotion_media" (
    "id" "text" NOT NULL,
    "title_bn" "text" NOT NULL,
    "caption_bn" "text",
    "category" "text" DEFAULT 'news'::"text" NOT NULL,
    "image_url" "text" NOT NULL,
    "loan_amount" "text",
    "customer_name" "text",
    "customer_location" "text",
    "customer_profession" "text",
    "badge_bn" "text",
    "story_bn" "text",
    "cta_text_bn" "text",
    "cta_link" "text",
    "date" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_contracts" (
    "id" "text" NOT NULL,
    "loan_id" "text",
    "user_phone" "text",
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'sent'::"text"
);


--
-- Name: site_customer_fixed_deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_customer_fixed_deposits" (
    "id" "text" NOT NULL,
    "user_phone" "text",
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_deposits" (
    "id" "text" NOT NULL,
    "user_phone" "text",
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_dps_schemes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_dps_schemes" (
    "id" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_installments" (
    "id" "text" NOT NULL,
    "loan_id" "text",
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_loans" (
    "id" "text" NOT NULL,
    "user_phone" "text",
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_packages" (
    "id" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_payment_methods" (
    "id" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_purged_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_purged_users" (
    "id" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "purged_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_staff_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_staff_cards" (
    "id" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_users" (
    "phone" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: site_withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."site_withdrawals" (
    "id" "text" NOT NULL,
    "user_phone" "text",
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: sub_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."sub_admins" (
    "id" "text" NOT NULL,
    "username" "text" NOT NULL,
    "password" "text" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'sub_admin'::"text" NOT NULL,
    "permissions" "jsonb" DEFAULT '["messages"]'::"jsonb" NOT NULL,
    "assigned_customer_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "can_delete_messages" boolean DEFAULT false
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "token" "text" NOT NULL,
    "user_phone" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


--
-- Name: virtual_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."virtual_cards" (
    "id" "text" NOT NULL,
    "user_phone" "text" NOT NULL,
    "customer_name" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "card_number" "text",
    "cardholder_name" "text",
    "expiry_date" "text",
    "cvv" "text",
    "card_type" "text" DEFAULT 'DBS Platinum Virtual'::"text",
    "spending_limit" numeric DEFAULT 100000,
    "balance" numeric DEFAULT 0,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: withdrawal_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."withdrawal_conditions" (
    "id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "step_order" integer DEFAULT 1 NOT NULL,
    "condition_title" "text" NOT NULL,
    "condition_description" "text",
    "fee_amount" numeric DEFAULT 0 NOT NULL,
    "trx_id" "text",
    "slip_url" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: withdrawal_payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."withdrawal_payment_methods" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "label_bn" "text" NOT NULL,
    "channel_type" "text" DEFAULT 'mobile_banking'::"text" NOT NULL,
    "logo_url" "text" DEFAULT ''::"text",
    "account_number_placeholder" "text" DEFAULT ''::"text",
    "instructions_bn" "text" DEFAULT ''::"text",
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: admin_auth admin_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'admin_auth_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'admin_auth'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."admin_auth"
    ADD CONSTRAINT "admin_auth_pkey" PRIMARY KEY ("username");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: customer_messages customer_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'customer_messages_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'customer_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."customer_messages"
    ADD CONSTRAINT "customer_messages_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: promotion_media promotion_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'promotion_media_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'promotion_media'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."promotion_media"
    ADD CONSTRAINT "promotion_media_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_contracts site_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_contracts_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_contracts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_contracts"
    ADD CONSTRAINT "site_contracts_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_customer_fixed_deposits site_customer_fixed_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_customer_fixed_deposits_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_customer_fixed_deposits'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_customer_fixed_deposits"
    ADD CONSTRAINT "site_customer_fixed_deposits_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_deposits site_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_deposits_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_deposits'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_deposits"
    ADD CONSTRAINT "site_deposits_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_dps_schemes site_dps_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_dps_schemes_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_dps_schemes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_dps_schemes"
    ADD CONSTRAINT "site_dps_schemes_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_installments site_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_installments_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_installments'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_installments"
    ADD CONSTRAINT "site_installments_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_loans site_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_loans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_loans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_loans"
    ADD CONSTRAINT "site_loans_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_packages site_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_packages_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_packages'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_packages"
    ADD CONSTRAINT "site_packages_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_payment_methods site_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_payment_methods_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_payment_methods'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_payment_methods"
    ADD CONSTRAINT "site_payment_methods_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_purged_users site_purged_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_purged_users_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_purged_users'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_purged_users"
    ADD CONSTRAINT "site_purged_users_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_settings_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_settings'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_staff_cards site_staff_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_staff_cards_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_staff_cards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_staff_cards"
    ADD CONSTRAINT "site_staff_cards_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_users site_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_users_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_users'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_users"
    ADD CONSTRAINT "site_users_pkey" PRIMARY KEY ("phone");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_withdrawals site_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'site_withdrawals_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'site_withdrawals'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."site_withdrawals"
    ADD CONSTRAINT "site_withdrawals_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: sub_admins sub_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'sub_admins_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'sub_admins'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."sub_admins"
    ADD CONSTRAINT "sub_admins_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: sub_admins sub_admins_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'sub_admins_username_key'
      AND n.nspname = 'public'
      AND c.relname = 'sub_admins'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."sub_admins"
    ADD CONSTRAINT "sub_admins_username_key" UNIQUE ("username");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_sessions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("token");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: virtual_cards virtual_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'virtual_cards_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'virtual_cards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."virtual_cards"
    ADD CONSTRAINT "virtual_cards_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: withdrawal_conditions withdrawal_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'withdrawal_conditions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'withdrawal_conditions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."withdrawal_conditions"
    ADD CONSTRAINT "withdrawal_conditions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: withdrawal_payment_methods withdrawal_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'withdrawal_payment_methods_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'withdrawal_payment_methods'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."withdrawal_payment_methods"
    ADD CONSTRAINT "withdrawal_payment_methods_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: idx_customer_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_customer_messages_created" ON "public"."customer_messages" USING "btree" ("created_at");


--
-- Name: idx_customer_messages_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_customer_messages_phone" ON "public"."customer_messages" USING "btree" ("user_phone");


--
-- Name: withdrawal_payment_methods Allow all write on withdrawal payment methods; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow all write on withdrawal payment methods'
      AND n.nspname = 'public'
      AND c.relname = 'withdrawal_payment_methods'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow all write on withdrawal payment methods" ON "public"."withdrawal_payment_methods" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: sub_admins Allow public all on sub_admins; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public all on sub_admins'
      AND n.nspname = 'public'
      AND c.relname = 'sub_admins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public all on sub_admins" ON "public"."sub_admins" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: customer_messages Allow public delete customer_messages; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public delete customer_messages'
      AND n.nspname = 'public'
      AND c.relname = 'customer_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public delete customer_messages" ON "public"."customer_messages" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: customer_messages Allow public insert customer_messages; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public insert customer_messages'
      AND n.nspname = 'public'
      AND c.relname = 'customer_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public insert customer_messages" ON "public"."customer_messages" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: withdrawal_payment_methods Allow public read active withdrawal payment methods; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public read active withdrawal payment methods'
      AND n.nspname = 'public'
      AND c.relname = 'withdrawal_payment_methods'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public read active withdrawal payment methods" ON "public"."withdrawal_payment_methods" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: customer_messages Allow public read customer_messages; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public read customer_messages'
      AND n.nspname = 'public'
      AND c.relname = 'customer_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public read customer_messages" ON "public"."customer_messages" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: customer_messages Allow public update customer_messages; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Allow public update customer_messages'
      AND n.nspname = 'public'
      AND c.relname = 'customer_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Allow public update customer_messages" ON "public"."customer_messages" FOR UPDATE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: admin_auth Public access admin_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access admin_auth'
      AND n.nspname = 'public'
      AND c.relname = 'admin_auth'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access admin_auth" ON "public"."admin_auth" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: promotion_media Public access promotion_media; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access promotion_media'
      AND n.nspname = 'public'
      AND c.relname = 'promotion_media'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access promotion_media" ON "public"."promotion_media" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_contracts Public access site_contracts; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_contracts'
      AND n.nspname = 'public'
      AND c.relname = 'site_contracts'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_contracts" ON "public"."site_contracts" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_customer_fixed_deposits Public access site_customer_fixed_deposits; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_customer_fixed_deposits'
      AND n.nspname = 'public'
      AND c.relname = 'site_customer_fixed_deposits'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_customer_fixed_deposits" ON "public"."site_customer_fixed_deposits" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_deposits Public access site_deposits; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_deposits'
      AND n.nspname = 'public'
      AND c.relname = 'site_deposits'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_deposits" ON "public"."site_deposits" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_dps_schemes Public access site_dps_schemes; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_dps_schemes'
      AND n.nspname = 'public'
      AND c.relname = 'site_dps_schemes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_dps_schemes" ON "public"."site_dps_schemes" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_installments Public access site_installments; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_installments'
      AND n.nspname = 'public'
      AND c.relname = 'site_installments'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_installments" ON "public"."site_installments" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_loans Public access site_loans; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_loans'
      AND n.nspname = 'public'
      AND c.relname = 'site_loans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_loans" ON "public"."site_loans" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_packages Public access site_packages; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_packages'
      AND n.nspname = 'public'
      AND c.relname = 'site_packages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_packages" ON "public"."site_packages" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_payment_methods Public access site_payment_methods; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_payment_methods'
      AND n.nspname = 'public'
      AND c.relname = 'site_payment_methods'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_payment_methods" ON "public"."site_payment_methods" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_purged_users Public access site_purged_users; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_purged_users'
      AND n.nspname = 'public'
      AND c.relname = 'site_purged_users'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_purged_users" ON "public"."site_purged_users" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_settings Public access site_settings; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_settings'
      AND n.nspname = 'public'
      AND c.relname = 'site_settings'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_settings" ON "public"."site_settings" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_staff_cards Public access site_staff_cards; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_staff_cards'
      AND n.nspname = 'public'
      AND c.relname = 'site_staff_cards'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_staff_cards" ON "public"."site_staff_cards" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_users Public access site_users; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_users'
      AND n.nspname = 'public'
      AND c.relname = 'site_users'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_users" ON "public"."site_users" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: site_withdrawals Public access site_withdrawals; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access site_withdrawals'
      AND n.nspname = 'public'
      AND c.relname = 'site_withdrawals'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access site_withdrawals" ON "public"."site_withdrawals" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_sessions Public access user_sessions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access user_sessions'
      AND n.nspname = 'public'
      AND c.relname = 'user_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access user_sessions" ON "public"."user_sessions" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: virtual_cards Public access virtual_cards; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access virtual_cards'
      AND n.nspname = 'public'
      AND c.relname = 'virtual_cards'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access virtual_cards" ON "public"."virtual_cards" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: withdrawal_conditions Public access withdrawal_conditions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public access withdrawal_conditions'
      AND n.nspname = 'public'
      AND c.relname = 'withdrawal_conditions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Public access withdrawal_conditions" ON "public"."withdrawal_conditions" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: admin_auth; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."admin_auth" ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."customer_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: promotion_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."promotion_media" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_contracts" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_customer_fixed_deposits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_customer_fixed_deposits" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_deposits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_deposits" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_dps_schemes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_dps_schemes" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_installments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_installments" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_loans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_loans" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_packages" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_payment_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_payment_methods" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_purged_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_purged_users" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_staff_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_staff_cards" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_users" ENABLE ROW LEVEL SECURITY;

--
-- Name: site_withdrawals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."site_withdrawals" ENABLE ROW LEVEL SECURITY;

--
-- Name: sub_admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."sub_admins" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;

--
-- Name: virtual_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."virtual_cards" ENABLE ROW LEVEL SECURITY;

--
-- Name: withdrawal_conditions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."withdrawal_conditions" ENABLE ROW LEVEL SECURITY;

--
-- Name: withdrawal_payment_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."withdrawal_payment_methods" ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




-- ============================================================
-- SECTION: DIFF FILTER OBJECTS
-- ============================================================
-- Objects that match diff-filter.json but cannot be represented
-- precisely by pg_dump --filter.

-- policy: "Public Access branding_assets" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public Access branding_assets'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Access branding_assets" ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''branding_assets''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Public Delete chat_images" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public Delete chat_images'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Delete chat_images" ON storage.objects AS PERMISSIVE FOR DELETE TO PUBLIC USING ((bucket_id = ''chat_images''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Public Insert chat_images" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public Insert chat_images'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Insert chat_images" ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((bucket_id = ''chat_images''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Public Read chat_images" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public Read chat_images'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Read chat_images" ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''chat_images''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Public Update chat_images" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Public Update chat_images'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Update chat_images" ON storage.objects AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((bucket_id = ''chat_images''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Update Access branding_assets" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Update Access branding_assets'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Update Access branding_assets" ON storage.objects AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((bucket_id = ''branding_assets''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Upload Access branding_assets" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Upload Access branding_assets'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Upload Access branding_assets" ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((bucket_id = ''branding_assets''::text));';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.admin_auth
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.admin_auth')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_auth;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.customer_messages
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.customer_messages')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_messages;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.promotion_media
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.promotion_media')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.promotion_media;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_contracts
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_contracts')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_contracts;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_customer_fixed_deposits
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_customer_fixed_deposits')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_customer_fixed_deposits;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_deposits
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_deposits')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_deposits;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_dps_schemes
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_dps_schemes')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_dps_schemes;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_installments
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_installments')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_installments;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_loans
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_loans')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_loans;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_packages
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_packages')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_packages;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_payment_methods
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_payment_methods')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_payment_methods;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_settings
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_settings')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_staff_cards
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_staff_cards')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_staff_cards;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_users
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_users')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_users;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.site_withdrawals
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.site_withdrawals')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_withdrawals;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.sub_admins
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.sub_admins')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.sub_admins;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.virtual_cards
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.virtual_cards')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.virtual_cards;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.withdrawal_conditions
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.withdrawal_conditions')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_conditions;';
  END IF;
END
$pg_schema_restore$;
-- publication table: supabase_realtime -> public.withdrawal_payment_methods
DO $pg_schema_restore$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') AND NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = to_regclass('public.withdrawal_payment_methods')
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_payment_methods;';
  END IF;
END
$pg_schema_restore$;

-- ============================================================
-- SECTION: STORAGE BUCKETS DATA
-- ============================================================

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('branding_assets', 'branding_assets', NULL, '2026-10-16 15:32:06.592487+00', '2026-10-16 15:32:06.592487+00', 'true', 'false', NULL, NULL, NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('chat_images', 'chat_images', NULL, '2026-10-15 19:55:16.868884+00', '2026-10-15 19:55:16.868884+00', 'true', 'false', '10485760', '{image/jpeg,image/png,image/webp,image/gif,image/jpg}', NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";

-- ============================================================
-- SECTION: CRON JOBS
-- ============================================================
-- 用户自定义 pg_cron 任务。

