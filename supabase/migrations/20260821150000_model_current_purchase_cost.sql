-- TASK-177: current model cost applies prospectively to every variant of one Product code.
alter table public.product_models
  add column current_purchase_cost numeric(14,2),
  add column current_purchase_currency public.currency_code,
  add column current_purchase_cost_eur numeric(14,2);

create function public.update_product_model_details(
  p_store_id uuid, p_model_id uuid, p_name text, p_gender text,
  p_low_stock_threshold integer, p_purchase_cost numeric, p_purchase_currency text,
  p_purchase_cost_eur numeric
) returns public.product_models language plpgsql security definer set search_path = '' as $$
declare v_old public.product_models; v_new public.product_models; v_actor uuid := (select auth.uid());
begin
  if v_actor is null then raise exception 'Authentication is required'; end if;
  if not public.user_is_store_owner(p_store_id) then raise exception 'Only an Owner can edit product details'; end if;
  if nullif(btrim(p_name),'') is null or p_gender not in ('women','men','unisex') or p_low_stock_threshold < 0 or p_purchase_cost < 0 or p_purchase_currency not in ('EUR','USD','TRY','RUB','GBP') or p_purchase_cost_eur < 0 then raise exception 'Invalid product details'; end if;
  select * into v_old from public.product_models where id=p_model_id and store_id=p_store_id for update;
  if not found then raise exception 'Product model is not available in this store'; end if;
  update public.product_models set name=btrim(p_name), gender=p_gender, low_stock_threshold=p_low_stock_threshold, current_purchase_cost=p_purchase_cost, current_purchase_currency=p_purchase_currency::public.currency_code, current_purchase_cost_eur=p_purchase_cost_eur, updated_at=now() where id=p_model_id returning * into v_new;
  insert into public.audit_logs(store_id,actor_id,action,entity_type,entity_id,details) values (p_store_id,v_actor,'product_model.details_updated','product_model',p_model_id,jsonb_build_object('old_name',v_old.name,'new_name',v_new.name,'old_gender',v_old.gender,'new_gender',v_new.gender,'old_threshold',v_old.low_stock_threshold,'new_threshold',v_new.low_stock_threshold,'old_purchase_cost',v_old.current_purchase_cost,'new_purchase_cost',v_new.current_purchase_cost,'currency',v_new.current_purchase_currency,'purchase_cost_eur',v_new.current_purchase_cost_eur));
  return v_new;
end $$;
revoke all on function public.update_product_model_details(uuid,uuid,text,text,integer,numeric,text,numeric) from public;
grant execute on function public.update_product_model_details(uuid,uuid,text,text,integer,numeric,text,numeric) to authenticated;

create function public.apply_current_model_cost_to_future_sale()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_cost numeric(14,2);
begin
  select model.current_purchase_cost_eur into v_cost from public.product_variants variant join public.product_models model on model.id = variant.product_model_id where variant.id = new.variant_id;
  if v_cost is not null then new.unit_cost_eur := v_cost; end if;
  return new;
end $$;
create trigger sale_lines_apply_current_model_cost before insert on public.sale_lines for each row execute function public.apply_current_model_cost_to_future_sale();
