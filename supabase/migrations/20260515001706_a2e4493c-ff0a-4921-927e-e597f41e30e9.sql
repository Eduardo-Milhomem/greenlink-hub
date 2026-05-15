REVOKE EXECUTE ON FUNCTION public.next_doc_number(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_doc_number(text, text) TO service_role;