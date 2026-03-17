// metas.js — Sección Objetivos del Life Dashboard

// ── Constants ─────────────────────────────────────────────────────────────────
const TBL_METAS    = 'metas';
const TBL_WISHLIST = 'wishlist';
const TBL_OCIO     = 'ocio';

const KANBAN_COLS = [
  { id: 'por_empezar', label: 'Por empezar', color: 'var(--text-3)'  },
  { id: 'en_progreso', label: 'En progreso', color: 'var(--amber)'   },
  { id: 'logrado',     label: 'Logrado',     color: 'var(--green)'   },
];

const WISH_PRIORIDADES = ['alta', 'media', 'baja'];
const WISH_PRIORIDAD_COLOR = { alta: 'var(--coral)', media: 'var(--amber)', baja: 'var(--text-3)' };

const OCIO_TIPOS = ['Restaurante', 'Bar', 'Museo', 'Parque', 'Teatro', 'Viaje', 'Otro'];
const OCIO_ESTADOS = ['quiero ir', 'fui', 'favorito'];
const OCIO_ESTADO_COLOR = {
  'quiero ir': 'var(--text-3)',
  'fui':       'var(--accent)',
  'favorito':  'var(--amber)',
};

// No seed needed — Supabase starts empty per user

// ── In-memory caches ─────────────────────────────────────────────────────────
let _metasCache    = null;
let _wishlistCache = null;
let _ocioCache     = null;

async function initCaches() {
  [_metasCache, _wishlistCache, _ocioCache] = await Promise.all([
    dbLoad(TBL_METAS),
    dbLoad(TBL_WISHLIST),
    dbLoad(TBL_OCIO),
  ]);
}

function loadM()  { return _metasCache    || []; }
function loadW()  { return _wishlistCache || []; }
function loadO()  { return _ocioCache     || []; }

// ── Active tab ────────────────────────────────────────────────────────────────
let activeTab = 'metas';

function setTab(tab) {
  activeTab = tab;
  ['metas','wishlist','ocio'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`section-${t}`).style.display = t === tab ? '' : 'none';
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════════════════════
// METAS — Kanban
// ═══════════════════════════════════════════════════════════════════════════════

function renderKanban() {
  const metas = loadM();

  KANBAN_COLS.forEach(col => {
    const items = metas.filter(m => m.estado === col.id);
    const el    = document.getElementById(`col-${col.id}`);
    if (!el) return;

    document.getElementById(`col-count-${col.id}`).textContent = items.length;

    el.innerHTML = items.map(m => {
      const dias    = Math.ceil((new Date(m.fecha_limite) - new Date()) / 86400000);
      const urgente = dias <= 14 && col.id !== 'logrado';
      const overdue = dias < 0  && col.id !== 'logrado';
      const diasTxt = overdue ? 'Vencida' : dias === 0 ? 'Hoy' : `${dias}d`;
      const diasColor = overdue ? 'var(--coral)' : urgente ? 'var(--amber)' : 'var(--text-3)';

      return `
        <div class="kanban-card" draggable="true"
             data-id="${m.id}"
             ondragstart="dragStart(event)"
             onclick="openMetaModal(${m.id})">
          <div class="kcard-top">
            <span class="kcard-emoji">${m.emoji}</span>
            <span class="kcard-title">${m.titulo}</span>
          </div>
          ${m.descripcion ? `<p class="kcard-desc">${m.descripcion}</p>` : ''}
          <div class="kcard-bottom">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:10px;color:var(--text-3)">Progreso</span>
                <span style="font-family:var(--font-mono);font-size:11px;font-weight:600;color:var(--accent)">${m.progreso}%</span>
              </div>
              <div style="height:4px;background:var(--surface);border-radius:2px;overflow:hidden">
                <div style="height:100%;width:${m.progreso}%;background:${col.id === 'logrado' ? 'var(--green)' : 'var(--accent)'};border-radius:2px;transition:width .4s ease"></div>
              </div>
            </div>
            <span style="font-size:10px;color:${diasColor};font-family:var(--font-mono);flex-shrink:0;margin-left:10px">${diasTxt}</span>
          </div>
        </div>
      `;
    }).join('') || `<div class="col-empty">Sin items</div>`;
  });
}

// Drag & Drop entre columnas
let draggedId = null;

function dragStart(e) {
  draggedId = parseInt(e.currentTarget.dataset.id);
  e.currentTarget.style.opacity = '.4';
  setTimeout(() => { if(e.currentTarget) e.currentTarget.style.opacity = ''; }, 0);
}

function dragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function dragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function drop(e, colId) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedId) return;

  const metas = loadM();
  const m     = metas.find(x => x.id === draggedId);
  if (!m) return;

  m.estado   = colId;
  m.progreso = colId === 'logrado' ? 100 : colId === 'por_empezar' && m.progreso === 100 ? 0 : m.progreso;
  const toUpdate = metas.find(x => x.id === draggedId);
  if (toUpdate) {
    const saved = await dbSave(TBL_METAS, { id: toUpdate.id, estado: toUpdate.estado, progreso: toUpdate.progreso });
    if (saved && _metasCache) {
      const idx = _metasCache.findIndex(x => x.id === saved.id);
      if (idx >= 0) _metasCache[idx] = { ..._metasCache[idx], ...saved };
    }
  }
  draggedId = null;
  renderKanban();
  showToast(`✓ "${m.titulo}" movida a ${KANBAN_COLS.find(c=>c.id===colId)?.label}`);
}

