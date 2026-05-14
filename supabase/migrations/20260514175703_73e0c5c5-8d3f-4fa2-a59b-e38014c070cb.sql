
-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'operator', 'viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER role check (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','manager','operator')
  )
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + default viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- profiles policies
CREATE POLICY "Authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "Authenticated read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ HELPER: read+staff write policy macro via DO blocks ============
-- We'll create policies inline per table for clarity.

-- ============ CUSTOMERS ============
CREATE TYPE public.customer_type AS ENUM ('pf','pj');
CREATE TYPE public.generic_status AS ENUM ('active','inactive');

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type public.customer_type NOT NULL DEFAULT 'pj',
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  document_number TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  status public.generic_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role_title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT,
  street TEXT, number TEXT, complement TEXT, district TEXT,
  city TEXT, state TEXT, zip_code TEXT,
  latitude NUMERIC, longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ LEADS ============
CREATE TYPE public.lead_status AS ENUM ('novo','contatado','qualificado','perdido','convertido');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status public.lead_status NOT NULL DEFAULT 'novo',
  assigned_to UUID REFERENCES auth.users(id),
  converted_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ CATALOG ============
CREATE TYPE public.catalog_item_type AS ENUM ('product','service','kit','rental','manufactured');

CREATE TABLE public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  item_type public.catalog_item_type NOT NULL DEFAULT 'product',
  unit_code TEXT NOT NULL DEFAULT 'UN',
  sale_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  track_stock BOOLEAN NOT NULL DEFAULT false,
  track_serial BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_catalog_items_updated_at BEFORE UPDATE ON public.catalog_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ OPPORTUNITIES ============
CREATE TYPE public.opportunity_stage AS ENUM ('novo','qualificado','proposta','negociacao','ganho','perdido');

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage public.opportunity_stage NOT NULL DEFAULT 'novo',
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  expected_close_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  win_probability INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON public.opportunities
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ QUOTES ============
CREATE TYPE public.quote_status AS ENUM ('draft','sent','approved','rejected','expired','cancelled');

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  status public.quote_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  item_description TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============ CUSTOMER ORDERS ============
CREATE TYPE public.order_status AS ENUM ('open','approved','invoiced','partially_fulfilled','fulfilled','cancelled');

CREATE TABLE public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'open',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_customer_orders_updated_at BEFORE UPDATE ON public.customer_orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  service_start_date DATE,
  service_end_date DATE
);

-- ============ CONTRACTS ============
CREATE TYPE public.contract_type AS ENUM ('sale_installation','rental','subscription','support','mixed');
CREATE TYPE public.contract_status AS ENUM ('draft','active','suspended','expired','cancelled');
CREATE TYPE public.billing_frequency AS ENUM ('one_time','monthly','quarterly','semiannual','annual');
CREATE TYPE public.billing_status AS ENUM ('open','partial','paid','overdue','cancelled');

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.customer_orders(id) ON DELETE SET NULL,
  contract_type public.contract_type NOT NULL DEFAULT 'subscription',
  status public.contract_status NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE,
  billing_frequency public.billing_frequency NOT NULL DEFAULT 'monthly',
  monthly_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  price_indexer TEXT,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_contracts_updated_at BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.contract_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  billing_frequency public.billing_frequency,
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT true
);

-- ============ ASSETS ============
CREATE TYPE public.asset_owner_type AS ENUM ('greenlink','customer','third_party');
CREATE TYPE public.asset_status AS ENUM ('available','reserved','installed','rented','maintenance','returned','inactive');

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT NOT NULL UNIQUE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  serial_number TEXT,
  owner_type public.asset_owner_type NOT NULL DEFAULT 'greenlink',
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  status public.asset_status NOT NULL DEFAULT 'available',
  site_name TEXT,
  address_id UUID REFERENCES public.customer_addresses(id) ON DELETE SET NULL,
  installed_at TIMESTAMPTZ,
  last_reading_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ SERVICE ORDERS ============
CREATE TYPE public.service_type AS ENUM ('installation','maintenance','removal','support','inspection','training');
CREATE TYPE public.service_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.service_order_status AS ENUM ('open','scheduled','in_route','in_progress','waiting_parts','done','cancelled','return_required');

CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.customer_orders(id) ON DELETE SET NULL,
  ticket_id UUID,
  service_type public.service_type NOT NULL DEFAULT 'maintenance',
  priority public.service_priority NOT NULL DEFAULT 'medium',
  status public.service_order_status NOT NULL DEFAULT 'open',
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_service_orders_updated_at BEFORE UPDATE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.service_order_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ
);

-- ============ TICKETS ============
CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.ticket_status AS ENUM ('new','in_progress','waiting_customer','resolved','cancelled');

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  channel TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  status public.ticket_status NOT NULL DEFAULT 'new',
  sla_due_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.service_orders
  ADD CONSTRAINT service_orders_ticket_fk
  FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE SET NULL;

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ INVENTORY ============
CREATE TYPE public.stock_movement_type AS ENUM ('in','out','transfer','adjustment','reservation','release','consumption','production_in');

CREATE TABLE public.stock_balances (
  warehouse_id TEXT NOT NULL DEFAULT 'main',
  catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  on_hand NUMERIC(14,3) NOT NULL DEFAULT 0,
  reserved NUMERIC(14,3) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (warehouse_id, catalog_item_id)
);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type public.stock_movement_type NOT NULL,
  catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE RESTRICT,
  source_warehouse_id TEXT,
  target_warehouse_id TEXT,
  quantity NUMERIC(14,3) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ FINANCE ============
CREATE TABLE public.receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.customer_orders(id) ON DELETE SET NULL,
  category_id UUID,
  cost_center_id UUID,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  open_amount NUMERIC(14,2) NOT NULL,
  status public.billing_status NOT NULL DEFAULT 'open',
  origin_type TEXT,
  origin_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_receivables_updated_at BEFORE UPDATE ON public.receivables
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.payables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  supplier_id UUID,
  category_id UUID,
  cost_center_id UUID,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  open_amount NUMERIC(14,2) NOT NULL,
  status public.billing_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_payables_updated_at BEFORE UPDATE ON public.payables
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ RLS POLICIES (operational tables) ============
-- Pattern: any authenticated user reads; admin or manager writes.
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'customers','customer_contacts','customer_addresses',
    'leads','catalog_items','opportunities',
    'quotes','quote_items','customer_orders','order_items',
    'contracts','contract_items','assets',
    'service_orders','service_order_tasks',
    'support_tickets','ticket_messages',
    'stock_balances','stock_movements',
    'receivables','payables'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "auth_read_%s" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "staff_insert_%s" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),''admin'') OR public.has_role(auth.uid(),''manager''))', t, t);
    EXECUTE format('CREATE POLICY "staff_update_%s" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),''admin'') OR public.has_role(auth.uid(),''manager'')) WITH CHECK (public.has_role(auth.uid(),''admin'') OR public.has_role(auth.uid(),''manager''))', t, t);
    EXECUTE format('CREATE POLICY "staff_delete_%s" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''admin'') OR public.has_role(auth.uid(),''manager''))', t, t);
  END LOOP;
END $$;
