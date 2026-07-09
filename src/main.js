import { db } from './storage.js';

const app = document.getElementById('app');
let activeTab = 'vitals';
let activeMedCat = 'allergies';

const MED_CATS = [
  { key: 'allergies', label: 'Allergies' },
  { key: 'medications', label: 'Medications' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'surgeries', label: 'Surgeries' },
  { key: 'family', label: 'Family history' }
];

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function latest(arr) {
  return arr.length ? arr[arr.length - 1] : null;
}

function render() {
  const s = db.state;
  const lastVital = latest(s.vitals);

  app.innerHTML = `
    <header class="hero">
      <p class="title">Vitals Ledger</p>
      <p class="subtitle">Your record. Your device. Nothing leaves it.</p>
      <div class="vitals-strip">
        ${vitalStat('Weight', lastVital?.weight, 'kg')}
        ${vitalStat('Resting HR', lastVital?.restingHR, 'bpm')}
        ${vitalStat('VO2 max', lastVital?.vo2max, '')}
        ${vitalStat('Height', s.profile.height, 'cm')}
      </div>
    </header>

    <nav class="tabs">
      ${tabBtn('vitals', 'Vitals')}
      ${tabBtn('workouts', 'Workouts')}
      ${tabBtn('medical', 'Medical')}
      ${tabBtn('export', 'Summary')}
    </nav>

    <main id="tab-content"></main>

    <footer class="privacy-note">Stored only in this browser. No account, no server, no sync.</footer>
  `;

  document.querySelectorAll('nav.tabs button').forEach(btn => {
    btn.addEventListener('click', () => { activeTab = btn.dataset.tab; render(); });
  });

  const content = document.getElementById('tab-content');
  if (activeTab === 'vitals') content.innerHTML = '', renderVitals(content);
  if (activeTab === 'workouts') renderWorkouts(content);
  if (activeTab === 'medical') renderMedical(content);
  if (activeTab === 'export') renderExport(content);
}

function vitalStat(label, value, unit) {
  return `<div class="stat">
    <span class="value">${value ?? '—'}${value ? `<span class="unit">${unit}</span>` : ''}</span>
    <span class="label">${label}</span>
  </div>`;
}

function tabBtn(key, label) {
  return `<button data-tab="${key}" class="${activeTab === key ? 'active' : ''}">${label}</button>`;
}

/* ---------------- Vitals tab ---------------- */
function renderVitals(content) {
  const s = db.state;
  content.innerHTML = `
    <div class="section-title">
      <div><span class="eyebrow">Log an entry</span>New reading</div>
    </div>
    <div class="card">
      <form class="entry-form" id="vital-form">
        <label class="full">Date
          <input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required />
        </label>
        <label>Weight (kg)<input type="number" step="0.1" name="weight" placeholder="e.g. 71.5" /></label>
        <label>Resting HR (bpm)<input type="number" name="restingHR" placeholder="e.g. 54" /></label>
        <label>VO2 max<input type="number" step="0.1" name="vo2max" placeholder="e.g. 48.2" /></label>
        <label>Height (cm)<input type="number" step="0.1" name="height" placeholder="one-off, optional" /></label>
        <label class="full">Notes<textarea name="notes" placeholder="Optional"></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save entry</button></div>
      </form>
    </div>

    <div class="section-title"><div><span class="eyebrow">History</span>Past readings</div></div>
    <div class="card" id="vital-list">
      ${s.vitals.length === 0 ? emptyState('No vitals logged yet.') : [...s.vitals].reverse().map(v => `
        <div class="entry-row">
          <div class="main">
            <div class="label">${fmtDate(v.date)}</div>
            <div class="meta">
              ${v.weight ? `Weight <span class="num">${v.weight} kg</span> · ` : ''}
              ${v.restingHR ? `HR <span class="num">${v.restingHR} bpm</span> · ` : ''}
              ${v.vo2max ? `VO2 <span class="num">${v.vo2max}</span>` : ''}
            </div>
            ${v.notes ? `<div class="meta">${escapeHtml(v.notes)}</div>` : ''}
          </div>
          <button class="del" data-id="${v.id}">Delete</button>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('vital-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get('height')) db.updateProfile({ height: f.get('height') });
    db.addVital({
      date: f.get('date'),
      weight: f.get('weight') ? Number(f.get('weight')) : null,
      restingHR: f.get('restingHR') ? Number(f.get('restingHR')) : null,
      vo2max: f.get('vo2max') ? Number(f.get('vo2max')) : null,
      notes: f.get('notes') || ''
    });
    render();
  });

  document.getElementById('vital-list').querySelectorAll('.del').forEach(b => {
    b.addEventListener('click', () => { db.deleteVital(b.dataset.id); render(); });
  });
}

