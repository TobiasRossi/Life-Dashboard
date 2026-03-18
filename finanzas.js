// finanzas.js — Sección Finanzas del Life Dashboard

// ── Constants ─────────────────────────────────────────────────────────────────
const TBL_TXS     = 'transactions';
const TBL_AHORROS = 'ahorros';

const CATEGORIAS_GASTO = [
  'Alimentación', 'Transporte', 'Facultad', 'Salud',
  'Ocio', 'Ropa', 'Servicios', 'Suscripciones', 'Otros',
];
const CATEGORIAS_INGRESO = ['Trabajo', 'Freelance', 'Regalo', 'Reintegro', 'Otros'];
const METODOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia'];

const CAT_COLORS = {
  'Alimentación':  '#0cc8b8',
  'Transporte':    '#a78bfa',
  'Facultad':      '#34d399',
  'Ocio':          '#f59e0b',
  'Servicios':     '#f87171',
  'Ropa':          '#60a5fa',
  'Salud':         '#fb923c',
  'Suscripciones': '#e879f9',
  'Otros':         '#555870',
  'Trabajo':       '#34d399',
  'Freelance':     '#0cc8b8',
  'Regalo':        '#f59e0b',
  'Reintegro':     '#a78bfa',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── localStorage ──────────────────────────────────────────────────────────────
// In-memory cache
let _txCache = null;

async function loadTxsAsync() {
  _txCache = await dbLoad(TBL_TXS);
  return _txCache;
}

function loadTxs() { return _txCache || []; }

async function saveTx(tx) {
  // tx without id = insert; with id = update
  const saved = await dbSave(TBL_TXS, tx);
  if (saved) {
    if (!_txCache) _txCache = [];
    const idx = _txCache.findIndex(t => t.id === saved.id);
    if (idx >= 0) _txCache[idx] = saved; else _txCache.push(saved);
  }
  return saved;
}

async function deleteTxById(id) {
  await dbDelete(TBL_TXS, id);
  _txCache = (_txCache||[]).filter(t => t.id !== id);
}

// ── Filters state ─────────────────────────────────────────────────────────────
let activeMonth = new Date().getMonth();
let activeYear  = new Date().getFullYear();
let activeFilter = 'todos'; // todos | ingreso | gasto

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);
}

