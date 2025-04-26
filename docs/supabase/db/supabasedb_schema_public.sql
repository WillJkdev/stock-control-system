--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.4

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

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: kardex_view; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.kardex_view AS (
	id integer,
	description text,
	date date,
	quantity double precision,
	movement_type text,
	details text,
	user_name text,
	stock numeric
);


--
-- Name: assign_admin_role_if_first(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_admin_role_if_first() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
  -- Si no hay otros usuarios, este es el primero → se le asigna rol 'admin'
  IF (SELECT COUNT(*) FROM users) = 0 THEN
    NEW.name := 'SuperAdmin';
    NEW.role := 'admin';
    NEW.is_protected := TRUE;
  ELSE
    -- Opcional: puedes forzar que todos los demás sean 'user'
    IF NEW.role IS NULL THEN
      NEW.role := 'user';
    END IF;
    -- Asegurar que is_protected sea FALSE para los siguientes
    NEW.is_protected := FALSE;
  END IF;

  RETURN NEW;
END;$$;


--
-- Name: count_user_company(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_user_company(id_company integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM company_assignment WHERE company_id = id_company);
END;
$$;


--
-- Name: insert_brands(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_brands(f_description text, f_company_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	PERFORM  1 FROM brands WHERE description = f_description AND company_id = f_company_id;
	IF FOUND THEN
		RAISE EXCEPTION 'Datos duplicados';
	ELSE
		INSERT INTO brands(description,company_id)
		VALUES(f_description,f_company_id);
	END IF;
END;
$$;


--
-- Name: insert_categories(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_categories(f_description text, f_color text, f_company_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	PERFORM  1 FROM categories WHERE description = f_description AND company_id = f_company_id;
	IF FOUND THEN
		RAISE EXCEPTION 'Datos duplicados';
	ELSE
		INSERT INTO categories(description,color,company_id)
		VALUES(f_description,f_color,f_company_id);
	END IF;
END;
$$;


--
-- Name: insert_permission_admin(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_permission_admin(p_user_id uuid, p_module_id integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  admin_check boolean;
begin
  -- Comprobar si el usuario autenticado es admin
  select exists (
    select 1
    from users
    where auth_id = auth.uid()
    and role = 'admin'
  ) into admin_check;

  if not admin_check then
    raise exception 'No tienes permisos para insertar permisos';
  end if;

  -- Insertar permiso
  insert into permissions (user_id, module_id)
  values (p_user_id, p_module_id);
end;
$$;


--
-- Name: insert_products(text, integer, numeric, numeric, text, text, numeric, numeric, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_products(_description text, _brand_id integer, _stock numeric, _stock_min numeric, _barcode text, _internal_code text, _purchase_price numeric, _sale_price numeric, _category_id integer, _company_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validación de parámetros obligatorios
    IF _description IS NULL OR _company_id IS NULL THEN
        RAISE EXCEPTION 'Descripción o Empresa no pueden ser NULL';
    END IF;

    -- Verificar si ya existe un producto con la misma descripción y empresa
    PERFORM 1 FROM products WHERE description = _description AND company_id = _company_id;
    
    IF FOUND THEN
        RAISE EXCEPTION 'Datos duplicados';
    ELSE
        INSERT INTO products(
            description, brand_id, stock, stock_min, barcode,
            internal_code, purchase_price, sale_price, category_id, company_id
        )
        VALUES(
            _description, _brand_id, _stock, _stock_min, _barcode,
            _internal_code, _purchase_price, _sale_price, _category_id, _company_id
        );
    END IF;
END;
$$;


--
-- Name: insertdefault(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insertdefault() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    item RECORD;
BEGIN
    INSERT INTO brands(description, company_id)
    VALUES('Generica', NEW.id);
    INSERT INTO categories(description, color, company_id)
    VALUES('General', '#FF5722', NEW.id);
    INSERT INTO company_assignment (company_id, user_id)
    VALUES(NEW.id, NEW.user_admin_id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en el trigger: %', SQLERRM;
        RETURN NULL; -- O manejar el error de otra manera
END;
$$;


--
-- Name: insertpermission(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insertpermission() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    item RECORD;
BEGIN
    IF NEW.role = 'admin' THEN
        INSERT INTO company(name, currency_symbol, user_admin_id)
        VALUES('Generica', 'S/.', NEW.id);
    END IF;

    FOR item IN 
        SELECT id FROM modules
    LOOP
        IF NEW.role = 'admin' THEN
            INSERT INTO permissions(user_id, module_id)
            VALUES(NEW.id, item.id);
        END IF;
    END LOOP;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en el trigger: %', SQLERRM;
        RETURN NULL; -- O manejar el error de otra manera
END;
$$;


--
-- Name: modify_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.modify_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  stockproduct NUMERIC;
BEGIN
  IF NEW.movement_type = 'input' THEN
    UPDATE products
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
  ELSE
    SELECT COALESCE(stock, 0) INTO stockproduct
    FROM products
    WHERE id = NEW.product_id;
    
    IF stockproduct >= NEW.quantity THEN
      UPDATE products
      SET stock = stock - NEW.quantity
      WHERE id = NEW.product_id;
    ELSE
      RAISE EXCEPTION 'Insufficient stock for this product';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: search_kardex(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_kardex(_company_id integer, searcher text) RETURNS TABLE(id integer, description text, date date, quantity double precision, movement_type text, details text, user_name text, stock numeric, created_at timestamp with time zone)
    LANGUAGE sql
    AS $$
SELECT 
  kardex.id,
  products.description,
  kardex.date,
  kardex.quantity,
  kardex.movement_type,
  kardex.details,
  users.name AS user_name,
  products.stock,
  kardex.created_at
FROM kardex
INNER JOIN users ON users.id = kardex.user_id
INNER JOIN products ON products.id = kardex.product_id
WHERE kardex.company_id = _company_id
  AND (
    searcher IS NULL 
    OR searcher = '' 
    OR products.description ILIKE '%' || searcher || '%'
  )
$$;


--
-- Name: show_kardex(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_kardex(_company_id integer) RETURNS TABLE(id integer, description text, date timestamp with time zone, quantity double precision, movement_type text, details text, user_name text, stock numeric, created_at timestamp with time zone, status boolean)
    LANGUAGE sql
    AS $$
SELECT 
  kardex.id,
  products.description,
  kardex.date,
  kardex.quantity,
  kardex.movement_type,
  kardex.details,
  users.name AS user_name,
  products.stock,
  kardex.created_at,
  kardex.status
FROM kardex
INNER JOIN company ON company.id = kardex.company_id
INNER JOIN users ON users.id = kardex.user_id
INNER JOIN products ON products.id = kardex.product_id
WHERE kardex.company_id = _company_id
$$;


--
-- Name: show_kardex_view(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_kardex_view(_company_id integer) RETURNS TABLE(id integer, description text, date date, quantity double precision, movement_type text, details text, user_name text, stock numeric)
    LANGUAGE sql
    AS $$
SELECT 
  kardex.id,
  products.description,
  kardex.date,
  kardex.quantity,
  kardex.movement_type,
  kardex.details,
  users.name AS user_name,
  products.stock
FROM kardex
INNER JOIN company ON company.id = kardex.company_id
INNER JOIN users ON users.id = kardex.user_id
INNER JOIN products ON products.id = kardex.product_id
WHERE kardex.company_id = _company_id
$$;


--
-- Name: show_products(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_products(_company_id integer) RETURNS TABLE(id integer, description text, brand_id integer, stock numeric, stock_min numeric, barcode text, internal_code text, purchase_price numeric, sale_price numeric, category_id integer, company_id integer, created_at timestamp without time zone, color text, brand text, categories text)
    LANGUAGE sql
    AS $$
SELECT 
  p.id,
  p.description,
  p.brand_id,
  p.stock,
  p.stock_min,
  p.barcode,
  p.internal_code,
  p.purchase_price,
  p.sale_price,
  p.category_id,
  p.company_id,
  p.created_at,
  c.color,
  b.description AS brand,
  c.description AS categories
FROM products p
INNER JOIN categories c ON c.id = p.category_id
INNER JOIN brands b ON b.id = p.brand_id
WHERE p.company_id = _company_id;
$$;


--
-- Name: show_staff(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.show_staff(_company_id integer) RETURNS TABLE(id integer, name text, nro_doc text, phone text, address text, reg_date text, status text, role text, auth_id text, type_doc text, email text, created_at timestamp without time zone)
    LANGUAGE sql
    AS $$
SELECT 
  u.id,
  u.name,
  u.nro_doc,
  u.phone,
  u.address,
  u.reg_date,
  u.status,
  u.role,
  u.auth_id,
  u.type_doc,
  u.email,
  u.created_at
FROM company_assignment ca
INNER JOIN users u ON u.id = ca.user_id
WHERE ca.company_id = _company_id;
$$;


--
-- Name: update_kardex_detector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_kardex_detector() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Solo si el status cambia de true -> false
  IF OLD.status = true AND NEW.status = false THEN

    -- Log para debug
    -- INSERT INTO debug_trigger_log (message) 
    -- VALUES ('Detectado cambio de status a FALSE para producto id=' || NEW.product_id);

    -- Ajustar el stock dependiendo del movimiento
    IF OLD.movement_type = 'input' THEN
      UPDATE products
      SET stock = stock - OLD.quantity
      WHERE id = OLD.product_id;
    ELSIF OLD.movement_type = 'output' THEN
      UPDATE products
      SET stock = stock + OLD.quantity
      WHERE id = OLD.product_id;
    END IF;

  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al procesar actualización de movimiento: %', SQLERRM;
END;
$$;


--
-- Name: valued_inventory(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.valued_inventory(_company_id integer, _searcher text DEFAULT NULL::text) RETURNS TABLE(id integer, description text, stock numeric, purchase_price numeric, total numeric)
    LANGUAGE sql
    AS $$
  SELECT 
    id,
    description,
    stock,
    purchase_price,
    (stock * purchase_price) AS total
  FROM products
  WHERE company_id = _company_id
    AND (_searcher IS NULL OR description ILIKE '%' || _searcher || '%');
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    description text,
    company_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.brands ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    description text,
    color text,
    company_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company (
    id bigint NOT NULL,
    name text,
    currency_symbol text,
    user_admin_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_assignment (
    id bigint NOT NULL,
    company_id bigint,
    user_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.company_assignment ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.company_assignment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.company ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.company_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: debug_trigger_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debug_trigger_log (
    id integer NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: debug_trigger_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.debug_trigger_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: debug_trigger_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.debug_trigger_log_id_seq OWNED BY public.debug_trigger_log.id;


--
-- Name: kardex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kardex (
    id bigint NOT NULL,
    date timestamp with time zone,
    movement_type text,
    quantity double precision,
    user_id bigint,
    product_id bigint,
    company_id bigint,
    details text,
    status boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kardex_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.kardex ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.kardex_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id bigint NOT NULL,
    name text,
    "check" boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.modules ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    user_id bigint,
    module_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    description text,
    brand_id bigint,
    stock numeric,
    stock_min numeric,
    barcode text,
    internal_code text,
    purchase_price numeric,
    sale_price numeric,
    category_id bigint,
    company_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name text DEFAULT 'generic'::text,
    nro_doc text DEFAULT '-'::text,
    phone text DEFAULT '-'::text,
    address text DEFAULT '--'::text,
    reg_date date NOT NULL,
    status text DEFAULT 'active'::text,
    role text NOT NULL,
    auth_id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_doc text DEFAULT '-'::text,
    email text DEFAULT '-'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_protected boolean DEFAULT false
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: debug_trigger_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debug_trigger_log ALTER COLUMN id SET DEFAULT nextval('public.debug_trigger_log_id_seq'::regclass);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: company_assignment company_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_assignment
    ADD CONSTRAINT company_assignment_pkey PRIMARY KEY (id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: debug_trigger_log debug_trigger_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debug_trigger_log
    ADD CONSTRAINT debug_trigger_log_pkey PRIMARY KEY (id);


--
-- Name: kardex kardex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users before_insert_user_asignar_admin; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER before_insert_user_asignar_admin BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role_if_first();


--
-- Name: company defaulttrigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER defaulttrigger AFTER INSERT ON public.company FOR EACH ROW EXECUTE FUNCTION public.insertdefault();


--
-- Name: kardex modify_stock_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER modify_stock_trigger AFTER INSERT ON public.kardex FOR EACH ROW EXECUTE FUNCTION public.modify_stock();


--
-- Name: users permissiontrigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER permissiontrigger AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.insertpermission();


--
-- Name: kardex update_kardex_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_kardex_trigger AFTER UPDATE ON public.kardex FOR EACH ROW EXECUTE FUNCTION public.update_kardex_detector();


--
-- Name: brands brands_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_assignment company_assignment_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_assignment
    ADD CONSTRAINT company_assignment_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_assignment company_assignment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_assignment
    ADD CONSTRAINT company_assignment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company company_user_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_user_admin_id_fkey FOREIGN KEY (user_admin_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kardex kardex_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kardex kardex_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kardex kardex_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions Allow insert for admin users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for admin users" ON public.permissions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = 'admin'::text)))));


--
-- Name: brands Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.brands FOR DELETE TO authenticated USING ((id = id));


--
-- Name: categories Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.categories FOR DELETE TO authenticated USING ((id = id));


--
-- Name: company Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.company FOR DELETE TO authenticated USING ((id = id));


--
-- Name: company_assignment Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.company_assignment FOR DELETE TO authenticated USING ((id = id));


--
-- Name: kardex Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.kardex FOR DELETE TO authenticated USING ((id = id));


--
-- Name: modules Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.modules FOR DELETE TO authenticated USING ((id = id));


--
-- Name: permissions Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.permissions FOR DELETE TO authenticated USING ((id = id));


--
-- Name: products Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.products FOR DELETE TO authenticated USING ((id = id));


--
-- Name: users Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for users based on user_id" ON public.users FOR DELETE TO authenticated USING ((id = id));


--
-- Name: brands Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.brands FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: categories Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: company Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.company FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: company_assignment Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.company_assignment FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: kardex Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.kardex FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: modules Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.modules FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: permissions Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.permissions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: products Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.products FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: users Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: brands Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.brands FOR SELECT TO authenticated USING (true);


--
-- Name: categories Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT TO authenticated USING (true);


--
-- Name: company Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.company FOR SELECT TO authenticated USING (true);


--
-- Name: company_assignment Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.company_assignment FOR SELECT TO authenticated USING (true);


--
-- Name: kardex Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.kardex FOR SELECT TO authenticated USING (true);


--
-- Name: modules Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.modules FOR SELECT TO authenticated USING (true);


--
-- Name: permissions Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.permissions FOR SELECT TO authenticated USING (true);


--
-- Name: products Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);


--
-- Name: users Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT TO authenticated USING (true);


--
-- Name: brands Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.brands FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: categories Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.categories FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: company Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.company FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: company_assignment Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.company_assignment FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: kardex Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.kardex FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: modules Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.modules FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: permissions Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.permissions FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: products Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.products FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: users Enable update for users based on email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users based on email" ON public.users FOR UPDATE TO authenticated USING ((id = id)) WITH CHECK ((id = id));


--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: company; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;

--
-- Name: company_assignment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_assignment ENABLE ROW LEVEL SECURITY;

--
-- Name: kardex; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kardex ENABLE ROW LEVEL SECURITY;

--
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION assign_admin_role_if_first(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.assign_admin_role_if_first() TO anon;
GRANT ALL ON FUNCTION public.assign_admin_role_if_first() TO authenticated;
GRANT ALL ON FUNCTION public.assign_admin_role_if_first() TO service_role;


--
-- Name: FUNCTION count_user_company(id_company integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.count_user_company(id_company integer) TO anon;
GRANT ALL ON FUNCTION public.count_user_company(id_company integer) TO authenticated;
GRANT ALL ON FUNCTION public.count_user_company(id_company integer) TO service_role;


--
-- Name: FUNCTION insert_brands(f_description text, f_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insert_brands(f_description text, f_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.insert_brands(f_description text, f_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.insert_brands(f_description text, f_company_id integer) TO service_role;


--
-- Name: FUNCTION insert_categories(f_description text, f_color text, f_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insert_categories(f_description text, f_color text, f_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.insert_categories(f_description text, f_color text, f_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.insert_categories(f_description text, f_color text, f_company_id integer) TO service_role;


--
-- Name: FUNCTION insert_permission_admin(p_user_id uuid, p_module_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insert_permission_admin(p_user_id uuid, p_module_id integer) TO anon;
GRANT ALL ON FUNCTION public.insert_permission_admin(p_user_id uuid, p_module_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.insert_permission_admin(p_user_id uuid, p_module_id integer) TO service_role;


--
-- Name: FUNCTION insert_products(_description text, _brand_id integer, _stock numeric, _stock_min numeric, _barcode text, _internal_code text, _purchase_price numeric, _sale_price numeric, _category_id integer, _company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insert_products(_description text, _brand_id integer, _stock numeric, _stock_min numeric, _barcode text, _internal_code text, _purchase_price numeric, _sale_price numeric, _category_id integer, _company_id integer) TO anon;
GRANT ALL ON FUNCTION public.insert_products(_description text, _brand_id integer, _stock numeric, _stock_min numeric, _barcode text, _internal_code text, _purchase_price numeric, _sale_price numeric, _category_id integer, _company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.insert_products(_description text, _brand_id integer, _stock numeric, _stock_min numeric, _barcode text, _internal_code text, _purchase_price numeric, _sale_price numeric, _category_id integer, _company_id integer) TO service_role;


--
-- Name: FUNCTION insertdefault(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insertdefault() TO anon;
GRANT ALL ON FUNCTION public.insertdefault() TO authenticated;
GRANT ALL ON FUNCTION public.insertdefault() TO service_role;


--
-- Name: FUNCTION insertpermission(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.insertpermission() TO anon;
GRANT ALL ON FUNCTION public.insertpermission() TO authenticated;
GRANT ALL ON FUNCTION public.insertpermission() TO service_role;


--
-- Name: FUNCTION modify_stock(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.modify_stock() TO anon;
GRANT ALL ON FUNCTION public.modify_stock() TO authenticated;
GRANT ALL ON FUNCTION public.modify_stock() TO service_role;


--
-- Name: FUNCTION search_kardex(_company_id integer, searcher text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.search_kardex(_company_id integer, searcher text) TO anon;
GRANT ALL ON FUNCTION public.search_kardex(_company_id integer, searcher text) TO authenticated;
GRANT ALL ON FUNCTION public.search_kardex(_company_id integer, searcher text) TO service_role;


--
-- Name: FUNCTION show_kardex(_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.show_kardex(_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.show_kardex(_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.show_kardex(_company_id integer) TO service_role;


--
-- Name: FUNCTION show_kardex_view(_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.show_kardex_view(_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.show_kardex_view(_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.show_kardex_view(_company_id integer) TO service_role;


--
-- Name: FUNCTION show_products(_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.show_products(_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.show_products(_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.show_products(_company_id integer) TO service_role;


--
-- Name: FUNCTION show_staff(_company_id integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.show_staff(_company_id integer) TO anon;
GRANT ALL ON FUNCTION public.show_staff(_company_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.show_staff(_company_id integer) TO service_role;


--
-- Name: FUNCTION update_kardex_detector(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_kardex_detector() TO anon;
GRANT ALL ON FUNCTION public.update_kardex_detector() TO authenticated;
GRANT ALL ON FUNCTION public.update_kardex_detector() TO service_role;


--
-- Name: FUNCTION valued_inventory(_company_id integer, _searcher text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.valued_inventory(_company_id integer, _searcher text) TO anon;
GRANT ALL ON FUNCTION public.valued_inventory(_company_id integer, _searcher text) TO authenticated;
GRANT ALL ON FUNCTION public.valued_inventory(_company_id integer, _searcher text) TO service_role;


--
-- Name: TABLE brands; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.brands TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.brands TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.brands TO service_role;


--
-- Name: SEQUENCE brands_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.brands_id_seq TO anon;
GRANT ALL ON SEQUENCE public.brands_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.brands_id_seq TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.categories TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.categories TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.categories TO service_role;


--
-- Name: SEQUENCE categories_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.categories_id_seq TO service_role;


--
-- Name: TABLE company; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company TO service_role;


--
-- Name: TABLE company_assignment; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company_assignment TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company_assignment TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.company_assignment TO service_role;


--
-- Name: SEQUENCE company_assignment_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.company_assignment_id_seq TO anon;
GRANT ALL ON SEQUENCE public.company_assignment_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.company_assignment_id_seq TO service_role;


--
-- Name: SEQUENCE company_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.company_id_seq TO anon;
GRANT ALL ON SEQUENCE public.company_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.company_id_seq TO service_role;


--
-- Name: TABLE debug_trigger_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.debug_trigger_log TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.debug_trigger_log TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.debug_trigger_log TO service_role;


--
-- Name: SEQUENCE debug_trigger_log_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.debug_trigger_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.debug_trigger_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.debug_trigger_log_id_seq TO service_role;


--
-- Name: TABLE kardex; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.kardex TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.kardex TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.kardex TO service_role;


--
-- Name: SEQUENCE kardex_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.kardex_id_seq TO anon;
GRANT ALL ON SEQUENCE public.kardex_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.kardex_id_seq TO service_role;


--
-- Name: TABLE modules; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.modules TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.modules TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.modules TO service_role;


--
-- Name: SEQUENCE modules_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.modules_id_seq TO anon;
GRANT ALL ON SEQUENCE public.modules_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.modules_id_seq TO service_role;


--
-- Name: TABLE permissions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permissions TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permissions TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permissions TO service_role;


--
-- Name: SEQUENCE permissions_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.permissions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.permissions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.permissions_id_seq TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.products TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.products TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.products TO service_role;


--
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO service_role;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

