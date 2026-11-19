// Leonida Platinum: an offline GTA 6 trophy guide and tracker.
// Data lives in data/trophies.json and data/roadmap.json, fetched from this
// app's own folder only. Progress lives in localStorage under STORE_KEY and
// can be exported to a file and imported back.
const STORE_KEY = 'leonida-platinum-v1';
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const countLineEl = document.getElementById('countLine');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');

const [trophyDoc, roadmapDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
const trophies = trophyDoc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}'); } catch { saved = {}; }
let earned = new Set((saved.earned ?? []).filter((n) => byName.has(n)));
let kind = saved.kind ?? 'all';
let selectedId = null;

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...earned],
    spoiler: spoilerEl.checked,
    hideEarned: hideEarnedEl.checked,
    kind,
    grade: gradeEl.value,
  }));
}

function isMasked(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function gradeCounts() {
  const out = {};
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    out[g] = `${got}/${total}`;
  }
  return out;
}

function renderProgress() {
  document.getElementById('progressText').textContent = `${earned.size} / ${trophies.length} earned`;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const c = gradeCounts();
  document.getElementById('gradeCounts').textContent =
    `Platinum ${c.platinum} · Gold ${c.gold} · Silver ${c.silver} · Bronze ${c.bronze}`;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'online') return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q && !t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    return true;
  });
}

