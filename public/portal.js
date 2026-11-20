/* PawGuard portal — adopter / volunteer / admin dashboards on Supabase.
   Authorisation is enforced by Row Level Security in the database (supabase/schema.sql);
   the role checks here only decide what to *show*. */
(() => {
const cfg = window.PAWGUARD_CONFIG || {};
const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
const sb = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const S = { session: null, profile: null, favs: new Set(), loc: null, centres: [] };

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ageText = m => m == null ? 'Age unknown' : m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr${m % 12 ? ' ' + (m % 12) + ' mo' : ''}`;
const cap = s => (s || '').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const when = d => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const role = () => S.profile?.role || null;
const isAdmin = () => role() === 'admin';
const isVol = () => role() === 'volunteer' || role() === 'admin';

function toast(msg, bad) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false; t.className = 'toast' + (bad ? ' bad' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 4200);
}
function friendly(err) {
  const m = (err && (err.message || err.error_description)) || String(err);
  if (err?.code === '23505') return 'You already have an open application for this animal.';
  if (err?.code === '42501' || /row-level security|Not allowed|only|Admins|Volunteers/i.test(m)) return 'You do not have permission to do that.';
  if (/Invalid login/i.test(m)) return 'Email or password is incorrect.';
  if (/already registered/i.test(m)) return 'That email is already registered — try signing in.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Network problem — check your connection and try again.';
  return m;
}
async function q(p) { const { data, error } = await p; if (error) throw error; return data; }

/* ---------- shell ---------- */
const NAV = {
  guest: [['browse', 'Adopt'], ['centres', 'Centres']],
  adopter: [['browse', 'Adopt'], ['favourites', 'Saved'], ['applications', 'My applications'], ['centres', 'Centres'], ['report', 'Report an animal'], ['profile', 'Profile']],
  volunteer: [['rescues', 'Nearby requests'], ['mycases', 'My cases'], ['report', 'Report an animal'], ['browse', 'Adoptable animals'], ['centres', 'Centres'], ['profile', 'Profile']],
  admin: [['admin', 'Overview'], ['admin/animals', 'Animals'], ['admin/applications', 'Applications'], ['admin/rescues', 'Rescues'], ['admin/centres', 'Centres'], ['profile', 'Profile']]
};
const home = () => ({ adopter: 'browse', volunteer: 'rescues', admin: 'admin' }[role()] || 'browse');
function renderShell() {
  const items = NAV[role() || 'guest'];
  const cur = location.hash.replace(/^#\//, '') || home();
  $('#nav').innerHTML = items.map(([h, l]) => `<a href="#/${h}" ${cur === h ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  $('#who').innerHTML = S.session
    ? `<span class="chip role-${role()}">${cap(role() === 'admin' ? 'NGO admin' : role())}</span><span class="who-name">${esc(S.profile?.full_name || S.session.user.email)}</span><button class="btn ghost sm" data-act="signout">Sign out</button>`
    : `<a class="btn sm" href="#/login">Sign in</a>`;
}

/* ---------- boot ---------- */
async function boot() {
  $('#menuBtn').onclick = e => { const n = $('#nav'); const o = n.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  if (!configured) return renderUnconfigured();
  const { data } = await sb.auth.getSession();
  await setSession(data.session);
  sb.auth.onAuthStateChange(async (ev, s) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'TOKEN_REFRESHED') { if ((s?.user?.id) !== (S.session?.user?.id)) { await setSession(s); route(); } } });
  window.addEventListener('hashchange', route);
  route();
  subscribeRealtime();
}
async function setSession(s) {
  S.session = s; S.profile = null; S.favs = new Set();
  if (s) {
    try {
      S.profile = await q(sb.from('profiles').select('*').eq('id', s.user.id).single());
      const f = await q(sb.from('favourites').select('animal_id'));
      S.favs = new Set(f.map(x => x.animal_id));
    } catch (e) { toast(friendly(e), true); }
  }
}
function renderUnconfigured() {
  renderShell();
  view.innerHTML = `<section class="panel setup"><h1>Accounts backend not connected</h1>
  <p>Sign-in, adoption applications, volunteer dashboards and the NGO admin area need a database. This deployment has no Supabase project configured yet, so nothing here is saved or pretended to work.</p>
  <ol><li>Create a free project at <a href="https://supabase.com" rel="noopener">supabase.com</a>.</li>
  <li>Open <b>SQL Editor</b> and run <code>supabase/schema.sql</code> from the repository (optionally <code>supabase/seed_demo.sql</code> for clearly-labelled demo data).</li>
  <li>Copy <b>Project URL</b> and the <b>anon public key</b> into <code>public/config.js</code> and redeploy. Never use the service_role key.</li></ol>
  <p><a class="btn" href="/">Back to main site</a></p></section>`;
}

/* ---------- router ---------- */
const ROUTES = {
  login: () => authView(), browse: () => browseView(), centres: () => centresView(),
  favourites: () => needAuth(favouritesView), applications: () => needAuth(applicationsView), profile: () => needAuth(profileView), report: () => needAuth(reportView),
  rescues: () => needRole(isVol, rescuesView), mycases: () => needRole(isVol, myCasesView),
  admin: () => needRole(isAdmin, adminOverview), 'admin/animals': () => needRole(isAdmin, adminAnimals),
  'admin/applications': () => needRole(isAdmin, adminApplications), 'admin/rescues': () => needRole(isAdmin, adminRescues), 'admin/centres': () => needRole(isAdmin, adminCentres)
};
async function route() {
  $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  let h = location.hash.replace(/^#\//, '');
  if (!h) { location.hash = '#/' + home(); return; }
  renderShell();
  view.innerHTML = loadingHtml();
  const fn = ROUTES[h];
  document.title = 'PawGuard · ' + (h.split('/').pop().replace(/^./, c => c.toUpperCase()));
  try { fn ? await fn() : view.innerHTML = emptyHtml('Page not found', 'That page does not exist.', '<a class="btn" href="#/">Go home</a>'); }
  catch (e) { view.innerHTML = errorHtml(e); }
  view.focus({ preventScroll: true });
}
const refresh = () => route();
const loadingHtml = () => `<div class="skeleton-grid" aria-busy="true" aria-label="Loading">${'<div class="sk"></div>'.repeat(6)}</div>`;
const emptyHtml = (t, m, extra = '') => `<div class="empty"><div class="empty-ic">🐾</div><h2>${esc(t)}</h2><p>${esc(m)}</p>${extra}</div>`;
const errorHtml = e => `<div class="empty err"><h2>Something went wrong</h2><p>${esc(friendly(e))}</p><button class="btn" data-act="retry">Try again</button></div>`;
function needAuth(fn) { if (!S.session) { location.hash = '#/login'; return; } return fn(); }
function needRole(check, fn) {
  if (!S.session) { location.hash = '#/login'; return; }
  if (!check()) { view.innerHTML = emptyHtml('Not available for your account', 'This area is restricted. Your account role does not include access to it.', `<a class="btn" href="#/${home()}">Back to my dashboard</a>`); return; }
  return fn();
}

/* ---------- auth ---------- */
function authView() {
  if (S.session) { location.hash = '#/' + home(); return; }
  view.innerHTML = `<div class="auth">
  <section class="panel">
    <div class="tabs" role="tablist"><button role="tab" id="t-in" aria-selected="true" data-tab="in">Sign in</button><button role="tab" id="t-up" aria-selected="false" data-tab="up">Create account</button></div>
    <form id="fIn" novalidate>
      <label>Email<input type="email" name="email" autocomplete="email" required></label>
      <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
      <p class="err-msg" role="alert"></p>
      <button class="btn block">Sign in</button>
      <button type="button" class="link" data-act="forgot">Forgot password?</button>
    </form>
    <form id="fUp" novalidate hidden>
      <fieldset class="roles"><legend>I want to</legend>
        <label class="rc"><input type="radio" name="role" value="adopter" checked><span><b>Adopt an animal</b><small>Browse, save and apply to adopt</small></span></label>
        <label class="rc"><input type="radio" name="role" value="volunteer"><span><b>Rescue / volunteer</b><small>Help on rescue cases near me</small></span></label>
      </fieldset>
      <label>Full name<input name="full_name" autocomplete="name" required maxlength="120"></label>
      <label>Email<input type="email" name="email" autocomplete="email" required></label>
      <div class="two"><label>Phone<input type="tel" name="phone" autocomplete="tel" maxlength="30"></label><label>City<input name="city" autocomplete="address-level2" maxlength="80"></label></div>
      <label>Password <small>(at least 8 characters)</small><input type="password" name="password" autocomplete="new-password" minlength="8" required></label>
      <p class="err-msg" role="alert"></p>
      <button class="btn block">Create account</button>
      <p class="fine">NGO / organisation administrator accounts are verified and enabled by the PawGuard owner — they cannot be self-created.</p>
    </form>
  </section>
  <aside class="auth-side"><h1>Every animal deserves a home and a helping hand.</h1>
    <ul><li><b>Adopters</b> browse genuinely available animals, save favourites and track applications.</li>
    <li><b>Volunteers</b> see nearby rescue requests, accept cases and post progress.</li>
    <li><b>Organisations</b> manage animals, applications, volunteers and centres.</li></ul></aside></div>`;
  const setTab = t => { $('#fIn').hidden = t !== 'in'; $('#fUp').hidden = t !== 'up'; $('#t-in').setAttribute('aria-selected', t === 'in'); $('#t-up').setAttribute('aria-selected', t === 'up'); };
  view.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  if (location.search.includes('signup')) setTab('up');
  $('#fIn').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (!f.email.value.trim() || !f.password.value) { m.textContent = 'Enter your email and password.'; return; }
    await withBusy(f, async () => { const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value }); if (error) m.textContent = friendly(error); });
  };
  $('#fUp').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (f.full_name.value.trim().length < 2) { m.textContent = 'Please enter your full name.'; return; }
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { m.textContent = 'Enter a valid email address.'; return; }
    if (f.password.value.length < 8) { m.textContent = 'Password must be at least 8 characters.'; return; }
    await withBusy(f, async () => {
      const { data, error } = await sb.auth.signUp({ email: f.email.value.trim(), password: f.password.value, options: { emailRedirectTo: location.origin + '/portal', data: { full_name: f.full_name.value.trim(), phone: f.phone.value.trim(), city: f.city.value.trim(), role: f.role.value } } });
      if (error) { m.textContent = friendly(error); return; }
      if (!data.session) { f.reset(); m.className = 'ok-msg'; m.textContent = 'Account created. Check your email to confirm your address, then sign in.'; }
    });
  };
}
async function withBusy(form, fn) {
  const b = form.querySelector('button:not([type=button])'); const t = b.textContent; b.disabled = true; b.textContent = 'Please wait…';
  try { await fn(); } catch (e) { toast(friendly(e), true); } finally { b.disabled = false; b.textContent = t; }
}

