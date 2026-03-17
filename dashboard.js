// dashboard.js — Home widgets (reads from Supabase)

const DIAS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n);
}

function getWeekNumber(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

// ── Date widget ───────────────────────────────────────────
function renderDateWidget() {
  const el = document.getElementById('widget-date');
  if (!el) return;
  const now    = new Date();
  const meses  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  el.innerHTML = `
    <div class="card-label">Hoy</div>
    <div class="card-value" style="font-size:32px">${String(now.getDate()).padStart(2,'0')}</div>
    <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-2);margin-top:4px">
      ${DIAS_FULL[now.getDay()]}, ${meses[now.getMonth()]} ${now.getFullYear()}
    </div>
    <div class="divider"></div>
    <div style="font-size:12px;color:var(--text-3)">Semana ${getWeekNumber(now)} del año</div>`;
}

// ── Clases widget ─────────────────────────────────────────
async function renderClasesWidget() {
  const el = document.getElementById('widget-clases');
  if (!el) return;

  const clases = await dbLoad('horario');
  const now    = new Date();
  const todayMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = [];

  for (let offset = 0; offset <= 13; offset++) {
    const d   = new Date(now);
    d.setDate(now.getDate() + offset);
    const dow = d.getDay();
    clases.forEach(c => {
      if (c.dia !== dow) return;
      const [h, m] = c.hora.split(':').map(Number);
      if (offset === 0 && h * 60 + m <= todayMin) return;
      upcoming.push({
        ...c,
        date:    d,
        dateStr: offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : DIAS_FULL[dow],
      });
    });
  }

  upcoming.sort((a, b) => a.date - b.date || a.hora.localeCompare(b.hora));
  const next3 = upcoming.slice(0, 3);

  if (!next3.length) {
    el.innerHTML = `<div class="card-label">Próximas clases</div><p style="color:var(--text-3);font-size:13px">Sin clases próximas</p>`;
    return;
  }

  const CAT_COLOR = { 'Teórica':'badge-purple', 'Práctica':'badge-teal' };
  el.innerHTML = `
    <div class="card-label">Próximas clases</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
      ${next3.map(c => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface-2);border-radius:var(--radius-sm);border:1px solid var(--border)">
          <div style="text-align:center;min-width:36px">
            <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--accent)">${c.hora}</div>
            <div style="font-size:10px;color:var(--text-3)">${c.dateStr}</div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.materia}</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:1px">${c.aula ? 'Aula ' + c.aula : ''}</div>
          </div>
          <span class="badge ${CAT_COLOR[c.tipo] || 'badge-teal'}">${c.tipo}</span>
        </div>`).join('')}
    </div>`;
}

// ── Gastos widget ─────────────────────────────────────────
async function renderGastosWidget() {
  const el = document.getElementById('widget-gastos');
  if (!el) return;

  const now  = new Date();
  const mes  = now.getMonth() + 1;
  const anio = now.getFullYear();

  const txs = await dbLoad('transactions');
  const monthly = txs.filter(t => {
    const d = new Date(t.fecha + 'T00:00:00');
    return d.getMonth() + 1 === mes && d.getFullYear() === anio;
  });

  const totalIngresos = monthly.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto), 0);
  const totalGastos   = monthly.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Number(t.monto), 0);
  const balance       = totalIngresos - totalGastos;
  const tasa          = totalIngresos > 0 ? Math.round((totalGastos / totalIngresos) * 100) : 0;
  const balanceColor  = balance >= 0 ? 'var(--green)' : 'var(--coral)';

  const cats = {};
  monthly.filter(t => t.tipo === 'gasto').forEach(t => {
    cats[t.categoria] = (cats[t.categoria] || 0) + Number(t.monto);
  });
  const topCats  = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0, 4);
  const maxCat   = topCats[0]?.[1] || 1;
  const CAT_COLORS = {
    'Alimentación':'#0cc8b8','Transporte':'#a78bfa','Facultad':'#34d399',
    'Ocio':'#f59e0b','Servicios':'#f87171','Ropa':'#60a5fa',
    'Salud':'#fb923c','Suscripciones':'#e879f9','Otros':'#555870',
  };

  el.innerHTML = `
    <div class="card-label">Finanzas — Este mes</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 11px">
        <div style="font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Ingresos</div>
        <div style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--green)">${formatARS(totalIngresos)}</div>
      </div>
      <div style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 11px">
        <div style="font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Gastos</div>
        <div style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--coral)">${formatARS(totalGastos)}</div>
      </div>
      <div style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 11px">
        <div style="font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Balance</div>
        <div style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:${balanceColor}">${formatARS(balance)}</div>
      </div>
    </div>
    ${topCats.length ? `
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:8px">Top categorías</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${topCats.map(([cat, amt]) => `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
              <span style="font-size:12px;color:var(--text-2)">${cat}</span>
              <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-3)">${formatARS(amt)}</span>
            </div>
            <div style="height:4px;background:var(--surface-2);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${Math.round((amt/maxCat)*100)}%;background:${CAT_COLORS[cat]||'#555870'};border-radius:2px"></div>
            </div>
          </div>`).join('')}
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--text-3)">
        Tasa de gasto: <span style="font-family:var(--font-mono);font-weight:600;color:${tasa>80?'var(--coral)':tasa>50?'var(--amber)':'var(--green)'}">${tasa}%</span>
      </div>
    ` : `<p style="font-size:12px;color:var(--text-3)">Sin gastos este mes</p>`}`;
}

// ── Meta widget ───────────────────────────────────────────
async function renderMetaWidget() {
  const el = document.getElementById('widget-meta');
  if (!el) return;

  const metas  = await dbLoad('metas');
  const active = metas.filter(m => m.estado === 'en_progreso')
    .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  const meta   = active[0];

  if (!meta) {
    el.innerHTML = `<div class="card-label">Objetivo activo</div><p style="color:var(--text-3);font-size:13px">Sin objetivos activos</p>`;
    return;
  }

  const dias    = Math.ceil((new Date(meta.fecha_limite) - new Date()) / 86400000);
  const urgente = dias <= 14;
  el.innerHTML = `
    <div class="card-label">Objetivo activo</div>
    <div style="display:flex;align-items:center;gap:10px;margin:8px 0 14px">
      <span style="font-size:24px">${meta.emoji}</span>
      <div>
        <div style="font-size:15px;font-weight:500">${meta.titulo}</div>
        <div style="font-size:11px;color:${urgente?'var(--coral)':'var(--text-3)'};margin-top:2px">
          ${dias > 0 ? `${dias} días restantes` : 'Fecha vencida'}
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="font-size:12px;color:var(--text-3)">Progreso</span>
      <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--accent)">${meta.progreso}%</span>
    </div>
    <div style="height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${meta.progreso}%;background:var(--accent);border-radius:3px;transition:width .6s ease"></div>
    </div>
    <div class="divider"></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${metas.slice(0,3).map(m=>`<span class="badge badge-teal">${m.emoji} ${m.progreso}%</span>`).join('')}
    </div>`;
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  // Show user name in sidebar
  const nameEl = document.getElementById('sidebar-username');
  if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email.split('@')[0];

  // Greeting
  const h   = new Date().getHours();
  const msg = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  const name = user.user_metadata?.full_name?.split(' ')[0] || 'Toto';
  const greetEl = document.getElementById('greeting-msg');
  if (greetEl) greetEl.textContent = `${msg}, ${name} 👋`;

  renderDateWidget();
  await Promise.all([
    renderClasesWidget(),
    renderGastosWidget(),
    renderMetaWidget(),
  ]);

  setInterval(renderDateWidget, 60000);

  document.getElementById('btn-signout')?.addEventListener('click', e => {
    e.preventDefault();
    signOut();
  });
});
