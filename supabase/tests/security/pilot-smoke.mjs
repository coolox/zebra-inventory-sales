/**
 * TASK-148 — security and pilot-capacity smoke.
 *
 * Probes the real HTTP boundary with signed JWTs instead of raw SQL, so RLS,
 * PostgREST grants and RPC guards are all exercised the way a browser reaches
 * them. Then runs a five-user concurrent burst and reconciles the ledger.
 *
 * Requires a clean local stack: `npm run supabase:reset` first.
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { createHmac } from "node:crypto";

const execFileAsync = promisify(execFile);
const db = "supabase_db_zebra-retail-local";
const api = "http://127.0.0.1:54321";

// Well-known local development keys printed by `supabase status`. Never used against hosted projects.
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const jwtSecret = "super-secret-jwt-token-with-at-least-32-characters-long";

const storeA = "00000000-0000-0000-0000-000000004901";
const storeB = "00000000-0000-0000-0000-000000004902";
const ownerA = "00000000-0000-0000-0000-000000004911";
const blocked = "00000000-0000-0000-0000-000000004913";
const ownerB = "00000000-0000-0000-0000-000000004914";
const unknown = "00000000-0000-0000-0000-000000004915";
const sellers = [1, 2, 3, 4, 5].map((n) => `00000000-0000-0000-0000-00000000492${n}`);
const variants = [1, 2, 3, 4, 5].map((n) => `00000000-0000-0000-0000-00000000494${n}`);
const variantB = "00000000-0000-0000-0000-000000004949";
const saleA = "00000000-0000-0000-0000-000000004951";
const saleLineA = "00000000-0000-0000-0000-000000004952";

let failures = 0;
function check(name, passed, detail = "") {
  if (passed) console.log(`PASS ${name}`);
  else { failures += 1; console.log(`FAIL ${name}${detail ? ` — ${detail}` : ""}`); }
}

async function sql(command) {
  const { stdout } = await execFileAsync("docker", ["exec", db, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", command]);
  return stdout.trim();
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function mintToken(sub) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ aud: "authenticated", role: "authenticated", sub, iat: now, exp: now + 3600, iss: "supabase" }));
  const signature = createHmac("sha256", jwtSecret).update(`${header}.${payload}`).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.${signature}`;
}

async function request(path, { token, method = "GET", body } = {}) {
  const headers = { apikey: anonKey, "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${api}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let parsed; try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: response.status, body: parsed };
}

const rowCount = (result) => (Array.isArray(result.body) ? result.body.length : -1);
const denied = (result) => result.status >= 400 || rowCount(result) === 0;

async function seed() {
  if ((await sql(`select exists(select 1 from public.stores where id = '${storeA}');`)) === "t") {
    throw new Error("Pilot smoke requires a clean local database: run npm run supabase:reset");
  }
  const users = [ownerA, ...sellers, blocked, ownerB, unknown];
  await sql(`
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ${users.map((id, index) => `('00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated', 'pilot-smoke-${index}@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now())`).join(",")};
    insert into public.stores (id, code, name) values ('${storeA}', 'pilot-a', 'Pilot Store A'), ('${storeB}', 'pilot-b', 'Other Store B');
    insert into public.store_memberships (store_id, user_id, role, status) values
      ('${storeA}', '${ownerA}', 'owner', 'active'),
      ${sellers.map((id) => `('${storeA}', '${id}', 'seller', 'active')`).join(",")},
      ('${storeA}', '${blocked}', 'seller', 'blocked'),
      ('${storeB}', '${ownerB}', 'owner', 'active');
    insert into public.product_models (id, store_id, model_code, name, brand, category, gender) values
      ${variants.map((_, i) => `('00000000-0000-0000-0000-00000000493${i + 1}', '${storeA}', 'PS-${i + 1}', 'Pilot model ${i + 1}', 'Zebra', 'clothing', 'unisex')`).join(",")},
      ('00000000-0000-0000-0000-000000004939', '${storeB}', 'PS-B', 'Other store model', 'Zebra', 'clothing', 'unisex');
    insert into public.product_variants (id, product_model_id, color, size) values
      ${variants.map((id, i) => `('${id}', '00000000-0000-0000-0000-00000000493${i + 1}', 'Black', 'M')`).join(",")},
      ('${variantB}', '00000000-0000-0000-0000-000000004939', 'Black', 'M');
    insert into public.purchase_receipts (id, store_id, status, source, created_by, confirmed_by, confirmed_at)
      values ('00000000-0000-0000-0000-000000004941', '${storeA}', 'confirmed', 'manual', '${ownerA}', '${ownerA}', now());
    insert into public.purchase_receipt_lines (receipt_id, variant_id, quantity, unit_cost, currency, eur_rate, unit_cost_eur) values
      ${variants.map((id) => `('00000000-0000-0000-0000-000000004941', '${id}', 5, 4, 'EUR', 1, 4)`).join(",")};
    insert into public.inventory_movements (store_id, variant_id, movement_type, quantity, actor_id, reason) values
      ${variants.map((id) => `('${storeA}', '${id}', 'receipt', 5, '${ownerA}', 'Pilot smoke fixture')`).join(",")};
    insert into public.sales (id, store_id, seller_id, total_amount_eur) values ('${saleA}', '${storeA}', '${sellers[0]}', 100);
    insert into public.sale_lines (id, sale_id, variant_id, quantity, unit_price, currency, eur_rate, unit_price_eur, unit_cost_eur)
      values ('${saleLineA}', '${saleA}', '${variants[0]}', 1, 100, 'EUR', 1, 100, 4);
  `);
}

async function authorizationProbes() {
  const sellerToken = mintToken(sellers[0]);
  const ownerToken = mintToken(ownerA);

  // 1. Anonymous callers must see nothing and must not reach business RPCs.
  check("anonymous cannot read sales", denied(await request("/rest/v1/sales?select=id")));
  check("anonymous cannot read stores", denied(await request("/rest/v1/stores?select=id")));
  check("anonymous cannot read product models", denied(await request("/rest/v1/product_models?select=id")));
  check("anonymous cannot call sale RPC", denied(await request("/rest/v1/rpc/confirm_sale_with_payments", {
    method: "POST", body: { p_store_id: storeA, p_lines: [], p_payments: [], p_idempotency_key: saleA },
  })));

  // 2. A validly signed token for a user with no membership sees nothing.
  check("unknown user sees no sales", denied(await request("/rest/v1/sales?select=id", { token: mintToken(unknown) })));
  check("unknown user sees no stores", denied(await request("/rest/v1/stores?select=id", { token: mintToken(unknown) })));

  // 3. A blocked seller loses access without being deleted.
  check("blocked seller sees no sales", denied(await request("/rest/v1/sales?select=id", { token: mintToken(blocked) })));
  check("blocked seller sees no variants", denied(await request("/rest/v1/product_variants?select=id", { token: mintToken(blocked) })));

  // 4. Cross-store isolation: the other store's owner must not see store A.
  const crossSales = await request("/rest/v1/sales?select=id", { token: mintToken(ownerB) });
  check("other store owner sees no store A sales", denied(crossSales), `rows=${rowCount(crossSales)}`);
  const crossStores = await request(`/rest/v1/stores?select=id&id=eq.${storeA}`, { token: mintToken(ownerB) });
  check("other store owner cannot read store A row", denied(crossStores), `rows=${rowCount(crossStores)}`);

  // 5. The normal pilot flow must still work, otherwise the checks above are meaningless.
  const sellerSales = await request("/rest/v1/sales?select=id", { token: sellerToken });
  check("active seller can read own store sales", rowCount(sellerSales) > 0, `rows=${rowCount(sellerSales)}`);

  // 6. Direct table writes must be refused even for a legitimate seller.
  check("seller cannot insert inventory movement directly", denied(await request("/rest/v1/inventory_movements", {
    token: sellerToken, method: "POST",
    body: { store_id: storeA, variant_id: variants[0], movement_type: "receipt", quantity: 99, actor_id: sellers[0], reason: "probe" },
  })));
  check("seller cannot insert a sale row directly", denied(await request("/rest/v1/sales", {
    token: sellerToken, method: "POST", body: { store_id: storeA, seller_id: sellers[0], total_amount_eur: 1 },
  })));
  check("seller cannot update an existing sale", denied(await request(`/rest/v1/sales?id=eq.${saleA}`, {
    token: sellerToken, method: "PATCH", body: { total_amount_eur: 0 },
  })));
  check("seller cannot delete a sale", denied(await request(`/rest/v1/sales?id=eq.${saleA}`, { token: sellerToken, method: "DELETE" })));
  check("seller cannot escalate own membership to owner", denied(await request(`/rest/v1/store_memberships?user_id=eq.${sellers[0]}`, {
    token: sellerToken, method: "PATCH", body: { role: "owner" },
  })));

  // 7. Owner-only RPCs must refuse a seller but serve the owner.
  check("seller cannot call reconciliation RPC", denied(await request("/rest/v1/rpc/get_reconciliation_discrepancies", {
    token: sellerToken, method: "POST", body: { p_store_id: storeA },
  })));
  check("seller cannot change membership status", denied(await request("/rest/v1/rpc/set_seller_membership_status", {
    token: sellerToken, method: "POST", body: { p_store_id: storeA, p_seller_id: sellers[1], p_status: "blocked" },
  })));
  const ownerReconciliation = await request("/rest/v1/rpc/get_reconciliation_discrepancies", {
    token: ownerToken, method: "POST", body: { p_store_id: storeA },
  });
  check("owner can call reconciliation RPC", ownerReconciliation.status === 200, `status=${ownerReconciliation.status}`);

  // 8. A tampered signature must never be accepted.
  const forged = `${mintToken(ownerA).split(".").slice(0, 2).join(".")}.forgedsignaturevalue`;
  const forgedResult = await request("/rest/v1/sales?select=id", { token: forged });
  check("forged token is rejected", forgedResult.status === 401, `status=${forgedResult.status}`);
}

function concurrentSale(sellerId, variantId, key) {
  const statement = `select set_config('request.jwt.claim.sub', '${sellerId}', false); select public.confirm_sale_with_payments('${storeA}', '[{"variant_id":"${variantId}","quantity":1,"unit_price":20,"currency":"EUR"}]'::jsonb, '[{"method":"cash","amount":20,"currency":"EUR"}]'::jsonb, '${key}');`;
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn("docker", ["exec", db, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", statement]);
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("close", (status) => resolve({ status, output, ms: Date.now() - started }));
  });
}

async function pilotBurst() {
  const keys = [1, 2, 3, 4, 5].map((n) => `00000000-0000-0000-0000-00000000496${n}`);
  const outcomes = await Promise.all(sellers.map((sellerId, index) => concurrentSale(sellerId, variants[index], keys[index])));
  const succeeded = outcomes.filter((outcome) => outcome.status === 0).length;
  check("five concurrent pilot sales all commit", succeeded === 5, `succeeded=${succeeded}/5`);

  const durations = outcomes.map((outcome) => outcome.ms).sort((a, b) => a - b);
  const slowest = durations[durations.length - 1];
  console.log(`MEASURE five-user burst: median ${durations[2]} ms, slowest ${slowest} ms`);
  check("slowest concurrent sale stays under the 5000 ms pilot threshold", slowest < 5000, `slowest=${slowest}ms`);

  // Idempotency: replaying the same keys must not create duplicate sales.
  const replay = await Promise.all(sellers.map((sellerId, index) => concurrentSale(sellerId, variants[index], keys[index])));
  const replayFailures = replay.filter((outcome) => outcome.status !== 0).length;
  const salesAfterReplay = Number(await sql(`select count(*) from public.sales where store_id = '${storeA}';`));
  check("replayed idempotency keys create no extra sales", salesAfterReplay === 6, `sales=${salesAfterReplay}, replay errors=${replayFailures}`);

  const negative = Number(await sql(`
    select count(*) from (
      select variant_id, sum(quantity) as balance from public.inventory_movements
      where store_id = '${storeA}' group by variant_id having sum(quantity) < 0
    ) as negatives;`));
  check("no negative stock balance after burst", negative === 0, `negative variants=${negative}`);

  // The seeded sale is inserted directly without payments, so it is not part of this invariant.
  const mismatched = Number(await sql(`
    select count(*) from public.sales sale
    where sale.store_id = '${storeA}' and sale.status = 'confirmed' and sale.id <> '${saleA}'
      and sale.total_amount_eur <> coalesce((
        select sum(payment.amount_eur) from public.sale_payments payment
        where payment.sale_id = sale.id and payment.status = 'captured'), 0);`));
  check("captured payments match confirmed sale totals", mismatched === 0, `mismatched sales=${mismatched}`);

  const missingMovements = Number(await sql(`
    select count(*) from public.sale_lines line
    join public.sales sale on sale.id = line.sale_id
    where sale.store_id = '${storeA}' and sale.status = 'confirmed' and sale.id <> '${saleA}'
      and not exists (
        select 1 from public.inventory_movements movement
        where movement.variant_id = line.variant_id and movement.movement_type = 'sale');`));
  check("every confirmed sale line has a stock movement", missingMovements === 0, `missing=${missingMovements}`);
}

await seed();
await authorizationProbes();
await pilotBurst();

if (failures > 0) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll pilot security and capacity checks passed");
