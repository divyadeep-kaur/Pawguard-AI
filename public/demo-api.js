/* Static demo mode: used automatically when the Python API is not reachable
   (e.g. the site is hosted on static hosting such as Vercel). Seed reports come from
   data/rescueReports.json; anything a visitor adds is kept in their own browser only. */
window.PawDemo = (() => {
  const KEY = 'pawguard.demo.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  let seed;
  const getSeed = async () => seed || (seed = await fetch('data/rescueReports.json').then((r) => r.json()).catch(() => []));
  const reports = async () => [...(load().added || []), ...(await getSeed())].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});

  function analytics(rs, adoptions) {
    const st = count(rs, (r) => r.status), sv = count(rs, (r) => r.severity);
    const months = {};
    [...rs].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).forEach((r) => {
      const d = new Date(r.timestamp), k = d.getFullYear() * 100 + d.getMonth();
      const m = months[k] || (months[k] = { month: d.toLocaleString('en', { month: 'short' }), reports: 0, recovered: 0 });
      m.reports++; if (r.status === 'Recovered') m.recovered++;
    });
    const top = (o, a, b, n = 99) => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, n).map(([k, v]) => ({ [a]: k, [b]: v }));
    return { totalReports: rs.length, recovered: st.Recovered || 0, activeCases: (st.Dispatched || 0) + (st['In-Rescue'] || 0),
      awaitingResponse: st.Reported || 0, criticalCases: sv.critical || 0, adoptionRequests: adoptions,
      species: top(count(rs, (r) => r.animalType), 'type', 'count'), conditions: top(count(rs, (r) => r.healthStatus), 'name', 'value', 6),
      monthlyTrends: Object.keys(months).sort().map((k) => months[k]) };
  }

  const SCANS = [
    { animalType: 'Dog', breed: 'Indie dog mix', healthDetected: 'Possible mange and malnutrition', severity: 'moderate', emergencyAlert: false,
      firstAid: ['Offer fresh water and small portions of plain boiled rice.', 'Keep the dog in a warm, dry spot and avoid touching bare skin patches without gloves.', 'Contact a vet or rescue NGO for skin treatment.'],
      suggestedAction: 'Feed gently, keep contact minimal, and arrange veterinary care.' },
    { animalType: 'Cow', breed: 'Indian zebu', healthDetected: 'Possible leg injury', severity: 'critical', emergencyAlert: true,
      firstAid: ['Do not force the animal to stand or walk.', 'Press a clean cloth on any bleeding wound.', 'Keep it in shade with water within reach.'],
      suggestedAction: 'Call 1962 or a large-animal vet immediately.' },
    { animalType: 'Cat', breed: 'Domestic calico', healthDetected: 'Possible eye infection', severity: 'low', emergencyAlert: false,
      firstAid: ['Wipe discharge with a clean cotton pad and warm water.', 'Keep the kitten in a calm, shaded space.'],
      suggestedAction: 'A vet can prescribe eye drops; this is usually very treatable.' },
  ];

  function chat(q) {
    q = (q || '').toLowerCase();
    if (/mange|skin/.test(q)) return 'Mange is caused by mites and spreads between dogs. Keep the animal separate, wear gloves, and see a vet for treatment. Good food helps skin recovery.';
    if (/1962|number|helpline|phone/.test(q)) return 'National animal helpline: 1962 (available in many Indian states). General emergency: 112. For cruelty complaints, contact the Animal Welfare Board of India or a local rescue NGO.';
    if (/fracture|wound|hurt|injur|bleed|wounded/.test(q)) return '1. Press a clean cloth on bleeding wounds.\n2. Keep the animal calm, still and in shade; do not straighten a broken limb.\n3. Call 1962 or a vet. Injured animals can bite from fear, so keep your distance from the head.';
    if (/adopt|process/.test(q)) return 'Open the Adopt section, choose an animal and send a request. The shelter team contacts you to arrange a visit. All animals are vaccinated and vet-cleared.';
    return 'I can help with first aid for street animals, reporting, and adoption. This is demo mode with a limited set of answers, so for emergencies please call 1962. For other help, email officialdivyadeep@gmail.com.';
  }

  async function handle(method, path, body = {}) {
    const s = load();
    if (method === 'GET' && path === '/rescue-reports') return reports();
    if (method === 'GET' && path === '/analytics') return analytics(await reports(), (s.adoptions || []).length + 1);
    if (method === 'POST' && path === '/rescue-reports') {
      const need = ['animalType', 'location', 'description', 'reporterName', 'reporterContact'];
      if (need.some((k) => !body[k])) throw new Error('Missing required fields for reporting');
      const all = await reports();
      const next = 1 + Math.max(0, ...all.map((r) => parseInt(String(r.ticketNumber).split('-').pop(), 10) || 0));
      const sev = ['low', 'moderate', 'critical'].includes(body.severity) ? body.severity : 'low';
      const rep = { ticketNumber: `PWG-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`, animalType: body.animalType,
        breed: body.breed || 'Unidentified', healthStatus: body.healthStatus || 'Requires inspection', severity: sev, description: body.description,
        location: body.location, gpsCoordinates: body.gpsCoordinates || { lat: 28.6 + (Math.random() - .5) * .1, lng: 77.25 + (Math.random() - .5) * .1 },
        imageUrl: '', reporterName: body.reporterName, reporterContact: body.reporterContact, status: 'Reported', timestamp: new Date().toISOString() };
      s.added = [rep, ...(s.added || [])]; save(s); return rep;
    }
    if (method === 'POST' && path === '/adoption/requests') {
      if (!body.animalId || !body.applicantName || !body.applicantEmail || !body.applicantPhone) throw new Error('Missing required adoption fields');
      const r = { id: `ADOPT-${102 + (s.adoptions || []).length}`, ...body, status: 'Pending' };
      s.adoptions = [...(s.adoptions || []), r]; save(s); return r;
    }
    if (method === 'POST' && path === '/scan-animal') {
      await new Promise((r) => setTimeout(r, 900));
      return { success: true, demo: true, source: 'Demo mode: this is a sample result, not a real analysis of your photo',
        data: { ...SCANS[Math.floor(Math.random() * SCANS.length)], nearbyResources: [] } };
    }
    if (method === 'POST' && path === '/chat') {
      const last = (body.messages || []).slice(-1)[0];
      return { content: chat(last && last.content), demo: true, source: 'Demo mode' };
    }
    throw new Error('Not available in demo mode');
  }
  return { handle };
})();
