-- ============================================================
-- Life Dashboard — Schema + RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Transactions (Finanzas — ingresos/gastos) ─────────────
create table if not exists transactions (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users not null default auth.uid(),
  fecha       date not null,
  tipo        text not null check (tipo in ('ingreso','gasto')),
  categoria   text not null,
  monto       numeric(12,2) not null,
  descripcion text,
  metodo_pago text
);
alter table transactions enable row level security;
create policy "own data" on transactions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Ahorros ──────────────────────────────────────────────
create table if not exists ahorros (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users not null default auth.uid(),
  nombre      text not null,
  emoji       text,
  descripcion text,
  saldo       numeric(14,2) default 0,
  meta        numeric(14,2) default 0,
  moneda      text default 'ARS',
  tipo_dolar  text default 'blue'
);
alter table ahorros enable row level security;
create policy "own data" on ahorros
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Materias LI ──────────────────────────────────────────
create table if not exists materias_li (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users not null default auth.uid(),
  materia_id  text not null,
  estado      text default 'pendiente',
  nota        numeric(4,1)
);
alter table materias_li enable row level security;
create policy "own data" on materias_li
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Materias TPI ─────────────────────────────────────────
create table if not exists materias_tpi (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users not null default auth.uid(),
  materia_id  text not null,
  estado      text default 'pendiente',
  nota        numeric(4,1)
);
alter table materias_tpi enable row level security;
create policy "own data" on materias_tpi
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Horario (clases) ─────────────────────────────────────
create table if not exists horario (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users not null default auth.uid(),
  materia_id  text not null,
  materia     text,
  dia         smallint not null,
  hora        text not null,
  hora_fin    text,
  duracion    int,
  aula        text,
  tipo        text default 'Teórica'
);
alter table horario enable row level security;
create policy "own data" on horario
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Metas (Objetivos — Kanban) ────────────────────────────
create table if not exists metas (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users not null default auth.uid(),
  titulo       text not null,
  descripcion  text,
  emoji        text default '🎯',
  estado       text default 'por_empezar',
  progreso     int default 0,
  fecha_limite date
);
alter table metas enable row level security;
create policy "own data" on metas
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Wishlist ─────────────────────────────────────────────
create table if not exists wishlist (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users not null default auth.uid(),
  nombre    text not null,
  emoji     text,
  precio    numeric(12,2) default 0,
  prioridad text default 'media',
  estado    text default 'pendiente',
  url       text
);
alter table wishlist enable row level security;
create policy "own data" on wishlist
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Ocio & Salidas ───────────────────────────────────────
create table if not exists ocio (
  id      bigint generated always as identity primary key,
  user_id uuid references auth.users not null default auth.uid(),
  nombre  text not null,
  tipo    text,
  barrio  text,
  estado  text default 'quiero ir',
  nota    text,
  fecha   date
);
alter table ocio enable row level security;
create policy "own data" on ocio
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