// Modal de meta
// ── Emoji picker ──────────────────────────────────────────────────────────────
const EMOJI_LIST = [
  '🎯','🏔️','💻','📚','🚀','🌍','🏋️','🎸','🎨','✈️',
  '🏠','🚗','💰','🎓','❤️','⚡','🌱','🏆','🎉','🔥',
  '💡','🎮','📷','🍕','☕','🌙','⭐','🦋','🎵','🏄',
  '💪','🧠','✅','📝','🔑','🌈','🎁','🛠️','📊','🌟',
  '🏡','🛤️','🌊','🧩','🎭','🦁','🐉','🍀','🧗','🎯',
];

function initEmojiPicker() {
  const grid  = document.getElementById('emoji-picker-grid');
  const input = document.getElementById('mm-emoji-input');
  if (!grid || !input) return;

  grid.innerHTML = EMOJI_LIST.map(e => `
    <button type="button" title="${e}"
      style="width:32px;height:32px;font-size:18px;background:none;border:1px solid transparent;border-radius:4px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .1s"
      onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='none'"
      onclick="document.getElementById('mm-emoji-input').value='${e}';document.querySelectorAll('#emoji-picker-grid button').forEach(b=>b.style.borderColor='transparent');this.style.borderColor='var(--accent-dim)'"
    >${e}</button>
  `).join('');
}

function openMetaModal(id) {
  const metas = loadM();
  const m     = id ? metas.find(x => x.id === id) : null;

  document.getElementById('mm-title-input').value    = m?.titulo      || '';
  document.getElementById('mm-desc-input').value     = m?.descripcion || '';
  document.getElementById('mm-emoji-input').value    = m?.emoji       || '🎯';
  document.getElementById('mm-fecha-input').value    = m?.fecha_limite || '';
  document.getElementById('mm-progreso-input').value = m?.progreso    ?? 0;
  document.getElementById('mm-progreso-val').textContent = (m?.progreso ?? 0) + '%';
  document.getElementById('mm-estado-select').value  = m?.estado      || 'por_empezar';
  document.getElementById('mm-id').value             = id || '';
  document.getElementById('mm-modal-title').textContent = id ? 'Editar meta' : 'Nueva meta';
  document.getElementById('mm-delete-btn').style.display = id ? '' : 'none';

  document.getElementById('meta-modal-overlay').style.display = 'flex';

  // Render emoji picker and highlight current selection
  initEmojiPicker();
  const cur = m?.emoji || '🎯';
  document.querySelectorAll('#emoji-picker-grid button').forEach(b => {
    b.style.borderColor = b.textContent.trim() === cur ? 'var(--accent-dim)' : 'transparent';
  });
}

function closeMetaModal() {
  document.getElementById('meta-modal-overlay').style.display = 'none';
}

