
ALTER TABLE public.customer_contacts ADD CONSTRAINT fk_cc_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
ALTER TABLE public.customer_addresses ADD CONSTRAINT fk_ca_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
ALTER TABLE public.opportunities ADD CONSTRAINT fk_opp_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.opportunities ADD CONSTRAINT fk_opp_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ADD CONSTRAINT fk_q_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.quotes ADD CONSTRAINT fk_q_opp FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE SET NULL;
ALTER TABLE public.quote_items ADD CONSTRAINT fk_qi_quote FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
ALTER TABLE public.quote_items ADD CONSTRAINT fk_qi_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE SET NULL;
ALTER TABLE public.customer_orders ADD CONSTRAINT fk_co_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.customer_orders ADD CONSTRAINT fk_co_quote FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES public.customer_orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT fk_oi_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE SET NULL;
ALTER TABLE public.contracts ADD CONSTRAINT fk_ctr_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.contracts ADD CONSTRAINT fk_ctr_order FOREIGN KEY (order_id) REFERENCES public.customer_orders(id) ON DELETE SET NULL;
ALTER TABLE public.contract_items ADD CONSTRAINT fk_ci_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;
ALTER TABLE public.contract_items ADD CONSTRAINT fk_ci_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE SET NULL;
ALTER TABLE public.assets ADD CONSTRAINT fk_a_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.assets ADD CONSTRAINT fk_a_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.assets ADD CONSTRAINT fk_a_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE SET NULL;
ALTER TABLE public.assets ADD CONSTRAINT fk_a_address FOREIGN KEY (address_id) REFERENCES public.customer_addresses(id) ON DELETE SET NULL;
ALTER TABLE public.service_orders ADD CONSTRAINT fk_so_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.service_orders ADD CONSTRAINT fk_so_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.service_orders ADD CONSTRAINT fk_so_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;
ALTER TABLE public.service_orders ADD CONSTRAINT fk_so_order FOREIGN KEY (order_id) REFERENCES public.customer_orders(id) ON DELETE SET NULL;
ALTER TABLE public.service_order_tasks ADD CONSTRAINT fk_sot_so FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id) ON DELETE CASCADE;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_st_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_st_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_st_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;
ALTER TABLE public.ticket_messages ADD CONSTRAINT fk_tm_ticket FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;
ALTER TABLE public.service_orders ADD CONSTRAINT fk_so_ticket FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE SET NULL;
ALTER TABLE public.stock_balances ADD CONSTRAINT fk_sb_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE CASCADE;
ALTER TABLE public.stock_movements ADD CONSTRAINT fk_sm_item FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id) ON DELETE RESTRICT;
ALTER TABLE public.receivables ADD CONSTRAINT fk_r_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;
ALTER TABLE public.receivables ADD CONSTRAINT fk_r_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT fk_r_order FOREIGN KEY (order_id) REFERENCES public.customer_orders(id) ON DELETE SET NULL;

ALTER TABLE public.catalog_items ADD CONSTRAINT uq_ci_code UNIQUE (item_code);
ALTER TABLE public.quotes ADD CONSTRAINT uq_q_number UNIQUE (quote_number);
ALTER TABLE public.customer_orders ADD CONSTRAINT uq_co_number UNIQUE (order_number);
ALTER TABLE public.contracts ADD CONSTRAINT uq_ctr_number UNIQUE (contract_number);
ALTER TABLE public.service_orders ADD CONSTRAINT uq_so_number UNIQUE (os_number);
ALTER TABLE public.support_tickets ADD CONSTRAINT uq_st_number UNIQUE (ticket_number);
ALTER TABLE public.assets ADD CONSTRAINT uq_a_tag UNIQUE (asset_tag);

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['customers','leads','opportunities','catalog_items','quotes','customer_orders','contracts','assets','service_orders','support_tickets','receivables','payables','profiles','stock_balances']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

CREATE SEQUENCE IF NOT EXISTS public.seq_quote_number START 1000;
CREATE SEQUENCE IF NOT EXISTS public.seq_order_number START 1000;
CREATE SEQUENCE IF NOT EXISTS public.seq_contract_number START 100;
CREATE SEQUENCE IF NOT EXISTS public.seq_os_number START 1000;
CREATE SEQUENCE IF NOT EXISTS public.seq_ticket_number START 1000;
CREATE SEQUENCE IF NOT EXISTS public.seq_asset_tag START 1;

CREATE OR REPLACE FUNCTION public.next_doc_number(prefix text, seq_name text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n bigint;
BEGIN
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO n;
  RETURN prefix || '-' || lpad(n::text, 5, '0');
END $$;