function txsForMonth(txs, month, year) {
  return txs.filter(t => {
    const d = new Date(t.fecha + 'T00:00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function calcSummary(txs) {
  const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
  const gastos   = txs.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
  return { ingresos, gastos, balance: ingresos - gastos };
}

// ── Period navigator ─────────────────────────────────────────────────────────
function renderPeriod() {
  document.getElementById('period-label').textContent = `${MESES[activeMonth]} ${activeYear}`;
}

function shiftMonth(delta) {
  activeMonth += delta;
  if (activeMonth < 0)  { activeMonth = 11; activeYear--; }
  if (activeMonth > 11) { activeMonth = 0;  activeYear++; }
  renderAll();
}

// ── Summary cards ─────────────────────────────────────────────────────────────
function renderSummary(txs) {
  const { ingresos, gastos, balance } = calcSummary(txs);
  const balanceColor = balance >= 0 ? 'var(--green)' : 'var(--coral)';
  const tasa = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0;

  document.getElementById('sum-ingresos').textContent = formatARS(ingresos);
  document.getElementById('sum-gastos').textContent   = formatARS(gastos);
  document.getElementById('sum-balance').textContent  = formatARS(balance);
  document.getElementById('sum-balance').style.color  = balanceColor;
  document.getElementById('sum-tasa').textContent     = tasa + '%';
  document.getElementById('sum-tasa').style.color     = tasa > 80 ? 'var(--coral)' : tasa > 50 ? 'var(--amber)' : 'var(--green)';
}

// ── Chart: donut por categoría ─────────────────────────────────────────────────
let donutChart = null;

function renderDonut(txs) {
  // Always destroy existing instance first
  if (donutChart) {
    donutChart.destroy();
    donutChart = null;
  }

  const canvas      = document.getElementById('chart-donut');
  const placeholder = document.getElementById('chart-donut-empty');
  if (!canvas) return;

  const gastos = txs.filter(t => t.tipo === 'gasto');
  const cats   = {};
  gastos.forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.monto; });

  const labels = Object.keys(cats);
  const data   = Object.values(cats);
  const colors = labels.map(l => CAT_COLORS[l] || '#555870');

  if (!labels.length) {
    canvas.style.display = 'none';
    if (placeholder) placeholder.style.display = '';
    return;
  }

  canvas.style.display = '';
  if (placeholder) placeholder.style.display = 'none';

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#16181f',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#8b8fa8',
            font: { family: "'DM Sans', sans-serif", size: 11 },
            boxWidth: 10, boxHeight: 10,
            borderRadius: 3, padding: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatARS(ctx.raw)} (${Math.round(ctx.parsed / data.reduce((a,b)=>a+b,0)*100)}%)`,
          },
        },
      },
    },
  });
}

// ── Chart: barras ingresos vs gastos últimos 6 meses ─────────────────────────
let barChart = null;

function renderBars(allTxs) {
  const canvas = document.getElementById('chart-bars');
  if (!canvas || !window.Chart) return;

  // Build last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = activeMonth - i;
    let y = activeYear;
    if (m < 0) { m += 12; y--; }
    months.push({ m, y, label: MESES[m].slice(0, 3) });
  }

  const ingresosData = months.map(({ m, y }) =>
    txsForMonth(allTxs, m, y).filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  );
  const gastosData = months.map(({ m, y }) =>
    txsForMonth(allTxs, m, y).filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  );

  if (barChart) barChart.destroy();

  barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosData,
          backgroundColor: 'rgba(52,211,153,.7)',
          borderColor: '#34d399',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Gastos',
          data: gastosData,
          backgroundColor: 'rgba(248,113,113,.7)',
          borderColor: '#f87171',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#8b8fa8',
            font: { family: "'DM Sans', sans-serif", size: 11 },
            boxWidth: 10, boxHeight: 10, borderRadius: 3,
          },
        },
        tooltip: {
          callbacks: { label: ctx => ` ${formatARS(ctx.raw)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: '#555870', font: { size: 11 } },
          grid:  { color: 'rgba(255,255,255,.04)' },
        },
        y: {
          ticks: {
            color: '#555870',
            font: { size: 10 },
            callback: v => formatARS(v).replace(',00',''),
          },
          grid: { color: 'rgba(255,255,255,.04)' },
        },
      },
    },
  });
}