/* ---------- shared bits ---------- */
async function loadCentres() { S.centres = await q(sb.from('centres').select('*').order('name')); return S.centres; }
const centreName = id => S.centres.find(c => c.id === id);
const centreBadge = c => c ? `${esc(c.name)}${c.verified ? ' <span class="chip ok" title="Verified by PawGuard administrators">Verified</span>' : ' <span class="chip">Unverified</span>'}${c.is_demo ? ' <span class="chip demo">Demo data</span>' : ''}` : '';
function distKm(a, b) { const R = 6371, r = x => x * Math.PI / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng); const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function getLoc() {
  return new Promise((res, rej) => {
    if (S.loc) return res(S.loc);
    if (!navigator.geolocation) return rej(new Error('Location is not supported by this browser.'));
    navigator.geolocation.getCurrentPosition(p => { S.loc = { lat: p.coords.latitude, lng: p.coords.longitude }; res(S.loc); }, () => rej(new Error('Location permission was denied. You can still type a city instead.')), { timeout: 10000 });
  });
}
async function uploadPhoto(file) {
  if (!file) return null;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Photos must be JPG, PNG or WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Photo must be under 5 MB.');
  const path = `${S.session.user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
  const { error } = await sb.storage.from('photos').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
}
const mapLink = c => c.lat != null && c.lng != null ? `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=16/${c.lat}/${c.lng}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent(c.address + ', ' + c.city)}`;
const photoHtml = (a, cls = '') => a.photo_url ? `<img class="${cls}" src="${esc(a.photo_url)}" alt="${esc(a.name)}, ${esc(a.species)}" loading="lazy">` : `<div class="noimg ${cls}" role="img" aria-label="No photo for ${esc(a.name)}">🐾</div>`;
function statusChip(s) { return `<span class="chip st-${s}">${cap(s)}</span>`; }

/* ---------- marketplace ---------- */
const F = { q: '', species: '', gender: '', age: '', city: '', vacc: false };
async function browseView() {
  await loadCentres();
  const animals = await q(sb.from('animals').select('*').eq('status', 'available').order('created_at', { ascending: false }));
  const cities = [...new Set(animals.map(a => a.city).filter(Boolean))].sort();
  view.innerHTML = `<div class="head"><div><h1>Animals looking for a home</h1><p class="sub">Only animals marked available by a welfare organisation are listed.</p></div></div>
  <form class="filters" id="flt" role="search" aria-label="Filter animals">
    <label class="grow">Search<input type="search" name="q" placeholder="Name or breed" value="${esc(F.q)}"></label>
    <label>Type<select name="species"><option value="">Any</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></label>
    <label>Gender<select name="gender"><option value="">Any</option><option value="male">Male</option><option value="female">Female</option></select></label>
    <label>Age<select name="age"><option value="">Any</option><option value="baby">Under 1 year</option><option value="young">1–3 years</option><option value="adult">3–8 years</option><option value="senior">8+ years</option></select></label>
    <label>Location<select name="city"><option value="">All cities</option>${cities.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
    <label class="chk"><input type="checkbox" name="vacc"> Vaccinated only</label>
  </form>
  <p id="count" class="sub" aria-live="polite"></p><div id="grid" class="grid"></div>`;
  const f = $('#flt'); ['species', 'gender', 'age', 'city'].forEach(k => f[k].value = F[k]); f.vacc.checked = F.vacc;
  const draw = () => {
    F.q = f.q.value.trim().toLowerCase(); F.species = f.species.value; F.gender = f.gender.value; F.age = f.age.value; F.city = f.city.value; F.vacc = f.vacc.checked;
    const ageOk = a => !F.age || (a.age_months != null && (F.age === 'baby' ? a.age_months < 12 : F.age === 'young' ? a.age_months >= 12 && a.age_months < 36 : F.age === 'adult' ? a.age_months >= 36 && a.age_months < 96 : a.age_months >= 96));
    const list = animals.filter(a => (!F.q || (a.name + ' ' + (a.breed || '')).toLowerCase().includes(F.q)) && (!F.species || a.species === F.species) && (!F.gender || a.gender === F.gender) && ageOk(a) && (!F.city || a.city === F.city) && (!F.vacc || a.vaccinated));
    $('#count').textContent = `${list.length} animal${list.length === 1 ? '' : 's'} available`;
    $('#grid').innerHTML = list.length ? list.map(card).join('') : emptyHtml(animals.length ? 'No animals match these filters' : 'No animals are listed yet', animals.length ? 'Try removing a filter.' : 'Organisations have not published any available animals yet. Please check back soon.');
  };
  f.oninput = draw; f.onsubmit = e => e.preventDefault(); draw();
  S.animals = animals;
}
function card(a) {
  const c = centreName(a.centre_id), fav = S.favs.has(a.id);
  return `<article class="card"><button class="fav" data-act="fav" data-id="${a.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove' : 'Save'} ${esc(a.name)} ${fav ? 'from' : 'to'} saved animals">${fav ? '♥' : '♡'}</button>
  <button class="card-img" data-act="detail" data-id="${a.id}" aria-label="View ${esc(a.name)}'s profile">${photoHtml(a)}<span class="chip ok avail">Available</span>${a.is_demo ? '<span class="chip demo dm">Demo listing</span>' : ''}</button>
  <div class="card-b"><h3>${esc(a.name)}</h3><p class="meta">${cap(a.species)}${a.breed ? ' · ' + esc(a.breed) : ''} · ${ageText(a.age_months)} · ${cap(a.gender)}</p>
  <p class="meta">📍 ${esc(a.city || c?.city || 'Location not given')}</p>
  <p class="tags"><span class="chip ${a.vaccinated ? 'ok' : ''}">${a.vaccinated ? 'Vaccinated' : 'Vaccination not recorded'}</span><span class="chip">${esc(a.health_status)}</span></p>
  <button class="btn block" data-act="detail" data-id="${a.id}">View profile</button></div></article>`;
}
async function animalById(id) { return S.animals?.find(a => a.id === id) || (await q(sb.from('animals').select('*').eq('id', id).single())); }
async function openDetail(id) {
  const a = await animalById(id), c = centreName(a.centre_id);
  const apps = S.session ? await q(sb.from('applications').select('id,status').eq('animal_id', id).eq('applicant_id', S.session.user.id)) : [];
  const open = apps.find(x => ['pending', 'under_review', 'approved'].includes(x.status));
  dialog(`<div class="detail">${photoHtml(a, 'big')}<div><h2>${esc(a.name)}</h2>
  <p>${statusChip(a.status === 'available' ? 'approved' : a.status).replace('Approved', 'Available')}${a.is_demo ? ' <span class="chip demo">Demo listing</span>' : ''}</p>
  <dl><dt>Type</dt><dd>${cap(a.species)}${a.breed ? ' · ' + esc(a.breed) : ''}</dd><dt>Age</dt><dd>${ageText(a.age_months)}</dd><dt>Gender</dt><dd>${cap(a.gender)}</dd>
  <dt>Health</dt><dd>${esc(a.health_status)}</dd><dt>Vaccinated</dt><dd>${a.vaccinated ? 'Yes' : 'Not recorded'}</dd><dt>Neutered / spayed</dt><dd>${a.neutered ? 'Yes' : 'Not recorded'}</dd>
  <dt>Location</dt><dd>${esc(a.city || '—')}</dd>${c ? `<dt>Cared for by</dt><dd>${centreBadge(c)}<br><small>${esc(c.address)}, ${esc(c.city)}${c.phone ? ' · <a href="tel:' + esc(c.phone) + '">' + esc(c.phone) + '</a>' : ''}</small></dd>` : ''}</dl>
  ${a.description ? `<p>${esc(a.description)}</p>` : ''}
  <div class="row">${open ? `<span class="chip">You applied · ${cap(open.status)}</span>` : `<button class="btn" data-act="apply" data-id="${a.id}">Apply to adopt</button>`}
  <button class="btn ghost" data-act="fav" data-id="${a.id}" aria-pressed="${S.favs.has(a.id)}">${S.favs.has(a.id) ? '♥ Saved' : '♡ Save'}</button></div></div></div>`, a.name);
}
async function toggleFav(id) {
  if (!S.session) { toast('Sign in to save animals.'); location.hash = '#/login'; return; }
  try {
    if (S.favs.has(id)) { await q(sb.from('favourites').delete().eq('animal_id', id).eq('user_id', S.session.user.id)); S.favs.delete(id); }
    else { await q(sb.from('favourites').insert({ user_id: S.session.user.id, animal_id: id })); S.favs.add(id); }
    document.querySelectorAll(`[data-act=fav][data-id="${id}"]`).forEach(b => { const on = S.favs.has(id); b.setAttribute('aria-pressed', on); if (b.classList.contains('fav')) b.textContent = on ? '♥' : '♡'; else b.textContent = on ? '♥ Saved' : '♡ Save'; });
    if (location.hash === '#/favourites') refresh();
  } catch (e) { toast(friendly(e), true); }
}
async function applyForm(id) {
  if (!S.session) { closeDialog(); toast('Please sign in to apply.'); location.hash = '#/login'; return; }
  const a = await animalById(id);
  dialog(`<h2>Apply to adopt ${esc(a.name)}</h2><p class="sub">The organisation reviews every application. Submitting does not guarantee adoption.</p>
  <form id="fApp" novalidate><label>Phone number<input type="tel" name="phone" required maxlength="30" value="${esc(S.profile?.phone || '')}" autocomplete="tel"></label>
  <label>Home type<select name="home_type" required><option value="">Select…</option><option value="house">House</option><option value="apartment">Apartment</option><option value="farm">Farm / large property</option><option value="other">Other</option></select></label>
  <label class="chk"><input type="checkbox" name="pets"> I have other pets at home</label>
  <label>Experience with animals <small>(optional)</small><textarea name="experience" rows="2" maxlength="1000"></textarea></label>
  <label>Why would you like to adopt ${esc(a.name)}?<textarea name="reason" rows="4" required minlength="10" maxlength="2000"></textarea></label>
  <p class="err-msg" role="alert"></p><div class="row"><button class="btn">Submit application</button><button type="button" class="btn ghost" data-act="close">Cancel</button></div></form>`, 'Apply');
  $('#fApp').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (f.phone.value.trim().length < 6) { m.textContent = 'Enter a valid phone number.'; return; }
    if (!f.home_type.value) { m.textContent = 'Choose your home type.'; return; }
    if (f.reason.value.trim().length < 10) { m.textContent = 'Please tell us a little more (at least 10 characters).'; return; }
    await withBusy(f, async () => {
      try { await q(sb.from('applications').insert({ animal_id: id, applicant_id: S.session.user.id, phone: f.phone.value.trim(), home_type: f.home_type.value, has_other_pets: f.pets.checked, experience: f.experience.value.trim() || null, reason: f.reason.value.trim() })); closeDialog(); toast('Application submitted. Track it under My applications.'); location.hash = '#/applications'; }
      catch (er) { m.textContent = friendly(er); }
    });
  };
}

/* ---------- adopter pages ---------- */
async function favouritesView() {
  await loadCentres();
  const rows = await q(sb.from('favourites').select('animals(*)').eq('user_id', S.session.user.id));
  const list = rows.map(r => r.animals).filter(Boolean); S.animals = list;
  view.innerHTML = `<div class="head"><h1>Saved animals</h1></div>` + (list.length ? `<div class="grid">${list.map(card).join('')}</div>` : emptyHtml('No saved animals yet', 'Tap the heart on an animal to save it here.', '<a class="btn" href="#/browse">Browse animals</a>'));
}
const STEPS = ['pending', 'under_review', 'approved', 'completed'];
async function applicationsView() {
  const apps = await q(sb.from('applications').select('*, animals(name,photo_url,species,city,status)').eq('applicant_id', S.session.user.id).order('created_at', { ascending: false }));
  const hist = apps.filter(a => a.status === 'completed');
  view.innerHTML = `<div class="head"><h1>My adoption applications</h1></div>` + (apps.length ? `<div class="stack">${apps.map(a => `<article class="row-card">${a.animals?.photo_url ? `<img src="${esc(a.animals.photo_url)}" alt="">` : '<div class="noimg sm">🐾</div>'}
  <div class="grow"><h3>${esc(a.animals?.name || 'Animal')}</h3><p class="meta">Applied ${when(a.created_at)} · Updated ${when(a.updated_at)}</p>
  ${a.status === 'rejected' ? `<p>${statusChip('rejected')}</p>` : `<ol class="steps" aria-label="Application progress">${STEPS.map((s, i) => `<li class="${STEPS.indexOf(a.status) >= i ? 'on' : ''}" ${a.status === s ? 'aria-current="step"' : ''}>${cap(s)}</li>`).join('')}</ol>`}
  ${a.admin_notes ? `<p class="note"><b>Message from the organisation:</b> ${esc(a.admin_notes)}</p>` : ''}</div></article>`).join('')}</div>` : emptyHtml('No applications yet', 'When you apply to adopt an animal you can follow its progress here.', '<a class="btn" href="#/browse">Find an animal</a>'))
  + (hist.length ? `<h2 class="h2">Adoption history</h2><ul class="plain">${hist.map(a => `<li>${esc(a.animals?.name)} — adopted, completed ${when(a.updated_at)}</li>`).join('')}</ul>` : '');
}
async function centresView() {
  const centres = await loadCentres();
  const cities = [...new Set(centres.map(c => c.city))].sort();
  view.innerHTML = `<div class="head"><div><h1>Nearby adoption centres</h1><p class="sub">Listed centres are records in the PawGuard database. The “Verified” label means a PawGuard administrator verified the organisation.</p></div></div>
  <form class="filters" id="cf"><label>City<select name="city"><option value="">All cities</option>${cities.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
  <button type="button" class="btn ghost" id="near">Sort by distance from me</button></form><p id="ccount" class="sub" aria-live="polite"></p><div id="clist" class="grid"></div>`;
  let near = false;
  const draw = () => {
    let list = centres.filter(c => !$('#cf').city.value || c.city === $('#cf').city.value);
    if (near && S.loc) list = list.map(c => ({ ...c, d: c.lat != null ? distKm(S.loc, c) : 1e9 })).sort((a, b) => a.d - b.d);
    $('#ccount').textContent = `${list.length} centre${list.length === 1 ? '' : 's'}`;
    $('#clist').innerHTML = list.length ? list.map(c => `<article class="card"><div class="card-b"><h3>${esc(c.name)}</h3><p>${c.verified ? '<span class="chip ok">Verified</span>' : '<span class="chip">Not yet verified</span>'} ${c.is_demo ? '<span class="chip demo">Demo data</span>' : ''}</p>
      <p class="meta">📍 ${esc(c.address)}, ${esc(c.city)}</p>${c.d != null && c.d < 1e9 ? `<p class="meta">${c.d.toFixed(1)} km away</p>` : ''}
      <p class="meta">${c.phone ? `☎ <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>` : ''} ${c.email ? `· ✉ <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}</p>
      <div class="row"><a class="btn" target="_blank" rel="noopener" href="${mapLink(c)}">Open map</a>${c.website ? `<a class="btn ghost" target="_blank" rel="noopener" href="${esc(c.website)}">Website</a>` : ''}</div></div></article>`).join('') : emptyHtml('No centres listed', centres.length ? 'No centres in this city.' : 'No adoption centres have been added yet. Administrators can add verified centres from the admin area.');
  };
  $('#cf').onchange = draw;
  $('#near').onclick = async () => { try { await getLoc(); near = true; draw(); } catch (e) { toast(e.message, true); } };
  draw();
}
async function profileView() {
  const p = S.profile;
  view.innerHTML = `<div class="head"><h1>Your profile</h1></div><section class="panel narrow"><form id="fP" novalidate>
  <label>Email<input value="${esc(S.session.user.email)}" disabled></label><label>Full name<input name="full_name" value="${esc(p.full_name)}" maxlength="120" required></label>
  <div class="two"><label>Phone<input name="phone" value="${esc(p.phone || '')}" maxlength="30"></label><label>City<input name="city" value="${esc(p.city || '')}" maxlength="80"></label></div>
  <p>Account type: <span class="chip role-${p.role}">${cap(p.role === 'admin' ? 'NGO admin' : p.role)}</span></p><p class="err-msg" role="alert"></p><button class="btn">Save changes</button></form></section>`;
  $('#fP').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f);
    if (f.full_name.value.trim().length < 2) { m.textContent = 'Name is required.'; return; }
    await withBusy(f, async () => { try { S.profile = await q(sb.from('profiles').update({ full_name: f.full_name.value.trim(), phone: f.phone.value.trim() || null, city: f.city.value.trim() || null }).eq('id', p.id).select().single()); renderShell(); toast('Profile saved.'); } catch (er) { m.textContent = friendly(er); } });
  };
}