function tag(text, cls) {
  const s = document.createElement('span');
  s.className = `tag ${cls}`;
  s.textContent = text;
  return s;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.dataset.id = t.id;
  if (earned.has(t.name)) li.classList.add('earned');
  if (selectedId === t.id) li.classList.add('selected');
  const masked = isMasked(t);

  const row1 = document.createElement('div');
  row1.className = 'row1';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${masked ? 'this trophy' : t.name} earned`);
  box.addEventListener('change', (e) => {
    e.stopPropagation();
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    renderAll();
  });
  row1.append(box);

  const medal = document.createElement('span');
  medal.className = `medal ${t.grade}`;
  medal.title = GRADE_LABEL[t.grade];
  row1.append(medal);

  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = masked ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.textContent = masked ? 'Earn this trophy in the game to reveal its name and description.' : t.description;
  body.append(name, desc);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(tag(GRADE_LABEL[t.grade], `grade-${t.grade}`));
  meta.append(tag(KIND_LABEL[t.kind] ?? t.kind, ''));
  if (t.count != null) meta.append(tag(`Target: ${t.count.toLocaleString('en-US')}`, 'count'));
  if (t.chapter) meta.append(tag(t.chapter, ''));
  if (t.hidden) meta.append(tag('Hidden on PSN', 'hidden'));
  if (t.missable) meta.append(tag('⚠ POSSIBLY MISSABLE', 'missable'));
  if (earned.has(t.name)) meta.append(tag('✓ Earned', 'earned-tag'));
  body.append(meta);
  row1.append(body);
  li.append(row1);

  li.addEventListener('click', () => {
    selectedId = t.id;
    renderAll();
  });
  return li;
}

function renderList() {
  rowsEl.replaceChildren();
  const list = visibleTrophies();
  if (kind === 'online') {
    const li = document.createElement('li');
    li.textContent = 'No online trophies: all 55 trophies are single-player and offline. Nothing here needs PlayStation Network or another player.';
    rowsEl.append(li);
  } else if (list.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No trophies match these filters. Clear the search or pick another kind or grade.';
    rowsEl.append(li);
  } else {
    for (const t of list) rowsEl.append(trophyRow(t));
  }
  const shown = kind === 'online' ? 0 : list.length;
  const earnedShown = list.filter((t) => earned.has(t.name)).length;
  countLineEl.textContent = `Showing ${shown} of ${trophies.length} trophies` +
    (kind !== 'all' ? ` · kind: ${KIND_LABEL[kind]}` : '') +
    (gradeEl.value !== 'all' ? ` · grade: ${GRADE_LABEL[gradeEl.value]}` : '') +
    ` · ${earnedShown} earned in this view`;
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'pick';
    p.textContent = 'Select a trophy on the left to read its guide and sources. The platinum takes about 200 hours at difficulty 4/10, in a single playthrough, all offline — and only one trophy can possibly be missed.';
    const p2 = document.createElement('p');
    p2.className = 'pick';
    p2.textContent = 'Start with the Roadmap tab for the order to earn them in, and the Missable tab for the one trophy to protect with a manual save.';
    detailEl.append(p, p2);
    return;
  }
  const masked = isMasked(t);
  const h = document.createElement('h2');
  h.textContent = masked ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = masked ? 'Earn this trophy in the game to reveal its name and description.' : t.description;
  detailEl.append(h, desc);
  if (masked) {
    const p = document.createElement('p');
    p.className = 'guide';
    p.textContent = 'Spoiler-safe mode is on. Turn it off, or tick this trophy earned, to read its guide.';
    detailEl.append(p);
    return;
  }
  const meta = document.createElement('p');
  meta.className = 'pick';
  meta.textContent = `${GRADE_LABEL[t.grade]} · ${KIND_LABEL[t.kind]}` +
    (t.count != null ? ` · Target: ${t.count.toLocaleString('en-US')}` : '') +
    (t.chapter ? ` · ${t.chapter}` : '') +
    (t.missable ? ' · POSSIBLY MISSABLE' : '') +
    (t.hidden ? ' · Hidden on PSN until earned' : '');
  detailEl.append(meta);
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  detailEl.append(guide);
  const src = document.createElement('div');
  src.className = 'sources';
  const b = document.createElement('b');
  b.textContent = 'Sources for this guide:';
  src.append(b);
  for (const s of t.sources ?? []) {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = `${s.name} — ${s.url}`;
    src.append(a);
  }
  const note = document.createElement('p');
  note.textContent = 'Guides are written in this entry’s own words. A link opens only if you click it; the app itself loads nothing from the network.';
  src.append(note);
  detailEl.append(src);
}

function renderRoadmap() {
  const ol = document.getElementById('roadmap');
  ol.replaceChildren();
  for (const stage of roadmapDoc.stages) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const name of stage.trophies) {
      const t = byName.get(name);
      const s = document.createElement('span');
      s.textContent = `${name}${t && earned.has(name) ? ' ✓' : ''}`;
      if (t?.missable) s.className = 'miss';
      chips.append(s);
    }
    li.append(h, hours, text, chips);
    ol.append(li);
  }
}

function renderMissables() {
  const ul = document.getElementById('missableRows');
  ul.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    ul.append(trophyRow(t));
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tabpage').forEach((p) => p.classList.toggle('hidden', p.id !== `tab-${btn.dataset.tab}`));
    document.getElementById('controls').style.display = btn.dataset.tab === 'checklist' ? '' : 'none';
  });
});

document.querySelectorAll('#kindFilters button').forEach((btn) => {
  btn.addEventListener('click', () => {
    kind = btn.dataset.kind;
    document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('active', b === btn));
    save();
    renderAll();
  });
});

searchEl.addEventListener('input', renderAll);
gradeEl.addEventListener('change', () => { save(); renderAll(); });
spoilerEl.addEventListener('change', () => { save(); renderAll(); });
hideEarnedEl.addEventListener('change', () => { save(); renderAll(); });

document.getElementById('export').addEventListener('click', () => {
  const payload = { app: 'leonida-platinum', exportedAt: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned ?? [];
    const next = new Set(names.filter((n) => byName.has(n)));
    earned = next;
    save();
    renderAll();
    alert(`Imported ${earned.size} earned trophies.`);
  } catch {
    alert('That file could not be read as progress. Export a file from this guide and import that one back.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks in this browser?')) return;
  earned = new Set();
  save();
  renderAll();
});

// Restore saved control states before the first render.
if (saved.spoiler) spoilerEl.checked = true;
if (saved.hideEarned) hideEarnedEl.checked = true;
if (saved.grade && [...gradeEl.options].some((o) => o.value === saved.grade)) gradeEl.value = saved.grade;
document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('active', b.dataset.kind === kind));
selectedId = 'positive-mental-attitude';
renderAll();
