function helloWorld() {
  console.log('Hello, Veni World!');
}

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentSection = 'dashboard';
let currentLogDate = todayStr();
let weightChart = null;
let calorieChart = null;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getData(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProfile() { return getData('hn_profile', null); }
function getFoodLog() { return getData('hn_food_log', []); }
function getWeightLog() { return getData('hn_weight_log', []); }

function toast(msg, type = 'success') {
  const tc = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span> ${msg}`;
  tc.appendChild(el);
  setTimeout(() => { el.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.querySelector(`[data-section="${name}"]`).classList.add('active');
  currentSection = name;

  if (name === 'dashboard') renderDashboard();
  if (name === 'food-log') renderFoodLog();
  if (name === 'report') renderReport();
}

// ─── BMI & CALCULATIONS ──────────────────────────────────────────────────────
function calcBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'bmi-underweight', color: '#3498db' };
  if (bmi < 25)   return { label: 'Normal',      cls: 'bmi-normal',      color: '#2ecc71' };
  if (bmi < 30)   return { label: 'Overweight',  cls: 'bmi-overweight',  color: '#f39c12' };
  return             { label: 'Obese',         cls: 'bmi-obese',        color: '#e74c3c' };
}

function calcBMR(p) {
  // Mifflin-St Jeor
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.gender === 'male' ? base + 5 : base - 161;
}

function calcTDEE(p) {
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(calcBMR(p) * (factors[p.activity] || 1.375));
}

function calcGoalCalories(p) {
  const tdee = calcTDEE(p);
  if (p.goal === 'lose')   return tdee - 500;
  if (p.goal === 'gain')   return tdee + 400;
  return tdee;
}

function idealWeightRange(height) {
  const h = height / 100;
  return { min: Math.round(18.5 * h * h), max: Math.round(24.9 * h * h) };
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function initProfileSection() {
  const p = getProfile();
  if (p) {
    document.getElementById('profileName').value = p.name || '';
    document.getElementById('profileAge').value = p.age || '';
    document.getElementById('profileGender').value = p.gender || 'male';
    document.getElementById('profileHeight').value = p.height || '';
    document.getElementById('profileWeight').value = p.weight || '';
    document.getElementById('profileActivity').value = p.activity || 'moderate';
    document.getElementById('profileGoal').value = p.goal || 'maintain';
    renderProfileStats(p);
  }
}

function saveProfile() {
  const p = {
    name: document.getElementById('profileName').value.trim(),
    age: parseInt(document.getElementById('profileAge').value),
    gender: document.getElementById('profileGender').value,
    height: parseFloat(document.getElementById('profileHeight').value),
    weight: parseFloat(document.getElementById('profileWeight').value),
    activity: document.getElementById('profileActivity').value,
    goal: document.getElementById('profileGoal').value,
    updatedAt: todayStr()
  };

  if (!p.name) { toast('Please enter your name', 'error'); return; }
  if (!p.age || p.age < 5 || p.age > 120) { toast('Please enter a valid age', 'error'); return; }
  if (!p.height || p.height < 100 || p.height > 250) { toast('Please enter height in cm (100–250)', 'error'); return; }
  if (!p.weight || p.weight < 20 || p.weight > 300) { toast('Please enter weight in kg (20–300)', 'error'); return; }

  setData('hn_profile', p);

  // Log initial weight
  const wlog = getWeightLog();
  const existing = wlog.find(w => w.date === todayStr());
  if (!existing) {
    wlog.push({ date: todayStr(), weight: p.weight });
    wlog.sort((a, b) => a.date.localeCompare(b.date));
    setData('hn_weight_log', wlog);
  }

  renderProfileStats(p);
  toast('Profile saved successfully!');
}

function renderProfileStats(p) {
  const bmi = calcBMI(p.weight, p.height);
  const cat = bmiCategory(bmi);
  const tdee = calcTDEE(p);
  const goalCal = calcGoalCalories(p);
  const ideal = idealWeightRange(p.height);

  document.getElementById('profileStats').innerHTML = `
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value ${cat.cls}">${bmi}</div>
        <div class="stat-label">BMI</div>
        <div class="stat-sub" style="color:${cat.color};font-weight:700;">${cat.label}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#e74c3c;">${Math.round(calcBMR(p))}</div>
        <div class="stat-label">BMR (kcal/day)</div>
        <div class="stat-sub">Resting calories</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#3498db;">${tdee}</div>
        <div class="stat-label">TDEE (kcal/day)</div>
        <div class="stat-sub">With activity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#2ecc71;">${goalCal}</div>
        <div class="stat-label">Goal (kcal/day)</div>
        <div class="stat-sub">${p.goal === 'lose' ? 'Deficit −500' : p.goal === 'gain' ? 'Surplus +400' : 'Maintenance'}</div>
      </div>
    </div>
    <div class="alert alert-info" style="margin-top:1rem;">
      <span>💡</span>
      <div>
        <strong>Ideal weight for your height (${p.height} cm):</strong> ${ideal.min}–${ideal.max} kg &nbsp;|&nbsp;
        <strong>Current:</strong> ${p.weight} kg &nbsp;|&nbsp;
        <strong>${p.weight < ideal.min ? `You are ${(ideal.min - p.weight).toFixed(1)} kg below ideal range` : p.weight > ideal.max ? `You are ${(p.weight - ideal.max).toFixed(1)} kg above ideal range` : 'You are within ideal weight range ✓'}</strong>
      </div>
    </div>
  `;
}

// Weight update log
function logWeight() {
  const val = parseFloat(document.getElementById('newWeight').value);
  if (!val || val < 20 || val > 300) { toast('Enter a valid weight', 'error'); return; }

  const wlog = getWeightLog();
  const today = todayStr();
  const idx = wlog.findIndex(w => w.date === today);
  if (idx >= 0) wlog[idx].weight = val;
  else wlog.push({ date: today, weight: val });
  wlog.sort((a, b) => a.date.localeCompare(b.date));
  setData('hn_weight_log', wlog);

  // Also update profile weight
  const p = getProfile();
  if (p) { p.weight = val; p.updatedAt = today; setData('hn_profile', p); renderProfileStats(p); }

  document.getElementById('newWeight').value = '';
  renderWeightLog();
  toast('Weight logged!');
}

function renderWeightLog() {
  const wlog = getWeightLog().slice(-10).reverse();
  const el = document.getElementById('weightLogList');
  if (!wlog.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">⚖️</div><p>No weight entries yet</p></div>'; return; }

  el.innerHTML = wlog.map((w, i) => {
    const prev = wlog[i + 1];
    let changeHtml = '';
    if (prev) {
      const diff = (w.weight - prev.weight).toFixed(1);
      if (diff < 0) changeHtml = `<span class="change change-down">↓ ${Math.abs(diff)} kg</span>`;
      else if (diff > 0) changeHtml = `<span class="change change-up">↑ ${diff} kg</span>`;
      else changeHtml = `<span class="change change-same">→ no change</span>`;
    }
    return `<div class="weight-entry">
      <div>
        <div class="date">${formatDate(w.date)}</div>
        ${changeHtml}
      </div>
      <div class="val">${w.weight} kg</div>
    </div>`;
  }).join('');
}

// ─── FOOD LOG ────────────────────────────────────────────────────────────────
let selectedFood = null;

function renderFoodLog() {
  renderDateNav();
  renderDayLog();
}

function renderDateNav() {
  document.getElementById('logDateDisplay').textContent = formatDate(currentLogDate);
}

function changeLogDate(delta) {
  const d = new Date(currentLogDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  currentLogDate = d.toISOString().split('T')[0];
  renderDateNav();
  renderDayLog();
}

function goToToday() {
  currentLogDate = todayStr();
  renderDateNav();
  renderDayLog();
}

function getLogsForDate(date) {
  return getFoodLog().filter(e => e.date === date);
}

function renderDayLog() {
  const logs = getLogsForDate(currentLogDate);
  const p = getProfile();
  const goalCal = p ? calcGoalCalories(p) : 2000;

  const totalCal = logs.reduce((s, e) => s + e.calories, 0);
  const totalProt = logs.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = logs.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = logs.reduce((s, e) => s + (e.fat || 0), 0);

  const pct = Math.min(100, Math.round((totalCal / goalCal) * 100));
  const fillCls = pct > 110 ? 'fill-red' : pct > 90 ? 'fill-orange' : 'fill-green';

  document.getElementById('dayCalSummary').innerHTML = `
    <div class="grid-4" style="margin-bottom:1rem;">
      <div class="stat-card">
        <div class="stat-value" style="color:#2ecc71;">${totalCal}</div>
        <div class="stat-label">Calories Eaten</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#e74c3c;">${goalCal}</div>
        <div class="stat-label">Daily Goal</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:${goalCal - totalCal >= 0 ? '#3498db' : '#e74c3c'};">${Math.abs(goalCal - totalCal)}</div>
        <div class="stat-label">${goalCal - totalCal >= 0 ? 'Remaining' : 'Over Goal'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#9b59b6;">${pct}%</div>
        <div class="stat-label">Goal Progress</div>
      </div>
    </div>
    <div class="progress-wrap">
      <div class="progress-label"><span>Calorie Progress</span><span>${totalCal} / ${goalCal} kcal</span></div>
      <div class="progress-bar"><div class="progress-fill ${fillCls}" style="width:${pct}%"></div></div>
    </div>
    <div class="macros-row">
      <div class="macro-item"><div class="macro-val macro-protein">${totalProt.toFixed(1)}g</div><div class="macro-lbl">Protein</div></div>
      <div class="macro-item"><div class="macro-val macro-carbs">${totalCarbs.toFixed(1)}g</div><div class="macro-lbl">Carbs</div></div>
      <div class="macro-item"><div class="macro-val macro-fat">${totalFat.toFixed(1)}g</div><div class="macro-lbl">Fat</div></div>
    </div>
  `;

  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snack' };

  let tableRows = '';
  if (!logs.length) {
    tableRows = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🍽️</div><h3>No food logged</h3><p>Add your meals using the form above</p></div></td></tr>`;
  } else {
    meals.forEach(meal => {
      const mealLogs = logs.filter(e => e.meal === meal);
      if (!mealLogs.length) return;
      const mealTotal = mealLogs.reduce((s, e) => s + e.calories, 0);
      tableRows += `<tr style="background:#f8fafc;"><td colspan="6" style="padding:8px 14px;font-weight:700;font-size:0.85rem;color:#2c3e50;">${mealLabels[meal]} — ${mealTotal} kcal</td></tr>`;
      mealLogs.forEach(e => {
        tableRows += `<tr>
          <td><span class="meal-badge meal-${e.meal}">${e.meal}</span></td>
          <td>${e.foodName}</td>
          <td>${e.quantity}g</td>
          <td style="font-weight:700;">${e.calories} kcal</td>
          <td><span style="color:#e74c3c;">${e.protein?.toFixed(1) || 0}g P</span> · <span style="color:#f39c12;">${e.carbs?.toFixed(1) || 0}g C</span> · <span style="color:#9b59b6;">${e.fat?.toFixed(1) || 0}g F</span></td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteFood('${e.id}')">✕</button></td>
        </tr>`;
      });
    });
  }

  document.getElementById('foodLogTable').innerHTML = `
    <table class="food-table">
      <thead><tr><th>Meal</th><th>Food</th><th>Quantity</th><th>Calories</th><th>Macros</th><th></th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;
}

function handleFoodSearch(e) {
  const q = e.target.value;
  const results = searchFoods(q);
  const box = document.getElementById('foodSuggestions');
  if (!results.length) { box.classList.remove('show'); return; }

  box.innerHTML = results.map(f => `
    <div class="suggestion-item" onclick="selectFood('${f[0].replace(/'/g, "\\'")}')">
      <span>${f[0]}</span>
      <span class="suggestion-cal">${f[1]} kcal/100g · ${f[6]}g serving</span>
    </div>`).join('');
  box.classList.add('show');
}

function selectFood(name) {
  const food = FOOD_DB.find(f => f[0] === name);
  if (!food) return;
  selectedFood = food;
  document.getElementById('foodSearch').value = food[0];
  document.getElementById('foodQuantity').value = food[6];
  document.getElementById('foodSuggestions').classList.remove('show');
  updateFoodPreview();
}

function updateFoodPreview() {
  if (!selectedFood) return;
  const qty = parseFloat(document.getElementById('foodQuantity').value) || 0;
  const factor = qty / 100;
  const cal = Math.round(selectedFood[1] * factor);
  const prot = (selectedFood[2] * factor).toFixed(1);
  const carbs = (selectedFood[3] * factor).toFixed(1);
  const fat = (selectedFood[4] * factor).toFixed(1);

  document.getElementById('foodPreview').innerHTML = `
    <div class="alert alert-success">
      <span>📊</span>
      <div>For <strong>${qty}g of ${selectedFood[0]}</strong>: &nbsp;
        <strong>${cal} kcal</strong> &nbsp;·&nbsp;
        Protein: <strong>${prot}g</strong> &nbsp;·&nbsp;
        Carbs: <strong>${carbs}g</strong> &nbsp;·&nbsp;
        Fat: <strong>${fat}g</strong>
      </div>
    </div>`;
}

function addFood() {
  if (!selectedFood) { toast('Please select a food from the list', 'error'); return; }
  const meal = document.getElementById('foodMeal').value;
  const qty = parseFloat(document.getElementById('foodQuantity').value);
  if (!qty || qty <= 0) { toast('Enter a valid quantity', 'error'); return; }

  const factor = qty / 100;
  const entry = {
    id: Date.now().toString(),
    date: currentLogDate,
    meal,
    foodName: selectedFood[0],
    quantity: qty,
    calories: Math.round(selectedFood[1] * factor),
    protein: parseFloat((selectedFood[2] * factor).toFixed(1)),
    carbs: parseFloat((selectedFood[3] * factor).toFixed(1)),
    fat: parseFloat((selectedFood[4] * factor).toFixed(1)),
  };

  const log = getFoodLog();
  log.push(entry);
  setData('hn_food_log', log);

  // Reset form
  selectedFood = null;
  document.getElementById('foodSearch').value = '';
  document.getElementById('foodQuantity').value = '';
  document.getElementById('foodPreview').innerHTML = '';
  document.getElementById('foodSuggestions').classList.remove('show');

  renderDayLog();
  toast(`${entry.foodName} added (${entry.calories} kcal)!`);
}

function deleteFood(id) {
  const log = getFoodLog().filter(e => e.id !== id);
  setData('hn_food_log', log);
  renderDayLog();
  toast('Entry removed', 'error');
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function renderDashboard() {
  const p = getProfile();
  if (!p) {
    document.getElementById('dashContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👤</div>
        <h3>Welcome to HealthNote!</h3>
        <p>Set up your profile first to see your personalised dashboard.</p>
        <button class="btn btn-primary" style="margin-top:1rem;" onclick="showSection('profile')">Set Up Profile</button>
      </div>`;
    return;
  }

  const bmi = calcBMI(p.weight, p.height);
  const cat = bmiCategory(bmi);
  const goalCal = calcGoalCalories(p);
  const todayLogs = getLogsForDate(todayStr());
  const todayCal = todayLogs.reduce((s, e) => s + e.calories, 0);
  const remaining = goalCal - todayCal;
  const wlog = getWeightLog();
  const ideal = idealWeightRange(p.height);

  // 7-day calorie data
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const cal = getFoodLog().filter(e => e.date === ds).reduce((s, e) => s + e.calories, 0);
    days7.push({ date: ds, cal, label: formatDateShort(ds) });
  }

  document.getElementById('dashContent').innerHTML = `
    <div class="alert alert-info" style="margin-bottom:1.5rem;">
      <span>👋</span>
      <span>Good ${greeting()}, <strong>${p.name}</strong>! Here's your health overview for today.</span>
    </div>

    <div class="grid-4" style="margin-bottom:1.5rem;">
      <div class="stat-card">
        <div class="stat-value ${cat.cls}">${bmi}</div>
        <div class="stat-label">BMI</div>
        <div class="stat-sub" style="color:${cat.color};font-weight:700;">${cat.label}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#2ecc71;">${todayCal}</div>
        <div class="stat-label">Today's Calories</div>
        <div class="stat-sub">Goal: ${goalCal} kcal</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:${remaining >= 0 ? '#3498db' : '#e74c3c'};">${Math.abs(remaining)}</div>
        <div class="stat-label">${remaining >= 0 ? 'Kcal Remaining' : 'Kcal Over'}</div>
        <div class="stat-sub">${remaining >= 0 ? 'Keep going!' : 'Over your limit'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#9b59b6;">${p.weight} kg</div>
        <div class="stat-label">Current Weight</div>
        <div class="stat-sub">Ideal: ${ideal.min}–${ideal.max} kg</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title"><span class="icon">📈</span>7-Day Calorie Intake</div>
        <div class="chart-container"><canvas id="calChart7"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">⚖️</span>Weight Trend</div>
        <div class="chart-container"><canvas id="weightChartDash"></canvas></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title"><span class="icon">🎯</span>Today's Progress</div>
        ${renderTodayProgress(todayLogs, p)}
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">💡</span>Quick Tips</div>
        ${renderQuickTips(p, bmi)}
      </div>
    </div>`;

  // Charts
  setTimeout(() => {
    const calCtx = document.getElementById('calChart7')?.getContext('2d');
    if (calCtx) {
      new Chart(calCtx, {
        type: 'bar',
        data: {
          labels: days7.map(d => d.label),
          datasets: [{
            label: 'Calories',
            data: days7.map(d => d.cal),
            backgroundColor: days7.map(d => d.cal > goalCal ? '#e74c3c88' : '#2ecc7188'),
            borderColor: days7.map(d => d.cal > goalCal ? '#e74c3c' : '#2ecc71'),
            borderWidth: 2, borderRadius: 6,
          }, {
            label: 'Goal',
            data: days7.map(() => goalCal),
            type: 'line', borderColor: '#e74c3c', borderDash: [6, 3],
            borderWidth: 2, pointRadius: 0, fill: false,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    const wCtx = document.getElementById('weightChartDash')?.getContext('2d');
    if (wCtx && wlog.length) {
      const recent = wlog.slice(-14);
      new Chart(wCtx, {
        type: 'line',
        data: {
          labels: recent.map(w => formatDateShort(w.date)),
          datasets: [{
            label: 'Weight (kg)',
            data: recent.map(w => w.weight),
            borderColor: '#3498db', backgroundColor: '#3498db22',
            borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.3,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
      });
    }
  }, 50);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function renderTodayProgress(logs, p) {
  const goalCal = calcGoalCalories(p);
  const totalCal = logs.reduce((s, e) => s + e.calories, 0);
  const totalProt = logs.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = logs.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = logs.reduce((s, e) => s + (e.fat || 0), 0);
  const protGoal = Math.round(p.weight * 1.6);
  const carbGoal = Math.round(goalCal * 0.5 / 4);
  const fatGoal = Math.round(goalCal * 0.25 / 9);

  const rows = [
    { label: 'Calories', val: totalCal, goal: goalCal, unit: 'kcal', cls: 'fill-green' },
    { label: 'Protein', val: Math.round(totalProt), goal: protGoal, unit: 'g', cls: 'fill-red' },
    { label: 'Carbohydrates', val: Math.round(totalCarbs), goal: carbGoal, unit: 'g', cls: 'fill-orange' },
    { label: 'Fat', val: Math.round(totalFat), goal: fatGoal, unit: 'g', cls: 'fill-blue' },
  ];

  return rows.map(r => `
    <div class="progress-wrap">
      <div class="progress-label"><span>${r.label}</span><span>${r.val} / ${r.goal} ${r.unit}</span></div>
      <div class="progress-bar"><div class="progress-fill ${r.cls}" style="width:${Math.min(100, Math.round(r.val/r.goal*100))}%"></div></div>
    </div>`).join('');
}

function renderQuickTips(p, bmi) {
  const tips = [];
  if (bmi > 25) tips.push({ icon: '🥗', title: 'Reduce portion sizes', desc: 'Try eating 20% less at each meal. Use smaller plates to help.' });
  if (bmi < 18.5) tips.push({ icon: '💪', title: 'Increase calorie intake', desc: 'Add healthy calorie-dense foods like nuts, avocado, and whole grains.' });
  tips.push({ icon: '💧', title: 'Stay hydrated', desc: 'Drink 8–10 glasses of water daily. Often thirst is mistaken for hunger.' });
  if (p.goal === 'lose') tips.push({ icon: '🚶', title: 'Move more', desc: 'A 30-minute brisk walk burns ~150 kcal and boosts metabolism.' });
  tips.push({ icon: '🥦', title: 'Eat more vegetables', desc: 'Aim for 5 servings of fruits & vegetables daily for fiber and micronutrients.' });
  tips.push({ icon: '😴', title: 'Prioritize sleep', desc: 'Poor sleep increases hunger hormones. Aim for 7–8 hours every night.' });

  return tips.slice(0, 4).map(t => `
    <div class="recommendation-item">
      <div class="rec-icon">${t.icon}</div>
      <div class="rec-text"><strong>${t.title}</strong><span>${t.desc}</span></div>
    </div>`).join('');
}

// ─── REPORT ──────────────────────────────────────────────────────────────────
function renderReport() {
  const p = getProfile();
  if (!p) {
    document.getElementById('reportContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No profile found</h3>
        <p>Please complete your profile to generate a health report.</p>
        <button class="btn btn-primary" style="margin-top:1rem;" onclick="showSection('profile')">Set Up Profile</button>
      </div>`;
    return;
  }

  const bmi = parseFloat(calcBMI(p.weight, p.height));
  const cat = bmiCategory(bmi);
  const goalCal = calcGoalCalories(p);
  const wlog = getWeightLog();
  const allLogs = getFoodLog();

  // Last 30 days stats
  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayLogs = allLogs.filter(e => e.date === ds);
    if (dayLogs.length) {
      days30.push({
        date: ds,
        cal: dayLogs.reduce((s, e) => s + e.calories, 0),
        prot: dayLogs.reduce((s, e) => s + (e.protein || 0), 0),
        carbs: dayLogs.reduce((s, e) => s + (e.carbs || 0), 0),
        fat: dayLogs.reduce((s, e) => s + (e.fat || 0), 0),
      });
    }
  }

  const loggedDays = days30.length;
  const avgCal = loggedDays ? Math.round(days30.reduce((s, d) => s + d.cal, 0) / loggedDays) : 0;
  const avgProt = loggedDays ? (days30.reduce((s, d) => s + d.prot, 0) / loggedDays).toFixed(1) : 0;

  // Weight change
  let weightChange = null;
  if (wlog.length >= 2) {
    weightChange = (wlog[wlog.length - 1].weight - wlog[0].weight).toFixed(1);
  }

  const recommendations = buildRecommendations(p, bmi, avgCal, goalCal, parseFloat(avgProt));

  document.getElementById('reportContent').innerHTML = `
    <div class="report-header">
      <h2>📋 Health Report — ${p.name}</h2>
      <p>Generated on ${formatDate(todayStr())} &nbsp;|&nbsp; Data covers last 30 days</p>
    </div>

    <div class="grid-2" style="margin-bottom:1.5rem;">
      <div class="card">
        <div class="card-title"><span class="icon">👤</span>Body Profile</div>
        <div class="grid-2">
          <div><label>Height</label><div style="font-size:1.2rem;font-weight:700;">${p.height} cm</div></div>
          <div><label>Weight</label><div style="font-size:1.2rem;font-weight:700;">${p.weight} kg</div></div>
          <div><label>Age</label><div style="font-size:1.2rem;font-weight:700;">${p.age} yrs</div></div>
          <div><label>Gender</label><div style="font-size:1.2rem;font-weight:700;">${p.gender === 'male' ? 'Male' : 'Female'}</div></div>
        </div>
        <div class="divider"></div>
        <div style="text-align:center;">
          <div class="stat-value ${cat.cls}" style="font-size:3rem;">${bmi}</div>
          <div class="stat-label">BMI — <span style="color:${cat.color};font-weight:700;">${cat.label}</span></div>
          ${renderBMIBar(bmi)}
        </div>
        ${weightChange !== null ? `<div class="alert ${parseFloat(weightChange) < 0 ? 'alert-success' : parseFloat(weightChange) > 0 ? 'alert-warning' : 'alert-info'}" style="margin-top:1rem;">
          <span>${parseFloat(weightChange) < 0 ? '📉' : parseFloat(weightChange) > 0 ? '📈' : '↔️'}</span>
          <div>Weight change since first entry: <strong>${weightChange > 0 ? '+' : ''}${weightChange} kg</strong></div>
        </div>` : ''}
      </div>

      <div class="card">
        <div class="card-title"><span class="icon">🍽️</span>Nutrition Summary (30 days)</div>
        ${loggedDays === 0 ? '<div class="empty-state"><div class="empty-icon">📊</div><p>No food data logged yet</p></div>' : `
          <div class="grid-2" style="margin-bottom:1rem;">
            <div class="stat-card"><div class="stat-value" style="font-size:1.5rem;color:#2ecc71;">${loggedDays}</div><div class="stat-label">Days Logged</div></div>
            <div class="stat-card"><div class="stat-value" style="font-size:1.5rem;color:#3498db;">${avgCal}</div><div class="stat-label">Avg kcal/day</div></div>
          </div>
          <div class="progress-wrap">
            <div class="progress-label"><span>Avg vs Goal (${goalCal} kcal)</span><span>${avgCal} kcal</span></div>
            <div class="progress-bar"><div class="progress-fill ${avgCal > goalCal * 1.1 ? 'fill-red' : avgCal < goalCal * 0.8 ? 'fill-blue' : 'fill-green'}" style="width:${Math.min(120, Math.round(avgCal/goalCal*100))}%"></div></div>
          </div>
          <div class="macros-row" style="margin-top:1.2rem;">
            <div class="macro-item"><div class="macro-val macro-protein">${avgProt}g</div><div class="macro-lbl">Avg Protein</div></div>
            <div class="macro-item"><div class="macro-val macro-carbs">${(days30.reduce((s,d)=>s+d.carbs,0)/Math.max(1,loggedDays)).toFixed(1)}g</div><div class="macro-lbl">Avg Carbs</div></div>
            <div class="macro-item"><div class="macro-val macro-fat">${(days30.reduce((s,d)=>s+d.fat,0)/Math.max(1,loggedDays)).toFixed(1)}g</div><div class="macro-lbl">Avg Fat</div></div>
          </div>
        `}
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:1.5rem;">
      <div class="card">
        <div class="card-title"><span class="icon">📈</span>Calorie Trend (30 days)</div>
        <div class="chart-container"><canvas id="calTrendChart"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon">⚖️</span>Weight History</div>
        <div class="chart-container"><canvas id="weightTrendChart"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">💊</span>Personalised Health Recommendations</div>
      ${recommendations.map(r => `
        <div class="recommendation-item">
          <div class="rec-icon">${r.icon}</div>
          <div class="rec-text"><strong>${r.title}</strong><span>${r.desc}</span></div>
        </div>`).join('')}
    </div>`;

  setTimeout(() => {
    // Calorie trend chart
    const calCtx = document.getElementById('calTrendChart')?.getContext('2d');
    if (calCtx) {
      new Chart(calCtx, {
        type: 'line',
        data: {
          labels: days30.map(d => formatDateShort(d.date)),
          datasets: [{
            label: 'Calories',
            data: days30.map(d => d.cal),
            borderColor: '#2ecc71', backgroundColor: '#2ecc7122',
            borderWidth: 2, fill: true, tension: 0.3, pointRadius: 3,
          }, {
            label: 'Goal',
            data: days30.map(() => goalCal),
            borderColor: '#e74c3c', borderDash: [6, 3], borderWidth: 2,
            pointRadius: 0, fill: false,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
      });
    }

    // Weight trend chart
    const wCtx = document.getElementById('weightTrendChart')?.getContext('2d');
    if (wCtx && wlog.length) {
      new Chart(wCtx, {
        type: 'line',
        data: {
          labels: wlog.map(w => formatDateShort(w.date)),
          datasets: [{
            label: 'Weight (kg)',
            data: wlog.map(w => w.weight),
            borderColor: '#3498db', backgroundColor: '#3498db22',
            borderWidth: 2.5, fill: true, tension: 0.3, pointRadius: 4,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
      });
    }
  }, 50);
}

function renderBMIBar(bmi) {
  const pct = Math.min(100, Math.max(0, ((bmi - 10) / (45 - 10)) * 100));
  return `
    <div style="margin-top:1rem;position:relative;">
      <div style="height:16px;border-radius:99px;background:linear-gradient(90deg,#3498db 0%,#2ecc71 35%,#f39c12 60%,#e74c3c 100%);"></div>
      <div style="position:absolute;top:-6px;left:${pct}%;transform:translateX(-50%);">
        <div style="width:3px;height:28px;background:#2c3e50;margin:0 auto;border-radius:2px;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:0.72rem;color:#7f8c8d;">
        <span>Underweight<br>&lt;18.5</span><span style="text-align:center;">Normal<br>18.5–24.9</span><span style="text-align:center;">Overweight<br>25–29.9</span><span style="text-align:right;">Obese<br>≥30</span>
      </div>
    </div>`;
}

function buildRecommendations(p, bmi, avgCal, goalCal, avgProt) {
  const recs = [];
  const protTarget = p.weight * 1.6;

  if (bmi < 18.5) {
    recs.push({ icon: '🥑', title: 'Increase healthy calorie intake', desc: `Your BMI of ${bmi} indicates underweight. Add calorie-dense foods like nuts, seeds, avocado, whole milk, and legumes. Aim for ${goalCal} kcal/day.` });
    recs.push({ icon: '💪', title: 'Focus on strength training', desc: 'Incorporate resistance training 3× per week to build muscle mass along with adequate protein intake.' });
  } else if (bmi >= 25 && bmi < 30) {
    recs.push({ icon: '🥗', title: 'Create a calorie deficit', desc: `Your BMI of ${bmi} is in the overweight range. Aim for ${goalCal} kcal/day (a ~500 kcal deficit) for safe weight loss of ~0.5 kg/week.` });
    recs.push({ icon: '🚴', title: 'Increase cardio activity', desc: '150 minutes of moderate-intensity cardio per week (30 min × 5 days) helps burn extra calories and improves heart health.' });
  } else if (bmi >= 30) {
    recs.push({ icon: '🏥', title: 'Consult a healthcare provider', desc: `BMI of ${bmi} is in the obese range. A doctor or registered dietitian can provide a personalised weight management plan.` });
    recs.push({ icon: '🥦', title: 'Fill half your plate with vegetables', desc: 'Low-calorie, high-fiber vegetables help you feel full while reducing overall calorie intake significantly.' });
  } else {
    recs.push({ icon: '✅', title: 'Maintain your healthy weight', desc: `Your BMI of ${bmi} is in the normal range. Continue your balanced diet and active lifestyle to maintain this.` });
  }

  if (avgCal > 0 && avgCal > goalCal * 1.1) {
    recs.push({ icon: '⚠️', title: 'Reduce daily calorie intake', desc: `You're averaging ${avgCal} kcal/day vs your goal of ${goalCal} kcal. Try reducing portion sizes or cutting high-calorie snacks.` });
  } else if (avgCal > 0 && avgCal < goalCal * 0.75) {
    recs.push({ icon: '🍳', title: 'Eat enough to fuel your body', desc: `Your average of ${avgCal} kcal is too low. Under-eating slows metabolism and causes muscle loss. Aim for at least ${Math.round(goalCal * 0.85)} kcal/day.` });
  }

  if (avgProt > 0 && avgProt < protTarget * 0.75) {
    recs.push({ icon: '🥩', title: 'Increase protein intake', desc: `You're averaging ${avgProt}g protein/day but need ~${Math.round(protTarget)}g (1.6g per kg body weight). Add eggs, chicken, paneer, dal, or whey protein.` });
  }

  recs.push({ icon: '💧', title: 'Drink more water', desc: 'Aim for 35ml/kg body weight = ' + Math.round(p.weight * 35 / 1000 * 10) / 10 + ' litres/day. Water boosts metabolism and reduces hunger.' });
  recs.push({ icon: '😴', title: 'Get 7–8 hours of quality sleep', desc: 'Sleep deprivation raises cortisol and ghrelin (hunger hormone), making weight management significantly harder.' });
  recs.push({ icon: '🧘', title: 'Manage stress levels', desc: 'Chronic stress leads to emotional eating and weight gain. Try meditation, yoga, or breathing exercises daily.' });

  if (p.activity === 'sedentary') {
    recs.push({ icon: '🚶', title: 'Start moving — any movement counts', desc: 'Even a 20-minute daily walk improves insulin sensitivity, mood, and metabolism. Start small and build up gradually.' });
  }

  return recs;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav clicks
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  // Food search
  const foodInput = document.getElementById('foodSearch');
  if (foodInput) {
    foodInput.addEventListener('input', handleFoodSearch);
    document.addEventListener('click', e => {
      if (!e.target.closest('.food-search-wrap')) {
        document.getElementById('foodSuggestions').classList.remove('show');
      }
    });
  }

  // Quantity change
  const qtyInput = document.getElementById('foodQuantity');
  if (qtyInput) qtyInput.addEventListener('input', updateFoodPreview);

  initProfileSection();
  renderWeightLog();
  renderDashboard();
});
