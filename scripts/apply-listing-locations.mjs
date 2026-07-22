import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const projectRef = projectUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;
const sqlFile = process.argv[2] || "supabase/fix_listing_area.sql";

if (!databaseUrl && (!projectRef || !password)) {
  console.error(`
Missing database credentials.

Add to .env.local:
  SUPABASE_DB_PASSWORD=your-database-password

Then run:
  npm run db:locations
`);
  process.exit(1);
}

const connectionString =
  databaseUrl ||
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

const directUrl =
  databaseUrl ||
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

const sqlPath = resolve(process.cwd(), sqlFile);
const sql = readFileSync(sqlPath, "utf8");

async function run(url, label) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  console.log(`Connecting via ${label}...`);
  await client.connect();
  try {
    await client.query(sql);
    const check = await client.query(`
      select column_name, data_type
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'marketplace_listings'
        and column_name in ('area', 'city', 'latitude', 'longitude', 'formatted_address', 'location_source')
      order by column_name
    `);
    console.log("Listing location columns:");
    for (const row of check.rows) {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    }
  } finally {
    await client.end();
  }
}

try {
  await run(directUrl, "direct db host");
} catch (directError) {
  console.warn("Direct connection failed:", directError.message);
  console.log("Retrying via pooler...");
  await run(connectionString, "pooler");
}

console.log("Done. Post Ad can now save area/lat/lng.");