/* ---------------- Workouts tab ---------------- */
function renderWorkouts(content) {
  const s = db.state;
  content.innerHTML = `
    <div class="section-title"><div><span class="eyebrow">Log a session</span>New workout</div></div>
    <div class="card">
      <form class="entry-form" id="workout-form">
        <label class="full">Date<input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required /></label>
        <label>Type
          <select name="type">
            <option>Run</option><option>Ride</option><option>Swim</option>
            <option>Strength</option><option>Walk</option><option>Other</option>
          </select>
        </label>
        <label>Distance (km)<input type="number" step="0.01" name="distanceKm" placeholder="optional" /></label>
        <label class="full">Duration (minutes)<input type="number" step="0.1" name="durationMin" placeholder="e.g. 42.5" required /></label>
        <label class="full">Notes<textarea name="notes" placeholder="Optional — how it felt, route, weight lifted, etc."></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save workout</button></div>
      </form>
    </div>

    <div class="section-title"><div><span class="eyebrow">History</span>Past sessions</div></div>
    <div class="card" id="workout-list">
      ${s.workouts.length === 0 ? emptyState('No workouts logged yet.') : s.workouts.map(w => {
        const pace = (w.distanceKm && w.durationMin) ? (w.durationMin / w.distanceKm) : null;
        return `
        <div class="entry-row">
          <div class="main">
            <div class="label">${w.type} · ${fmtDate(w.date)}</div>
            <div class="meta">
              ${w.distanceKm ? `<span class="num">${w.distanceKm} km</span> · ` : ''}
              <span class="num">${w.durationMin} min</span>
              ${pace ? ` · <span class="num">${pace.toFixed(2)} min/km</span>` : ''}
            </div>
            ${w.notes ? `<div class="meta">${escapeHtml(w.notes)}</div>` : ''}
          </div>
          <button class="del" data-id="${w.id}">Delete</button>
        </div>`;
      }).join('')}
    </div>
  `;

  document.getElementById('workout-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    db.addWorkout({
      date: f.get('date'),
      type: f.get('type'),
      distanceKm: f.get('distanceKm') ? Number(f.get('distanceKm')) : null,
      durationMin: Number(f.get('durationMin')),
      notes: f.get('notes') || ''
    });
    render();
  });

  document.getElementById('workout-list').querySelectorAll('.del').forEach(b => {
    b.addEventListener('click', () => { db.deleteWorkout(b.dataset.id); render(); });
  });
}

/* ---------------- Medical tab ---------------- */
function renderMedical(content) {
  const s = db.state;
  const catFields = {
    allergies: [['label','Allergy','e.g. Penicillin'], ['severity','Severity','e.g. Severe / Mild']],
    medications: [['label','Medication','e.g. Metformin'], ['dose','Dose','e.g. 500mg'], ['frequency','Frequency','e.g. Twice daily']],
    conditions: [['label','Condition','e.g. Asthma'], ['since','Since','e.g. 2014']],
    surgeries: [['label','Procedure','e.g. Appendectomy'], ['date','Date','YYYY or YYYY-MM']],
    family: [['label','Condition','e.g. Type 2 diabetes'], ['relation','Relation','e.g. Mother']]
  };
  const fields = catFields[activeMedCat];
  const items = s.medical[activeMedCat];

  content.innerHTML = `
    <div class="section-title"><div><span class="eyebrow">Categories</span>Medical history</div></div>
    <div class="med-grid">
      ${MED_CATS.map(c => `
        <button class="med-cat-btn ${activeMedCat === c.key ? 'active' : ''}" data-cat="${c.key}">
          ${c.label}<span class="count">${s.medical[c.key].length} entries</span>
        </button>`).join('')}
    </div>

    <div class="card">
      <form class="entry-form" id="med-form">
        ${fields.map(([name, label, placeholder]) => `
          <label>${label}<input type="text" name="${name}" placeholder="${placeholder}" ${name === 'label' ? 'required' : ''} /></label>
        `).join('')}
        <label class="full">Notes<textarea name="notes" placeholder="Optional"></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Add</button></div>
      </form>
    </div>

    <div class="card" id="med-list">
      ${items.length === 0 ? emptyState('Nothing recorded here yet.') : items.map(it => `
        <div class="entry-row">
          <div class="main">
            <div class="label">${escapeHtml(it.label)} ${it.severity ? `<span class="pill alert">${escapeHtml(it.severity)}</span>` : ''}</div>
            <div class="meta">${[it.dose, it.frequency, it.since, it.date, it.relation].filter(Boolean).map(escapeHtml).join(' · ')}</div>
            ${it.notes ? `<div class="meta">${escapeHtml(it.notes)}</div>` : ''}
          </div>
          <button class="del" data-id="${it.id}">Delete</button>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.med-cat-btn').forEach(b => {
    b.addEventListener('click', () => { activeMedCat = b.dataset.cat; render(); });
  });

  document.getElementById('med-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const entry = {};
    fields.forEach(([name]) => entry[name] = f.get(name) || '');
    entry.notes = f.get('notes') || '';
    db.addMedical(activeMedCat, entry);
    render();
  });

  document.getElementById('med-list').querySelectorAll('.del').forEach(b => {
    b.addEventListener('click', () => { db.deleteMedical(activeMedCat, b.dataset.id); render(); });
  });
}

