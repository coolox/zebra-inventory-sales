create or replace function public.owner_cash_report(p_store_id uuid, p_from date, p_to date)
returns table(payment_method public.payment_method, currency public.currency_code, payment_count bigint, amount numeric)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.user_is_store_owner(p_store_id) then
    raise exception 'Only an Owner can view Cash reports' using errcode = '42501';
  end if;

  return query
  select captured.method, captured.currency, count(*)::bigint, sum(captured.amount)::numeric
  from (
    select payment.method, payment.currency, payment.amount
    from public.sale_payments payment join public.sales sale on sale.id=payment.sale_id join public.stores store on store.id=sale.store_id
    where sale.store_id=p_store_id and sale.status='confirmed' and (sale.sold_at at time zone store.timezone)::date between p_from and p_to
    union all
    select payment.method, payment.currency, payment.amount
    from public.sale_exchange_payments payment join public.sale_exchanges exchange on exchange.id=payment.exchange_id join public.stores store on store.id=exchange.store_id
    where exchange.store_id=p_store_id and (exchange.exchanged_at at time zone store.timezone)::date between p_from and p_to
  ) captured
  group by captured.method, captured.currency order by captured.method, captured.currency
  ;
end;
$$;
revoke all on function public.owner_cash_report(uuid,date,date) from public;
grant execute on function public.owner_cash_report(uuid,date,date) to authenticated;
