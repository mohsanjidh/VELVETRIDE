// ── Fleet Filtering & Global State ────────────────────────────────
let filteredCategory = 'all';
let allCarsFromDB = []; // Store all cars from Supabase
let allFetchedCars = []; // Store the initial fetch response
let masterCarList = []; // Single source of truth for filtering

// ── Scroll Nav ────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
});

// ── Scroll Reveal ─────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Initial reveal elements observation
window.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealEls.forEach(el => observer.observe(el));
});

// ── Mobile Menu ───────────────────────────────────────────────────
function openMobile() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  
  if (menu.classList.contains('open')) {
    closeMobile();
    return;
  }
  
  menu.classList.add('open');
  document.querySelectorAll('.nav-hamburger').forEach(btn => btn.classList.add('active'));
}

function closeMobile() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
  document.querySelectorAll('.nav-hamburger').forEach(btn => btn.classList.remove('active'));
}

// ── Render Cars Wrapper ───────────────────────────────────────────
function renderCars(cars) {
  renderFleetCarsFiltered(cars);
}

// ── Fleet Tabs - Advanced Category Filter ──────────────────────────
function filterFleet(cat, btn) {
  document.querySelectorAll('.fleet-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  filteredCategory = cat;
  
  const fleetGrid = document.getElementById('fleetGrid');
  if (!fleetGrid) return;
  
  // Handle "Imported" tab - show coming soon placeholder
  if (cat === 'imported') {
    fleetGrid.innerHTML = `
      <div class="fleet-coming-soon">
        <div class="coming-soon-content">
          <div class="coming-soon-text">COMING SOON...</div>
          <div class="coming-soon-subtitle">Exclusive imported vehicles launching soon</div>
        </div>
      </div>
    `;
    return;
  }
  
  // Filter cars based on category
  let filteredCars = [];
  
  if (cat === 'all') {
    renderCars(masterCarList);
    return;
  } else if (cat === 'budget') {
    filteredCars = masterCarList.filter(car => {
      try {
        const rawPrice = car.Rent_Amount !== undefined ? car.Rent_Amount : (car.price !== undefined ? car.price : car.price_12h);
        if (rawPrice === undefined || rawPrice === null) {
          console.warn('⚠️ Price field not found for car:', car);
          return false;
        }
        const cleanPrice = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10);
        if (isNaN(cleanPrice)) {
          throw new Error(`Parsed price is NaN for value: ${rawPrice}`);
        }
        return cleanPrice <= 10000;
      } catch (err) {
        console.error('⚠️ Price parsing error:', err.message, car);
        return false;
      }
    });
  } else if (cat === 'luxury' || cat === 'modified') {
    // Exact category match (case-insensitive)
    filteredCars = masterCarList.filter(car => {
      const category = car.Category || car.category;
      return category && category.toLowerCase() === cat.toLowerCase();
    });
  }
  
  // Re-render the fleet grid with filtered cars
  renderCars(filteredCars);
}