/* ---------------- Export / doctor summary tab ---------------- */
function renderExport(content) {
  const s = db.state;
  const lastVital = latest(s.vitals);

  content.innerHTML = `
    <div class="section-title"><div><span class="eyebrow">For a visit</span>Doctor summary</div></div>
    <div class="summary-sheet" id="summary-sheet">
      <h2>${s.profile.name || 'Health summary'}</h2>
      <div class="meta-line">
        ${s.profile.dob ? `DOB ${fmtDate(s.profile.dob)} · ` : ''}
        ${s.profile.bloodType ? `Blood type ${escapeHtml(s.profile.bloodType)} · ` : ''}
        Generated ${fmtDate(new Date().toISOString().slice(0,10))}
      </div>

      <h3>Latest vitals</h3>
      ${lastVital ? `<ul>
        <li>Weight: ${lastVital.weight ?? '—'} kg (${fmtDate(lastVital.date)})</li>
        <li>Resting HR: ${lastVital.restingHR ?? '—'} bpm</li>
        <li>VO2 max: ${lastVital.vo2max ?? '—'}</li>
        <li>Height: ${s.profile.height || '—'} cm</li>
      </ul>` : `<p class="meta-line">No vitals logged.</p>`}

      ${MED_CATS.map(c => `
        <h3>${c.label}</h3>
        ${s.medical[c.key].length ? `<ul>${s.medical[c.key].map(it => `<li>${escapeHtml(it.label)}${it.severity ? ` — ${escapeHtml(it.severity)}` : ''}${it.dose ? ` — ${escapeHtml(it.dose)} ${escapeHtml(it.frequency||'')}` : ''}${it.since ? ` — since ${escapeHtml(it.since)}` : ''}${it.date ? ` — ${escapeHtml(it.date)}` : ''}${it.relation ? ` — ${escapeHtml(it.relation)}` : ''}</li>`).join('')}</ul>` : `<p class="meta-line">None recorded.</p>`}
      `).join('')}

      <h3>Recent workouts</h3>
      ${s.workouts.length ? `<ul>${s.workouts.slice(0,5).map(w => `<li>${fmtDate(w.date)} — ${w.type}, ${w.durationMin} min${w.distanceKm ? `, ${w.distanceKm} km` : ''}</li>`).join('')}</ul>` : `<p class="meta-line">None recorded.</p>`}
    </div>

    <div class="export-actions">
      <button class="btn btn-primary" id="print-btn">Print / Save as PDF</button>
      <button class="btn btn-ghost" id="export-json">Export JSON backup</button>
      <label class="btn btn-ghost" style="display:inline-block;">Import backup
        <input type="file" id="import-json" accept="application/json" style="display:none" />
      </label>
      <button class="btn btn-alert" id="wipe-btn">Erase all data</button>
    </div>

    <div class="section-title"><div><span class="eyebrow">Profile</span>Used on the summary sheet</div></div>
    <div class="card">
      <form class="entry-form" id="profile-form">
        <label>Full name<input type="text" name="name" value="${escapeAttr(s.profile.name)}" /></label>
        <label>Date of birth<input type="date" name="dob" value="${s.profile.dob || ''}" /></label>
        <label>Blood type<input type="text" name="bloodType" value="${escapeAttr(s.profile.bloodType)}" placeholder="e.g. O+" /></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save profile</button></div>
      </form>
    </div>
  `;

  document.getElementById('print-btn').addEventListener('click', () => window.print());

  document.getElementById('export-json').addEventListener('click', () => {
    const blob = new Blob([db.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitals-ledger-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { db.importJSON(reader.result); render(); }
      catch { alert('That file could not be read as a backup.'); }
    };
    reader.readAsText(file);
  });

  document.getElementById('wipe-btn').addEventListener('click', () => {
    if (confirm('This deletes everything stored on this device. This cannot be undone. Continue?')) {
      db.wipeAll();
      render();
    }
  });

  document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    db.updateProfile({ name: f.get('name'), dob: f.get('dob'), bloodType: f.get('bloodType') });
    render();
  });
}

function emptyState(text) {
  return `<div class="empty-state">${text}</div>`;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(str) { return escapeHtml(str || ''); }

render();
