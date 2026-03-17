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

// Load all rows for the current user
async function dbLoad(table) {
  const { data, error } = await sb.from(table).select('*').order('id');
  if (error) { console.error(`dbLoad ${table}:`, error); return []; }
  return data || [];
}

// Insert or update a single row — always injects user_id
async function dbSave(table, row) {
  const user = await getUser();
  if (!user) return null;
  const rowWithUser = { ...row, user_id: user.id };
  const { data, error } = await sb.from(table).upsert(rowWithUser).select().single();
  if (error) { console.error(`dbSave ${table}:`, error); return null; }
  return data;
}

// Delete a row by id
async function dbDelete(table, id) {
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) console.error(`dbDelete ${table}:`, error);
}

// Replace all rows for the current user — used for facultad materias
// Seeds with all-pendiente state (ignores hardcoded estados from JS arrays)
async function dbReplaceAll(table, rows) {
  const user = await getUser();
  if (!user) return;
  await sb.from(table).delete().eq('user_id', user.id);
  if (rows.length) {
    const withUser = rows.map(r => ({
      ...r,
      user_id: user.id,
      // Force pendiente on initial seed — user updates from the UI
      estado: r._isSeed ? 'pendiente' : (r.estado || 'pendiente'),
      nota:   r._isSeed ? null : (r.nota ?? null),
    }));
    const { error } = await sb.from(table).insert(withUser);
    if (error) console.error(`dbReplaceAll ${table}:`, error);
  }
}