// ── Chart: línea — saldo acumulado del mes día a día ──────────────────────────
// ── Transaction list ──────────────────────────────────────────────────────────
function renderList(txs) {
  const container = document.getElementById('tx-list');
  if (!container) return;

  let filtered = [...txs].sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (activeFilter !== 'todos') filtered = filtered.filter(t => t.tipo === activeFilter);

  if (!filtered.length) {
    container.innerHTML = `<p style="color:var(--text-3);font-size:13px;padding:24px 0;text-align:center">Sin transacciones para este período</p>`;
    return;
  }

  // Group by date
  const groups = {};
  filtered.forEach(t => {
    if (!groups[t.fecha]) groups[t.fecha] = [];
    groups[t.fecha].push(t);
  });

  container.innerHTML = Object.entries(groups).map(([fecha, items]) => {
    const d = new Date(fecha + 'T00:00:00');
    const label = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    const dayTotal = items.reduce((s, t) => t.tipo === 'ingreso' ? s + t.monto : s - t.monto, 0);

    return `
      <div class="tx-group">
        <div class="tx-date-header">
          <span>${label}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:${dayTotal >= 0 ? 'var(--green)' : 'var(--coral)'}">${dayTotal >= 0 ? '+' : ''}${formatARS(dayTotal)}</span>
        </div>
        ${items.map(t => `
          <div class="tx-row" data-id="${t.id}">
            <div class="tx-cat-dot" style="background:${CAT_COLORS[t.categoria] || '#555870'}"></div>
            <div class="tx-info">
              <span class="tx-desc">${t.descripcion || t.categoria}</span>
              <span class="tx-meta">${t.categoria} · ${t.metodo_pago}</span>
            </div>
            <div class="tx-amount ${t.tipo === 'ingreso' ? 'tx-ingreso' : 'tx-gasto'}">
              ${t.tipo === 'ingreso' ? '+' : '-'}${formatARS(t.monto)}
            </div>
            <button class="tx-delete" onclick="deleteTx(${t.id})" title="Eliminar">✕</button>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// ── Form ──────────────────────────────────────────────────────────────────────
function populateCategorias(tipo) {
  const sel = document.getElementById('f-categoria');
  const cats = tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function openForm() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('f-fecha').value   = today;
  document.getElementById('f-monto').value   = '';
  document.getElementById('f-desc').value    = '';
  document.getElementById('f-tipo').value    = 'gasto';
  populateCategorias('gasto');
  document.getElementById('form-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('f-monto').focus(), 50);
}

function closeForm() {
  document.getElementById('form-overlay').style.display = 'none';
}

async function submitForm() {
  const tipo     = document.getElementById('f-tipo').value;
  const monto    = parseFloat(document.getElementById('f-monto').value);
  const fecha    = document.getElementById('f-fecha').value;
  const cat      = document.getElementById('f-categoria').value;
  const desc     = document.getElementById('f-desc').value.trim();
  const metodo   = document.getElementById('f-metodo').value;

  if (!monto || monto <= 0 || !fecha) {
    showToast('⚠ Completá monto y fecha');
    return;
  }

  await saveTx({ fecha, tipo, categoria: cat, monto, descripcion: desc, metodo_pago: metodo });

  const d = new Date(fecha + 'T00:00:00');
  activeMonth = d.getMonth();
  activeYear  = d.getFullYear();

  closeForm();
  renderAll();
  showToast(`✓ ${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${formatARS(monto)} guardado`);
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteTx(id) {
  if (!confirm('¿Eliminar esta transacción?')) return;
  await deleteTxById(id);
  renderAll();
  showToast('Transacción eliminada');
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  const txs = txsForMonth(loadTxs(), activeMonth, activeYear);
  renderList(txs);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Render all ────────────────────────────────────────────────────────────────
function renderAll() {
  const allTxs    = loadTxs();
  const monthTxs  = txsForMonth(allTxs, activeMonth, activeYear);

  renderPeriod();
  renderSummary(monthTxs);
  renderDonut(monthTxs);
  renderBars(allTxs);
  renderList(monthTxs);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Populate form selects
  document.getElementById('f-metodo').innerHTML = METODOS.map(m => `<option>${m}</option>`).join('');
  document.getElementById('f-tipo').addEventListener('change', e => populateCategorias(e.target.value));

  // Period nav
  document.getElementById('btn-prev-month').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('btn-next-month').addEventListener('click', () => shiftMonth(1));

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.addEventListener('click', () => setFilter(b.dataset.filter));
  });

  // Form
  document.getElementById('btn-add-tx').addEventListener('click', openForm);
  document.getElementById('btn-form-save').addEventListener('click', submitForm);
  document.getElementById('btn-form-cancel').addEventListener('click', closeForm);
  document.getElementById('form-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('form-overlay')) closeForm();
  });

  // Enter key to submit form
  document.getElementById('form-overlay').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') submitForm();
    if (e.key === 'Escape') closeForm();
  });

  // Section tabs
  document.querySelectorAll('.fin-tab').forEach(b => {
    b.addEventListener('click', () => setFinTab(b.dataset.tab));
  });

  // Ahorros
  document.getElementById('btn-add-ahorro').addEventListener('click', () => openAhorroModal(null));
  document.getElementById('am-save-btn').addEventListener('click', saveAhorroModal);
  document.getElementById('am-delete-btn').addEventListener('click', deleteAhorro);
  document.getElementById('am-close-btn').addEventListener('click', closeAhorroModal);
  document.getElementById('ahorro-modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'ahorro-modal-overlay') closeAhorroModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAhorroModal();
  });

  const user = await requireAuth();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-username');
  if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email.split('@')[0];

  document.getElementById('btn-signout')?.addEventListener('click', e => { e.preventDefault(); signOut(); });

  await loadTxsAsync();
  await loadAhorrosAsync();

  renderAll();
  renderAhorros();
  fetchCotizaciones();
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION TABS — Movimientos / Ahorros
// ═══════════════════════════════════════════════════════════════════════════════
let activeFinTab = 'movimientos';

function setFinTab(tab) {
  activeFinTab = tab;
  document.querySelectorAll('.fin-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.getElementById('section-movimientos').style.display = tab === 'movimientos' ? '' : 'none';
  document.getElementById('section-ahorros').style.display     = tab === 'ahorros'     ? '' : 'none';

  // FAB only makes sense on Movimientos
  const fab = document.getElementById('btn-add-tx');
  if (fab) fab.style.display = tab === 'movimientos' ? 'flex' : 'none';

  // Update subtitle
  const sub = document.getElementById('fin-subtitle');
  if (sub) sub.textContent = tab === 'ahorros'
    ? 'Seguimiento de cuentas y fondos de ahorro'
    : 'Control de ingresos y gastos personales';
}

// ═══════════════════════════════════════════════════════════════════════════════
// AHORROS — con soporte USD y cotización live via dolarapi.com
// ═══════════════════════════════════════════════════════════════════════════════
const LS_AHORROS    = 'ld_ahorros';
const LS_COTIZACION = 'ld_cotizacion_cache'; // kept in localStorage — not user data
const CACHE_TTL_MS  = 30 * 60 * 1000; // 30 minutos

const TIPOS_DOLAR = [
  { id: 'blue',      label: 'Blue',      url: 'https://dolarapi.com/v1/dolares/blue'            },
  { id: 'oficial',   label: 'Oficial',   url: 'https://dolarapi.com/v1/dolares/oficial'          },
  { id: 'bolsa',     label: 'MEP/Bolsa', url: 'https://dolarapi.com/v1/dolares/bolsa'            },
  { id: 'cripto',    label: 'Cripto',    url: 'https://dolarapi.com/v1/dolares/cripto'           },
  { id: 'mayorista', label: 'Mayorista', url: 'https://dolarapi.com/v1/dolares/mayorista'        },
];

// Estado global de cotizaciones
let cotizaciones = {}; // { blue: { compra, venta, fechaActualizacion }, ... }
let cotizLoading = false;

let _ahorrosCache = null;
async function loadAhorrosAsync() { _ahorrosCache = await dbLoad(TBL_AHORROS); return _ahorrosCache; }
function loadAhorros() { return _ahorrosCache || []; }

const AHORRO_COLORES = [
  '#0cc8b8','#a78bfa','#34d399','#f59e0b','#60a5fa','#f87171','#fb923c','#e879f9',
];

// ── Cotización ────────────────────────────────────────────────────────────────
async function fetchCotizaciones(force = false) {
  const cached = localStorage.getItem(LS_COTIZACION);
  if (!force && cached) {
    const { ts, data } = JSON.parse(cached);
    if (Date.now() - ts < CACHE_TTL_MS) {
      cotizaciones = data;
      return;
    }
  }

  if (cotizLoading) return;
  cotizLoading = true;
  updateCotizBadge('actualizando...');

  try {
    const results = await Promise.allSettled(
      TIPOS_DOLAR.map(t => fetch(t.url).then(r => r.json()).then(d => ({ id: t.id, ...d })))
    );

    results.forEach(r => {
      if (r.status === 'fulfilled') {
        const { id, ...rest } = r.value;
        cotizaciones[id] = rest;
      }
    });

    localStorage.setItem(LS_COTIZACION, JSON.stringify({ ts: Date.now(), data: cotizaciones }));
    updateCotizBadge(null);
  } catch {
    updateCotizBadge('sin conexión');
  } finally {
    cotizLoading = false;
    renderAhorros(); // re-render with fresh rates
  }
}

function updateCotizBadge(msg) {
  const badge = document.getElementById('cotiz-status');
  if (!badge) return;
  if (msg) {
    badge.textContent = msg;
    badge.style.color = 'var(--amber)';
  } else {
    const blue = cotizaciones.blue;
    if (blue) {
      const ts = new Date(blue.fechaActualizacion);
      badge.textContent = `Blue $${blue.venta} · act. ${ts.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}`;
      badge.style.color = 'var(--text-3)';
    }
  }
}

function getVentaRate(tipoId) {
  return cotizaciones[tipoId]?.venta || null;
}

// ── Render Ahorros ────────────────────────────────────────────────────────────
function renderAhorros() {
  const ahorros = loadAhorros();
  const el      = document.getElementById('ahorros-list');
  if (!el) return;

  // Calcular totales en ARS (convirtiendo USD si hay cotización) y total USD directo
  let totalARS = 0;
  let totalUSD = 0;
  ahorros.forEach(a => {
    if (a.moneda === 'USD') {
      totalUSD += a.saldo;
      const rate = getVentaRate(a.tipo_dolar || 'blue');
      if (rate) totalARS += a.saldo * rate;
    } else {
      totalARS += a.saldo;
    }
  });

  const totalMeta = ahorros.filter(a => a.meta > 0 && a.moneda === 'ARS')
    .reduce((s, a) => s + a.meta, 0);

  document.getElementById('ahorro-total').textContent      = formatARS(totalARS);
  document.getElementById('ahorro-total-usd').textContent  = totalUSD > 0
    ? new Intl.NumberFormat('es-AR', { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(totalUSD)
    : '—';
  document.getElementById('ahorro-meta-total').textContent = totalMeta > 0 ? formatARS(totalMeta) : '—';
  document.getElementById('ahorro-cuentas').textContent    = ahorros.length;

  if (!ahorros.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:48px 0;color:var(--text-3)">
        <div style="font-size:32px;margin-bottom:12px">🏦</div>
        <p style="font-size:14px;margin-bottom:4px">Sin cuentas de ahorro</p>
        <p style="font-size:12px">Usá el botón + para agregar tu primera cuenta</p>
      </div>`;
    return;
  }

  const formatUSD = n => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n);

  el.innerHTML = ahorros.map((a, idx) => {
    const color      = AHORRO_COLORES[idx % AHORRO_COLORES.length];
    const isUSD      = a.moneda === 'USD';
    const rate       = isUSD ? getVentaRate(a.tipo_dolar || 'blue') : null;
    const saldoARS   = isUSD && rate ? a.saldo * rate : null;
    const tipoCfg    = TIPOS_DOLAR.find(t => t.id === (a.tipo_dolar || 'blue'));

    // Progress toward meta
    const metaVal    = a.meta > 0 ? a.meta : 0;
    const saldoComp  = isUSD && rate ? saldoARS : a.saldo;
    const metaComp   = isUSD && rate && metaVal > 0 ? metaVal * rate : metaVal;
    const pct        = metaComp > 0 ? Math.min(100, Math.round((saldoComp / metaComp) * 100)) : null;

    return `
      <div class="ahorro-card" onclick="openAhorroModal(${a.id})" style="border-left:3px solid ${color}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${pct !== null ? 12 : 0}px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">${a.emoji || '💰'}</span>
            <div>
              <div style="font-size:14px;font-weight:500">${a.nombre}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
                ${a.descripcion ? `<span style="font-size:11px;color:var(--text-3)">${a.descripcion}</span>` : ''}
                ${isUSD ? `<span style="font-size:10px;font-weight:600;letter-spacing:.04em;padding:1px 6px;border-radius:10px;background:rgba(96,165,250,.12);color:#60a5fa">USD · ${tipoCfg?.label || 'Blue'}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="text-align:right">
            ${isUSD ? `
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:${color}">${formatUSD(a.saldo)}</div>
              ${saldoARS !== null
                ? `<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-3);margin-top:2px">${formatARS(saldoARS)}</div>`
                : `<div style="font-size:11px;color:var(--amber);margin-top:2px">cargando cotización...</div>`
              }
            ` : `
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:${color}">${formatARS(a.saldo)}</div>
            `}
            ${metaVal > 0 ? `<div style="font-size:11px;color:var(--text-3);margin-top:2px">meta: ${isUSD ? formatUSD(metaVal) : formatARS(metaVal)}</div>` : ''}
          </div>
        </div>
        ${pct !== null ? `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span style="font-size:11px;color:var(--text-3)">Progreso hacia la meta</span>
            <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:${color}">${pct}%</span>
          </div>
          <div style="height:5px;background:var(--surface-2);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width .5s ease"></div>
          </div>
        ` : ''}
      </div>`;
  }).join('');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openAhorroModal(id) {
  const ahorros = loadAhorros();
  const a       = id ? ahorros.find(x => x.id === id) : null;

  document.getElementById('am-id').value          = id || '';
  document.getElementById('am-nombre').value      = a?.nombre      || '';
  document.getElementById('am-emoji').value       = a?.emoji       || '💰';
  document.getElementById('am-descripcion').value = a?.descripcion || '';
  document.getElementById('am-saldo').value       = a?.saldo       ?? '';
  document.getElementById('am-meta').value        = a?.meta > 0 ? a.meta : '';
  document.getElementById('am-moneda').value      = a?.moneda      || 'ARS';
  document.getElementById('am-tipo-dolar').value  = a?.tipo_dolar  || 'blue';
  document.getElementById('am-modal-title').textContent  = id ? 'Editar cuenta' : 'Nueva cuenta de ahorro';
  document.getElementById('am-delete-btn').style.display = id ? '' : 'none';

  // Sync radio buttons
  const moneda = a?.moneda || 'ARS';
  document.querySelectorAll('input[name="am-moneda-radio"]').forEach(r => {
    r.checked = r.value === moneda;
  });
  toggleDolarSelect(moneda);

  document.getElementById('ahorro-modal-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('am-nombre').focus(), 50);
}

function toggleDolarSelect(moneda) {
  const row = document.getElementById('am-tipo-dolar-row');
  if (row) row.style.display = moneda === 'USD' ? '' : 'none';
}

function closeAhorroModal() {
  document.getElementById('ahorro-modal-overlay').style.display = 'none';
}

async function saveAhorroModal() {
  const id     = document.getElementById('am-id').value;
  const nombre = document.getElementById('am-nombre').value.trim();
  if (!nombre) { showToast('⚠ El nombre es obligatorio'); return; }

  const saldo  = parseFloat(document.getElementById('am-saldo').value)  || 0;
  const meta   = parseFloat(document.getElementById('am-meta').value)   || 0;
  const moneda = document.getElementById('am-moneda').value;

  const data = {
    nombre,
    emoji:       document.getElementById('am-emoji').value || '💰',
    descripcion: document.getElementById('am-descripcion').value.trim(),
    saldo,
    meta,
    moneda,
    tipo_dolar:  moneda === 'USD' ? document.getElementById('am-tipo-dolar').value : null,
  };

  const saved = await dbSave(TBL_AHORROS, id ? { id: parseInt(id), ...data } : data);
  if (saved) {
    if (!_ahorrosCache) _ahorrosCache = [];
    const idx = _ahorrosCache.findIndex(x => x.id === saved.id);
    if (idx >= 0) _ahorrosCache[idx] = saved; else _ahorrosCache.push(saved);
  }
  closeAhorroModal();
  renderAhorros();
  showToast(id ? `✓ "${data.nombre}" actualizado` : `✓ "${data.nombre}" agregado`);
}

async function deleteAhorro() {
  const id = document.getElementById('am-id').value;
  if (!id || !confirm('¿Eliminar esta cuenta?')) return;
  await dbDelete(TBL_AHORROS, parseInt(id));
  _ahorrosCache = (_ahorrosCache||[]).filter(x => x.id !== parseInt(id));
  closeAhorroModal();
  renderAhorros();
  showToast('Cuenta eliminada');
}