async function saveMetaModal() {
  const id     = document.getElementById('mm-id').value;
  const titulo = document.getElementById('mm-title-input').value.trim();
  if (!titulo) { showToast('⚠ El título es obligatorio'); return; }

  const metas  = loadM();
  const data   = {
    titulo,
    descripcion:  document.getElementById('mm-desc-input').value.trim(),
    emoji:        document.getElementById('mm-emoji-input').value || '🎯',
    fecha_limite: document.getElementById('mm-fecha-input').value,
    progreso:     parseInt(document.getElementById('mm-progreso-input').value) || 0,
    estado:       document.getElementById('mm-estado-select').value,
  };

  if (id) {
    const idx = metas.findIndex(x => x.id === parseInt(id));
    metas[idx] = { ...metas[idx], ...data };
  } else {
    metas.push({ id: maxId(metas), ...data });
  }

  const saved = await dbSave(TBL_METAS, id ? { id: parseInt(id), ...data } : data);
  if (saved) {
    if (!_metasCache) _metasCache = [];
    const idx = _metasCache.findIndex(x => x.id === saved.id);
    if (idx >= 0) _metasCache[idx] = saved; else _metasCache.push(saved);
  }
  closeMetaModal();
  renderKanban();
  showToast(id ? `✓ "${data.titulo}" actualizada` : `✓ Meta creada`);
}

async function deleteMeta() {
  const id    = document.getElementById('mm-id').value;
  if (!id || !confirm('¿Eliminar esta meta?')) return;
  const metas = loadM().filter(x => x.id !== parseInt(id));
  save(LS_METAS, metas);
  closeMetaModal();
  renderKanban();
  showToast('Meta eliminada');
}

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST — Galería con filtro
// ═══════════════════════════════════════════════════════════════════════════════

let wishFilter = 'todos';

function renderWishlist() {
  const items  = loadW();
  const el     = document.getElementById('wishlist-grid');
  if (!el) return;

  const filtered = wishFilter === 'todos' ? items
    : wishFilter === 'comprado' ? items.filter(x => x.estado === 'comprado')
    : items.filter(x => x.prioridad === wishFilter && x.estado !== 'comprado');

  // Stats
  const pendientes = items.filter(x => x.estado === 'pendiente');
  const total      = pendientes.reduce((s, x) => s + (x.precio || 0), 0);
  const alta       = pendientes.filter(x => x.prioridad === 'alta').reduce((s, x) => s + (x.precio||0), 0);
  document.getElementById('wish-total').textContent    = formatARS(total);
  document.getElementById('wish-alta').textContent     = formatARS(alta);
  document.getElementById('wish-comprados').textContent = items.filter(x => x.estado === 'comprado').length;

  el.innerHTML = filtered.length ? filtered.map(item => `
    <div class="wish-card ${item.estado === 'comprado' ? 'wish-comprado' : ''}"
         style="border-top:3px solid ${WISH_PRIORIDAD_COLOR[item.prioridad]}"
         onclick="openWishModal(${item.id})">
      <div class="wish-emoji">${item.emoji}</div>
      <div class="wish-nombre">${item.nombre}</div>
      <div class="wish-precio">${item.precio ? formatARS(item.precio) : '—'}</div>
      <div class="wish-footer">
        <span class="badge" style="background:${WISH_PRIORIDAD_COLOR[item.prioridad]}18;color:${WISH_PRIORIDAD_COLOR[item.prioridad]};font-size:10px;padding:2px 7px;border-radius:10px">
          ${item.prioridad}
        </span>
        ${item.estado === 'comprado' ? '<span style="font-size:11px;color:var(--green)">✓ comprado</span>' : ''}
      </div>
    </div>
  `).join('') : `<p style="color:var(--text-3);font-size:13px;grid-column:1/-1;padding:32px 0;text-align:center">Sin items</p>`;
}

function setWishFilter(f) {
  wishFilter = f;
  document.querySelectorAll('.wish-filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.f === f)
  );
  renderWishlist();
}

function openWishModal(id) {
  const items = loadW();
  const item  = id ? items.find(x => x.id === id) : null;

  document.getElementById('wm-id').value          = id || '';
  document.getElementById('wm-nombre').value      = item?.nombre   || '';
  document.getElementById('wm-emoji').value       = item?.emoji    || '🛍️';
  document.getElementById('wm-precio').value      = item?.precio   || '';
  document.getElementById('wm-url').value         = item?.url      || '';
  document.getElementById('wm-prioridad').value   = item?.prioridad|| 'media';
  document.getElementById('wm-comprado').checked  = item?.estado   === 'comprado';
  document.getElementById('wm-modal-title').textContent = id ? 'Editar item' : 'Nuevo item';
  document.getElementById('wm-delete-btn').style.display = id ? '' : 'none';

  document.getElementById('wish-modal-overlay').style.display = 'flex';
}

