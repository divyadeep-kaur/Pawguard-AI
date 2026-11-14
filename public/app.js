/* PawGuard AI front end. No build step; talks to the Python API in backend/. */
(() => {
  'use strict';

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EMOJI = { Dog: '🐶', Cat: '🐱', Cow: '🐄', Bird: '🐦', Other: '🐾' };
  const emoji = (t) => EMOJI[t] || EMOJI.Other;
  const SEV_COLOR = { critical: '#dc2626', moderate: '#f59e0b', low: '#16a34a' };

  // Use the real API when it is reachable; otherwise fall back to the in-browser demo (see demo-api.js).
  let mode = 'live', aiOn = false;
  const ready = (async () => {
    try {
      const r = await fetch('/api/health');
      const j = await r.json();
      if (!(r.ok && j.status === 'ok')) throw new Error('no api');
      aiOn = !!j.ai;
    } catch {
      mode = 'demo';
    }
  })();

  async function api(path, opts = {}) {
    await ready;
    if (mode === 'demo') return window.PawDemo.handle(opts.method || 'GET', path, opts.body || {});
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
  }

  const timeAgo = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const days = Math.floor((Date.now() - d) / 864e5);
    if (days < 1) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Local illustration is always shown; if a real photo exists at img/photos/<id>.jpg it is layered on top.
  const photo = (art, fallback, alt, id, pos) =>
    `<div class="ph" role="img" aria-label="${esc(alt)}">${fallback}<img src="${esc(art)}" alt="" loading="lazy">${id ? `<img class="ov" ${pos ? `style="object-position:${esc(pos)}"` : ''} src="img/photos/${esc(id)}.jpg" alt="" onload="this.classList.add('ok')" onerror="this.remove()">` : ''}</div>`;

  // ---------- nav ----------
  const menuBtn = $('#menu-btn');
  menuBtn.addEventListener('click', () => {
    const open = $('#nav-links').classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $('#nav-links').addEventListener('click', () => { $('#nav-links').classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); });

  if ('IntersectionObserver' in window) {
    const links = $$('#nav-links a');
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const t = $(a.getAttribute('href')); if (t) io.observe(t); });
  }

  // ---------- state ----------
  const state = { reports: [], filter: 'all', scan: null, photo: null };

  // ---------- analytics ----------
  function renderStats(a) {
    $$('[data-stat]').forEach((el) => { el.textContent = a[el.dataset.stat] ?? 0; });

    $('#kpis').innerHTML = [
      ['totalReports', 'Total reports'],
      ['recovered', 'Animals recovered'],
      ['activeCases', 'Cases in progress'],
      ['criticalCases', 'Critical cases'],
    ].map(([k, label]) => `<div class="card kpi"><b>${a[k] ?? 0}</b><span>${label}</span></div>`).join('');

    // months (grouped columns)
    const months = a.monthlyTrends || [];
    const max = Math.max(1, ...months.map((m) => m.reports));
    $('#chart-months').innerHTML = months.length
      ? `<div class="cols">${months.map((m) => `<div class="col" title="${m.month}: ${m.reports} reported, ${m.recovered} recovered">
            <div class="pair"><i style="height:${(m.reports / max) * 100}%"></i><i class="rec" style="height:${(m.recovered / max) * 100}%"></i></div>${esc(m.month)}</div>`).join('')}</div>
         <div class="key"><span><i></i>Reported</span><span><i class="rec"></i>Recovered</span></div>`
      : '<p class="nodata">No data yet.</p>';

    const bars = (rows, label, val) => {
      if (!rows.length) return '<p class="nodata">No data yet.</p>';
      const m = Math.max(1, ...rows.map((r) => r[val]));
      return `<div class="bars">${rows.map((r) => `<div class="bar"><span title="${esc(r[label])}">${esc(r[label])}</span><div class="track"><i style="width:${(r[val] / m) * 100}%"></i></div><b>${r[val]}</b></div>`).join('')}</div>`;
    };
    $('#chart-species').innerHTML = bars(a.species || [], 'type', 'count');
    $('#chart-conditions').innerHTML = bars(a.conditions || [], 'name', 'value');
  }

  async function loadAnalytics() {
    try { renderStats(await api('/analytics')); } catch (e) { console.warn(e); }
  }

  // ---------- reports queue ----------
  function renderQueue() {
    const f = state.filter;
    const sp = $('#queue-species').value;
    const rows = state.reports.filter((r) => (f === 'all' ? true : f === 'open' ? r.status !== 'Recovered' : r.status === f) && (!sp || r.animalType === sp));
    $('#queue').innerHTML = rows.length
      ? rows.map((r) => `<li><button class="q-item${state.fresh && state.fresh.has(r.ticketNumber) ? ' fresh' : ''}" data-ticket="${esc(r.ticketNumber)}">
          <span class="q-ico">${emoji(r.animalType)}</span>
          <span class="q-main"><b>${esc(r.animalType)} · ${esc(r.healthStatus)}</b><span>${esc(r.location)} · ${timeAgo(r.timestamp)}</span></span>
          <span class="q-meta"><span class="badge b-${esc(r.status)}">${esc(r.status)}</span><span class="q-ticket">${esc(r.ticketNumber)}</span></span>
        </button></li>`).join('')
      : '<li class="nodata">No reports in this view.</li>';
    renderMapList();
    drawMarkers();
  }

  // ----- live sync: polls the API (or watches other tabs in demo mode) and animates what changed -----
  const known = new Map(); let lastSync = 0, firstSync = true, syncing = false;
  async function sync(silent = false) {
    if (syncing) return; syncing = true;
    try {
      const rs = await api('/rescue-reports');
      const changed = [];
      rs.forEach((r) => {
        const prev = known.get(r.ticketNumber);
        if (!firstSync && prev === undefined) changed.push([r, `New report: ${r.animalType}, ${r.location}`]);
        else if (!firstSync && prev !== r.status) changed.push([r, `${r.ticketNumber} is now ${r.status}`]);
        known.set(r.ticketNumber, r.status);
      });
      state.reports = rs; state.fresh = new Set(changed.map(([r]) => r.ticketNumber));
      renderQueue(); loadAnalytics();
      if (!silent && changed.length) toast(changed.length === 1 ? changed[0][1] : `${changed.length} live updates`);
      setTimeout(() => { state.fresh = new Set(); }, 3200);
      firstSync = false; lastSync = Date.now(); paintLive(true);
    } catch (e) { paintLive(false); if (firstSync) toast('Could not load reports: ' + e.message); }
    finally { syncing = false; }
  }
  const loadReports = sync;
  function paintLive(ok = true) {
    const secs = Math.max(0, Math.round((Date.now() - lastSync) / 1000));
    $$('[data-live]').forEach((el) => {
      el.classList.toggle('off', !ok);
      $('.live-text', el).textContent = !ok ? 'Reconnecting…' : secs < 5 ? 'Live · just now' : `Live · ${secs}s ago`;
    });
  }
  setInterval(() => { if (document.visibilityState === 'visible') { Date.now() - lastSync > 8000 && sync(); } paintLive(true); renderTimes(); }, 1000);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && sync());
  window.addEventListener('storage', (e) => { if (e.key === 'pawguard.demo.v1') sync(); }); // another tab changed demo data
  let lastTimes = 0;
  function renderTimes() { if (Date.now() - lastTimes > 30000) { lastTimes = Date.now(); renderQueue(); } }

  $('#queue-filter').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.filter = b.dataset.f;
    $$('#queue-filter .chip').forEach((c) => c.classList.toggle('on', c === b));
    renderQueue();
  });
  $('#queue-species').addEventListener('change', renderQueue);
  $('#track-out').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-adv]'); if (!b) return;
    await api('/rescue-reports/' + encodeURIComponent(b.dataset.adv), { method: 'PUT', body: { status: b.dataset.next } });
    await sync(); $('#track-form').requestSubmit();   // refresh timeline + queue + map + dashboard
  });
  $('#track-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#track-in').value.trim().toUpperCase(), out = $('#track-out');
    const r = state.reports.find((x) => x.ticketNumber.toUpperCase() === q);
    if (!q) { out.innerHTML = ''; return; }
    if (!r) { out.innerHTML = `<p class="error">No ticket found for "${esc(q)}". Check the number and try again.</p>`; return; }
    const steps = ['Reported', 'Dispatched', 'In-Rescue', 'Recovered'], at = steps.indexOf(r.status);
    out.innerHTML = `<div class="tl"><div><h4>${emoji(r.animalType)} ${esc(r.ticketNumber)} · ${esc(r.animalType)}</h4><small>${esc(r.healthStatus)} · ${esc(r.location)} · filed ${timeAgo(r.timestamp)}</small></div>
      <ol>${steps.map((st, i) => `<li class="${i <= at ? 'on' : ''}">${st.replace('-', ' ')}</li>`).join('')}</ol>
      ${mode === 'demo' && at < 3 ? `<button class="btn btn-ghost btn-sm adv" data-adv="${esc(r.ticketNumber)}" data-next="${steps[at + 1]}">Demo: move to “${steps[at + 1].replace('-', ' ')}” →</button>` : ''}</div>`;
    focusReport(r.ticketNumber, false);
  });
  $('#queue').addEventListener('click', (e) => {
    const b = e.target.closest('.q-item'); if (b) focusReport(b.dataset.ticket, true);
  });

  // ---------- map ----------
  let map, layer; const markers = {};
  function initMap() {
    const el = $('#leaflet-map');
    if (!window.L) {
      el.innerHTML = '<div class="map-fallback"><div><b>Map unavailable</b><br>The map library could not be loaded (check your connection). The list on the right still shows every case.</div></div>';
      return;
    }
    map = L.map(el, { scrollWheelZoom: false }).setView([28.6, 77.25], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    layer = L.layerGroup().addTo(map);
  }
  function drawMarkers() {
    if (!map) return;
    layer.clearLayers();
    state.reports.forEach((r) => {
      const g = r.gpsCoordinates; if (!g) return;
      const color = r.status === 'Recovered' ? '#64748b' : SEV_COLOR[r.severity] || '#16a34a';
      const m = L.marker([g.lat, g.lng], { icon: L.divIcon({ className: '', html: `<div class="pin" style="background:${color}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] }) })
        .bindPopup(`<b>${emoji(r.animalType)} ${esc(r.animalType)} · ${esc(r.healthStatus)}</b><br>${esc(r.location)}<br><small>${esc(r.status)} · ${esc(r.ticketNumber)}</small>`)
        .addTo(layer);
      markers[r.ticketNumber] = m;
    });
    const pts = state.reports.filter((r) => r.gpsCoordinates).map((r) => [r.gpsCoordinates.lat, r.gpsCoordinates.lng]);
    if (pts.length && !drawMarkers.fitted) { map.fitBounds(pts, { padding: [30, 30], maxZoom: 13 }); drawMarkers.fitted = true; }
  }
  function renderMapList() {
    const open = state.reports.filter((r) => r.status !== 'Recovered');
    $('#map-list').innerHTML = open.length
      ? open.map((r) => `<li><button class="q-item" data-ticket="${esc(r.ticketNumber)}">
          <span class="q-ico">${emoji(r.animalType)}</span>
          <span class="q-main"><b>${esc(r.location)}</b><span>${esc(r.animalType)} · ${esc(r.healthStatus)}</span></span>
          <span class="badge b-${esc(r.severity)}">${esc(r.severity)}</span></button></li>`).join('')
      : '<li class="nodata">No open cases right now. 🎉</li>';
  }
  $('#map-list').addEventListener('click', (e) => {
    const b = e.target.closest('.q-item'); if (b) focusReport(b.dataset.ticket, false);
  });
  function focusReport(ticket, scroll) {
    if (scroll) $('#map').scrollIntoView({ behavior: 'smooth' });
    const r = state.reports.find((x) => x.ticketNumber === ticket);
    if (!r) return;
    if (map && r.gpsCoordinates) { map.setView([r.gpsCoordinates.lat, r.gpsCoordinates.lng], 15); markers[ticket]?.openPopup(); }
    else if (!map && scroll) toast(`${r.ticketNumber}: ${r.location} (${r.status})`);
  }

  // ---------- scanner ----------
  const drop = $('#drop'), fileInput = $('#file');
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) setPhoto(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', () => fileInput.files[0] && setPhoto(fileInput.files[0]));

  function setPhoto(file) {
    if (!file.type.startsWith('image/')) return toast('Please choose an image file.');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1024, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      state.photo = c.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(url);
      $('#preview').src = state.photo; $('#preview').hidden = false; $('#drop-empty').hidden = true;
      $('#scan-btn').disabled = false; $('#scan-clear').hidden = false;
    };
    img.onerror = () => toast('That image could not be read.');
    img.src = url;
  }
  $('#scan-clear').addEventListener('click', () => {
    state.photo = null; state.scan = null; fileInput.value = '';
    $('#preview').hidden = true; $('#drop-empty').hidden = false;
    $('#scan-btn').disabled = true; $('#scan-clear').hidden = true;
    $('#result-body').hidden = true; $('#result-empty').hidden = false;
  });

  // ---------- real scan: on-device species detection + symptom checklist ----------
  // 1) TensorFlow.js COCO-SSD runs in the browser and finds dogs/cats/cows/birds in the photo (no key, photo never leaves the device).
  // 2) The user ticks what they can see; first-aid guidance and urgency come from the rules below.
  // If a real Gemini key is configured on the backend, that analysis is used instead.
  const SPECIES = { dog: 'Dog', cat: 'Cat', cow: 'Cow', bird: 'Bird', horse: 'Other', sheep: 'Other', bear: 'Other' };
  const loadScript = (src) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('load failed')); document.head.appendChild(s); });
  let detectorP = null;
  function getDetector() {
    if (!detectorP) detectorP = (async () => {
      if (!window.cocoSsd) {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
      }
      return window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
    })().catch((e) => { detectorP = null; throw e; });
    return detectorP;
  }
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
  async function detectAnimal() {
    const model = await withTimeout(getDetector(), 25000);
    const preds = await model.detect($('#preview'), 10, 0.25);
    const animals = preds.filter((p) => SPECIES[p.class]).sort((x, y) => y.score - x.score);
    return animals[0] ? { type: SPECIES[animals[0].class], raw: animals[0].class, score: animals[0].score } : null;
  }
  $('#file').addEventListener('change', () => { getDetector().catch(() => {}); }); // warm up the model while the user looks at the photo

  const SAFETY = {
    Dog: 'Approach slowly from the side and avoid the head; frightened dogs can bite. Use a lead or cloth loop only if it is calm.',
    Cat: 'Do not chase. Place a towel or box next to the cat and let it come in; use thick gloves, as frightened cats scratch and bite.',
    Cow: 'Keep clear of the horns and back legs. Do not corner the animal, and keep traffic and crowds away.',
    Bird: 'Cover it gently with a cloth, place it in a ventilated box in a dark, quiet spot, and do not give food or water.',
    Other: 'Keep a safe distance and avoid the head and hooves or claws. Do not feed it until a vet has seen it.',
  };
  const CONDS = {
    bleeding: { label: 'Bleeding or an open wound', sev: 'critical', steps: ['Press a clean cloth firmly on the wound and add more on top if it soaks through. Do not remove the first layer.', 'Do not put powders, turmeric or home remedies on a deep wound.'] },
    cantstand: { label: 'Cannot stand or walk, or dragging a limb', sev: 'critical', steps: ['Do not force it to stand; a broken limb can get worse.', 'Move it only if it is in traffic, using a blanket or board as a stretcher and keeping its back straight.'] },
    vehicle: { label: 'Hit by a vehicle or fell from a height', sev: 'critical', steps: ['Keep it still and warm; internal injuries are possible even if it looks fine.', 'Give no food or water until a vet has checked it.'] },
    plastic: { label: 'Bloated belly, drooling or chewing plastic', sev: 'critical', steps: ['Never pull plastic or string out of the mouth.', 'Keep it calm and call a vet or 1962 straight away.'] },
    heat: { label: 'Panting heavily or overheated', sev: 'moderate', steps: ['Move it into shade and offer small sips of cool water.', 'Wet the paws and belly with cool (not ice-cold) water.'] },
    thin: { label: 'Very thin or weak', sev: 'moderate', steps: ['Offer fresh water first, then small portions of plain food such as boiled rice or egg for dogs and cats.', 'Keep it warm and let it rest.'] },
    skin: { label: 'Skin sores, hair loss or constant itching', sev: 'moderate', steps: ['Avoid touching bare skin without gloves; mange and fungal infections can spread.', 'Keep it apart from other animals and arrange a vet visit for treatment.'] },
    vomit: { label: 'Vomiting or diarrhoea', sev: 'moderate', steps: ['Offer small sips of water and hold food for a few hours.', 'Puppies and kittens get worse quickly, so see a vet soon.'] },
    tangled: { label: 'Tangled in string, wire or a net', sev: 'moderate', steps: ['Stay calm and avoid sudden moves that tighten it.', 'Cut the string away only if you can do it safely with blunt scissors; otherwise wait for rescuers.'] },
    eye: { label: 'Eye or nose discharge', sev: 'low', steps: ['Wipe gently with a clean cotton pad and warm water.', 'A vet can prescribe drops; this is usually very treatable.'] },
    healthy: { label: 'Looks healthy but needs food, water or shelter', sev: 'low', steps: ['Offer fresh water and a shaded, safe resting place.', 'Report it so a volunteer can arrange vaccination, sterilisation or adoption.'] },
  };
  const RANK = { low: 0, moderate: 1, critical: 2 };
  const ACTION = {
    critical: 'Call 1962 or the nearest vet right away, then file a rescue report so rescuers can find the animal.',
    moderate: 'File a rescue report today and arrange a vet visit within 24 hours.',
    low: 'File a report so a volunteer can follow up, and keep fresh water nearby.',
  };

  function buildGuidance(type, picked, how) {
    const chosen = picked.map((k) => CONDS[k]);
    const sev = chosen.reduce((m, c) => (RANK[c.sev] > RANK[m] ? c.sev : m), 'low');
    const steps = [...new Set([SAFETY[type] || SAFETY.Other, ...chosen.flatMap((c) => c.steps)])];
    if (!chosen.length) steps.push('Offer fresh water and watch for changes. If anything worsens, file a report.');
    return { demo: false, source: how, data: { animalType: type, breed: how, healthDetected: chosen.length ? chosen.map((c) => c.label).join('; ') : 'No problems reported', severity: sev,
      emergencyAlert: sev === 'critical', firstAid: steps, suggestedAction: ACTION[sev] } };
  }

  function renderChecklist(det, note) {
    $('#result-empty').hidden = true;
    const body = $('#result-body'); body.hidden = false;
    const types = ['Dog', 'Cat', 'Cow', 'Bird', 'Other'], cur = det ? det.type : 'Dog';
    body.innerHTML = `
      ${note ? `<div class="demo-tag">${esc(note)}</div>` : ''}
      <div class="res-sec"><h4>1. Animal</h4>
        <div class="seg5" id="sp-pick">${types.map((t) => `<label><input type="radio" name="sp" value="${t}" ${t === cur ? 'checked' : ''}><span>${emoji(t)} ${t}</span></label>`).join('')}</div>
        ${det ? `<p class="hint">Detected on your device: <b>${esc(det.type)}</b> (${Math.round(det.score * 100)}% match). Change it if that's wrong.</p>` : ''}</div>
      <div class="res-sec"><h4>2. What can you see? <small>(tick all that apply)</small></h4>
        <div class="chk" id="cond-pick">${Object.entries(CONDS).map(([k, c]) => `<label><input type="checkbox" value="${k}"><span>${esc(c.label)}</span></label>`).join('')}</div></div>
      <div class="res-actions"><button class="btn btn-primary" id="get-guide">Get first-aid guidance</button></div>`;
    $('#get-guide').addEventListener('click', () => {
      const type = $('input[name=sp]:checked').value, picked = $$('#cond-pick input:checked').map((i) => i.value);
      const how = det && det.type === type ? `Species detected on your device (${Math.round(det.score * 100)}% match); condition reported by you` : 'Species and condition reported by you';
      state.scan = buildGuidance(type, picked, how); renderScan(state.scan);
    });
  }

  $('#scan-btn').addEventListener('click', async () => {
    const btn = $('#scan-btn');
    btn.disabled = true; btn.textContent = 'Analysing…'; $('#scanline').hidden = false;
    try {
      // a real Gemini analysis (backend with API key) wins; sample/demo responses are ignored
      let real = null;
      if (mode === 'live' && aiOn) { try { const r = await api('/scan-animal', { method: 'POST', body: { imageBase64: state.photo } }); if (r && r.demo === false) real = r; } catch { /* fall through */ } }
      if (real) { state.scan = real; renderScan(real); return; }
      let det = null, note = '';
      try { det = await detectAnimal(); if (!det) note = 'No dog, cat, cow or bird was found in this photo. Please check the photo, or choose the animal yourself below.'; }
      catch { note = 'Automatic detection is not available right now (it needs an internet connection). Please choose the animal yourself.'; }
      renderChecklist(det, note);
    } finally { btn.disabled = false; btn.textContent = 'Analyse photo'; $('#scanline').hidden = true; }
  });

  function renderScan({ data: d, source, demo }) {
    $('#result-empty').hidden = true;
    const body = $('#result-body'); body.hidden = false;
    body.innerHTML = `
      ${demo ? `<div class="demo-tag">⚠️ ${esc(source)}</div>` : ''}
      <div class="res-top"><div><h3>${emoji(d.animalType)} ${esc(d.animalType)}</h3><small>${esc(d.breed)}</small></div>
        <span class="badge b-${esc(d.severity)}">${esc(d.severity)}</span></div>
      ${d.emergencyAlert ? '<div class="alert">🚨 Possible emergency. Call <a href="tel:1962">1962</a> now and keep the animal still and calm.</div>' : ''}
      <div class="res-sec"><h4>Condition</h4><div>${esc(d.healthDetected)}</div></div>
      <div class="res-sec"><h4>First aid</h4><ol>${(d.firstAid || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="res-sec"><h4>Recommended action</h4><div>${esc(d.suggestedAction)}</div></div>
      ${!demo ? `<p class="hint">Source: ${esc(source)}. Guidance only, not a vet diagnosis.</p>` : '<p class="hint">Guidance only, not a vet diagnosis.</p>'}
      <div class="res-actions"><button class="btn btn-primary" id="to-report">File a rescue report</button><a class="btn btn-ghost" href="tel:1962">Call 1962</a></div>`;
    $('#to-report').addEventListener('click', prefillReport);
  }

  function prefillReport() {
    const d = state.scan.data;
    const known = ['Dog', 'Cat', 'Cow', 'Bird'];
    $('#f-type').value = known.includes(d.animalType) ? d.animalType : 'Other';
    $('#f-breed').value = d.breed || '';
    $('#f-health').value = d.healthDetected || '';
    const sev = $(`input[name=sev][value=${d.severity}]`); if (sev) sev.checked = true;
    $('#report').scrollIntoView({ behavior: 'smooth' });
    $('#f-loc').focus({ preventScroll: true });
  }

  // ---------- report form ----------
  $('#gps-btn').addEventListener('click', () => {
    const note = $('#gps-note');
    if (!navigator.geolocation) { note.textContent = 'Location is not supported on this device.'; return; }
    note.textContent = 'Finding you…';
    navigator.geolocation.getCurrentPosition((p) => {
      state.gps = { lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) };
      note.textContent = `Location captured (±${Math.round(p.coords.accuracy)} m). Add a landmark in the field above.`;
      if (!$('#f-loc').value) $('#f-loc').value = `${state.gps.lat}, ${state.gps.lng}`;
    }, () => { note.textContent = 'Could not get your location. Please type it instead.'; }, { enableHighAccuracy: true, timeout: 10000 });
  });

  $('#report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#report-error'); err.hidden = true;
    const body = {
      animalType: $('#f-type').value, breed: $('#f-breed').value.trim() || undefined,
      healthStatus: $('#f-health').value.trim() || undefined,
      severity: $('input[name=sev]:checked').value, location: $('#f-loc').value.trim(),
      description: $('#f-desc').value.trim(), reporterName: $('#f-name').value.trim(),
      reporterContact: $('#f-contact').value.trim(), gpsCoordinates: state.gps,
    };
    if (!body.location || !body.description || !body.reporterName || !body.reporterContact) {
      err.textContent = 'Please fill in location, details, your name and a contact number.'; err.hidden = false; return;
    }
    const btn = $('#report-submit'); btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      const r = await api('/rescue-reports', { method: 'POST', body });
      toast(`Report filed: ticket ${r.ticketNumber}`);
      e.target.reset(); state.gps = undefined; $('#gps-note').textContent = '';
      await sync(true);
      focusReport(r.ticketNumber, false);
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { btn.disabled = false; btn.textContent = 'Submit rescue report'; }
  });

  // ---------- adoption ----------
  const PETS = [
    { id: 'pet-1', name: 'Buddy', type: 'Dog', breed: 'Indie mix', age: '2 years', sex: 'Male', img: 'img/pet-buddy.svg', story: 'Found wandering near a market, watchful and gentle. Now vaccinated, vet-cleared and settling in well, a good match for a quiet home.' },
    { id: 'pet-2', name: 'Luna', type: 'Cat', breed: 'Orange tabby', age: '2 years', sex: 'Female', img: 'img/pet-luna.svg', story: 'Found thin on a city rooftop and nursed back to health. Calm, curious and happiest in a warm, sunny spot.' },
    { id: 'pet-3', name: 'Coco', type: 'Dog', breed: 'Indie', age: '3 years', sex: 'Female', pos: '50% 12%', img: 'img/pet-coco.svg', story: 'Fed by shopkeepers outside a roadside workshop. Cheerful, people-friendly and ready to be someone\'s companion.' },
    { id: 'pet-4', name: 'Sheru', type: 'Dog', breed: 'Indie mix', age: '1.5 years', sex: 'Male', tags: ['Vaccinated', 'Recovering'], img: 'img/pet-sheru.svg', story: 'Treated for a paw injury and mending well. Patient, friendly and used to being handled, so a good match for a first-time adopter.' },
  ];
  $('#pets').innerHTML = PETS.map((p) => `<article class="card pet">${photo(p.img, emoji(p.type), `${p.name}, ${p.breed}`, p.id, p.pos)}
      <div class="pet-body"><h3>${p.name}<small>${p.age} · ${p.sex}</small></h3>
      <div class="tags"><span>${p.breed}</span>${(p.tags || ['Vaccinated', 'Vet-cleared']).map((t) => `<span>${t}</span>`).join('')}</div>
      <p>${p.story}</p><button class="btn btn-primary btn-sm" data-adopt="${p.id}">Adopt ${p.name}</button></div></article>`).join('');

  const dlg = $('#adopt-dialog'); let petSel = null;
  $('#pets').addEventListener('click', (e) => {
    const b = e.target.closest('[data-adopt]'); if (!b) return;
    petSel = PETS.find((p) => p.id === b.dataset.adopt);
    $('#adopt-title').textContent = `Adopt ${petSel.name}`;
    $('#a-date').min = new Date().toISOString().slice(0, 10);
    $('#adopt-error').hidden = true;
    dlg.showModal();
  });
  $('#adopt-form').addEventListener('submit', async (e) => {
    if (e.submitter && e.submitter.value === 'cancel') return;
    e.preventDefault();
    const err = $('#adopt-error'); err.hidden = true;
    const btn = $('#adopt-submit'); btn.disabled = true;
    try {
      const r = await api('/adoption/requests', { method: 'POST', body: {
        animalId: petSel.id, animalName: petSel.name, applicantName: $('#a-name').value.trim(),
        applicantEmail: $('#a-email').value.trim(), applicantPhone: $('#a-phone').value.trim(),
        visitDate: $('#a-date').value || undefined, message: $('#a-msg').value.trim() || undefined } });
      dlg.close(); e.target.reset();
      toast(`Request ${r.id} sent. The shelter team will contact you about ${petSel.name}.`);
      loadAnalytics();
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { btn.disabled = false; }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  // ---------- stories ----------
  const STORIES = [
    { id: 'kiku', art: 'kiku', tag: '🐈 Cat', name: 'Street rescue to a safe home', text: 'Tiny kittens found on the street need warmth, milk and a vet check. With fostering and adoption, they grow up safe and loved.' },
    { id: 'nandi', art: 'nandi', tag: '🐄 Cattle', name: 'Roadside rescue to a safe sanctuary', text: 'Cattle left to scavenge among rubbish can be moved to sanctuaries where they graze freely, are fed properly and get veterinary care.' },
    { id: 'rocky', art: 'rocky', tag: '🐕 Dog', name: 'From severe skin disease to a happy dog', text: 'Untreated mange and infection can cover a dog in sores. With vet treatment, good food and patience, a full recovery is possible.' },
    { id: 'pup', art: 'rocky', tag: '🐕 Puppy', name: 'From hairless and weak to playful', text: 'Severe malnutrition and skin infection are treatable. Proper medical care and a loving home can change everything.', posB: '50% 12%', posA: '50% 25%' },
  ];
  const half = (s, k, lab) => `<div class="ph"><span class="lab">${lab}</span><img src="img/story-${s.art}-${k}.svg" alt="" loading="lazy"><img class="ov" ${(k === 'before' ? s.posB : s.posA) ? `style="object-position:${k === 'before' ? s.posB : s.posA}"` : ''} src="img/photos/${s.id}-${k}.jpg" alt="" onload="this.classList.add('ok')" onerror="this.remove()"></div>`;
  $('#stories').innerHTML = STORIES.map((s) => `<article class="card story"><div class="ba" role="img" aria-label="${esc(s.name)}, before and after">${half(s, 'before', 'Before')}${half(s, 'after', 'After')}</div>
      <div class="story-body"><div class="tags"><span>${s.tag}</span></div><h3>${s.name}</h3><p>${s.text}</p></div></article>`).join('');

  // ---------- chat ----------
  const chat = $('#chat'), log = $('#chat-log'), history = [];
  function addMsg(who, text) {
    const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function toggleChat(open) {
    chat.hidden = !open; $('#chat-fab').setAttribute('aria-expanded', open);
    if (open) { if (!log.children.length) addMsg('bot', 'Hi! I can help with first aid for street animals, how to report, and how adoption works. What do you need?'); $('#chat-input').focus(); }
  }
  $('#chat-fab').addEventListener('click', () => toggleChat(chat.hidden));
  $('#chat-close').addEventListener('click', () => toggleChat(false));
  async function send(text) {
    if (!text) return;
    $('#chat-faq').hidden = true; addMsg('me', text); history.push({ role: 'user', content: text });
    const wait = addMsg('bot', '…');
    try {
      const r = await api('/chat', { method: 'POST', body: { messages: history.slice(-10) } });
      wait.textContent = String(r.content).replace(/\*\*/g, ''); history.push({ role: 'assistant', content: r.content });
    } catch (e) { wait.textContent = 'Sorry, I could not reach the assistant. For emergencies call 1962, or email officialdivyadeep@gmail.com.'; }
    log.scrollTop = log.scrollHeight;
  }
  $('#chat-form').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#chat-input'); const t = i.value.trim(); i.value = ''; send(t); });
  $('#chat-faq').addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });

  // ---------- hero slideshow ----------
  const HERO = [
    { art: 'img/pet-buddy.svg', photo: 'img/photos/hero-1.jpg', emoji: '🐕', name: 'First aid saves lives', sub: 'A clean bandage and a calm, gentle hand' },
    { art: 'img/pet-luna.svg', photo: 'img/photos/hero-2.jpg', flip: true, emoji: '🐈', name: 'Rooftop strays', sub: 'City cats need food, water and vaccines' },
    { art: 'img/story-nandi-after.svg', photo: 'img/photos/hero-3.jpg', emoji: '🐄', name: 'Cattle in need', sub: 'Injured and abandoned cows can be helped too' },
    { art: 'img/story-rocky-after.svg', photo: 'img/photos/hero-4.jpg', pos: '50% 55%', emoji: '🐂', name: 'Street cattle', sub: 'Traffic and plastic are their biggest dangers' },
    { art: 'img/pet-sheru.svg', photo: 'img/photos/hero-5.jpg', emoji: '🐾', name: 'Paw care', sub: 'Gloves, patience and proper treatment' },
    { art: 'img/story-kiku-after.svg', photo: 'img/photos/hero-6.jpg', emoji: '🐈', name: 'A stray calling out', sub: 'Hungry strays often come to people for help', pos: '50% 30%', flip: true },
  ];
  (function heroSlider() {
    const wrap = $('#slides'), dots = $('#sc-dots'), hero = $('#top');
    let i = 0, timer = null, x0 = null, moved = false;
    HERO.forEach((h, n) => {
      const d = document.createElement('div'); d.className = 'slide'; d.style.backgroundImage = `url(${h.art})`; wrap.appendChild(d);
      const t = new Image(); d.style.backgroundPosition = h.pos || 'center'; if (h.flip) d.style.transform = 'scaleX(-1)'; t.onload = () => { d.style.backgroundImage = `url(${h.photo})`; }; t.src = h.photo; // real photo replaces art if present
      const b = document.createElement('button'); b.setAttribute('aria-label', `Photo ${n + 1} of ${HERO.length}`); b.onclick = () => { go(n); restart(); }; dots.appendChild(b);
    });
    const slides = [...wrap.children], dotEls = [...dots.children];
    function go(n, dir = 1) {
      const prev = slides[i]; prev.classList.remove('on'); prev.classList.add(dir > 0 ? 'out-l' : 'out-r');
      setTimeout(() => prev.classList.remove('out-l', 'out-r'), 1300);
      i = (n + HERO.length) % HERO.length;
      slides[i].classList.add('on');
      dotEls.forEach((d, k) => d.classList.toggle('on', k === i));
      $('#sc-emoji').textContent = HERO[i].emoji; $('#sc-name').textContent = HERO[i].name; $('#sc-sub').textContent = HERO[i].sub;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 5000); };
    $('#sc-next').onclick = () => { go(i + 1); restart(); };
    $('#sc-prev').onclick = () => { go(i - 1, -1); restart(); };
    // swipe / drag
    hero.addEventListener('pointerdown', (e) => { if (e.target.closest('a,button')) return; x0 = e.clientX; moved = false; hero.classList.add('drag'); });
    window.addEventListener('pointerup', (e) => {
      if (x0 === null) return; const dx = e.clientX - x0; x0 = null; hero.classList.remove('drag');
      if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); restart(); }
    });
    hero.addEventListener('mouseenter', () => clearInterval(timer)); hero.addEventListener('mouseleave', restart);
    go(0); restart();
  })();

  // ---------- boot ----------
  initMap();
  $('#queue').innerHTML = '<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>';
  loadReports();
  loadAnalytics();
})();
