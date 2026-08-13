import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const db = "supabase_db_zebra-retail-local";
const owner = "00000000-0000-0000-0000-000000003001";
const store = "00000000-0000-0000-0000-000000003011";
const saleVariant = "00000000-0000-0000-0000-000000003031";
const adjustmentVariant = "00000000-0000-0000-0000-000000003032";
const sourceVariant = "00000000-0000-0000-0000-000000003033";
const replacementVariant = "00000000-0000-0000-0000-000000003034";

async function sql(command) {
  const { stdout } = await execFileAsync("docker", ["exec", db, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", command]);
  return stdout.trim();
}

async function waitForSchema() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      if (await sql("select to_regprocedure('public.exchange_sale_line(uuid,uuid,uuid,integer,numeric,text,jsonb,text,uuid,timestamp with time zone)') is not null;")) return;
    } catch { /* db reset is still recreating the local schema */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Local Supabase schema did not become ready after reset");
}

function concurrent(command) {
  return new Promise((resolve) => {
    const child = spawn("docker", ["exec", db, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", command]);
    let output = ""; child.stdout.on("data", (chunk) => { output += chunk; }); child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("close", (status) => resolve({ status, output }));
  });
}

const asOwner = (statement) => `select set_config('request.jwt.claim.sub', '${owner}', false); select pg_sleep(0.15); ${statement}`;
const sale = (variant, key) => asOwner(`select public.confirm_sale_with_payments('${store}', '[{"variant_id":"${variant}","quantity":1,"unit_price":10,"currency":"EUR"}]'::jsonb, '[{"method":"cash","amount":10,"currency":"EUR"}]'::jsonb, '${key}');`);
const adjustment = asOwner(`select public.confirm_inventory_adjustment('${store}', '${adjustmentVariant}', -1, 'Concurrent count correction', '00000000-0000-0000-0000-000000003062');`);
const exchange = asOwner(`select public.exchange_sale_line('${store}', '00000000-0000-0000-0000-000000003051', '${replacementVariant}', 1, 100, 'EUR', '[]'::jsonb, 'Concurrent exchange', '00000000-0000-0000-0000-000000003063');`);

async function assertOneConflict(name, left, right, variants) {
  const outcomes = await Promise.all([concurrent(left), concurrent(right)]);
  if (outcomes.filter((outcome) => outcome.status === 0).length !== 1) throw new Error(`${name}: expected exactly one conflicting operation to succeed\n${outcomes.map((outcome) => outcome.output).join("\n")}`);
  for (const variant of variants) {
    const balance = Number(await sql(`select coalesce(sum(quantity), 0) from public.inventory_movements where store_id = '${store}' and variant_id = '${variant}';`));
    if (balance < 0) throw new Error(`${name}: negative balance for ${variant}`);
  }
  console.log(`PASS ${name}: one operation rejected and ledger balances remain non-negative`);
}

await waitForSchema();
if ((await sql(`select exists(select 1 from public.stores where id = '${store}');`)) === "t") throw new Error("Concurrency fixture requires a clean local database");
await sql(`
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('00000000-0000-0000-0000-000000000000', '${owner}', 'authenticated', 'authenticated', 'concurrency-owner@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
  insert into public.stores (id, code, name) values ('${store}', 'concurrency', 'Concurrency Store');
  insert into public.store_memberships (store_id, user_id, role, status) values ('${store}', '${owner}', 'owner', 'active');
  insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
    ('00000000-0000-0000-0000-000000003021', '${store}', 'CON-A', 'Concurrent sale', 'Zebra', 'clothing', 'unisex'),
    ('00000000-0000-0000-0000-000000003022', '${store}', 'CON-B', 'Concurrent adjustment', 'Zebra', 'clothing', 'unisex'),
    ('00000000-0000-0000-0000-000000003023', '${store}', 'CON-C', 'Exchange source', 'Zebra', 'clothing', 'unisex'),
    ('00000000-0000-0000-0000-000000003024', '${store}', 'CON-D', 'Exchange replacement', 'Zebra', 'clothing', 'unisex');
  insert into public.product_variants (id, product_model_id, color, size) values
    ('${saleVariant}', '00000000-0000-0000-0000-000000003021', 'Black', 'M'), ('${adjustmentVariant}', '00000000-0000-0000-0000-000000003022', 'Black', 'M'), ('${sourceVariant}', '00000000-0000-0000-0000-000000003023', 'Black', 'M'), ('${replacementVariant}', '00000000-0000-0000-0000-000000003024', 'Black', 'M');
  insert into public.purchase_receipts (id, store_id, status, source, created_by, confirmed_by, confirmed_at) values ('00000000-0000-0000-0000-000000003041', '${store}', 'confirmed', 'manual', '${owner}', '${owner}', now());
  insert into public.purchase_receipt_lines (receipt_id, variant_id, quantity, unit_cost, currency, eur_rate, unit_cost_eur) values
    ('00000000-0000-0000-0000-000000003041', '${saleVariant}', 1, 4, 'EUR', 1, 4), ('00000000-0000-0000-0000-000000003041', '${adjustmentVariant}', 1, 4, 'EUR', 1, 4), ('00000000-0000-0000-0000-000000003041', '${replacementVariant}', 1, 4, 'EUR', 1, 4);
  insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id, reason) values ('${store}', '${saleVariant}', 'receipt', 1, '${owner}', 'Fixture'), ('${store}', '${adjustmentVariant}', 'receipt', 1, '${owner}', 'Fixture'), ('${store}', '${replacementVariant}', 'receipt', 1, '${owner}', 'Fixture');
  insert into public.sales (id, store_id, seller_id, total_amount_eur) values ('00000000-0000-0000-0000-000000003050', '${store}', '${owner}', 100);
  insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur) values ('00000000-0000-0000-0000-000000003051', '00000000-0000-0000-0000-000000003050', '${sourceVariant}', 1, 100, 'EUR', 1, 100, 4);
`);

await assertOneConflict("sale vs sale", sale(saleVariant, "00000000-0000-0000-0000-000000003061"), sale(saleVariant, "00000000-0000-0000-0000-000000003064"), [saleVariant]);
await assertOneConflict("sale vs adjustment", sale(adjustmentVariant, "00000000-0000-0000-0000-000000003065"), adjustment, [adjustmentVariant]);
await assertOneConflict("sale vs exchange", sale(replacementVariant, "00000000-0000-0000-0000-000000003066"), exchange, [sourceVariant, replacementVariant]);
console.log("PASS repeated clean-run concurrency harness");