/* ---------- reporting & volunteer ---------- */
const URG = ['low', 'medium', 'high', 'critical'];
function reportView() {
  view.innerHTML = `<div class="head"><div><h1>Report an animal in need</h1><p class="sub">Your report is saved to the database and appears to volunteers and the organisation immediately. For a life-threatening emergency also call <a href="tel:1962">1962</a> or <a href="tel:112">112</a>.</p></div></div>
  <section class="panel narrow"><form id="fR" novalidate><div class="two"><label>Animal<select name="species"><option value="dog">Dog</option><option value="cat">Cat</option><option value="cow">Cow</option><option value="bird">Bird</option><option value="other">Other</option></select></label>
  <label>Urgency<select name="urgency"><option value="low">Low – stable</option><option value="medium" selected>Medium</option><option value="high">High – injured</option><option value="critical">Critical – life threatening</option></select></label></div>
  <label>What is happening?<textarea name="description" rows="4" required minlength="5" maxlength="2000" placeholder="Injuries, behaviour, how long it has been there…"></textarea></label>
  <label>Address or landmark<input name="address" maxlength="300"></label><div class="two"><label>City<input name="city" maxlength="80"></label>
  <div class="field"><span class="lbl">Exact location</span><button type="button" class="btn ghost" id="geo">📍 Use my location</button><small id="geoS" class="fine">Not shared</small></div></div>
  <label>Photo <small>(optional, JPG/PNG/WebP, max 5 MB)</small><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
  <p class="err-msg" role="alert"></p><button class="btn">Submit report</button></form></section>`;
  let pos = null;
  $('#geo').onclick = async () => { try { pos = await getLoc(); $('#geoS').textContent = `Shared (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`; } catch (e) { toast(e.message, true); } };
  $('#fR').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (f.description.value.trim().length < 5) { m.textContent = 'Please describe the situation.'; return; }
    if (!pos && !f.address.value.trim() && !f.city.value.trim()) { m.textContent = 'Share your location or enter an address / city so volunteers can find the animal.'; return; }
    await withBusy(f, async () => {
      try {
        const url = await uploadPhoto(f.photo.files[0]);
        const r = await q(sb.from('rescue_requests').insert({ species: f.species.value, urgency: f.urgency.value, description: f.description.value.trim(), address: f.address.value.trim() || null, city: f.city.value.trim() || null, lat: pos?.lat ?? null, lng: pos?.lng ?? null, photo_url: url, reporter_id: S.session.user.id }).select('ticket').single());
        view.innerHTML = emptyHtml('Report received', `Your ticket number is ${r.ticket}. Keep it to follow progress.`, `<a class="btn" href="#/${isVol() ? 'rescues' : 'report'}">${isVol() ? 'See nearby requests' : 'Report another'}</a>`);
      } catch (er) { m.textContent = friendly(er); }
    });
  };
}
const rcard = (r, mine) => `<article class="row-card urg-${r.urgency}">${r.photo_url ? `<img src="${esc(r.photo_url)}" alt="Reported ${esc(r.species)}" loading="lazy">` : `<div class="noimg sm">🐾</div>`}
<div class="grow"><h3>${cap(r.species)} <small>${esc(r.ticket)}</small></h3><p><span class="chip urg">${cap(r.urgency)}</span> ${statusChip(r.status)}</p>
<p>${esc(r.description)}</p><p class="meta">📍 ${esc([r.address, r.city].filter(Boolean).join(', ') || 'Location pinned on map')}${r._d != null ? ' · ' + r._d.toFixed(1) + ' km away' : ''} · ${when(r.created_at)}</p>
${r.lat != null ? `<p><a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=16/${r.lat}/${r.lng}">Open location map</a></p>` : ''}
<div class="row">${mine ? `<button class="btn sm" data-act="progress" data-id="${r.id}">Update progress</button>` : (r.status === 'reported' && !r.assigned_to ? `<button class="btn sm" data-act="accept" data-id="${r.id}">Accept this case</button>` : '')}</div></div></article>`;
const RF = { urgency: '', dist: '' };
async function rescuesView() {
  let list = await q(sb.from('rescue_requests').select('*').eq('status', 'reported').is('assigned_to', null).order('created_at', { ascending: false }));
  view.innerHTML = `<div class="head"><div><h1>Nearby rescue requests</h1><p class="sub">Open cases waiting for a volunteer.</p></div></div>
  <form class="filters" id="rf"><label>Urgency<select name="urgency"><option value="">All</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
  <label>Distance<select name="dist"><option value="">Any</option><option value="5">Within 5 km</option><option value="15">Within 15 km</option><option value="50">Within 50 km</option></select></label>
  <button type="button" class="btn ghost" id="rloc">📍 Use my location</button></form><p id="rcount" class="sub" aria-live="polite"></p><div id="rl" class="stack"></div>`;
  const f = $('#rf'); f.urgency.value = RF.urgency; f.dist.value = RF.dist;
  const draw = () => {
    RF.urgency = f.urgency.value; RF.dist = f.dist.value;
    let l = list.map(r => ({ ...r, _d: S.loc && r.lat != null ? distKm(S.loc, r) : null }));
    if (RF.urgency) l = l.filter(r => r.urgency === RF.urgency);
    if (RF.dist) { if (!S.loc) $('#rcount').textContent = 'Share your location to filter by distance.'; else l = l.filter(r => r._d != null && r._d <= +RF.dist); }
    l.sort((a, b) => URG.indexOf(b.urgency) - URG.indexOf(a.urgency) || (a._d ?? 1e9) - (b._d ?? 1e9) || new Date(b.created_at) - new Date(a.created_at));
    if (!(RF.dist && !S.loc)) $('#rcount').textContent = `${l.length} open request${l.length === 1 ? '' : 's'}`;
    $('#rl').innerHTML = l.length ? l.map(r => rcard(r, false)).join('') : emptyHtml('No open requests', 'Nothing matches right now. New reports appear here automatically.');
  };
  f.onchange = draw; $('#rloc').onclick = async () => { try { await getLoc(); draw(); toast('Location set.'); } catch (e) { toast(e.message, true); } };
  draw();
}
async function myCasesView() {
  const list = await q(sb.from('rescue_requests').select('*').eq('assigned_to', S.session.user.id).order('updated_at', { ascending: false }));
  const act = list.filter(r => !['rescued', 'closed'].includes(r.status)), done = list.filter(r => ['rescued', 'closed'].includes(r.status));
  view.innerHTML = `<div class="head"><h1>My cases</h1></div><h2 class="h2">Assigned to me (${act.length})</h2>${act.length ? `<div class="stack">${act.map(r => rcard(r, true)).join('')}</div>` : emptyHtml('No active cases', 'Accept a case from Nearby requests.', '<a class="btn" href="#/rescues">Find cases</a>')}
  <h2 class="h2">Completed rescues (${done.length})</h2>${done.length ? `<div class="stack">${done.map(r => rcard(r, false).replace(/<div class="row">.*?<\/div><\/div><\/article>/s, '</div></article>')).join('')}</div>` : '<p class="sub">Completed rescues will appear here.</p>'}`;
}
async function progressDialog(id) {
  const r = await q(sb.from('rescue_requests').select('*').eq('id', id).single());
  const ups = await q(sb.from('rescue_updates').select('*').eq('request_id', id).order('created_at', { ascending: false }));
  dialog(`<h2>Update ${esc(r.ticket)}</h2><form id="fU"><label>New status<select name="status">${['accepted', 'in_progress', 'rescued', 'closed'].map(s => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select></label>
  <label>Note <small>(optional)</small><textarea name="note" rows="3" maxlength="1000" placeholder="What happened?"></textarea></label><p class="err-msg" role="alert"></p>
  <div class="row"><button class="btn">Save update</button><button type="button" class="btn ghost" data-act="close">Cancel</button></div></form>
  <h3 class="h2">History</h3>${ups.length ? `<ul class="plain">${ups.map(u => `<li><b>${cap(u.status)}</b> · ${when(u.created_at)}${u.note ? '<br>' + esc(u.note) : ''}</li>`).join('')}</ul>` : '<p class="sub">No updates yet.</p>'}`, 'Progress');
  $('#fU').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f);
    await withBusy(f, async () => { try { await q(sb.rpc('update_rescue', { p_id: id, p_status: f.status.value, p_note: f.note.value.trim() || null })); closeDialog(); toast('Progress updated.'); refresh(); } catch (er) { m.textContent = friendly(er); } });
  };
}

/* ---------- admin ---------- */
async function adminOverview() {
  const s = await q(sb.rpc('admin_stats'));
  const bars = Object.entries(s.by_status || {}); const max = Math.max(1, ...bars.map(b => b[1]));
  const kpi = (n, l) => `<div class="kpi"><b>${n}</b><span>${l}</span></div>`;
  view.innerHTML = `<div class="head"><h1>Organisation overview</h1></div><div class="kpis">${kpi(s.animals_total, 'Animals registered')}${kpi(s.animals_available, 'Available for adoption')}${kpi(s.animals_adopted, 'Adopted')}${kpi(s.applications_open, 'Applications to review')}${kpi(s.rescues_open, 'Open rescue cases')}${kpi(s.rescues_done, 'Rescues completed')}${kpi(s.volunteers, 'Volunteers')}${kpi(s.adopters, 'Adopters')}</div>
  <section class="panel"><h2>Rescue cases by status</h2>${bars.length ? bars.map(([k, v]) => `<div class="bar"><span>${cap(k)}</span><div><i style="width:${(v / max) * 100}%"></i></div><b>${v}</b></div>`).join('') : '<p class="sub">No rescue cases yet.</p>'}</section>
  <section class="panel"><h2>Adding another organisation admin</h2><p class="sub">For safety, admin rights can only be granted in the database by the project owner: after the person signs up, run <code>update public.profiles set role='admin' where id=(select id from auth.users where email='…');</code> in the Supabase SQL editor.</p></section>`;
}
async function adminAnimals() {
  await loadCentres();
  const list = await q(sb.from('animals').select('*').order('created_at', { ascending: false })); S.animals = list;
  view.innerHTML = `<div class="head"><h1>Animals</h1><button class="btn" data-act="animalForm">+ Register animal</button></div>` + (list.length ? `<div class="table-wrap"><table><caption class="sr">Registered animals</caption><thead><tr><th>Animal</th><th>Type</th><th>Status</th><th>Centre</th><th><span class="sr">Actions</span></th></tr></thead><tbody>${list.map(a => `<tr><td>${a.photo_url ? `<img class="thumb" src="${esc(a.photo_url)}" alt="">` : ''}<b>${esc(a.name)}</b>${a.is_demo ? ' <span class="chip demo">Demo</span>' : ''}<br><small>${ageText(a.age_months)} · ${cap(a.gender)}</small></td><td>${cap(a.species)}</td><td>${statusChip(a.status)}</td><td>${esc(centreName(a.centre_id)?.name || '—')}</td><td class="act"><button class="btn sm ghost" data-act="animalForm" data-id="${a.id}">Edit</button> <button class="btn sm ghost danger" data-act="animalDel" data-id="${a.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No animals registered', 'Register an animal, then set its status to Available to list it in the marketplace.'));
}
function animalForm(id) {
  const a = id ? S.animals.find(x => x.id === id) : {};
  const sel = (n, opts, v) => `<select name="${n}">${opts.map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  dialog(`<h2>${id ? 'Edit' : 'Register'} animal</h2><form id="fA" novalidate><div class="two"><label>Name<input name="name" required maxlength="80" value="${esc(a.name || '')}"></label>
  <label>Type${sel('species', [['dog', 'Dog'], ['cat', 'Cat'], ['other', 'Other']], a.species || 'dog')}</label></div>
  <div class="two"><label>Breed<input name="breed" maxlength="80" value="${esc(a.breed || '')}"></label><label>Age (months)<input type="number" name="age_months" min="0" max="360" value="${a.age_months ?? ''}"></label></div>
  <div class="two"><label>Gender${sel('gender', [['unknown', 'Unknown'], ['male', 'Male'], ['female', 'Female']], a.gender || 'unknown')}</label><label>City<input name="city" maxlength="80" value="${esc(a.city || '')}"></label></div>
  <label>Health status<input name="health_status" maxlength="160" value="${esc(a.health_status || 'Healthy')}"></label>
  <div class="two"><label class="chk"><input type="checkbox" name="vaccinated" ${a.vaccinated ? 'checked' : ''}> Vaccinated</label><label class="chk"><input type="checkbox" name="neutered" ${a.neutered ? 'checked' : ''}> Neutered / spayed</label></div>
  <div class="two"><label>Adoption centre<select name="centre_id"><option value="">— none —</option>${S.centres.map(c => `<option value="${c.id}" ${c.id === a.centre_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
  <label>Status${sel('status', [['in_care', 'In care (not listed)'], ['recovering', 'Recovering (not listed)'], ['available', 'Available for adoption'], ['pending_adoption', 'Adoption pending'], ['adopted', 'Adopted']], a.status || 'in_care')}</label></div>
  <label>Description<textarea name="description" rows="3" maxlength="2000">${esc(a.description || '')}</textarea></label>
  <label>Photo <small>(JPG/PNG/WebP, max 5 MB)</small><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
  <p class="err-msg" role="alert"></p><div class="row"><button class="btn">${id ? 'Save changes' : 'Register animal'}</button><button type="button" class="btn ghost" data-act="close">Cancel</button></div></form>`, 'Animal');
  $('#fA').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (!f.name.value.trim()) { m.textContent = 'Name is required.'; return; }
    await withBusy(f, async () => {
      try {
        const photo = await uploadPhoto(f.photo.files[0]);
        const row = { name: f.name.value.trim(), species: f.species.value, breed: f.breed.value.trim() || null, age_months: f.age_months.value === '' ? null : +f.age_months.value, gender: f.gender.value, city: f.city.value.trim() || null, health_status: f.health_status.value.trim() || 'Healthy', vaccinated: f.vaccinated.checked, neutered: f.neutered.checked, centre_id: f.centre_id.value || null, status: f.status.value, description: f.description.value.trim() || null };
        if (photo) row.photo_url = photo;
        if (id) await q(sb.from('animals').update(row).eq('id', id)); else await q(sb.from('animals').insert({ ...row, created_by: S.session.user.id }));
        closeDialog(); toast('Animal saved.'); refresh();
      } catch (er) { m.textContent = friendly(er); }
    });
  };
}
async function adminApplications() {
  const apps = await q(sb.from('applications').select('*, animals(name,status,photo_url), profiles!applicant_id(full_name,phone,city)').order('created_at', { ascending: false }));
  view.innerHTML = `<div class="head"><h1>Adoption applications</h1></div>` + (apps.length ? `<div class="stack">${apps.map(a => `<article class="row-card">${a.animals?.photo_url ? `<img src="${esc(a.animals.photo_url)}" alt="">` : '<div class="noimg sm">🐾</div>'}<div class="grow">
  <h3>${esc(a.profiles?.full_name || 'Applicant')} → ${esc(a.animals?.name)}</h3><p class="meta">${when(a.created_at)} · ${statusChip(a.status)} · ☎ ${esc(a.phone)} · ${esc(cap(a.home_type))}${a.has_other_pets ? ' · has other pets' : ''}</p>
  ${a.experience ? `<p><b>Experience:</b> ${esc(a.experience)}</p>` : ''}<p><b>Reason:</b> ${esc(a.reason)}</p>
  <form class="inline" data-app="${a.id}"><label>Status<select name="status">${['pending', 'under_review', 'approved', 'rejected', 'completed'].map(s => `<option value="${s}" ${s === a.status ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select></label>
  <label class="grow">Message to applicant<input name="notes" maxlength="2000" value="${esc(a.admin_notes || '')}"></label><button class="btn sm">Save</button></form></div></article>`).join('')}</div>` : emptyHtml('No applications yet', 'Applications from adopters will appear here.'));
}
async function adminRescues() {
  const [list, vols] = await Promise.all([q(sb.from('rescue_requests').select('*, assignee:profiles!assigned_to(full_name)').order('created_at', { ascending: false })), q(sb.rpc('list_volunteers'))]);
  view.innerHTML = `<div class="head"><h1>Rescue requests</h1></div>` + (list.length ? `<div class="stack">${list.map(r => `<article class="row-card urg-${r.urgency}">${r.photo_url ? `<img src="${esc(r.photo_url)}" alt="">` : '<div class="noimg sm">🐾</div>'}<div class="grow"><h3>${cap(r.species)} <small>${esc(r.ticket)}</small></h3>
  <p><span class="chip urg">${cap(r.urgency)}</span> ${statusChip(r.status)} <span class="meta">${when(r.created_at)}</span></p><p>${esc(r.description)}</p><p class="meta">📍 ${esc([r.address, r.city].filter(Boolean).join(', ') || 'Pinned location')}</p>
  <form class="inline" data-rescue="${r.id}"><label>Assign volunteer<select name="vol"><option value="">— unassigned —</option>${vols.map(v => `<option value="${v.id}" ${v.id === r.assigned_to ? 'selected' : ''}>${esc(v.full_name || 'Unnamed')}${v.city ? ' (' + esc(v.city) + ')' : ''}</option>`).join('')}</select></label>
  <label>Status<select name="status">${['reported', 'accepted', 'in_progress', 'rescued', 'closed'].map(s => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select></label><button class="btn sm">Save</button></form></div></article>`).join('')}</div>` : emptyHtml('No rescue requests', 'Reports submitted by users will appear here.'));
}
async function adminCentres() {
  const list = await loadCentres();
  view.innerHTML = `<div class="head"><h1>Adoption centres</h1><button class="btn" data-act="centreForm">+ Add centre</button></div>` + (list.length ? `<div class="table-wrap"><table><thead><tr><th>Centre</th><th>Contact</th><th>Verified</th><th><span class="sr">Actions</span></th></tr></thead><tbody>${list.map(c => `<tr><td><b>${esc(c.name)}</b>${c.is_demo ? ' <span class="chip demo">Demo</span>' : ''}<br><small>${esc(c.address)}, ${esc(c.city)}</small></td><td>${esc(c.phone || '—')}<br><small>${esc(c.email || '')}</small></td><td>${c.verified ? '<span class="chip ok">Verified</span>' : 'No'}</td><td class="act"><button class="btn sm ghost" data-act="centreForm" data-id="${c.id}">Edit</button> <button class="btn sm ghost danger" data-act="centreDel" data-id="${c.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No centres yet', 'Add the real organisations you have verified.'));
}
function centreForm(id) {
  const c = id ? S.centres.find(x => x.id === id) : {};
  dialog(`<h2>${id ? 'Edit' : 'Add'} centre</h2><form id="fC" novalidate><label>Name<input name="name" required maxlength="160" value="${esc(c.name || '')}"></label><label>Address<input name="address" required maxlength="300" value="${esc(c.address || '')}"></label>
  <div class="two"><label>City<input name="city" required maxlength="80" value="${esc(c.city || '')}"></label><label>Phone<input name="phone" maxlength="30" value="${esc(c.phone || '')}"></label></div>
  <div class="two"><label>Email<input type="email" name="email" value="${esc(c.email || '')}"></label><label>Website<input type="url" name="website" placeholder="https://" value="${esc(c.website || '')}"></label></div>
  <div class="two"><label>Latitude<input type="number" step="any" name="lat" min="-90" max="90" value="${c.lat ?? ''}"></label><label>Longitude<input type="number" step="any" name="lng" min="-180" max="180" value="${c.lng ?? ''}"></label></div>
  <label class="chk"><input type="checkbox" name="verified" ${c.verified ? 'checked' : ''}> Verified organisation (only tick after you have checked it)</label><p class="err-msg" role="alert"></p>
  <div class="row"><button class="btn">Save centre</button><button type="button" class="btn ghost" data-act="close">Cancel</button></div></form>`, 'Centre');
  $('#fC').onsubmit = async e => {
    e.preventDefault(); const f = e.target, m = $('.err-msg', f); m.textContent = '';
    if (!f.name.value.trim() || !f.address.value.trim() || !f.city.value.trim()) { m.textContent = 'Name, address and city are required.'; return; }
    const row = { name: f.name.value.trim(), address: f.address.value.trim(), city: f.city.value.trim(), phone: f.phone.value.trim() || null, email: f.email.value.trim() || null, website: f.website.value.trim() || null, lat: f.lat.value === '' ? null : +f.lat.value, lng: f.lng.value === '' ? null : +f.lng.value, verified: f.verified.checked };
    await withBusy(f, async () => { try { if (id) await q(sb.from('centres').update(row).eq('id', id)); else await q(sb.from('centres').insert({ ...row, created_by: S.session.user.id })); closeDialog(); toast('Centre saved.'); refresh(); } catch (er) { m.textContent = friendly(er); } });
  };
}

/* ---------- dialog + events ---------- */
let lastFocus = null;
function dialog(html, label) {
  closeDialog(true); lastFocus = document.activeElement;
  const d = document.createElement('dialog'); d.className = 'dlg'; d.setAttribute('aria-label', label || 'Dialog');
  d.innerHTML = `<button class="x" data-act="close" aria-label="Close">×</button>${html}`; $('#dlgHost').appendChild(d);
  d.addEventListener('close', () => { d.remove(); lastFocus?.focus?.(); }); d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.showModal();
}
function closeDialog(silent) { const d = $('#dlgHost dialog'); if (d) { if (silent) d.remove(); else d.close(); } }

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  try {
    if (act === 'close') closeDialog();
    else if (act === 'retry') refresh();
    else if (act === 'signout') { await sb.auth.signOut(); location.hash = '#/browse'; }
    else if (act === 'fav') toggleFav(id);
    else if (act === 'detail') await openDetail(id);
    else if (act === 'apply') await applyForm(id);
    else if (act === 'accept') { await q(sb.rpc('accept_rescue', { p_id: id })); toast('Case accepted. Find it under My cases.'); refresh(); }
    else if (act === 'progress') await progressDialog(id);
    else if (act === 'animalForm') animalForm(id);
    else if (act === 'animalDel') { if (confirm('Delete this animal and its applications? This cannot be undone.')) { await q(sb.from('animals').delete().eq('id', id)); toast('Animal deleted.'); refresh(); } }
    else if (act === 'centreForm') centreForm(id);
    else if (act === 'centreDel') { if (confirm('Delete this centre?')) { await q(sb.from('centres').delete().eq('id', id)); toast('Centre deleted.'); refresh(); } }
    else if (act === 'forgot') {
      const em = $('#fIn')?.email.value.trim(); if (!em) { toast('Enter your email first.', true); return; }
      await q(sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + '/portal' })); toast('If that email is registered, a reset link is on its way.');
    }
  } catch (er) { toast(friendly(er), true); }
});
document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.dataset.app) { e.preventDefault(); try { await q(sb.from('applications').update({ status: f.status.value, admin_notes: f.notes.value.trim() || null }).eq('id', f.dataset.app)); toast('Application updated.'); refresh(); } catch (er) { toast(friendly(er), true); } }
  if (f.dataset.rescue) {
    e.preventDefault(); const id = f.dataset.rescue;
    try { await q(sb.rpc('assign_rescue', { p_id: id, p_volunteer: f.vol.value || null })); await q(sb.rpc('update_rescue', { p_id: id, p_status: f.status.value, p_note: 'Updated by admin' })); toast('Rescue case updated.'); refresh(); } catch (er) { toast(friendly(er), true); }
  }
});

/* ---------- realtime (re-render lists when rows change) ---------- */
function subscribeRealtime() {
  let t;
  const kick = () => { clearTimeout(t); t = setTimeout(() => { if (!document.querySelector('dialog[open]') && !document.activeElement?.closest?.('form')) route(); }, 600); };
  sb.channel('pg-live').on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_requests' }, kick).on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, kick).on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, kick).subscribe();
}

boot();
})();