function closeWishModal() {
  document.getElementById('wish-modal-overlay').style.display = 'none';
}

async function saveWishModal() {
  const id     = document.getElementById('wm-id').value;
  const nombre = document.getElementById('wm-nombre').value.trim();
  if (!nombre) { showToast('⚠ El nombre es obligatorio'); return; }

  const items = loadW();
  const data  = {
    nombre,
    emoji:     document.getElementById('wm-emoji').value    || '🛍️',
    precio:    parseFloat(document.getElementById('wm-precio').value) || 0,
    url:       document.getElementById('wm-url').value.trim(),
    prioridad: document.getElementById('wm-prioridad').value,
    estado:    document.getElementById('wm-comprado').checked ? 'comprado' : 'pendiente',
  };

  if (id) {
    const idx = items.findIndex(x => x.id === parseInt(id));
    items[idx] = { ...items[idx], ...data };
  } else {
    items.push({ id: maxId(items), ...data });
  }

  const saved = await dbSave(TBL_WISHLIST, id ? { id: parseInt(id), ...data } : data);
  if (saved) {
    if (!_wishlistCache) _wishlistCache = [];
    const idx = _wishlistCache.findIndex(x => x.id === saved.id);
    if (idx >= 0) _wishlistCache[idx] = saved; else _wishlistCache.push(saved);
  }
  closeWishModal();
  renderWishlist();
  showToast(id ? `✓ "${data.nombre}" actualizado` : `✓ "${data.nombre}" agregado`);
}

async function deleteWish() {
  const id = document.getElementById('wm-id').value;
  if (!id || !confirm('¿Eliminar este item?')) return;
  save(LS_WISHLIST, loadW().filter(x => x.id !== parseInt(id)));
  closeWishModal();
  renderWishlist();
  showToast('Item eliminado');
}

// ═══════════════════════════════════════════════════════════════════════════════
// OCIO & SALIDAS — Lista interactiva
// ═══════════════════════════════════════════════════════════════════════════════

let ocioFilter = 'todos';

function renderOcio() {
  const items  = loadO();
  const el     = document.getElementById('ocio-list');
  if (!el) return;

  const filtered = ocioFilter === 'todos' ? items : items.filter(x => x.estado === ocioFilter);

  // Stats chips
  document.getElementById('ocio-count-quiero').textContent  = items.filter(x => x.estado === 'quiero ir').length;
  document.getElementById('ocio-count-fui').textContent     = items.filter(x => x.estado === 'fui').length;
  document.getElementById('ocio-count-fav').textContent     = items.filter(x => x.estado === 'favorito').length;

  el.innerHTML = filtered.length ? filtered.map(item => {
    const fechaStr = item.fecha
      ? new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    return `
      <div class="ocio-row" onclick="openOcioModal(${item.id})">
        <div class="ocio-estado-dot" style="background:${OCIO_ESTADO_COLOR[item.estado]}"></div>
        <div class="ocio-info">
          <span class="ocio-nombre">${item.nombre}</span>
          <span class="ocio-meta">${item.tipo}${item.barrio ? ' · ' + item.barrio : ''}${fechaStr ? ' · ' + fechaStr : ''}</span>
        </div>
        ${item.nota ? `<span class="ocio-nota">${item.nota}</span>` : ''}
        <span class="ocio-estado-badge" style="color:${OCIO_ESTADO_COLOR[item.estado]}">${item.estado}</span>
      </div>
    `;
  }).join('') : `<p style="color:var(--text-3);font-size:13px;padding:24px 0;text-align:center">Sin lugares</p>`;
}

function setOcioFilter(f) {
  ocioFilter = f;
  document.querySelectorAll('.ocio-filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.f === f)
  );
  renderOcio();
}

function openOcioModal(id) {
  const items = loadO();
  const item  = id ? items.find(x => x.id === id) : null;

  document.getElementById('om-id').value      = id || '';
  document.getElementById('om-nombre').value  = item?.nombre || '';
  document.getElementById('om-tipo').value    = item?.tipo   || 'Restaurante';
  document.getElementById('om-barrio').value  = item?.barrio || '';
  document.getElementById('om-nota').value    = item?.nota   || '';
  document.getElementById('om-estado').value  = item?.estado || 'quiero ir';
  document.getElementById('om-fecha').value   = item?.fecha  || '';
  document.getElementById('om-modal-title').textContent      = id ? 'Editar lugar' : 'Nuevo lugar';
  document.getElementById('om-delete-btn').style.display     = id ? '' : 'none';

  document.getElementById('ocio-modal-overlay').style.display = 'flex';
}

