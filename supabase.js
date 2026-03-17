// supabase.js — cliente compartido para todo el dashboard

const SUPABASE_URL = 'https://cjxwqttejqfzewpxpqhw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YResSdvF9u09QQGOGKKkkg_i3KyG9u6';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth helpers ──────────────────────────────────────────
async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function requireAuth() {
  const user = await getUser();
  if (!user) { window.location.href = 'auth.html'; return null; }
  return user;
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'auth.html';
}

// ── DB helpers ────────────────────────────────────────────
async function dbLoad(table) {
  const { data, error } = await sb.from(table).select('*').order('id');
  if (error) { console.error(`dbLoad ${table}:`, error); return []; }
  return data;
}

async function dbSave(table, row) {
  const { data, error } = await sb.from(table).upsert(row).select().single();
  if (error) { console.error(`dbSave ${table}:`, error); return null; }
  return data;
}

async function dbDelete(table, id) {
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) console.error(`dbDelete ${table}:`, error);
}

async function dbReplaceAll(table, rows) {
  const user = await getUser();
  if (!user) return;
  await sb.from(table).delete().eq('user_id', user.id);
  if (rows.length) {
    const withUser = rows.map(r => ({ ...r, user_id: user.id }));
    const { error } = await sb.from(table).insert(withUser);
    if (error) console.error(`dbReplaceAll ${table}:`, error);
  }
}
