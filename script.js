// ================= PLATFORM DATASETS =================

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200",
    tag: "🟢 Dynamic GPS Rescue Links",
    title: "National Stray Animal Diagnostics Engine",
    desc: "Empowering citizens and forest volunteers to identify, report, and recover stray animals using customized veterinary diagnostics and real-time medical updates.",
    actionText: "Deploy Scanner Now",
    actionLink: "#scanner"
  },
  {
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1200",
    tag: "❤️ Help the Unheard Survivors",
    title: "Every Rescued Pet Deserves a Cozy Home",
    desc: "All street survivors open for adoption are completely vaccinated, medically sterilized, microchipped, and fully behavioral-cleared for warm home integration.",
    actionText: "Browse Companion Portal",
    actionLink: "#adoption"
  },
  {
    image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=1200",
    tag: "🦁 Satyameva Jayate - Veterinary Action",
    title: "Synchronized with NGO Ambulances and Vets",
    desc: "Trigger state-of-the-art clinic and nurse ambulances through Helpline 1962 dispatch. Get active status tracking and print scan codes for instant coordination on the streets.",
    actionText: "File Distress Ticket",
    actionLink: "#reporter"
  }
];

const ADOPTION_PETS = [
  {
    id: "pet-1",
    name: "Buddy",
    breed: "Indie Retriever Mix",
    age: "11 Months",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
    healthStatus: "Fully Recovered (Post mild mange treatment)",
    rescueHistory: "Rescued near Noida bypass highway suffering from extreme flea dermatitis and malnutrition. Today, Buddy is extremely athletic, vaccinated, active, and friendly with kids."
  },
  {
    id: "pet-2",
    name: "Luna",
    breed: "Calico domestic",
    age: "5 Months",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    healthStatus: "Perfect Health (Dewormed & vaccinated)",
    rescueHistory: "Found trapped inside a commercial stormwater pipe during torrential downpours. Luna is a tiny chatterbox who loves soft blanket naps."
  },
  {
    id: "pet-3",
    name: "Coco",
    breed: "Labrador Retriever",
    age: "2 Years",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    healthStatus: "Fully Healthy (Castrated, Microchipped)",
    rescueHistory: "Abandoned on the street by owners due to eye allergy, which has now completely cleared up. Cocoa is obedient, gentle, and trained."
  },
  {
    id: "pet-4",
    name: "Sheru",
    breed: "Indie Pariah",
    age: "1.5 Years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
    healthStatus: "Fully Healthy (Leash trained)",
    rescueHistory: "Rescued from a local market area where other stray animals bit him. Sheru has fully recovered his energetic spirit and has deep, expressive eyes."
  }
];

const SUCCESS_STORIES = [
  {
    id: "story-1",
    name: "Rocky (The Highway Warrior)",
    beforeUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600",
    afterUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600",
    location: "Sukhdev Vihar",
    story: "Rocky was found unconscious on a busy highway divider with a deep hip wound. Our automated ticket PWG-002 mobilized nearby NGO medics. After 2 months of deep wound therapy Rocky was adopted by an loving family."
  },
  {
    id: "story-2",
    name: "Nandi (Sabarmathi Bull)",
    beforeUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&q=80&w=600",
    afterUrl: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=600",
    location: "Yamuna Floodplains",
    story: "Nandi suffered from a critical plastic wire entanglement on his foot cut deep into cartilage. Our surgical truck dispatched to administer field anesthetic. Nandi is now free-grazing, completely limp-free."
  },
  {
    id: "story-3",
    name: "Kiku (Feline Orphan)",
    beforeUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=600",
    afterUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600",
    location: "Vasant Kunj",
    story: "Kiku was a tiny newborn kitten with eyes swollen completely shut due to viral conjunctivitis. Identified via PawGuard's AI Vision health detector, sterile procedure cured Kiku. Adpotive parents now support her!"
  }
];

const LOCALITIES = [
  { name: "Connaught Place, Delhi", lat: 28.6304, lng: 77.2177 },
  { name: "Defense Colony, South Delhi", lat: 28.5714, lng: 77.2227 },
  { name: "Noida Sector 62, UP", lat: 28.6273, lng: 77.3725 },
  { name: "Indirapuram, Ghaziabad", lat: 28.6358, lng: 77.3732 },
  { name: "Raja Garden, West Delhi", lat: 28.6441, lng: 77.1221 },
  { name: "Sukhdev Vihar, South Delhi", lat: 28.5604, lng: 77.2831 }
];

const STATIC_MAP_ASSETS = [
  { id: "asset-1", type: "ngo", name: "Friendicoes SECA Medical Center", lat: 28.5714, lng: 77.2227, address: "Defense Colony Market, New Delhi", contact: "1962 / +91 11 2432 0262" },
  { id: "asset-2", type: "hospital", name: "Sanjay Gandhi 24/7 Trauma Unit", lat: 28.6441, lng: 77.1221, address: "Raja Garden Crossing, Delhi", contact: "+91 11 2544 8062" },
  { id: "asset-3", type: "ambulance", name: "AWBI Rescue Ambulance #08", lat: 28.5604, lng: 77.2831, address: "Active patrolling Sukhdev Vihar", contact: "+91 88800 00010" }
];


// ================= PLATFORM SINGLETON STATE MANAGER =================