function closeOcioModal() {
  document.getElementById('ocio-modal-overlay').style.display = 'none';
}

async function saveOcioModal() {
  const id     = document.getElementById('om-id').value;
  const nombre = document.getElementById('om-nombre').value.trim();
  if (!nombre) { showToast('⚠ El nombre es obligatorio'); return; }

  const items = loadO();
  const data  = {
    nombre,
    tipo:   document.getElementById('om-tipo').value,
    barrio: document.getElementById('om-barrio').value.trim(),
    nota:   document.getElementById('om-nota').value.trim(),
    estado: document.getElementById('om-estado').value,
    fecha:  document.getElementById('om-fecha').value,
  };

  if (id) {
    const idx = items.findIndex(x => x.id === parseInt(id));
    items[idx] = { ...items[idx], ...data };
  } else {
    items.push({ id: maxId(items), ...data });
  }

  const saved = await dbSave(TBL_OCIO, id ? { id: parseInt(id), ...data } : data);
  if (saved) {
    if (!_ocioCache) _ocioCache = [];
    const idx = _ocioCache.findIndex(x => x.id === saved.id);
    if (idx >= 0) _ocioCache[idx] = saved; else _ocioCache.push(saved);
  }
  closeOcioModal();
  renderOcio();
  showToast(id ? `✓ "${data.nombre}" actualizado` : `✓ "${data.nombre}" agregado`);
}

async function deleteOcio() {
  const id = document.getElementById('om-id').value;
  if (!id || !confirm('¿Eliminar este lugar?')) return;
  save(LS_OCIO, loadO().filter(x => x.id !== parseInt(id)));
  closeOcioModal();
  renderOcio();
  showToast('Lugar eliminado');
}

// ── Util ──────────────────────────────────────────────────────────────────────
function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);
}

// Safe addEventListener — skips if element not found instead of throwing
function on(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {



  // Tab buttons
  ['metas','wishlist','ocio'].forEach(t => {
    on(`tab-${t}`, 'click', () => setTab(t));
  });

  // FAB
  on('btn-add-item', 'click', () => {
    if (activeTab === 'metas')    openMetaModal(null);
    if (activeTab === 'wishlist') openWishModal(null);
    if (activeTab === 'ocio')     openOcioModal(null);
  });

  // Drag & drop columns
  document.querySelectorAll('.kanban-col-body').forEach(col => {
    col.addEventListener('dragover',  dragOver);
    col.addEventListener('dragleave', dragLeave);
    col.addEventListener('drop',      e => drop(e, col.dataset.col));
  });

  // Meta modal
  on('mm-progreso-input', 'input', e => {
    document.getElementById('mm-progreso-val').textContent = e.target.value + '%';
  });
  on('mm-save-btn',   'click', saveMetaModal);
  on('mm-delete-btn', 'click', deleteMeta);
  on('mm-close-btn',  'click', closeMetaModal);
  on('meta-modal-overlay', 'click', e => {
    if (e.target.id === 'meta-modal-overlay') closeMetaModal();
  });

  // Wish modal
  on('wm-save-btn',   'click', saveWishModal);
  on('wm-delete-btn', 'click', deleteWish);
  on('wm-close-btn',  'click', closeWishModal);
  on('wish-modal-overlay', 'click', e => {
    if (e.target.id === 'wish-modal-overlay') closeWishModal();
  });

  // Ocio modal
  on('om-save-btn',   'click', saveOcioModal);
  on('om-delete-btn', 'click', deleteOcio);
  on('om-close-btn',  'click', closeOcioModal);
  on('ocio-modal-overlay', 'click', e => {
    if (e.target.id === 'ocio-modal-overlay') closeOcioModal();
  });

  // Wishlist filter buttons
  document.querySelectorAll('.wish-filter-btn').forEach(b =>
    b.addEventListener('click', () => setWishFilter(b.dataset.f))
  );

  // Ocio filter buttons
  document.querySelectorAll('.ocio-filter-btn').forEach(b =>
    b.addEventListener('click', () => setOcioFilter(b.dataset.f))
  );

  // Escape closes any open modal
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeMetaModal(); closeWishModal(); closeOcioModal();
  });

  renderKanban();
  renderWishlist();
  renderOcio();
});
