// facultad.js — Sección Facultad del Life Dashboard
// Planes reales UNQ según PDFs adjuntos (Plan 2015)

// ── Datos LI ──────────────────────────────────────────────────────────────────
const MATERIAS_LI = [
  // Ciclo Introductorio
  { id:'li_epl',  nombre:'Elementos de Programación y Lógica', grupo:'CI',    creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  { id:'li_mat',  nombre:'Matemática',                          grupo:'CI',    creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  { id:'li_lea',  nombre:'Lectura y Escritura Académica',       grupo:'CI',    creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  // Otros requerimientos
  { id:'li_ing1', nombre:'Inglés I',                            grupo:'NOR',   creditos:6,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'li_ing2', nombre:'Inglés II',                           grupo:'NOR',   creditos:6,  correlativas:['li_ing1'],                     estado:'pendiente', nota:null },
  { id:'li_tti',  nombre:'TTI',                                 grupo:'NFHW',  creditos:4,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'li_ttu',  nombre:'TTU',                                 grupo:'NFHW',  creditos:4,  correlativas:[],                              estado:'pendiente', nota:null },
  // Nucleo Basico
  { id:'li_intro',nombre:'Introducción a la Programación',      grupo:'NBW',   creditos:16, correlativas:['li_epl'],                      estado:'aprobada',  nota:8  },
  { id:'li_mat1', nombre:'Matemática I',                        grupo:'NBW',   creditos:16, correlativas:['li_epl'],                      estado:'aprobada',  nota:7  },
  { id:'li_orga', nombre:'Organización de Computadoras',        grupo:'NBW',   creditos:12, correlativas:['li_epl'],                      estado:'aprobada',  nota:8  },
  { id:'li_bd',   nombre:'Bases de Datos',                      grupo:'NBW',   creditos:12, correlativas:['li_epl'],                      estado:'aprobada',  nota:7  },
  { id:'li_poo1', nombre:'Programación con Objetos I',          grupo:'NBW',   creditos:16, correlativas:['li_intro'],                    estado:'aprobada',  nota:9  },
  { id:'li_ed',   nombre:'Estructuras de Datos',                grupo:'NBW',   creditos:12, correlativas:['li_intro'],                    estado:'aprobada',  nota:8  },
  { id:'li_mat2', nombre:'Matemática II',                       grupo:'NBW',   creditos:8,  correlativas:['li_mat1'],                     estado:'aprobada',  nota:6  },
  { id:'li_poo2', nombre:'Programación con Objetos II',         grupo:'NBW',   creditos:12, correlativas:['li_poo1'],                     estado:'aprobada',  nota:8  },
  { id:'li_so',   nombre:'Sistemas Operativos',                 grupo:'NBW',   creditos:12, correlativas:['li_intro','li_orga'],          estado:'pendiente',  nota:null },
  { id:'li_redes',nombre:'Redes de Computadoras',               grupo:'NBW',   creditos:12, correlativas:['li_orga'],                     estado:'pendiente',  nota:null },
  { id:'li_pfunc',nombre:'Programación Funcional',              grupo:'NBW',   creditos:8,  correlativas:['li_ed'],                       estado:'pendiente', nota:null },
  { id:'li_ciu',  nombre:'Construcción de Interfaces de Usuario',grupo:'NBW',  creditos:12, correlativas:['li_poo2'],                     estado:'pendiente', nota:null },
  { id:'li_ep',   nombre:'Estrategias de Persistencia',         grupo:'NBW',   creditos:12, correlativas:['li_bd','li_poo2'],             estado:'pendiente', nota:null },
  { id:'li_lsor', nombre:'Lab. Sistemas Operativos y Redes',    grupo:'NBW',   creditos:8,  correlativas:['li_redes','li_so'],            estado:'pendiente', nota:null },
  { id:'li_algo', nombre:'Algoritmos',                          grupo:'NBW',   creditos:12, correlativas:['li_pfunc'],                    estado:'pendiente', nota:null },
  // Cursos Basicos
  { id:'li_amat1',nombre:'Análisis Matemático I',               grupo:'W15BO', creditos:12, correlativas:['li_mat2'],                     estado:'pendiente', nota:null },
  { id:'li_lp',   nombre:'Lógica y Programación',               grupo:'W15BO', creditos:12, correlativas:['li_intro','li_mat1'],          estado:'pendiente', nota:null },
  { id:'li_pc',   nombre:'Programación Concurrente',            grupo:'W15BO', creditos:8,  correlativas:['li_ed'],                       estado:'pendiente', nota:null },
  { id:'li_mat3', nombre:'Matemática III',                      grupo:'W15BO', creditos:8,  correlativas:['li_amat1'],                    estado:'pendiente', nota:null },
  { id:'li_eis',  nombre:'Elementos de Ingeniería de Software', grupo:'W15BO', creditos:12, correlativas:['li_poo2'],                     estado:'pendiente', nota:null },
  { id:'li_prob', nombre:'Probabilidad y Estadísticas',         grupo:'W15BO', creditos:12, correlativas:['li_mat3'],                     estado:'pendiente', nota:null },
  { id:'li_lfa',  nombre:'Lenguajes Formales y Autómatas',      grupo:'W15BO', creditos:8,  correlativas:['li_lp'],                      estado:'pendiente', nota:null },
  { id:'li_ir',   nombre:'Ingeniería de Requerimientos',        grupo:'W15BO', creditos:8,  correlativas:['li_eis'],                      estado:'pendiente', nota:null },
  { id:'li_seg',  nombre:'Seguridad de la Información',         grupo:'W15BO', creditos:8,  correlativas:['li_lsor'],                     estado:'pendiente', nota:null },
  { id:'li_pds',  nombre:'Práctica del Desarrollo de Software', grupo:'W15BO', creditos:16, correlativas:['li_ciu','li_ep','li_eis'],     estado:'pendiente', nota:null },
  { id:'li_gp',   nombre:'Gestión de Proyectos de Desarrollo',  grupo:'W15BO', creditos:8,  correlativas:['li_ir'],                       estado:'pendiente', nota:null },
  // Cursos Avanzados
  { id:'li_arq1', nombre:'Arquitectura de Software I',          grupo:'W12AV', creditos:12, correlativas:['li_pc','li_pds','li_gp','li_seg'], estado:'pendiente', nota:null },
  { id:'li_sdist',nombre:'Sistemas Distribuidos',               grupo:'W12AV', creditos:8,  correlativas:['li_pc','li_lsor'],             estado:'pendiente', nota:null },
  { id:'li_clp',  nombre:'Características de Lenguajes de Prog.',grupo:'W12AV',creditos:8, correlativas:['li_lp'],                       estado:'pendiente', nota:null },
  { id:'li_arq2', nombre:'Arquitectura de Software II',         grupo:'W12AV', creditos:12, correlativas:['li_arq1','li_sdist'],          estado:'pendiente', nota:null },
  { id:'li_tc',   nombre:'Teoría de la Computación',            grupo:'W12AV', creditos:8,  correlativas:['li_lfa'],                      estado:'pendiente', nota:null },
  { id:'li_poo3', nombre:'Programación con Objetos III',        grupo:'W12AV', creditos:8,  correlativas:['li_poo2'],                     estado:'pendiente', nota:null },
  { id:'li_arqc', nombre:'Arquitecturas de Computadoras',       grupo:'W12AV', creditos:8,  correlativas:['li_lsor'],                     estado:'pendiente', nota:null },
  { id:'li_pgc',  nombre:'Parseo y Generación de Código',       grupo:'W12AV', creditos:8,  correlativas:['li_lfa','li_clp'],             estado:'pendiente', nota:null },
  { id:'li_legal',nombre:'Aspectos Legales',                    grupo:'W12AV', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  // Seminario Final
  { id:'li_sf',   nombre:'Seminario Final',                     grupo:'W12SF', creditos:20, correlativas:[],                              estado:'pendiente', nota:null },
];

// ── Datos TPI ─────────────────────────────────────────────────────────────────
const MATERIAS_TPI = [
  // Ciclo Introductorio
  { id:'tpi_epl', nombre:'Elementos de Programación y Lógica', grupo:'CI',   creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  { id:'tpi_mat', nombre:'Matemática',                          grupo:'CI',   creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  { id:'tpi_lea', nombre:'Lectura y Escritura Académica',       grupo:'CI',   creditos:10, correlativas:[],                              estado:'aprobada',  nota:null },
  // Otros requerimientos
  { id:'tpi_ing1',nombre:'Inglés I',                            grupo:'NOR',  creditos:6,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_ing2',nombre:'Inglés II',                           grupo:'NOR',  creditos:6,  correlativas:['tpi_ing1'],                    estado:'pendiente', nota:null },
  { id:'tpi_tip', nombre:'TIP',                                 grupo:'NOR',  creditos:20, correlativas:[],                              estado:'pendiente', nota:null },
  // Cursos Obligatorios
  { id:'tpi_intro',nombre:'Introducción a la Programación',     grupo:'CO',   creditos:16, correlativas:['tpi_epl'],                     estado:'aprobada',  nota:8  },
  { id:'tpi_orga', nombre:'Organización de Computadoras',       grupo:'CO',   creditos:12, correlativas:['tpi_epl'],                     estado:'aprobada',  nota:8  },
  { id:'tpi_mat1', nombre:'Matemática I',                       grupo:'CO',   creditos:16, correlativas:['tpi_epl'],                     estado:'aprobada',  nota:7  },
  { id:'tpi_bd',   nombre:'Bases de Datos',                     grupo:'CO',   creditos:12, correlativas:['tpi_epl'],                     estado:'aprobada',  nota:7  },
  { id:'tpi_ed',   nombre:'Estructura de Datos',                grupo:'CO',   creditos:16, correlativas:['tpi_intro'],                   estado:'aprobada',  nota:8  },
  { id:'tpi_poo1', nombre:'Programación con Objetos I',         grupo:'CO',   creditos:16, correlativas:['tpi_intro'],                   estado:'aprobada',  nota:9  },
  { id:'tpi_poo2', nombre:'Programación con Objetos II',        grupo:'CO',   creditos:12, correlativas:['tpi_poo1'],                    estado:'aprobada',  nota:8  },
  // Cursos Avanzados
  { id:'tpi_mat2', nombre:'Matemática II',                      grupo:'CA',   creditos:8,  correlativas:['tpi_mat1'],                    estado:'pendiente', nota:null },
  { id:'tpi_pfunc',nombre:'Programación Funcional',             grupo:'CA',   creditos:8,  correlativas:['tpi_ed'],                      estado:'pendiente', nota:null },
  { id:'tpi_ep',   nombre:'Estrategias de Persistencia',        grupo:'CA',   creditos:12, correlativas:['tpi_bd','tpi_poo2'],           estado:'pendiente', nota:null },
  { id:'tpi_ciu',  nombre:'Construcción de Interfaces de Usuario',grupo:'CA', creditos:12, correlativas:['tpi_poo2'],                    estado:'pendiente', nota:null },
  { id:'tpi_eis',  nombre:'Elementos de Ingeniería de Software',grupo:'CA',   creditos:12, correlativas:['tpi_poo2'],                    estado:'pendiente', nota:null },
  { id:'tpi_pc',   nombre:'Programación Concurrente',           grupo:'CA',   creditos:12, correlativas:['tpi_ed'],                      estado:'pendiente', nota:null },
  { id:'tpi_so',   nombre:'Sistemas Operativos',                grupo:'CA',   creditos:12, correlativas:['tpi_intro','tpi_orga'],        estado:'pendiente',  nota:null },
  { id:'tpi_redes',nombre:'Redes de Computadoras',              grupo:'CA',   creditos:12, correlativas:['tpi_orga'],                    estado:'pendiente',  nota:null },
  { id:'tpi_lsor', nombre:'Lab. Sistemas Operativos y Redes',   grupo:'CA',   creditos:8,  correlativas:['tpi_redes','tpi_so'],          estado:'pendiente', nota:null },
  { id:'tpi_da',   nombre:'Desarrollo de Aplicaciones',         grupo:'CA',   creditos:8,  correlativas:['tpi_eis','tpi_ciu','tpi_ep'],  estado:'pendiente', nota:null },
  // Complementarias
  { id:'tpi_tti',  nombre:'Taller de Trabajo Intelectual',      grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_ttu',  nombre:'Taller de Trabajo Universitario',    grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_seg',  nombre:'Seguridad Informática',              grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_bd2',  nombre:'Bases de Datos II',                  grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_arqs', nombre:'Introducción a Arquitecturas de SW', grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
  { id:'tpi_poo3', nombre:'Programación con Objetos III',       grupo:'COMP', creditos:8,  correlativas:[],                              estado:'pendiente', nota:null },
];

const GRUPOS_LI = {
  CI:    { label:'Ciclo Introductorio',     color:'var(--text-3)'  },
  NOR:   { label:'Otros requerimientos',    color:'var(--text-3)'  },
  NFHW:  { label:'Formación Humanística',   color:'var(--text-3)'  },
  NBW:   { label:'Núcleo Básico',           color:'var(--accent)'  },
  W15BO: { label:'Cursos Básicos',          color:'var(--purple)'  },
  W12AV: { label:'Cursos Avanzados',        color:'var(--amber)'   },
  W12SF: { label:'Seminario Final',         color:'var(--green)'   },
};

const GRUPOS_TPI = {
  CI:   { label:'Ciclo Introductorio',      color:'var(--text-3)'  },
  NOR:  { label:'Otros requerimientos',     color:'var(--text-3)'  },
  CO:   { label:'Cursos Obligatorios',      color:'var(--accent)'  },
  CA:   { label:'Cursos Avanzados',         color:'var(--purple)'  },
  COMP: { label:'Complementarias',          color:'var(--amber)'   },
};

// Supabase tables
const TBL_LI      = 'materias_li';
const TBL_TPI     = 'materias_tpi';
const TBL_HORARIO = 'horario';

let activeCarrera = sessionStorage.getItem('ld_carrera_activa') || 'li';

async function setCarrera(c) {
  activeCarrera = c;
  sessionStorage.setItem('ld_carrera_activa', c);
  document.getElementById('btn-carrera-li').classList.toggle('active',  c === 'li');
  document.getElementById('btn-carrera-tpi').classList.toggle('active', c === 'tpi');
  const sub = c === 'li'
    ? 'Licenciatura en Informática · Plan 2015'
    : 'Tecnicatura en Programación Informática · Plan 2015';
  document.getElementById('page-carrera-sub').textContent = sub;
  await loadMateriasAsync();
  await loadHorarioAsync();
  await renderAll();
}

// In-memory cache — populated on page load
let _materiasCache = null;
let _horarioCache  = null;

function loadMaterias() {
  // Returns cache (sync) — always call await loadMateriasAsync() first
  return _materiasCache || [];
}

async function loadMateriasAsync() {
  const table = activeCarrera === 'li' ? TBL_LI : TBL_TPI;
  const rows  = await dbLoad(table);
  const def   = activeCarrera === 'li' ? MATERIAS_LI : MATERIAS_TPI;

  if (!rows.length) {
    // First time: seed defaults for this user
    _materiasCache = def;
    await dbReplaceAll(table, def.map(m => ({ materia_id: m.id, estado: m.estado, nota: m.nota })));
    return _materiasCache;
  }

  // Merge DB state (estado/nota) into static definition (nombre, creditos, etc.)
  const stateMap = Object.fromEntries(rows.map(r => [r.materia_id, r]));
  _materiasCache = def.map(m => ({
    ...m,
    estado: stateMap[m.id]?.estado ?? m.estado,
    nota:   stateMap[m.id]?.nota   ?? m.nota,
    _dbId:  stateMap[m.id]?.id,
  }));
  return _materiasCache;
}

async function saveMaterias(materias) {
  _materiasCache = materias;
  const table = activeCarrera === 'li' ? TBL_LI : TBL_TPI;
  // Upsert only estado/nota rows (lightweight)
  const rows = materias.map(m => ({
    ...(m._dbId ? { id: m._dbId } : {}),
    materia_id: m.id,
    estado:     m.estado,
    nota:       m.nota ?? null,
  }));
  await dbReplaceAll(table, rows);
}

function loadHorario() {
  return _horarioCache || [];
}

async function loadHorarioAsync() {
  _horarioCache = await dbLoad(TBL_HORARIO);
  return _horarioCache;
}

function getUnlockState(materias) {
  const map = Object.fromEntries(materias.map(m => [m.id, m.estado]));
  return Object.fromEntries(materias.map(m => {
    if (m.estado === 'aprobada' || m.estado === 'cursando') return [m.id, true];
    return [m.id, m.correlativas.every(c => map[c] === 'aprobada')];
  }));
}

function calcStats(materias) {
  const c  = materias;
  const ap = c.filter(m => m.estado === 'aprobada').length;
  const cu = c.filter(m => m.estado === 'cursando').length;
  const ns = c.filter(m => m.nota != null).map(m => m.nota);
  const pr = ns.length ? (ns.reduce((a,b) => a+b, 0) / ns.length).toFixed(1) : '—';
  return { total:c.length, aprobadas:ap, cursando:cu, promedio:pr, pct: c.length ? Math.round(ap/c.length*100) : 0 };
}

function renderStats(materias) {
  const s = calcStats(materias);
  document.getElementById('stat-aprobadas').textContent = s.aprobadas;
  document.getElementById('stat-total').textContent     = s.total;
  document.getElementById('stat-cursando').textContent  = s.cursando;
  document.getElementById('stat-promedio').textContent  = s.promedio;
  document.getElementById('stat-pct').textContent       = s.pct + '%';
  document.getElementById('progress-fill').style.width  = s.pct + '%';
}

function renderRoadmap(materias) {
  const container = document.getElementById('roadmap-grid');
  if (!container) return;

  const unlocked = getUnlockState(materias);
  const gcfg     = activeCarrera === 'li' ? GRUPOS_LI : GRUPOS_TPI;
  const grupos   = [...new Set(materias.map(m => m.grupo))];

  const EC = {
    aprobada:  { label:'Aprobada',  cls:'estado-aprobada',  dot:'#34d399' },
    cursando:  { label:'Cursando',  cls:'estado-cursando',  dot:'#0cc8b8' },
    pendiente: { label:'Pendiente', cls:'estado-pendiente', dot:'#555870' },
    libre:     { label:'Libre',     cls:'estado-libre',     dot:'#f87171' },
  };

  container.innerHTML = grupos.map(grupo => {
    const mats = materias.filter(m => m.grupo === grupo);
    const g    = gcfg[grupo] || { label:grupo, color:'var(--text-3)' };
    const ap   = mats.filter(m => m.estado === 'aprobada').length;
    return `
      <div class="año-block">
        <div class="año-header">
          <span class="año-label" style="color:${g.color}">${g.label}</span>
          <span class="año-sub">${ap}/${mats.length} aprobadas</span>
        </div>
        <div class="cuatris-row">
          <div class="cuatri-col" style="grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">
            ${mats.map(m => {
              const cfg    = EC[m.estado] || EC.pendiente;
              const locked = !unlocked[m.id] && m.estado === 'pendiente';
              const corrs  = m.correlativas.map(c => materias.find(x => x.id===c)?.nombre.split(' ')[0]||c).join(', ');
              return `
                <div class="materia-card ${cfg.cls} ${locked ? 'locked' : ''}"
                     onclick="${locked ? '' : "openModal('"+m.id+"')"}">
                  <div class="materia-header">
                    <span class="materia-dot" style="background:${cfg.dot}"></span>
                    <span class="materia-nombre">${m.nombre}</span>
                    ${locked ? '<span class="lock-icon">🔒</span>' : ''}
                  </div>
                  <div class="materia-meta">
                    <span>${m.creditos} cr.</span>
                    ${m.nota != null ? `<span class="materia-nota">${m.nota}/10</span>` : `<span class="badge-estado">${cfg.label}</span>`}
                  </div>
                  ${corrs ? `<div class="materia-corr">Req: ${corrs}</div>` : ''}
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderHorario(materias) {
  const horario   = loadHorario();
  const container = document.getElementById('horario-grid');
  if (!container) return;

  const DIAS  = ['Lun','Mar','Mié','Jue','Vie'];
  const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00',
                 '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
  const COLORS = ['var(--accent)','var(--purple)','var(--amber)','var(--green)','var(--coral)'];

  // Only show hours that are covered by at least one class (start or in-between)
  const toMin = t => { const [hh,mm] = t.split(':').map(Number); return hh*60+mm; };
  const activas = HORAS.filter(h => horario.some(c => {
    const start = toMin(c.hora);
    const end   = c.hora_fin ? toMin(c.hora_fin) : start + 60;
    return toMin(h) >= start && toMin(h) < end;
  }));

  if (!activas.length) {
    container.innerHTML = `<p style="color:var(--text-3);font-size:13px;padding:24px">Sin horarios cargados. Editá una materia cursando para agregar clases.</p>`;
    return;
  }

  const matIds  = [...new Set(horario.map(h => h.materiaId))];
  const colorOf = Object.fromEntries(matIds.map((id,i) => [id, COLORS[i % COLORS.length]]));

  // Track which cells are already occupied by a spanning class
  const occupied = {}; // key: `${diaIdx}-${hora}` → true

  let html = `<div class="horario-table">`;
  html += `<div class="h-cell h-header h-corner"></div>`;
  DIAS.forEach(d => { html += `<div class="h-cell h-header">${d}</div>`; });

  activas.forEach(hora => {
    html += `<div class="h-cell h-time">${hora}</div>`;
    DIAS.forEach((_, i) => {
      const key = `${i}-${hora}`;
      if (occupied[key]) return; // already rendered by a spanning cell above

      const clase = horario.find(c => c.dia === i+1 && c.hora === hora);
      if (clase) {
        const mat   = materias.find(m => m.id === clase.materiaId);
        const color = colorOf[clase.materiaId] || 'var(--accent)';

        // Calculate row span
        let span = 1;
        if (clase.hora_fin) {
          const startIdx = activas.indexOf(hora);
          const endMin   = toMin(clase.hora_fin);
          for (let j = startIdx + 1; j < activas.length; j++) {
            if (toMin(activas[j]) < endMin) {
              span++;
              occupied[`${i}-${activas[j]}`] = true;
            } else break;
          }
        }

        const spanStyle = span > 1 ? `grid-row: span ${span};` : '';
        html += `
          <div class="h-cell h-clase" style="border-left:3px solid ${color};${spanStyle}align-items:flex-start;padding-top:10px">
            <div class="h-clase-nombre" style="color:${color}">${mat?.nombre.split(' ').slice(0,2).join(' ')||clase.materia}</div>
            <div class="h-clase-sub">${clase.tipo}${clase.aula?' · '+clase.aula:''}</div>
            ${clase.hora_fin ? `<div class="h-clase-sub" style="margin-top:2px;opacity:.7">${clase.hora} – ${clase.hora_fin}</div>` : ''}
          </div>`;
      } else {
        html += `<div class="h-cell h-empty"></div>`;
      }
    });
  });
  html += `</div>`;
  container.innerHTML = html;
}

const DIAS_LABEL = ['','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const HORAS_SLOT = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00',
                    '15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

function getClasesForMateria(id) { return loadHorario().filter(h => h.materiaId === id); }

async function saveClaseForMateria(materiaId, matNombre, d) {
  const toMin = t => { const [hh,mm] = t.split(':').map(Number); return hh*60+mm; };
  const duracion = d.hora_fin ? toMin(d.hora_fin) - toMin(d.hora) : 60;
  const saved = await dbSave(TBL_HORARIO, {
    materia_id: materiaId, materia: matNombre, dia: parseInt(d.dia),
    hora: d.hora, hora_fin: d.hora_fin||'', duracion,
    aula: d.aula||'', tipo: d.tipo||'Teórica',
  });
  if (saved) {
    if (!_horarioCache) _horarioCache = [];
    _horarioCache.push(saved);
  }
}

async function deleteClaseFromHorario(id) {
  await dbDelete(TBL_HORARIO, id);
  _horarioCache = (_horarioCache||[]).filter(h => h.id !== id);
}

function renderSchedulePanel(materiaId, matNombre) {
  const panel  = document.getElementById('modal-schedule-panel');
  if (!panel) return;
  const clases = getClasesForMateria(materiaId);
  const safe   = matNombre.replace(/'/g,"\\'");

  panel.style.display = '';
  panel.innerHTML = `
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
      <div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Horarios en el calendario</div>
      ${clases.length ? `
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
          ${clases.map(c => `
            <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm)">
              <div style="flex:1;font-size:12px">
                <span style="color:var(--accent);font-family:var(--font-mono)">${DIAS_LABEL[c.dia]}</span>
                <span style="color:var(--text-3);margin:0 4px">·</span>
                <span>${c.hora}${c.hora_fin ? ' → ' + c.hora_fin : ''}</span>
                <span style="color:var(--text-3);margin:0 4px">·</span><span>${c.tipo}</span>
                ${c.aula?`<span style="color:var(--text-3);margin:0 4px">·</span><span>Aula ${c.aula}</span>`:''}
              </div>
              <button onclick="(async()=>{await deleteClaseFromHorario(${c.id});await loadHorarioAsync();renderSchedulePanel('${materiaId}','${safe}');renderHorario(loadMaterias());})()" 
                style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:11px;padding:2px 6px;transition:color .15s"
                onmouseover="this.style.color='var(--coral)'" onmouseout="this.style.color='var(--text-3)'">✕</button>
            </div>`).join('')}
        </div>` : `<p style="font-size:12px;color:var(--text-3);margin-bottom:12px">Sin horarios cargados.</p>`}
      <details>
        <summary style="font-size:12px;color:var(--accent);cursor:pointer;list-style:none;user-select:none;margin-bottom:8px">+ Agregar horario</summary>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <div><div class="form-label" style="font-size:10px">Día</div>
            <select class="form-control" id="nc-dia" style="font-size:12px;padding:6px 10px">
              ${DIAS_LABEL.slice(1).map((d,i)=>`<option value="${i+1}">${d}</option>`).join('')}
            </select></div>
          <div><div class="form-label" style="font-size:10px">Tipo</div>
            <select class="form-control" id="nc-tipo" style="font-size:12px;padding:6px 10px">
              <option>Teórica</option><option>Práctica</option><option>Taller</option>
            </select></div>
          <div><div class="form-label" style="font-size:10px">Hora inicio</div>
            <select class="form-control" id="nc-hora" style="font-size:12px;padding:6px 10px">
              ${HORAS_SLOT.map(h=>`<option value="${h}">${h}</option>`).join('')}
            </select></div>
          <div><div class="form-label" style="font-size:10px">Hora fin</div>
            <select class="form-control" id="nc-hora-fin" style="font-size:12px;padding:6px 10px">
              ${HORAS_SLOT.map(h=>`<option value="${h}">${h}</option>`).join('')}
            </select></div>
          <div><div class="form-label" style="font-size:10px">Aula</div>
            <input type="text" class="form-control" id="nc-aula" placeholder="Ej: A-12" maxlength="10" style="font-size:12px;padding:6px 10px"></div>
          <div style="display:flex;align-items:flex-end">
            <button class="btn-primary" style="width:100%;padding:7px"
              onclick="
                const hi = document.getElementById('nc-hora').value;
                const hf = document.getElementById('nc-hora-fin').value;
                if (hf <= hi) { showToast('⚠ La hora fin debe ser mayor que la hora inicio'); return; }
                saveClaseForMateria('${materiaId}','${safe}',{dia:document.getElementById('nc-dia').value,hora:hi,hora_fin:hf,tipo:document.getElementById('nc-tipo').value,aula:document.getElementById('nc-aula').value});
                renderSchedulePanel('${materiaId}','${safe}');
                renderHorario(loadMaterias());
                showToast('✓ Horario agregado')">
              Guardar</button></div>
        </div>
      </details>
    </div>`;
}

function openModal(id) {
  const materias = loadMaterias();
  const m = materias.find(x => x.id === id);
  if (!m) return;

  const unlocked = getUnlockState(materias);
  const ESTADOS  = ['pendiente','cursando','aprobada','libre'];
  const corr     = m.correlativas.map(c => materias.find(x=>x.id===c)?.nombre||c);

  document.getElementById('modal-title').textContent = m.nombre;
  document.getElementById('modal-año').textContent   = `${m.creditos} créditos · Grupo: ${m.grupo}`;
  document.getElementById('modal-corr').innerHTML    = corr.length
    ? corr.map(c=>`<span class="badge badge-teal" style="font-size:11px">${c}</span>`).join('')
    : '<span style="color:var(--text-3);font-size:12px">Sin correlativas específicas</span>';

  const sel = document.getElementById('modal-estado');
  sel.innerHTML = ESTADOS.map(e=>`<option value="${e}" ${m.estado===e?'selected':''}>${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join('');
  sel.disabled  = !unlocked[id];

  const notaEl    = document.getElementById('modal-nota');
  notaEl.value    = m.nota ?? '';
  notaEl.disabled = m.estado !== 'aprobada';

  const syncPanels = estado => {
    notaEl.disabled = estado !== 'aprobada';
    const panel = document.getElementById('modal-schedule-panel');
    if (estado === 'cursando') {
      renderSchedulePanel(m.id, m.nombre);
    } else if (panel) {
      panel.style.display = 'none';
      panel.innerHTML = '';
    }
  };

  sel.onchange = () => syncPanels(sel.value);
  syncPanels(m.estado);

  document.getElementById('modal-save').onclick = async () => {
    const idx    = materias.findIndex(x => x.id === id);
    const estado = sel.value;
    materias[idx].estado = estado;
    materias[idx].nota   = estado === 'aprobada' && notaEl.value ? parseFloat(notaEl.value) : null;
    // Remove from calendar if no longer cursando
    if (estado !== 'cursando') {
      const toDelete = loadHorario().filter(h => h.materia_id === id || h.materiaId === id);
      for (const c of toDelete) await dbDelete(TBL_HORARIO, c.id);
      _horarioCache = (_horarioCache||[]).filter(h => h.materia_id !== id && h.materiaId !== id);
    }
    await saveMaterias(materias);
    closeModal();
    renderAll();
    showToast(`✓ ${m.nombre} actualizada`);
  };

  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function setView(view) {
  document.getElementById('view-roadmap').classList.toggle('active', view === 'roadmap');
  document.getElementById('view-horario').classList.toggle('active', view === 'horario');
  document.getElementById('section-roadmap').style.display = view === 'roadmap' ? '' : 'none';
  document.getElementById('section-horario').style.display = view === 'horario' ? '' : 'none';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

async function renderAll() {
  const materias = loadMaterias();
  renderStats(materias);
  renderRoadmap(materias);
  renderHorario(materias);
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-username');
  if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email.split('@')[0];

  document.getElementById('btn-signout')?.addEventListener('click', e => { e.preventDefault(); signOut(); });

  await loadMateriasAsync();
  await loadHorarioAsync();
  setCarrera(activeCarrera);
  document.getElementById('btn-carrera-li').addEventListener('click',  () => setCarrera('li'));
  document.getElementById('btn-carrera-tpi').addEventListener('click', () => setCarrera('tpi'));
  document.getElementById('view-roadmap').addEventListener('click',    () => setView('roadmap'));
  document.getElementById('view-horario').addEventListener('click',    () => setView('horario'));
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
});