window.state = {
  // Core Roles
  currentRole: "Citizen",
  
  // Slide trackers
  currentHeroSlide: 0,
  currentStoryIndex: 0,
  currentStoryShowAfter: false,

  // Active Database Lists
  reports: [],
  analytics: null,

  // UI Interactive Elements
  activeScanTab: "file",
  capturedImageBase64: null,
  activeCameraStream: null,
  activeFormSeverity: "low",
  autoCapturedGps: null,

  // Chat parameters
  chatbotOpen: false,
  chatMessages: [
    {
      role: "assistant",
      content: "Hello! I am **PawGuard AI Companion**, your 24/7 dedicated stray rescue, symptoms analyst, and municipal dispatcher. Ask me anything about veterinary first-aid, stray emergencies, or our adoption protocol!"
    }
  ],

  // Focus location metrics
  focalLocationName: "Connaught Place, Delhi",
  focalLatLng: { lat: 28.6304, lng: 77.2177 },

  // Leaflet map instance holders
  mapInstance: null,
  mapMarkersGroup: null,
  mapPolyline: null,

  // Chartjs instances references
  volumeChart: null,
  speciesChart: null,


  // --- ROLE HANDLING OPERATIONS ---
  onRoleChange: function(newRole) {
    this.currentRole = newRole;
    console.log("Portal viewing role updated successfully to:", newRole);
    
    // Refresh reported incident controls based on authorized views
    this.renderReportsList();
    
    // Smooth scroll visual update to indicate shift
    const alertBox = document.createElement("div");
    alertBox.className = "fixed bottom-24 left-6 bg-slate-900 border border-blue-500/30 text-white font-mono text-[11px] py-3 px-5 rounded-2xl z-50 shadow-2xl animate-bounce";
    alertBox.innerHTML = `🛡️ Focus View Shifted: Authorized role <strong>${newRole}</strong> verified`;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 2500);

    if (newRole === "Officer") {
      this.triggerFieldPortalDefault();
    }
  },


  // --- INITIALIZATION ---
  init: async function() {
    this.initHero();
    this.initSuccessStory();
    this.initAdoptionPets();
    this.initChatbotFaq();

    // Load reports and analytics from backend
    await this.fetchReports();
    await this.fetchAnalytics();

    // Map GIS Initialization
    this.initMap();

    // Check QR triage ingress URL parameter triggers
    const urlParams = new URLSearchParams(window.location.search);
    const triageTicket = urlParams.get("ticket");
    if (triageTicket) {
      this.triggerFieldPortal(triageTicket);
    }

    // Auto-create Lucide SVG icons across complete DOM tree
    lucide.createIcons();
  },


  // --- HERO CAROUSEL IMPLEMENTATION ---
  initHero: function() {
    this.renderHeroSlide();
    
    // Automated auto slider transition loop 6000ms
    setInterval(() => {
      this.currentHeroSlide = (this.currentHeroSlide + 1) % HERO_SLIDES.length;
      this.renderHeroSlide();
    }, 6000);
  },

  renderHeroSlide: function() {
    const slide = HERO_SLIDES[this.currentHeroSlide];
    
    const bgImg = document.getElementById("hero-bg-img");
    const tag = document.getElementById("hero-tag");
    const title = document.getElementById("hero-title");
    const desc = document.getElementById("hero-desc");
    const btn = document.getElementById("hero-btn");
    const dotsContainer = document.getElementById("hero-dots");

    if (bgImg && slide) {
      bgImg.src = slide.image;
      tag.innerHTML = slide.tag;
      title.innerHTML = slide.title;
      desc.innerHTML = slide.desc;
      btn.innerHTML = slide.actionText;
      btn.href = slide.actionLink;

      // Re-trigger Ken-Burns zoom on change
      bgImg.classList.remove("kenburns-active");
      void bgImg.offsetWidth; // force reflow
      bgImg.classList.add("kenburns-active");

      // Slidedots re-render
      dotsContainer.innerHTML = "";
      HERO_SLIDES.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = `w-3 h-3 rounded-full cursor-pointer transition ${
          idx === this.currentHeroSlide ? "bg-blue-600 scale-125" : "bg-white/30 hover:bg-white/50"
        }`;
        dot.onclick = () => {
          this.currentHeroSlide = idx;
          this.renderHeroSlide();
        };
        dotsContainer.appendChild(dot);
      });
    }
  },

  nextHeroSlide: function() {
    this.currentHeroSlide = (this.currentHeroSlide + 1) % HERO_SLIDES.length;
    this.renderHeroSlide();
  },

  prevHeroSlide: function() {
    this.currentHeroSlide = (this.currentHeroSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    this.renderHeroSlide();
  },


  // --- SCANNER DIAGNOSTICS IMPLEMENTATION ---
  switchScanTab: function(tabName) {
    this.activeScanTab = tabName;
    
    // Reset indicators
    document.getElementById("tab-btn-file").className = "flex-1 py-1.5 text-center text-xs font-bold rounded-xl cursor-pointer transition text-slate-500 hover:text-slate-800";
    document.getElementById("tab-btn-camera").className = "flex-1 py-1.5 text-center text-xs font-bold rounded-xl cursor-pointer transition text-slate-500 hover:text-slate-800";
    document.getElementById("tab-btn-presets").className = "flex-1 py-1.5 text-center text-xs font-bold rounded-xl cursor-pointer transition text-slate-500 hover:text-slate-800";

    const activeTabBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeTabBtn) {
      activeTabBtn.className = "flex-1 py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition bg-white text-slate-900 shadow-md";
    }

    // Hide viewport sub-panels
    document.getElementById("panel-file").classList.add("hidden");
    document.getElementById("panel-camera").classList.add("hidden");
    document.getElementById("panel-presets").classList.add("hidden");

    // Clear active cameras on tab modification
    this.stopCameraStream();

    if (tabName === "file") {
      document.getElementById("panel-file").classList.remove("hidden");
    } else if (tabName === "camera") {
      document.getElementById("panel-camera").classList.remove("hidden");
      this.startCameraStream();
    } else if (tabName === "presets") {
      document.getElementById("panel-presets").classList.remove("hidden");
    }
  },

  startCameraStream: async function() {
    const video = document.getElementById("camera-video");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      this.activeCameraStream = stream;
      if (video) {
        video.srcObject = stream;
      }
    } catch (e) {
      alert("Unable to access front or rear camera. Falling back to File or Preset Tab.");
      this.switchScanTab("file");
    }
  },

  stopCameraStream: function() {
    if (this.activeCameraStream) {
      this.activeCameraStream.getTracks().forEach(track => track.stop());
      this.activeCameraStream = null;
    }
  },

  captureCameraPhoto: function() {
    const video = document.getElementById("camera-video");
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL("image/jpeg");
    this.showCapturedPreview(base64Data);
  },

  loadPreset: function(presetUrl) {
    this.showCapturedPreview(presetUrl);
  },

  handleFilePick: function(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.showCapturedPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  },

  showCapturedPreview: function(imageSrc) {
    this.capturedImageBase64 = imageSrc;
    this.stopCameraStream();

    // Show preview panel frame
    document.getElementById("panel-file").classList.add("hidden");
    document.getElementById("panel-camera").classList.add("hidden");
    document.getElementById("panel-presets").classList.add("hidden");
    
    const previewPanel = document.getElementById("panel-preview");
    previewPanel.classList.remove("hidden");
    
    document.getElementById("scanned-image-view").src = imageSrc;
  },

  resetViewport: function() {
    this.capturedImageBase64 = null;
    document.getElementById("panel-preview").classList.add("hidden");
    document.getElementById("scanner-laser").classList.add("hidden");
    this.switchScanTab(this.activeScanTab);
  },

  triggerVisionAnalysis: async function() {
    if (!this.capturedImageBase64) {
      alert("Please upload, snap, or select a preset sample first.");
      return;
    }

    const progressDiv = document.getElementById("scanner-loading");
    const progressTxt = document.getElementById("scanner-progress-text");
    const progressSub = document.getElementById("scanner-progress-sub");
    const laser = document.getElementById("scanner-laser");

    progressDiv.classList.remove("hidden");
    laser.classList.remove("hidden");

    // Artificial diagnostic delays representing premium AI parsing
    const steps = [
      { text: "INGESTING IMAGE COORDINATES...", sub: "Verifying focal brightness..." },
      { text: "SEGMENTING SPECIES SHARDS...", sub: "Model running deep analysis..." },
      { text: "ANALYZING SURFICIAL LESIONS...", sub: "Scanners tracking wound patterns..." },
      { text: "RESOLVING CLINICAL TELEMETRY...", sub: "Compiling first-aid steps..." }
    ];

    for (let i = 0; i < steps.length; i++) {
      progressTxt.innerHTML = steps[i].text;
      progressSub.innerHTML = steps[i].sub;
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      const response = await fetch("/api/scan-animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: this.capturedImageBase64 })
      });

      if (!response.ok) throw new Error("Vision server error");
      const result = await response.json();
      
      this.renderVisionResult(result.data, result.source);
    } catch (e) {
      alert("Encountered connection delays. Loading simulated backup analyzer parameters.");
      // Simulated sandbox mock fallback
      this.renderVisionResult({
        animalType: "Dog",
        breed: "Indian Pariah / Stray Mix",
        healthDetected: "Sarcoptic Mange Dermatitis",
        severity: "moderate",
        emergencyAlert: false,
        firstAid: [
          "Administer antiseptic washes mixed with fresh neem leaves extracts.",
          "Keep diet filled with nutritious lipids/omega oils to trigger hair recovery.",
          "Prevent direct skin interactions with human kids until vet isolation is complete."
        ],
        suggestedAction: "Contact the local metro medical station to file a treatment ticket.",
        nearbyResources: [
          { name: "PAWS Vet Center", type: "First Station", distance: "2.1 km", phone: "1962 / +91 98111" }
        ]
      }, "PawGuard Offline Diagnostics Backup - Simulation (Local Sandbox)");
    } finally {
      progressDiv.classList.add("hidden");
      laser.classList.add("hidden");
    }
  },

  renderVisionResult: function(data, sourceName) {
    document.getElementById("scanner-empty-card").classList.add("hidden");
    
    const resultCard = document.getElementById("scanner-result-card");
    resultCard.classList.remove("hidden");

    const severityColor = 
      data.severity === "critical" ? "text-red-500 bg-red-950 border-red-800" :
      data.severity === "moderate" ? "text-orange-500 bg-amber-950 border-amber-900" : "text-emerald-500 bg-emerald-950 border-emerald-900";

    const localResList = data.nearbyResources ? data.nearbyResources.map(r => `
      <div class="p-2 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
        <div>
          <span class="font-extrabold text-[#2563EB] block">${r.name}</span>
          <span class="text-[9px] text-slate-400 font-sans uppercase">${r.type} • Dist: ${r.distance}</span>
        </div>
        <a href="tel:${r.phone}" class="p-1 px-3.5 bg-red-650 hover:bg-red-500 border border-white/10 text-white rounded-lg text-[9px] font-bold transition flex items-center gap-1">
          📞 CALL
        </a>
      </div>
    `).join("") : "";

    const firstAidBullets = data.firstAid ? data.firstAid.map(f => `
      <li class="flex items-start text-xs font-light space-x-2 text-slate-300">
        <span class="text-blue-500 mr-1 shrink-0">🩹</span>
        <span>${f}</span>
      </li>
    `).join("") : "";

    resultCard.innerHTML = `
      <div>
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h4 class="font-display font-black text-xl text-white">Clinical Telemetry</h4>
            <p class="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">${sourceName}</p>
          </div>
          <span class="text-xs font-mono font-bold uppercase py-1 px-3.5 rounded-full border ${severityColor}">
            ${data.severity}
          </span>
        </div>

        <div class="space-y-4 mt-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-white/5 border border-white/15 rounded-2xl">
              <span class="text-[9px] font-mono text-slate-400 block uppercase">Species & Group</span>
              <span class="text-xs font-bold text-white block mt-0.5">${data.animalType}</span>
              <span class="text-[10px] text-slate-300 font-mono block">${data.breed}</span>
            </div>
            <div class="p-3 bg-white/5 border border-white/15 rounded-2xl">
              <span class="text-[9px] font-mono text-slate-400 block uppercase">Diagnosed Issue</span>
              <span class="text-xs font-bold text-red-400 block mt-0.5">${data.healthDetected}</span>
            </div>
          </div>

          <!-- First Aid Rules -->
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h5 class="text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-2">Precautionary First Aid</h5>
            <ul class="space-y-2">
              ${firstAidBullets}
            </ul>
          </div>

          <!-- Closest Local ambulance -->
          <div class="space-y-2">
            <h5 class="text-xs font-bold font-display uppercase tracking-wider text-slate-400">Recommended Rescuers</h5>
            <div class="space-y-2">
              ${localResList}
            </div>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-white/10 mt-6 md:mt-0">
        <button onclick="window.state.transferDataToForm('${data.animalType}', '${data.breed}', '${data.healthDetected}', '${data.severity}')" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5">
          <i data-lucide="arrow-right" class="w-4 h-4"></i> Map This Emergency Distress Ticket
        </button>
      </div>
    `;

    lucide.createIcons();
  },

  transferDataToForm: function(type, breed, issue, severity) {
    document.getElementById("form-animal-type").value = type;
    document.getElementById("form-breed").value = breed;
    document.getElementById("form-health").value = issue;
    this.selectFormSeverity(severity || "low");

    // Scroll smoothly to reporter form
    document.getElementById("reporter").scrollIntoView({ behavior: "smooth" });
  },


  // --- REPORTING SYSTEM ACTIONS & TRIAGE ---
  fetchReports: async function() {
    try {
      const response = await fetch("/api/rescue-reports");
      if (!response.ok) throw new Error("HTTP error list fetch failed");
      const list = await response.json();
      this.reports = list;
      this.renderReportsList();
      
      // Update dynamic leaflets map coordinates
      this.updateMapMarkers();
    } catch (e) {
      console.error("Failed loading active queue:", e);
    }
  },

  selectFormSeverity: function(level) {
    this.activeFormSeverity = level;
    
    // Reset selection styles
    document.getElementById("lbl-sev-low").className = "flex items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer select-none text-xs font-bold text-slate-700 font-display transition";
    document.getElementById("lbl-sev-moderate").className = "flex items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer select-none text-xs font-bold text-slate-700 font-display transition";
    document.getElementById("lbl-sev-critical").className = "flex items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer select-none text-xs font-bold text-slate-700 font-display transition";

    const selectedBtn = document.getElementById(`lbl-sev-${level}`);
    if (selectedBtn) {
      if (level === "critical") {
        selectedBtn.className = "flex items-center justify-center py-2.5 bg-red-650 hover:bg-red-700 border border-red-500 rounded-xl cursor-pointer select-none text-xs font-bold text-white font-display transition";
      } else if (level === "moderate") {
        selectedBtn.className = "flex items-center justify-center py-2.5 bg-amber-500 hover:bg-amber-600 border border-amber-400 rounded-xl cursor-pointer select-none text-xs font-bold text-white font-display transition";
      } else {
        selectedBtn.className = "flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-xl cursor-pointer select-none text-xs font-bold text-white font-display transition";
      }
    }
  },

  captureGpsFeedback: function() {
    // Simulated browser GPS lock
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.autoCapturedGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        document.getElementById("gps-cap-feedback").classList.remove("hidden");
      },
      () => {
        // Fallback Delhi coordinate
        this.autoCapturedGps = { lat: 28.5355 + (Math.random() - 0.5) * 0.05, lng: 77.3910 + (Math.random() - 0.5) * 0.05 };
        document.getElementById("gps-cap-feedback").classList.remove("hidden");
      }
    );
  },

  submitReportForm: async function(event) {
    event.preventDefault();

    const animalType = document.getElementById("form-animal-type").value;
    const breed = document.getElementById("form-breed").value || "Indie Mix";
    const healthStatus = document.getElementById("form-health").value;
    const location = document.getElementById("form-location").value;
    const description = document.getElementById("form-description").value;
    const reporterName = document.getElementById("form-reporter-name").value;
    const reporterContact = document.getElementById("form-reporter-contact").value;

    const payload = {
      animalType,
      breed,
      healthStatus,
      severity: this.activeFormSeverity,
      location,
      description,
      reporterName,
      reporterContact,
      imageUrl: this.capturedImageBase64,
      gpsCoordinates: this.autoCapturedGps
    };

    try {
      const response = await fetch("/api/rescue-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Filing report failed");
      
      const newReport = await response.json();
      
      // Clear forms
      document.getElementById("report-form").reset();
      document.getElementById("gps-cap-feedback").classList.add("hidden");
      this.autoCapturedGps = null;
      this.capturedImageBase64 = null;

      // Re-trigger visual alert notification
      alert(`Success! Triage Emergency Incident Ticket created: ${newReport.ticketNumber}`);
      
      // Auto-reload lists and maps
      await this.fetchReports();
      await this.fetchAnalytics();
    } catch (e) {
      console.error(e);
      alert("Error submitting coordinates. Please verify local connectivity.");
    }
  },

  updateTriageReportStatus: async function(ticketId, newStatus) {
    try {
      const response = await fetch(`/api/rescue-reports/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Status updating failed");
      
      await this.fetchReports();
      await this.fetchAnalytics();
    } catch (e) {
      alert("Status synchronization failing.");
    }
  },

  renderReportsList: function() {
    const listContainer = document.getElementById("reports-queue-list");
    if (!listContainer) return;

    if (this.reports.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 p-6 text-slate-400 text-xs">
          🚫 No incident distress reports present in this region.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.reports.map((item) => {
      const sevClass = 
        item.severity === "critical" ? "text-red-600 bg-red-100 border-red-200" :
        item.severity === "moderate" ? "text-orange-500 bg-orange-100 border-orange-200" : "text-blue-600 bg-blue-100 border-blue-200";

      const statusColors = {
        "Reported": "bg-slate-100 text-slate-800 border-slate-200",
        "Dispatched": "bg-amber-100 text-amber-900 border-amber-200 animate-pulse",
        "In-Rescue": "bg-blue-100 text-blue-900 border-blue-200",
        "Recovered": "bg-emerald-100 text-emerald-900 border-emerald-200"
      };

      const statusBadge = `<span class="border text-[9px] font-mono tracking-wider font-extrabold uppercase py-1 px-3 rounded-full ${statusColors[item.status] || "bg-slate-100"} shrink-0">${item.status}</span>`;

      // Authorized controls viewable only by Vet Rescuers (NGO / Gov / System)
      const isAuthorizedRole = ["NGO", "Govt", "System"].includes(this.currentRole);
      
      const roleAdminActions = isAuthorizedRole ? `
        <div class="flex flex-wrap gap-2.5 pt-4 mt-4 border-t border-slate-100 items-center">
          <span class="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest shrink-0">DISPATCH CONTROL STATION:</span>
          ${item.status === "Reported" ? `
            <button onclick="window.state.updateTriageReportStatus('${item.ticketNumber}', 'Dispatched')" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-bold text-[9px] rounded-xl cursor-pointer shadow-md transition uppercase tracking-wider active:scale-95">Dispatch Nurse Ambulance</button>
          ` : ""}
          ${item.status === "Dispatched" ? `
            <button onclick="window.state.updateTriageReportStatus('${item.ticketNumber}', 'In-Rescue')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-bold text-[9px] rounded-xl cursor-pointer shadow-md transition uppercase tracking-wider active:scale-95">Start Clinical Ward Care</button>
          ` : ""}
          ${item.status === "In-Rescue" ? `
            <button onclick="window.state.updateTriageReportStatus('${item.ticketNumber}', 'Recovered')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-bold text-[9px] rounded-xl cursor-pointer shadow-md transition uppercase tracking-wider active:scale-95">Mark Recovered</button>
          ` : ""}
          ${item.status === "Recovered" ? `
            <span class="text-[10px] text-emerald-650 font-mono font-bold flex items-center gap-1">🟢 Clinical Recovery Completed successfully</span>
          ` : ""}
        </div>
      ` : "";

      return `
        <div class="py-5" id="ticket-${item.ticketNumber}">
          <div class="flex items-start justify-between gap-4">
            
            <div class="flex items-start space-x-4">
              <!-- Thumbnail preview image display -->
              <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                <img src="${item.imageUrl}" class="w-full h-full object-cover" />
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-display font-black text-slate-900 text-base">${item.animalType}</span>
                  <span class="text-[10px] font-mono text-[#2563EB] bg-blue-50 py-0.5 px-2 rounded-md font-semibold">${item.breed}</span>
                  <span class="text-[9px] border font-mono font-bold px-2 py-0.5 rounded-full ${sevClass}">${item.severity}</span>
                </div>
                
                <h6 class="text-xs text-red-500 font-mono font-semibold mt-1">Diagnosis: ${item.healthStatus}</h6>
                <p class="text-xs text-slate-500 leading-relaxed font-light mt-1.5">${item.description}</p>
                
                <div class="flex flex-wrap items-center text-[10px] text-slate-400 gap-x-4 mt-2 font-mono">
                  <span>Location Landmark: <strong>${item.location}</strong></span>
                  <span>Ticket reference: <strong>${item.ticketNumber}</strong></span>
                </div>
              </div>

            </div>

            <!-- Ticket control panel: Status and print buttons -->
            <div class="flex flex-col items-end space-y-2 shrink-0">
              ${statusBadge}
              
              <button onclick="window.state.triggerQrCodeModal('${item.ticketNumber}')" class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-xl cursor-pointer transition select-none flex items-center gap-1 active:scale-95 shadow-sm">
                <i data-lucide="qr-code" class="w-3.5 h-3.5 text-slate-500"></i> QR Beacon
              </button>
            </div>

          </div>

          ${roleAdminActions}

        </div>
      `;
    }).join("");

    lucide.createIcons();
  },


  // --- PRINTABLE QR DISPATCH MODAL HANDLERS ---
  triggerQrCodeModal: function(ticketId) {
    const report = this.reports.find(r => r.ticketNumber === ticketId);
    if (!report) return;

    const modal = document.getElementById("qr-modal");
    modal.classList.remove("hidden");

    // Dynamic origin-aware QR target links to trigger the authorized Field Portal Gate directly
    const origin = window.location.origin + window.location.pathname;
    const absoluteWeblink = `${origin}?ticket=${report.ticketNumber}`;

    // Highly reliable, ultra-fast Google QR API
    const qrImageSource = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(absoluteWeblink)}`;
    
    document.getElementById("qr-beacon-image").src = qrImageSource;
    document.getElementById("qr-ticket-id").innerHTML = report.ticketNumber;
    document.getElementById("qr-ticket-species").innerHTML = report.animalType;
    document.getElementById("qr-ticket-severity").innerHTML = report.severity;
    document.getElementById("trans-landmark-meta").innerHTML = report.location;

    lucide.createIcons();
  },

  closeQrModal: function() {
    document.getElementById("qr-modal").classList.add("hidden");
  },


  // --- AUTHORIZED FIELD PORTAL INGRESS CONTROLLER ---
  triggerFieldPortal: async function(ticketNumber) {
    const wrapper = document.getElementById("field-portal-wrapper");
    wrapper.classList.remove("hidden");

    const contentDiv = document.getElementById("field-portal-content");
    contentDiv.innerHTML = `
      <div class="col-span-2 text-center py-6">
        <div class="w-8 h-8 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin mx-auto mb-4"></div>
        <p class="text-xs text-slate-400 font-mono">Triage Tunnel Sync Active...</p>
      </div>
    `;

    // Smooth focal center scroll
    wrapper.scrollIntoView({ behavior: "smooth" });

    try {
      const response = await fetch(`/api/rescue-reports/${ticketNumber}`);
      if (!response.ok) throw new Error("Ticket not discovered");

      const doc = await response.json();
      
      const mapLink = doc.gpsCoordinates 
        ? `https://www.google.com/maps/search/?api=1&query=${doc.gpsCoordinates.lat},${doc.gpsCoordinates.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.location)}`;

      const statusColors = {
        "Reported": "bg-slate-800 text-slate-300 border-slate-700",
        "Dispatched": "text-amber-400 bg-amber-950 border-amber-900 animate-pulse",
        "In-Rescue": "text-blue-400 bg-blue-950 border-blue-900",
        "Recovered": "text-emerald-400 bg-emerald-950 border-emerald-900"
      };

      contentDiv.innerHTML = `
        <!-- Left specs -->
        <div>
          <div class="flex items-center space-x-3 flex-wrap">
            <h3 class="text-2xl font-display font-black text-white">${doc.animalType} <span class="text-xs font-mono font-normal text-zinc-500">mix</span></h3>
            <span class="text-[10px] font-mono py-1 px-3.5 border rounded-full font-bold uppercase ${statusColors[doc.status] || "bg-slate-850"}" id="portal-status-badge-${doc.ticketNumber}">${doc.status}</span>
          </div>
          
          <div class="mt-4 p-4.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2.5 font-sans">
            <p class="text-xs text-slate-300 leading-relaxed font-light"><strong class="font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Clinical Issue</strong> ${doc.healthStatus}</p>
            <p class="text-xs text-slate-300 leading-relaxed font-light"><strong class="font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Incident landmarks Description</strong> ${doc.description}</p>
            <p class="text-xs text-slate-300 leading-relaxed font-light"><strong class="font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Reporter citizen contact name</strong> ${doc.reporterName} (<span class="font-mono text-blue-400">${doc.reporterContact}</span>)</p>
          </div>

          <a href="${mapLink}" target="_blank" class="mt-6 inline-flex items-center space-x-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold font-display uppercase tracking-wider text-white rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
            <i data-lucide="navigation" class="w-4 h-4 text-emerald-400"></i> Open GPS in Google Maps
          </a>
        </div>

        <!-- Right actions -->
        <div class="flex flex-col space-y-4">
          <h4 class="font-display font-extrabold text-sm text-zinc-400 uppercase tracking-wider">Deploy Station Updates</h4>
          <div class="grid grid-cols-2 gap-3.5">
            <button onclick="window.state.updateFieldPortalStatus('${doc.ticketNumber}', 'Dispatched')" class="py-4 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold font-display text-xs tracking-wider uppercase transition shadow-md active:scale-95 cursor-pointer">
              Dispatched Van
            </button>
            <button onclick="window.state.updateFieldPortalStatus('${doc.ticketNumber}', 'In-Rescue')" class="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold font-display text-xs tracking-wider uppercase transition shadow-md active:scale-95 cursor-pointer">
              Clinical Ward Care
            </button>
            <button onclick="window.state.updateFieldPortalStatus('${doc.ticketNumber}', 'Recovered')" class="py-4 col-span-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold font-display text-xs tracking-wider uppercase transition shadow-lg active:scale-95 cursor-pointer">
              Discharged & Stable
            </button>
          </div>
          <p class="text-[10px] text-zinc-500 italic text-center font-mono leading-relaxed mt-1">Station coordinates will align instantly across municipal registers upon clicking.</p>
          
          <div class="border-t border-slate-800/60 pt-3 flex flex-col">
            <button onclick="window.state.startFieldQrScanner()" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-650 hover:to-amber-700 text-white font-bold font-display text-xs rounded-xl cursor-pointer shadow-md transition uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95">
              <i data-lucide="qr-code" class="w-4 h-4"></i> Scan Another Printed Tag QR
            </button>
          </div>
        </div>
      `;

      lucide.createIcons();
    } catch (e) {
      contentDiv.innerHTML = `
        <div class="col-span-2 text-center py-6 text-red-400">
          ⚠️ Discovered ticket reference expired or connection timed out.
        </div>
      `;
    }
  },

  updateFieldPortalStatus: async function(ticketId, newStatus) {
    try {
      const response = await fetch(`/api/rescue-reports/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Sync update error");

      alert(`Success! Triage Status updated to: ${newStatus}`);
      this.triggerFieldPortal(ticketId); // Re-render state

      // Reload global tracking registers
      await this.fetchReports();
    } catch (e) {
      alert("State update failure.");
    }
  },

  closeFieldPortal: function() {
    document.getElementById("field-portal-wrapper").classList.add("hidden");
    // Purge URL query state beautifully
    const origin = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, origin);

    // Stop any active scanners
    if (this.fieldQrInterval) {
      clearInterval(this.fieldQrInterval);
      this.fieldQrInterval = null;
    }
    if (this.fieldQrStream) {
      this.fieldQrStream.getTracks().forEach(track => track.stop());
      this.fieldQrStream = null;
    }
  },

  // --- FIELD OFFICER DEFAULT ENTRY VIEW ---
  triggerFieldPortalDefault: function() {
    const wrapper = document.getElementById("field-portal-wrapper");
    wrapper.classList.remove("hidden");
    wrapper.scrollIntoView({ behavior: "smooth" });

    // Clean any prior streams
    if (this.fieldQrInterval) {
      clearInterval(this.fieldQrInterval);
      this.fieldQrInterval = null;
    }
    if (this.fieldQrStream) {
      this.fieldQrStream.getTracks().forEach(track => track.stop());
      this.fieldQrStream = null;
    }

    const contentDiv = document.getElementById("field-portal-content");
    contentDiv.innerHTML = `
      <div class="col-span-2 flex flex-col items-center justify-center text-center py-10 px-4">
        <div class="w-16 h-16 rounded-[24px] bg-amber-500/10 border-2 border-dashed border-amber-500/40 flex items-center justify-center mb-6 text-3xl">
          🛡️
        </div>
        <h3 class="font-display font-black text-2xl text-white">Authorized Field Officer Portal</h3>
        <p class="text-xs text-slate-450 mt-2 max-w-lg leading-relaxed font-light">
          Official PawGuard Field Beacon Sync. Scan printed collar QR tags on stray animals to instantly pull up coordinates, first-aid reports, and dispatch status updates on-site.
        </p>
        
        <!-- Interactive Scan & Lookup Options Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-8">
          
          <!-- Option 1: Live QR Scanner -->
          <button onclick="window.state.startFieldQrScanner()" class="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition cursor-pointer group active:scale-98">
            <div class="w-12 h-12 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center mb-3 text-orange-400 group-hover:scale-105 transition">
              <i data-lucide="camera" class="w-6 h-6"></i>
            </div>
            <span class="text-xs font-bold font-display text-white">Camera Scanner</span>
            <span class="text-[9px] text-zinc-550 mt-1 uppercase font-mono">Scan printed tag QR</span>
          </button>

          <!-- Option 2: Image File Upload QR Decoder -->
          <button onclick="document.getElementById('field-qr-file-input').click()" class="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition cursor-pointer group active:scale-98">
            <input type="file" id="field-qr-file-input" accept="image/*" class="hidden" onchange="window.state.handleFieldQrFile(this)" />
            <div class="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mb-3 text-blue-400 group-hover:scale-105 transition">
              <i data-lucide="hard-drive" class="w-6 h-6"></i>
            </div>
            <span class="text-xs font-bold font-display text-white">Upload QR Image</span>
            <span class="text-[9px] text-zinc-550 mt-1 uppercase font-mono">Select image file</span>
          </button>

          <!-- Option 3: Manual Input -->
          <div class="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition">
            <div class="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400">
              <i data-lucide="hash" class="w-6 h-6"></i>
            </div>
            <span class="text-xs font-bold font-display text-white mb-2">Manual Lookup</span>
            <div class="flex w-full mt-1">
              <input type="text" id="manual-ticket-input" placeholder="PWG-2026-001" class="w-full text-center bg-slate-905 border border-slate-800 text-white font-mono text-[10px] rounded-l-xl py-1.5 px-2 focus:outline-none focus:border-blue-500 uppercase tracking-wider" />
              <button onclick="window.state.manualTicketLookup()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-r-xl font-mono text-[10px] font-bold active:scale-95 transition">GO</button>
            </div>
          </div>

        </div>
      </div>
    `;

    lucide.createIcons();
  },

  // --- REAL-TIME CAMERA SCANNING ---
  startFieldQrScanner: async function() {
    const contentDiv = document.getElementById("field-portal-content");
    contentDiv.innerHTML = `
      <div class="col-span-2 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-850 w-full max-w-lg mx-auto">
        <div class="flex items-center justify-between w-full mb-5">
          <div class="flex items-center space-x-2">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <h4 class="font-display font-bold text-sm text-white uppercase tracking-wider">Live Printed Tag QR Scanner</h4>
          </div>
          <button onclick="window.state.stopFieldQrScanner()" class="text-zinc-450 hover:text-white transition p-1.5 bg-slate-900 rounded-full hover:bg-slate-850 cursor-pointer">
            <i data-lucide="x" class="w-4.5 h-4.5"></i>
          </button>
        </div>

        <!-- Live video container with aiming guides -->
        <div class="relative w-full aspect-square max-w-xs bg-black rounded-2xl overflow-hidden border border-slate-800">
          <video id="field-qr-video" class="w-full h-full object-cover" autoplay playsinline muted></video>
          
          <!-- Targeting visual guides -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-48 h-48 border-4 border-dashed border-orange-500/70 rounded-3xl relative flex items-center justify-center">
              <!-- Laser scanner horizontal line effect -->
              <div class="absolute top-0 inset-x-0 h-1.5 bg-orange-500 shadow-[0_0_12px_#EA580C] animate-scanner-beam"></div>
            </div>
          </div>

          <!-- Active status overlay -->
          <div class="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-center font-mono text-[9px] text-slate-300">
            Align official printed tag or collar QR inside box
          </div>
        </div>

        <div class="mt-5 flex flex-col items-center space-y-1 text-center">
          <p id="field-qr-status" class="text-xs text-orange-400 font-mono font-medium animate-pulse">Requesting video capture permissions...</p>
          <p class="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Accept camera popup to initiate lens sync</p>
        </div>
      </div>
    `;

    lucide.createIcons();

    try {
      this.fieldQrStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      const video = document.getElementById("field-qr-video");
      if (video) {
        video.srcObject = this.fieldQrStream;
        video.setAttribute("playsinline", true);
        video.play();
      }
      
      const statusLbl = document.getElementById("field-qr-status");
      if (statusLbl) {
        statusLbl.innerHTML = "📸 Lens Sync Active. Align printed QR tag...";
        statusLbl.className = "text-xs text-emerald-400 font-mono font-medium";
      }

      this.fieldQrInterval = setInterval(() => {
        this.processFieldQrFrame();
      }, 150);

    } catch (err) {
      console.error("Camera capture denied:", err);
      const statusLbl = document.getElementById("field-qr-status");
      if (statusLbl) {
        statusLbl.innerHTML = "⚠️ Camera Blocked or Unavailable. Please upload QR image or search manually.";
        statusLbl.className = "text-xs text-red-400 font-mono font-medium font-sans px-4";
      }
    }
  },

  stopFieldQrScanner: function() {
    if (this.fieldQrInterval) {
      clearInterval(this.fieldQrInterval);
      this.fieldQrInterval = null;
    }
    if (this.fieldQrStream) {
      this.fieldQrStream.getTracks().forEach(track => track.stop());
      this.fieldQrStream = null;
    }
    this.triggerFieldPortalDefault();
  },

  processFieldQrFrame: function() {
    const video = document.getElementById("field-qr-video");
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (typeof jsQR !== "undefined") {
      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "dontInvert"
      });
      
      if (code && code.data) {
        const ticket = this.extractTicketFromQr(code.data);
        if (ticket) {
          // Play standard micro-beep using native Web Audio API
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 1100; // high success beep
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
          } catch(ae) {}

          // Stop scanner loop
          if (this.fieldQrInterval) {
            clearInterval(this.fieldQrInterval);
            this.fieldQrInterval = null;
          }
          if (this.fieldQrStream) {
            this.fieldQrStream.getTracks().forEach(track => track.stop());
            this.fieldQrStream = null;
          }

          const statusLbl = document.getElementById("field-qr-status");
          if (statusLbl) {
            statusLbl.innerHTML = `✅ DECODED: ${ticket}! Accessing telemetry...`;
            statusLbl.className = "text-xs text-emerald-400 font-black font-mono";
          }

          setTimeout(() => {
            this.triggerFieldPortal(ticket);
          }, 600);
        }
      }
    }
  },

  // --- QR TICKET EXTRACTION UTILITY ---
  extractTicketFromQr: function(decodedString) {
    if (!decodedString) return null;
    const match = decodedString.match(/PWG-\d{4}-\d+/i) || decodedString.match(/PWG-[A-Za-z0-9-]+/i);
    return match ? match[0].toUpperCase() : null;
  },

  // --- PHOTO IMAGE FILE QR SCANNING FALLBACK ---
  handleFieldQrFile: function(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (typeof jsQR !== "undefined") {
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            const ticket = this.extractTicketFromQr(code.data);
            if (ticket) {
              // Successfully decoded
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = 1100;
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
              } catch(ae) {}
              
              alert(`Decoded printed tag QR: ${ticket}. Accessing telemetry data...`);
              this.triggerFieldPortal(ticket);
            } else {
              alert("No valid PawGuard Incident Ticket (PWG-xxxx-xxx) decoded from this QR code.");
            }
          } else {
            alert("No QR Code discovered in this image file. Please align clearly and upload again.");
          }
        } else {
          alert("Awaiting jsQR decoder script. Please wait a moment and try again.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  // --- MANUAL SEARCH ---
  manualTicketLookup: function() {
    const input = document.getElementById("manual-ticket-input");
    if (!input) return;
    
    const ticketId = input.value.trim().toUpperCase();
    if (ticketId) {
      this.triggerFieldPortal(ticketId);
    } else {
      alert("Please input a valid PawGuard Ticket ID (e.g., PWG-2026-001)");
    }
  },


  // --- INTERACTIVE MAP RENDERING (Leaflet Integration) ---
  initMap: function() {
    const mapDiv = document.getElementById("leaflet-map");
    if (!mapDiv) return;

    // Connect OpenStreetMap tiles
    this.mapInstance = L.map('leaflet-map').setView([this.focalLatLng.lat, this.focalLatLng.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map &copy; OpenStreetMap volunteers'
    }).addTo(this.mapInstance);

    this.mapMarkersGroup = L.layerGroup().addTo(this.mapInstance);

    this.renderLocalityList();
    this.updateMapMarkers();
  },

  renderLocalityList: function() {
    const localitiesBox = document.getElementById("map-localities-selector");
    if (!localitiesBox) return;

    localitiesBox.innerHTML = LOCALITIES.map((loc) => {
      // Haversine metrics from focal focus point
      const R = 6371; // Earth KM
      const dLat = (loc.lat - this.focalLatLng.lat) * Math.PI / 180;
      const dLon = (loc.lng - this.focalLatLng.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.focalLatLng.lat * Math.PI / 180) *
          Math.cos(loc.lat * Math.PI / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = (R * c).toFixed(1);

      return `
        <button onclick="window.state.changeFocusLocality('${loc.name}', ${loc.lat}, ${loc.lng})" class="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-slate-100/90 border border-slate-200 transition-all flex items-center justify-between font-display text-xs group cursor-pointer">
          <div>
            <span class="font-bold text-slate-800 group-hover:text-[#2563EB] transition block">${loc.name}</span>
            <span class="text-[9px] text-slate-400 font-mono uppercase mt-0.5">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</span>
          </div>
          <span class="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 py-1 px-2.5 rounded-lg shrink-0">${distance} km</span>
        </button>
      `;
    }).join("");
  },

  changeFocusLocality: function(name, lat, lng) {
    this.focalLocationName = name;
    this.focalLatLng = { lat, lng };

    this.mapInstance.setView([lat, lng], 13);
    
    this.renderLocalityList();
    this.updateMapMarkers();
  },

  updateMapMarkers: function() {
    if (!this.mapInstance || !this.mapMarkersGroup) return;

    // Purge prior pointers
    this.mapMarkersGroup.clearLayers();
    if (this.mapPolyline) {
      this.mapInstance.removeLayer(this.mapPolyline);
      this.mapPolyline = null;
    }

    // Connect user focus pointer
    const userIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping bg-blue-400"></span>
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white text-white shadow-2xl bg-blue-600">
            👑
          </div>
        </div>
      `,
      iconSize: [30, 30]
    });

    L.marker([this.focalLatLng.lat, this.focalLatLng.lng], { icon: userIcon })
      .bindPopup(`<strong class="font-display">Focal Station:</strong><br/>${this.focalLocationName}`)
      .addTo(this.mapMarkersGroup);

    // Merge static system assets with registered rescue cases
    const mergedAssets = [...STATIC_MAP_ASSETS];
    this.reports.forEach((item) => {
      if (item.gpsCoordinates) {
        mergedAssets.push({
          id: item.ticketNumber,
          type: "stray_reported",
          name: `${item.animalType} distressed (${item.ticketNumber})`,
          lat: item.gpsCoordinates.lat,
          lng: item.gpsCoordinates.lng,
          address: item.location,
          contact: item.reporterName
        });
      }
    });

    let nearestItem = null;
    let minDistance = Infinity;

    mergedAssets.forEach((asset) => {
      // Haversine calculations
      const R = 6371;
      const dLat = (asset.lat - this.focalLatLng.lat) * Math.PI / 180;
      const dLon = (asset.lng - this.focalLatLng.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.focalLatLng.lat * Math.PI / 180) *
          Math.cos(asset.lat * Math.PI / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance < minDistance) {
        minDistance = distance;
        nearestItem = { ...asset, distance: distance.toFixed(1) };
      }

      // Generate custom emojis indicators based on categories
      const emojiMap = {
        "ngo": "🏠",
        "hospital": "🏥",
        "ambulance": "🚑",
        "stray_reported": "🚨"
      };

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full border border-white text-white shadow-lg bg-orange-500">
              <span class="text-xs select-none">${emojiMap[asset.type] || "📍"}</span>
            </div>
          </div>
        `,
        iconSize: [25, 25]
      });

      L.marker([asset.lat, asset.lng], { icon: customIcon })
        .bindPopup(`
          <strong class="font-display font-black text-sm text-slate-800">${asset.name}</strong><br/>
          <span class="text-xs text-slate-500 mt-1 block">Landmark: ${asset.address}</span>
          <span class="text-[10px] font-mono text-[#2563EB] font-bold block mt-1">Distance: ${distance.toFixed(1)} km</span>
        `)
        .addTo(this.mapMarkersGroup);
    });

    // Draw routing line to closest asset dynamically
    if (nearestItem) {
      const linePoints = [
        [this.focalLatLng.lat, this.focalLatLng.lng],
        [nearestItem.lat, nearestItem.lng]
      ];
      this.mapPolyline = L.polyline(linePoints, { color: '#00D1FF', weight: 4, dashArray: "10, 10" }).addTo(this.mapInstance);

      // Render details in sidebar panel
      const detailContainer = document.getElementById("map-nearest-sidebar");
      if (detailContainer) {
        detailContainer.innerHTML = `
          <span class="text-[9px] font-mono text-[#2563EB] bg-blue-100 font-extrabold uppercase py-1 px-3 rounded-full mb-3 inline-block tracking-widest">
            🛡️ NEAREST CO-RESPONDER
          </span>
          <h4 class="font-display font-black text-slate-900 text-[15px]">${nearestItem.name}</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">${nearestItem.address}</p>
          <div class="flex items-center justify-between bg-slate-100/70 py-2 px-3.5 rounded-xl border border-slate-200/80 text-xs mt-4">
            <span class="font-mono font-bold text-slate-700">Distance Ratio:</span>
            <span class="font-mono text-emerald-650 font-black">${nearestItem.distance} KM</span>
          </div>
        `;
      }
    }
  },


  // --- DYNAMIC METRICS ANALYTICS & CHARTS (Chartjs) ---
  fetchAnalytics: async function() {
    try {
      const resp = await fetch("/api/analytics");
      if (!resp.ok) throw new Error("Analytics load error");
      const data = await resp.json();
      
      this.analytics = data;

      // Card counts
      document.getElementById("stat-total-reports").innerHTML = data.totalReports;
      document.getElementById("stat-rescued").innerHTML = data.rescuedAnimals;
      document.getElementById("stat-critical").innerHTML = data.criticalCases;
      document.getElementById("stat-adopted").innerHTML = data.adoptionsCompleted;

      // Recharts to Chart.js translations
      this.populateCharts(data);
    } catch (e) {
      console.error(e);
    }
  },

  populateCharts: function(data) {
    const volCtx = document.getElementById("chart-volume");
    const specCtx = document.getElementById("chart-species");

    if (!volCtx || !specCtx) return;

    // Purge old graphs if they exist to prevent memory crash leaking
    if (this.volumeChart) this.volumeChart.destroy();
    if (this.speciesChart) this.speciesChart.destroy();

    // Line/Area Graph Incident Volume vs Completed Rescues
    const trendsMonths = data.monthlyTrends.map(t => t.month);
    const trendsReports = data.monthlyTrends.map(t => t.reports);
    const trendsRescued = data.monthlyTrends.map(t => t.rescued);

    this.volumeChart = new Chart(volCtx, {
      type: 'line',
      data: {
        labels: trendsMonths,
        datasets: [
          {
            label: 'Incident Volume',
            data: trendsReports,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.45,
            borderWidth: 3
          },
          {
            label: 'Completed Rescues',
            data: trendsRescued,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            fill: true,
            tension: 0.45,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { family: 'Inter', size: 11, weight: 'bold' } } }
        },
        scales: {
          y: { grid: { color: 'rgba(156, 163, 175, 0.1)' } },
          x: { grid: { display: false } }
        }
      }
    });

    // Doughnut Pie Graph species classifications constituency
    const specType = data.categoryCounts.map(c => c.type);
    const specCount = data.categoryCounts.map(c => c.count);

    this.speciesChart = new Chart(specCtx, {
      type: 'doughnut',
      data: {
        labels: specType,
        datasets: [
          {
            data: specCount,
            backgroundColor: ["#2563EB", "#10B981", "#F97316", "#A78BFA", "#6B7280"]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 10 } } }
        }
      }
    });
  },


  // --- STORIES COMPARISON IMPLEMENTATION ---
  initSuccessStory: function() {
    this.renderSuccessStory();
  },

  renderSuccessStory: function() {
    const story = SUCCESS_STORIES[this.currentStoryIndex];
    if (!story) return;

    const imgElement = document.getElementById("trans-viewing-img");
    const nameElement = document.getElementById("trans-name");
    const locationElement = document.getElementById("trans-location");
    const storyElement = document.getElementById("trans-story");
    const laserElement = document.getElementById("trans-laser");
    const badgeElement = document.getElementById("trans-image-badge");

    const btnBefore = document.getElementById("trans-btn-before");
    const btnAfter = document.getElementById("trans-btn-after");

    nameElement.innerHTML = story.name;
    locationElement.innerHTML = story.location;
    storyElement.innerHTML = `"${story.story}"`;

    if (this.currentStoryShowAfter) {
      imgElement.src = story.afterUrl;
      badgeElement.className = "font-mono text-[10px] tracking-widest font-extrabold uppercase py-1.5 px-3.5 rounded-full text-white shadow-xl bg-emerald-600";
      badgeElement.innerHTML = "🟢 After (Recovered)";
      laserElement.classList.add("hidden");

      btnAfter.className = "flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition bg-emerald-600 text-white shadow-lg";
      btnBefore.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer transition text-slate-500 hover:text-slate-800";
    } else {
      imgElement.src = story.beforeUrl;
      badgeElement.className = "font-mono text-[10px] tracking-widest font-extrabold uppercase py-1.5 px-3.5 rounded-full text-white shadow-xl bg-red-650 animate-pulse";
      badgeElement.innerHTML = "🔴 Before (Rescued Condition)";
      laserElement.classList.remove("hidden");

      btnBefore.className = "flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition bg-red-650 text-white shadow-lg";
      btnAfter.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer transition text-slate-500 hover:text-slate-800";
    }
  },

  switchStoryImage: function(showAfterBoolean) {
    this.currentStoryShowAfter = showAfterBoolean;
    this.renderSuccessStory();
  },

  nextStory: function() {
    this.currentStoryIndex = (this.currentStoryIndex + 1) % SUCCESS_STORIES.length;
    this.currentStoryShowAfter = false; // reset
    this.renderSuccessStory();
  },

  prevStory: function() {
    this.currentStoryIndex = (this.currentStoryIndex - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length;
    this.currentStoryShowAfter = false; // reset
    this.renderSuccessStory();
  },


  // --- ADOPTION CARDS DISPLAY ---
  initAdoptionPets: function() {
    const adoptionGrid = document.getElementById("adoption-grid");
    if (!adoptionGrid) return;

    adoptionGrid.innerHTML = ADOPTION_PETS.map((pet) => {
      return `
        <div class="relative group rounded-[28px] bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between">
          
          <!-- Image overlay displays -->
          <div class="relative h-60 overflow-hidden bg-slate-100 shrink-0 select-none">
            <img src="${pet.imageUrl}" alt="${pet.name}" class="w-full h-full object-cover group-hover:scale-104 transition duration-500" />
            <span class="absolute top-4 right-4 text-[9px] font-mono tracking-widest font-extrabold uppercase py-1 px-3 bg-blue-600 text-white rounded-full shadow-lg">
              ${pet.gender} • ${pet.age}
            </span>
          </div>

          <!-- Content attributes -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-display font-extrabold text-lg text-slate-900">${pet.name}</h3>
              <span class="text-[10px] font-mono font-bold tracking-wider text-[#2563EB] uppercase block mt-0.5">${pet.breed}</span>
              <div class="mt-3.5 text-xs text-slate-500 leading-relaxed font-light">
                <span class="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">Rescue Case history:</span>
                <p class="line-clamp-3 mt-1 italic pl-1">"${pet.rescueHistory}"</p>
              </div>
            </div>

            <!-- Health Status & action triggers -->
            <div class="mt-6 border-t border-slate-100 pt-4">
              <div class="flex items-center text-[10px] text-emerald-600 font-mono font-extrabold mb-3.5 uppercase tracking-wide">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse"></span>
                ${pet.healthStatus}
              </div>

              <button onclick="window.state.openAdoptionModal('${pet.id}', '${pet.name}', '${pet.breed}', '${pet.imageUrl}', '${pet.gender} • ${pet.age}')" class="w-full py-3 bg-[#2563EB] hover:bg-double-blue-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1">
                ❤️ Adopt Companion
              </button>
            </div>
          </div>

        </div>
      `;
    }).join("");
  },

  openAdoptionModal: function(petId, petName, petBreed, imgUrl, metaBadge) {
    // Save state in attributes
    document.getElementById("adopt-input-pet-id").value = petId;
    document.getElementById("adopt-input-pet-name").value = petName;

    // Reposition design tags
    document.getElementById("adopt-modal-sidebar-name").innerHTML = petName;
    document.getElementById("adopt-modal-sidebar-breed").innerHTML = petBreed;
    document.getElementById("adopt-modal-sidebar-badge").innerHTML = metaBadge;
    document.getElementById("adopt-modal-sidebar-bg").style.backgroundImage = `url('${imgUrl}')`;

    // Make modal frame visible
    document.getElementById("adoption-modal").classList.remove("hidden");
  },

  closeAdoptionModal: function() {
    document.getElementById("adoption-modal").classList.add("hidden");
    document.getElementById("adopt-form").reset();
  },

  submitAdoptionForm: async function(event) {
    event.preventDefault();

    const animalId = document.getElementById("adopt-input-pet-id").value;
    const animalName = document.getElementById("adopt-input-pet-name").value;
    const name = document.getElementById("adopt-form-name").value;
    const email = document.getElementById("adopt-form-email").value;
    const phone = document.getElementById("adopt-form-phone").value;
    const visitDate = document.getElementById("adopt-form-date").value;
    const message = document.getElementById("adopt-form-message").value;

    const payload = {
      animalId,
      animalName,
      applicantName: name,
      applicantEmail: email,
      applicantPhone: phone,
      visitDate,
      message
    };

    try {
      const response = await fetch("/api/adoption/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Posting adoption failed");

      alert(`Success! Adoption inquiry registered for pet: ${animalName}. Volunteers will reach out soon!`);
      this.closeAdoptionModal();
      
      // Reload count
      await this.fetchAnalytics();
    } catch (e) {
      alert("Inquiry registration delay. Try again soon.");
    }
  },


  // --- FLOATING AI CHATBOT HANDLERS ---
  toggleChatbot: function() {
    this.chatbotOpen = !this.chatbotOpen;
    const box = document.getElementById("chatbot-box");
    const iconNormal = document.getElementById("chat-icon-normal");
    const iconClose = document.getElementById("chat-icon-close");

    if (this.chatbotOpen) {
      box.classList.remove("hidden");
      iconNormal.classList.add("hidden");
      iconClose.classList.remove("hidden");
      this.scrollChatToBottom();
    } else {
      box.classList.add("hidden");
      iconNormal.classList.remove("hidden");
      iconClose.classList.add("hidden");
    }
  },

  initChatbotFaq: function() {
    const faqWidget = document.getElementById("chat-faqs");
    if (!faqWidget) return;

    const questions = [
      { text: "Scabies/Mange Symptoms?", query: "What are symptoms of scabies and mange?" },
      { text: "First Aid Bleeding?", query: "How do I do veterinary first aid for a bleeding street animal?" },
      { text: "What runs on 1962?", query: "What emergency help runs on Helpline 1962 in India?" },
      { text: "Process of Adoption?", query: "How does the stray animal adoption process function?" }
    ];

    faqWidget.innerHTML = questions.map((faq) => {
      // String escape to allow clicking
      const queryStr = faq.query.replace(/'/g, "\\'");
      return `
        <button onclick="window.state.faqChatQuery('${queryStr}')" class="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-slate-200 cursor-pointer text-xs transition inline-block">
          ${faq.text}
        </button>
      `;
    }).join("");
  },

  faqChatQuery: function(queryText) {
    document.getElementById("chat-input-field").value = queryText;
    this.submitChatMessage();
  },

  submitChatMessage: async function() {
    const input = document.getElementById("chat-input-field");
    const userText = input.value;
    if (!userText.trim()) return;

    // Register user msg locally
    this.chatMessages.push({ role: "user", content: userText });
    input.value = "";
    
    this.renderChatMessages();

    // Spawn typing animation placeholder
    const scrollBox = document.getElementById("chat-messages-scroll");
    const typingLi = document.createElement("div");
    typingLi.className = "flex justify-start text-[11px] italic text-slate-400 font-mono" ;
    typingLi.id = "chat-typing-indicator";
    typingLi.innerHTML = `
      <div class="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center space-x-1">
        <span class="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
        <span class="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="ml-1 select-none text-[10px]">PawGuard syncing answers...</span>
      </div>
    `;
    scrollBox.appendChild(typingLi);
    this.scrollChatToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: this.chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error("Chat api failed");
      const respData = await response.json();

      // Purge typing
      const indicator = document.getElementById("chat-typing-indicator");
      if (indicator) indicator.remove();

      this.chatMessages.push({ role: "assistant", content: respData.content });
      this.renderChatMessages();
    } catch (e) {
      const indicator = document.getElementById("chat-typing-indicator");
      if (indicator) indicator.remove();

      this.chatMessages.push({ role: "assistant", content: "Apologies, telemetry link timed out. Please try again." });
      this.renderChatMessages();
    }
  },

  renderChatMessages: function() {
    const scrollBox = document.getElementById("chat-messages-scroll");
    if (!scrollBox) return;

    scrollBox.innerHTML = this.chatMessages.map((m) => {
      const isUser = m.role === "user";
      const bubbleClass = isUser 
        ? "bg-blue-600 text-white rounded-tr-none ml-auto" 
        : "bg-white/10 text-slate-100 rounded-tl-none border border-white/5";

      // Super basic bold parsing helper to support structured Markdown highlights
      let text = m.content;
      text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
      text = text.replace(/\n/g, "<br/>");

      return `
        <div class="flex ${isUser ? "justify-end" : "justify-start"}">
          <div class="${bubbleClass} p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%]">
            ${text}
          </div>
        </div>
      `;
    }).join("");

    this.scrollChatToBottom();
  },

  scrollChatToBottom: function() {
    const scrollBox = document.getElementById("chat-messages-scroll");
    if (scrollBox) {
      scrollBox.scrollTop = scrollBox.scrollHeight;
    }
  }

};


// ================= ATTACH LAUNCHER ON WINDOW LOAD =================
window.onload = () => {
  window.state.init();
};