// ── Render Filtered Fleet Cars ─────────────────────────────────────
function renderFleetCarsFiltered(cars) {
  const fleetGrid = document.getElementById('fleetGrid');
  if (!fleetGrid) return;
  
  // Add fade-out animation
  fleetGrid.style.opacity = '0.7';
  
  // Clear grid with smooth transition
  setTimeout(() => {
    fleetGrid.innerHTML = '';
    
    if (cars.length === 0) {
      fleetGrid.innerHTML = `
        <div class="fleet-empty-state">
          <p>No vehicles found in this category.</p>
        </div>
      `;
      fleetGrid.style.opacity = '1';
      return;
    }
    
    // Map category names from DB to CSS classes
    const categoryMap = {
      'Luxury': 'luxury',
      'Modified': 'modified',
      'Imported': 'imported',
      'Budget': 'budget'
    };
    
    // Render each filtered car
    cars.forEach((car, index) => {
      const category = categoryMap[car.Category || car.category] || 'luxury';
      const delay = index % 3;
      
      const carHTML = `
        <div class="fleet-item show" data-cat="${category}">
          <div class="fleet-card reveal ${delay > 0 ? `delay-${delay}` : ''}">
            <div class="fleet-card-img">
              <img src="${car.Image_link || 'https://via.placeholder.com/600x400'}" alt="${car.Car_Name}" loading="lazy">
            </div>
            <div class="fleet-card-body">
              <div class="fleet-card-name">${car.Car_Name}</div>
              <div class="card-meta-logistic">
                <span class="label">Category:</span> <span class="value gold">${car.Category}</span>
              </div>
              <div class="card-meta-logistic">
                <span class="label">Location:</span> <span class="value">${car.Car_location}</span>
              </div>
              <div class="card-packages-container">
                <div class="card-packages-title">Available Packages</div>
                <div class="card-packages-row">
                  <div>Period: <span class="price">${car.Rent_Period}</span></div>
                  <div>Rate: <span class="price">${(car.Rent_Amount || '').toString().includes('₹') ? '' : '₹'}${car.Rent_Amount}</span></div>
                </div>
              </div>
              <div class="card-btn-container">
                <button class="btn-primary" style="font-size:0.72rem;padding:0.6rem 1.4rem" onclick="openEnquiry('${car.Car_Name.replace(/'/g, "\\'")}')" ><span>Enquire & Book</span></button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      fleetGrid.innerHTML += carHTML;
    });
    
    // Make all fleet cards visible by adding the visible class
    const newRevealEls = document.querySelectorAll('.fleet-card.reveal');
    newRevealEls.forEach(el => {
      el.classList.add('visible');
    });
    
    // Fade in
    fleetGrid.style.opacity = '1';
  }, 150);
}


// ── Car Modal ─────────────────────────────────────────────────────
const carDetails = {
  rolls: {
    name: 'Rolls-Royce Ghost', tag: 'Ultra Luxury | V12 Engine',
    img: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&q=80',
    specs: [['Engine','6.75L V12'],['Power','563 BHP'],['Seats','4'],['0-100','4.8s'],['Transmission','Auto'],['Drive','RWD']],
    pricing: [['8 Hours','₹8,000'],['12 Hours','₹15,000'],['24 Hours','₹25,000']]
  },
  lambo: {
    name: 'Lamborghini Huracán', tag: 'Exotic Supercar | V10 Engine',
    img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80',
    specs: [['Engine','5.2L V10'],['Power','640 BHP'],['Seats','2'],['0-100','2.9s'],['Transmission','Auto'],['Drive','AWD']],
    pricing: [['8 Hours','₹12,000'],['12 Hours','₹20,000'],['24 Hours','₹35,000']]
  },
  gwagon: {
    name: 'Mercedes-AMG G63', tag: 'Imported Luxury SUV | V8 Biturbo',
    img: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&q=80',
    specs: [['Engine','4.0L V8 Biturbo'],['Power','577 BHP'],['Seats','5'],['0-100','4.5s'],['Transmission','Auto'],['Drive','AWD']],
    pricing: [['8 Hours','₹6,000'],['12 Hours','₹11,000'],['24 Hours','₹18,000']]
  },
  bmw: {
    name: 'BMW M5 Competition', tag: 'Performance Luxury | V8 Biturbo',
    img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80',
    specs: [['Engine','4.4L V8'],['Power','625 BHP'],['Seats','5'],['0-100','3.3s'],['Transmission','Auto'],['Drive','AWD']],
    pricing: [['8 Hours','₹4,000'],['12 Hours','₹7,000'],['24 Hours','₹12,000']]
  },
  porsche: {
    name: 'Porsche 911 Carrera', tag: 'Iconic Sports Car | Flat-6',
    img: 'https://images.unsplash.com/photo-1617531653332-bd46c16f7d71?w=600&q=80',
    specs: [['Engine','3.0L Flat-6'],['Power','385 BHP'],['Seats','4'],['0-100','4.2s'],['Transmission','PDK'],['Drive','RWD']],
    pricing: [['8 Hours','₹5,500'],['12 Hours','₹9,500'],['24 Hours','₹16,000']]
  },
  ferrari: {
    name: 'Ferrari Roma', tag: 'Italian Exotic | V8 Turbo',
    img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80',
    specs: [['Engine','3.9L V8'],['Power','612 BHP'],['Seats','2+2'],['0-100','3.4s'],['Transmission','DCT'],['Drive','RWD']],
    pricing: [['8 Hours','₹10,000'],['12 Hours','₹18,000'],['24 Hours','₹30,000']]
  },
  bentley: {
    name: 'Bentley Continental GT', tag: 'Grand Tourer | W12 Engine',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80',
    specs: [['Engine','6.0L W12'],['Power','626 BHP'],['Seats','4'],['0-100','3.6s'],['Transmission','DCT'],['Drive','AWD']],
    pricing: [['8 Hours','₹7,500'],['12 Hours','₹13,000'],['24 Hours','₹22,000']]
  },
  innova: {
    name: 'Toyota Innova Crysta', tag: 'Premium MPV | 2.4L Diesel',
    img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80',
    specs: [['Engine','2.4L Diesel'],['Power','174 BHP'],['Seats','7'],['Fuel','Diesel'],['Transmission','Auto/Manual'],['Drive','RWD']],
    pricing: [['8 Hours','₹1,500'],['12 Hours','₹2,500'],['24 Hours','₹3,500']]
  },
  gtr: {
    name: 'Nissan GT-R (Tuned)', tag: 'Modified Performance | V6 Biturbo',
    img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80',
    specs: [['Engine','3.8L V6 Biturbo'],['Power','700+ BHP'],['Seats','2+2'],['0-100','2.7s'],['Transmission','DCT'],['Drive','AWD']],
    pricing: [['8 Hours','₹5,000'],['12 Hours','₹9,000'],['24 Hours','₹15,000']]
  }
};

function openModal(id) {
  const car = carDetails[id]; if (!car) return;
  document.getElementById('modalImg').src = car.img;
  document.getElementById('modalName').textContent = car.name;
  document.getElementById('modalTag').textContent = car.tag;
  document.getElementById('modalSpecs').innerHTML = car.specs.map(([k,v]) => `
    <div class="modal-spec-item"><div class="modal-spec-label">${k}</div><div class="modal-spec-value">${v}</div></div>
  `).join('');
  document.getElementById('modalPricing').innerHTML = car.pricing.map(([k,v]) => `
    <div class="modal-price-box"><span class="modal-price-label">${k}</span><div class="modal-price-val">${v}</div></div>
  `).join('');
  document.getElementById('carModal').classList.add('open');
}
function closeModal() { document.getElementById('carModal').classList.remove('open'); }
document.getElementById('carModal').addEventListener('click', e => { if(e.target === e.currentTarget) closeModal(); });

// ── Enquiry Pre-fill ──────────────────────────────────────────────
function openEnquiry(car) {
  const fCar = document.getElementById('fCar');
  if (fCar) {
    fCar.value = car;
    const enquirySec = document.getElementById('enquiry');
    if (enquirySec) enquirySec.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = 'contact.html?car=' + encodeURIComponent(car);
  }
}
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const car = urlParams.get('car');
  if (car) {
    const fCar = document.getElementById('fCar');
    if (fCar) fCar.value = car;
  }
});

// ── Submit Enquiry ────────────────────────────────────────────────
function submitEnquiry(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const city = document.getElementById('fCity').value;
  const car = document.getElementById('fCar').value.trim();
  const date = document.getElementById('fDate').value;
  const period = document.getElementById('fPeriod').value;
  const msg = document.getElementById('fMsg').value.trim();

  if (!name || !phone) {
    showToast('⚠️ Please fill in your name and phone number');
    return;
  }

  // Constructing the structured message for WhatsApp
  const messageText = `🌟 New Rental Enquiry - Velvetride Rentals 🌟\n\n` +
    `Car Model: ${car || 'Not Specified'}\n\n` +
    `Package Duration: ${period || 'Not Specified'}\n\n` +
    `Date of Program: ${date || 'Not Specified'}\n\n` +
    `Location: ${city || 'Not Specified'}\n\n` +
    `Customer Notes: ${msg || 'None'}\n\n` +
    `Please confirm availability for these details.`;

  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/918921331962?text=${encodedMessage}`;

  // Redirect the user directly to WhatsApp in a new tab
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  // Clean form reset lifecycle
  const formElement = document.getElementById('enquiryForm');
  if (formElement) {
    formElement.reset();
  }
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Legal Modals ──────────────────────────────────────────────────
const legalTexts = {
  privacy: `<h2>Privacy Policy</h2>
    <h3>Information We Collect</h3><p>We collect personal information including name, phone number, email address, and location data to facilitate car rental bookings and provide our services.</p>
    <h3>How We Use Your Information</h3><p>Your information is used exclusively to process bookings, provide customer support, send service updates, and improve our offerings. We never sell your data to third parties.</p>
    <h3>Data Security</h3><p>All data is encrypted and stored securely. We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
    <h3>WhatsApp Communication</h3><p>By contacting us via WhatsApp, you consent to receiving communications about your booking. We respect your privacy and will not spam you.</p>
    <h3>Contact Us</h3><p>For privacy concerns, email:velvetriderentals786@gmail.com</p>`,
  terms: `<h2>Terms & Conditions</h2>
    <h3>Eligibility</h3><p>All drivers must be 21+ years of age with a valid driving license. International licenses are accepted with appropriate documentation.</p>
    <h3>Booking & Payment</h3><p>A security deposit is required at pickup. Full rental amount is due before vehicle handover. We accept cash, bank transfer, and major UPI platforms.</p>
    <h3>Fuel Policy</h3><p>All vehicles are provided with a full tank and must be returned full. Fuel costs for deviation are the renter's responsibility.</p>
    <h3>Damage Policy</h3><p>The renter is responsible for any damage beyond normal wear and tear. Comprehensive insurance covers most scenarios; however, the excess applies to the renter.</p>
    <h3>Cancellation</h3><p>Cancellations made 48+ hours in advance receive a full refund. Less than 48 hours: 50% refund. Day-of cancellations are non-refundable.</p>`,
  rental: `<h2>Rental Agreement</h2>
    <h3>Vehicle Handover</h3><p>A thorough inspection is conducted at pickup and return. Any pre-existing damage is documented and signed off by both parties before departure.</p>
    <h3>Usage Restrictions</h3><p>Vehicles may not be used for racing, off-roading (unless specified), or illegal activities. Smoking is strictly prohibited in all vehicles.</p>
    <h3>Geographic Limitations</h3><p>Vehicles are to be used within agreed-upon geographic boundaries. Interstate travel requires prior written permission and may incur additional charges.</p>
    <h3>Breakdown Assistance</h3><p>24/7 roadside assistance is included. Contact our support line immediately in case of breakdown or accident. Do not attempt repairs independently.</p>
    <h3>Driver Limitations</h3><p>Only the registered driver(s) may operate the vehicle. Adding additional drivers requires prior approval and documentation.</p>`
};
function showLegal(type) {
  document.getElementById('legalContent').innerHTML = legalTexts[type];
  document.getElementById('legalModal').classList.add('open');
}
function closeLegal() { document.getElementById('legalModal').classList.remove('open'); }
document.getElementById('legalModal').addEventListener('click', e => { if(e.target === e.currentTarget) closeLegal(); });

// ── Supabase Connection & Dynamic Fleet Loading ────────────────────
const SUPABASE_URL = 'https://slbziwdlgcmxuplirfxw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KvSc7s2b69bQsaW3kBx7Lg_8USXjEV5';

window.addEventListener('DOMContentLoaded', async () => {
  // ── Load Signature Fleet for Home Page (3 specific cars) ──────────
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) {
    try {
      // Fetch matching signature cars using fuzzy/partial match on Name and Location
      const sigUrl = `${SUPABASE_URL}/rest/v1/cars?select=*&or=${encodeURIComponent(
        '(Car_Name.ilike.*Gwagon*,Car_Name.ilike.*Defen*Blue*,Car_Name.ilike.*Defender*Blue*,Car_Name.ilike.*bmw*m5*)'
      )}&or=${encodeURIComponent(
        '(Car_location.ilike.*kalamassery*,Car_location.ilike.*Vyttila*,Car_location.ilike.*Wayanad*)'
      )}`;
      
      let sigCars = [];
      try {
        const sigRes = await fetch(sigUrl, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }
        });
        if (sigRes.ok) {
          sigCars = await sigRes.json();
        }
      } catch (e) {
        console.warn('⚠️ Signature cars query failed:', e.message);
      }
      
      // Filter out our three targeted vehicles from the query results to see if we got all 3
      const targetGwagon = sigCars.some(c => (c.Car_Name || '').toLowerCase().includes('gwagon') && (c.Car_location || '').toLowerCase().includes('kalamassery'));
      const targetDefenter = sigCars.some(c => {
        const name = (c.Car_Name || '').toLowerCase();
        const loc = (c.Car_location || '').toLowerCase();
        return ((name.includes('defen') && name.includes('blue')) || (name.includes('defender') && name.includes('blue'))) &&
               (loc.includes('kalamassery') || loc.includes('vyttila'));
      });
      const targetBmw = sigCars.some(c => (c.Car_Name || '').toLowerCase().includes('bmw') && (c.Car_Name || '').toLowerCase().includes('m5') && (c.Car_location || '').toLowerCase().includes('wayanad'));
      
      const matchedCount = (targetGwagon ? 1 : 0) + (targetDefenter ? 1 : 0) + (targetBmw ? 1 : 0);
      
      // Fallback: IF the specific targeted query returns fewer than 3 vehicles, THEN automatically fetch additional vehicles from the "Luxury" category
      if (matchedCount < 3) {
        console.warn(`⚠️ Target query only matched ${matchedCount} cars. Fetching additional luxury cars...`);
        try {
          const luxuryUrl = `${SUPABASE_URL}/rest/v1/cars?select=*&Category=eq.luxury`;
          const luxuryRes = await fetch(luxuryUrl, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }
          });
          if (luxuryRes.ok) {
            const luxuryCars = await luxuryRes.json();
            // Merge the luxury cars into sigCars so renderFeaturedCars has candidates to fill the gap
            sigCars = [...sigCars, ...luxuryCars];
          }
        } catch (e) {
          console.warn('⚠️ Fallback luxury cars query failed:', e.message);
        }
      }
      
      console.log('✅ Signature Fleet loaded:', sigCars.length, 'candidates');
      renderFeaturedCars(sigCars);
    } catch (err) {
      console.error('❌ Signature Fleet fetch failed:', err.message);
    }
  }

  // ── Load Full Fleet for Fleet Page ────────────────────────────────
  const fleetGrid = document.getElementById('fleetGrid');
  if (fleetGrid) {
    try {
      const fleetRes = await fetch(`${SUPABASE_URL}/rest/v1/cars?select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }
      });

      if (fleetRes.ok) {
        const cars = await fleetRes.json();
        console.log('✅ Supabase Fleet loaded:', cars.length, 'cars');
        masterCarList = cars;
        renderFleetCars(cars);
      } else {
        console.warn('⚠️ Supabase fleet response error:', fleetRes.status);
      }
    } catch (err) {
      console.error('❌ Supabase fleet connection error:', err.message);
    }
  }
  
  // Ensure all fleet and reveal cards are visible
  setTimeout(() => {
    document.querySelectorAll('.fleet-card.reveal').forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }, 500);
});

// ── Render Fleet Cars Dynamically ──────────────────────────────────
function renderFleetCars(cars) {
  const fleetGrid = document.getElementById('fleetGrid');
  if (!fleetGrid) return;
  
  // Store cars globally for filtering
  allCarsFromDB = cars;
  allFetchedCars = cars;
  masterCarList = cars;
  
  // Clear existing cars
  fleetGrid.innerHTML = '';
  fleetGrid.style.opacity = '1';
  
  // Map category names from DB to CSS classes
  const categoryMap = {
    'Luxury': 'luxury',
    'Modified': 'modified',
    'Imported': 'imported',
    'Budget': 'budget'
  };
  
  // Render each car
  cars.forEach((car, index) => {
    const category = categoryMap[car.Category || car.category] || 'luxury';
    const delay = index % 3; // Stagger animation delays
    
    const carHTML = `
      <div class="fleet-item show" data-cat="${category}">
        <div class="fleet-card reveal ${delay > 0 ? `delay-${delay}` : ''}">
          <div class="fleet-card-img">
            <img src="${car.Image_link || 'https://via.placeholder.com/600x400'}" alt="${car.Car_Name}" loading="lazy">
          </div>
          <div class="fleet-card-body">
            <div class="fleet-card-name">${car.Car_Name}</div>
            <div class="card-meta-logistic">
              <span class="label">Category:</span> <span class="value gold">${car.Category}</span>
            </div>
            <div class="card-meta-logistic">
              <span class="label">Location:</span> <span class="value">${car.Car_location}</span>
            </div>
            <div class="card-packages-container">
              <div class="card-packages-title">Available Packages</div>
              <div class="card-packages-row">
                <div>Period: <span class="price">${car.Rent_Period}</span></div>
                <div>Rate: <span class="price">${(car.Rent_Amount || '').toString().includes('₹') ? '' : '₹'}${car.Rent_Amount}</span></div>
              </div>
            </div>
            <div class="card-btn-container">
              <button class="btn-primary" style="font-size:0.72rem;padding:0.6rem 1.4rem" onclick="openEnquiry('${car.Car_Name.replace(/'/g, "\\'")}')" ><span>Enquire & Book</span></button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    fleetGrid.innerHTML += carHTML;
  });
  
  // Make all fleet cards visible by adding the visible class
  const newRevealEls = document.querySelectorAll('.fleet-card.reveal');
  newRevealEls.forEach(el => {
    el.classList.add('visible');
  });
  
  // Also populate featured grid on home page
  renderFeaturedCars(cars);
}

// ── Render Featured Cars on Home Page ───────────────────────────────
// Receives candidate cars and renders exactly 3 targeted cars with a luxury fallback.
// Uses the correct DB column names: Car_Name, Image_link, Category,
// Car_location, Rent_Period, Rent_Amount.
function renderFeaturedCars(cars) {
  const featuredGrid = document.getElementById('featuredGrid');
  if (!featuredGrid || !cars || cars.length === 0) return;

  // Clear existing placeholder / static content
  featuredGrid.innerHTML = '';

  const matchedCars = [];

  // 1. Gwagon (luxury, kalamassery)
  const gwagon = cars.find(c => {
    const name = (c.Car_Name || c.car_name || '').toLowerCase();
    const loc = (c.Car_location || c.location || '').toLowerCase();
    return name.includes('gwagon') && loc.includes('kalamassery');
  });
  if (gwagon) matchedCars.push(gwagon);

  // 2. Defenter Blue (luxury, kalamassery / Vyttila)
  const defenter = cars.find(c => {
    const name = (c.Car_Name || c.car_name || '').toLowerCase();
    const loc = (c.Car_location || c.location || '').toLowerCase();
    const nameMatch = (name.includes('defen') && name.includes('blue')) || (name.includes('defender') && name.includes('blue'));
    const locMatch = loc.includes('kalamassery') || loc.includes('vyttila');
    return nameMatch && locMatch;
  });
  if (defenter) matchedCars.push(defenter);

  // 3. Bagged bmw m5 (modified, Wayanad)
  const bmw = cars.find(c => {
    const name = (c.Car_Name || c.car_name || '').toLowerCase();
    const loc = (c.Car_location || c.location || '').toLowerCase();
    return name.includes('bmw') && name.includes('m5') && loc.includes('wayanad');
  });
  if (bmw) matchedCars.push(bmw);

  // Fallback: If we have less than 3, fill with other luxury cars from the passed list
  if (matchedCars.length < 3) {
    const additional = cars.filter(c => {
      const isAlreadyMatched = matchedCars.some(mc => 
        (mc.Car_Name || mc.car_name || '').trim().toLowerCase() === (c.Car_Name || c.car_name || '').trim().toLowerCase()
      );
      const isLuxury = (c.Category || c.category || '').toLowerCase() === 'luxury';
      return !isAlreadyMatched && isLuxury;
    });
    // Shuffle additional candidates for randomness
    const shuffled = additional.sort(() => 0.5 - Math.random());
    for (const car of shuffled) {
      if (matchedCars.length >= 3) break;
      matchedCars.push(car);
    }
  }

  // Ensure exactly 3 cars are rendered in the grid
  const carsToRender = matchedCars.slice(0, 3);

  const categoryMap = {
    'Luxury':   'luxury',
    'Modified': 'modified',
    'Imported': 'imported',
    'Budget':   'budget'
  };

  carsToRender.forEach((car, index) => {
    const carName   = car.car_name     || car.Car_Name    || 'Luxury Vehicle';
    const carImg    = car.image_link   || car.Image_link  || 'https://via.placeholder.com/600x400';
    const carCat    = car.category     || car.Category    || 'Luxury';
    const carLoc    = car.location     || car.Car_location|| 'Kerala';
    const rentPer   = car.rent_period  || car.Rent_Period || '';
    const rentAmt   = car.rent_amount  || car.Rent_Amount || '';

    const cssCategory = categoryMap[carCat] || 'luxury';
    const delayClass  = index === 0 ? 'delay-1' : index === 1 ? 'delay-2' : 'delay-3';

    const carHTML = `
      <div class="car-card reveal ${delayClass}">
        <div class="car-card-img">
          <img src="${carImg}" alt="${carName}" loading="lazy">
          <div class="car-card-badge badge-${cssCategory}">${carCat}</div>
          <div class="car-card-overlay">
            <button class="btn-gold" style="font-size:0.7rem;padding:0.5rem 1rem"
              onclick="event.stopPropagation(); openEnquiry('${carName.replace(/'/g, "\\'")}')">
              Quick View
            </button>
          </div>
        </div>
        <div class="car-card-body">
          <div class="car-card-name">${carName}</div>
          <div class="card-meta-logistic">
            <span class="label">Category:</span>
            <span class="value gold">${carCat}</span>
          </div>
          <div class="card-meta-logistic">
            <span class="label">Location:</span>
            <span class="value">${carLoc}</span>
          </div>
          <div class="card-packages-container">
            <div class="card-packages-title">Available Packages</div>
            <div class="card-packages-row">
              ${rentPer ? `<div>Period: <span class="price">${rentPer}</span></div>` : ''}
              ${rentAmt ? `<div>Rate: <span class="price">${(rentAmt || '').toString().includes('₹') ? '' : '₹'}${rentAmt}</span></div>` : ''}
            </div>
          </div>
          <div class="card-btn-container">
            <button class="btn-primary" style="font-size:0.7rem;padding:0.5rem 1.2rem"
              onclick="openEnquiry('${carName.replace(/'/g, "\\'")}')">
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    `;

    featuredGrid.innerHTML += carHTML;
  });

  // Re-observe newly added featured elements for reveal animation
  const newRevealEls = document.querySelectorAll('.featured-grid .car-card.reveal, #featuredGrid .car-card.reveal');
  newRevealEls.forEach(el => observer.observe(el));
}

// ── Runtime WhatsApp Link Updater ─────────────────────────────────
// Ensures all WhatsApp links target the primary booking number (+91 8921331962)
// with the correct welcome messages.
window.addEventListener('DOMContentLoaded', () => {
  const newNum = '918921331962';
  const genericText = encodeURIComponent('Hi Velvetride Rentals, I am interested in browsing your fleet and making a booking!');
  
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes('text=') || link.classList.contains('whatsapp-btn')) {
      link.setAttribute('href', `https://wa.me/${newNum}?text=${genericText}`);
    } else {
      link.setAttribute('href', `https://wa.me/${newNum}`);
    }
  });
});




