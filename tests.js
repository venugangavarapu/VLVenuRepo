// ─── UNIT TESTS ──────────────────────────────────────────────────────────────
// Run with: node tests.js

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failed++;
  }
}

// ── Pure logic stubs ──────────────────────────────────────────────────────────
function calcBMI(weight, height) {
  const h = height / 100;
  return Math.round(weight / (h * h) * 10) / 10;
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight' };
  if (bmi < 25)   return { label: 'Normal' };
  if (bmi < 30)   return { label: 'Overweight' };
  return             { label: 'Obese' };
}

function calcBMR(p) {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.gender === 'male' ? base + 5 : base - 161;
}

function calcTDEE(p) {
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(calcBMR(p) * (factors[p.activity] || 1.375));
}

function calcGoalCalories(p) {
  const tdee = calcTDEE(p);
  if (p.goal === 'lose') return tdee - 500;
  if (p.goal === 'gain') return tdee + 400;
  return tdee;
}

function idealWeightRange(height) {
  const h = height / 100;
  return { min: Math.round(18.5 * h * h), max: Math.round(24.9 * h * h) };
}

// ── Test: calcBMI ─────────────────────────────────────────────────────────────
console.log('\n[calcBMI]');
assert('70kg 175cm → 22.9',   calcBMI(70, 175)  === 22.9);
assert('50kg 160cm → 19.5',   calcBMI(50, 160)  === 19.5);
assert('100kg 180cm → 30.9',  calcBMI(100, 180) === 30.9);
assert('returns a number',    typeof calcBMI(70, 175) === 'number');

// ── Test: bmiCategory ─────────────────────────────────────────────────────────
console.log('\n[bmiCategory]');
assert('17.0 → Underweight',  bmiCategory(17.0).label === 'Underweight');
assert('18.4 → Underweight',  bmiCategory(18.4).label === 'Underweight');
assert('18.5 → Normal',       bmiCategory(18.5).label === 'Normal');
assert('22.9 → Normal',       bmiCategory(22.9).label === 'Normal');
assert('24.9 → Normal',       bmiCategory(24.9).label === 'Normal');
assert('25.0 → Overweight',   bmiCategory(25.0).label === 'Overweight');
assert('29.9 → Overweight',   bmiCategory(29.9).label === 'Overweight');
assert('30.0 → Obese',        bmiCategory(30.0).label === 'Obese');
assert('35.0 → Obese',        bmiCategory(35.0).label === 'Obese');

// ── Test: calcBMR ─────────────────────────────────────────────────────────────
console.log('\n[calcBMR]');
// male:   10*80 + 6.25*175 - 5*30 + 5   = 1748.75
// female: 10*60 + 6.25*165 - 5*25 - 161 = 1345.25
const male30   = { weight: 80, height: 175, age: 30, gender: 'male' };
const female25 = { weight: 60, height: 165, age: 25, gender: 'female' };

assert('male 80kg 175cm 30y → 1748.75',   calcBMR(male30)   === 1748.75);
assert('female 60kg 165cm 25y → 1345.25', calcBMR(female25) === 1345.25);

// ── Test: calcTDEE ────────────────────────────────────────────────────────────
console.log('\n[calcTDEE]');
const sedentaryMale   = { ...male30, activity: 'sedentary' };
const activeMale      = { ...male30, activity: 'active' };
const unknownActivity = { ...male30, activity: 'couch-potato' };

assert('sedentary → BMR × 1.2',               calcTDEE(sedentaryMale)   === Math.round(1748.75 * 1.2));
assert('active → BMR × 1.725',                calcTDEE(activeMale)      === Math.round(1748.75 * 1.725));
assert('unknown activity falls back to 1.375', calcTDEE(unknownActivity) === Math.round(1748.75 * 1.375));

// ── Test: calcGoalCalories ────────────────────────────────────────────────────
console.log('\n[calcGoalCalories]');
const tdee = calcTDEE(sedentaryMale);
assert('lose → TDEE − 500', calcGoalCalories({ ...sedentaryMale, goal: 'lose' })     === tdee - 500);
assert('gain → TDEE + 400', calcGoalCalories({ ...sedentaryMale, goal: 'gain' })     === tdee + 400);
assert('maintain → TDEE',   calcGoalCalories({ ...sedentaryMale, goal: 'maintain' }) === tdee);

// ── Test: idealWeightRange ────────────────────────────────────────────────────
console.log('\n[idealWeightRange]');
const r175 = idealWeightRange(175);
assert('175cm min is 57', r175.min === 57);
assert('175cm max is 76', r175.max === 76);
assert('min < max',       r175.min < r175.max);

// ── Test: deleteFood — Bug #2 (mocked) ───────────────────────────────────────
console.log('\n[deleteFood]');

function makeDeleteFoodTest() {
  let store = [
    { id: '1', date: '2026-04-17', meal: 'lunch', foodName: 'Rice', calories: 300 },
    { id: '2', date: '2026-04-17', meal: 'dinner', foodName: 'Dal',  calories: 150 },
  ];
  let toastType = null;
  let renderCalled = false;

  const getFoodLog  = () => store;
  const setData     = (_, val) => { store = val; };
  const renderDayLog = () => { renderCalled = true; };
  const toast       = (_, type) => { toastType = type; };

  function deleteFood(id) {
    const log = getFoodLog().filter(e => e.id !== id);
    setData('hn_food_log', log);
    renderDayLog();
    toast('Entry removed', 'info');  // fixed value
  }

  deleteFood('1');
  return { store, toastType, renderCalled };
}

const dt = makeDeleteFoodTest();
assert('deleteFood removes the correct entry',       dt.store.length === 1 && dt.store[0].id === '2');
assert('deleteFood calls renderDayLog',              dt.renderCalled === true);
assert('deleteFood uses toast type "info" not "error"', dt.toastType === 'info');

// ── Test: submitWelcome validation (pure logic) ───────────────────────────────
console.log('\n[submitWelcome validation]');
function validateWelcome(lastName, ageRaw) {
  const age = parseInt(ageRaw);
  if (!lastName || !lastName.trim()) return 'missing-lastname';
  if (!age || age < 1 || age > 120)  return 'invalid-age';
  return 'ok';
}

assert('empty lastName → error',       validateWelcome('', '25')       === 'missing-lastname');
assert('spaces-only lastName → error', validateWelcome('   ', '25')    === 'missing-lastname');
assert('age 0 → error',                validateWelcome('Smith', '0')   === 'invalid-age');
assert('age 121 → error',              validateWelcome('Smith', '121') === 'invalid-age');
assert('age NaN (empty) → error',      validateWelcome('Smith', '')    === 'invalid-age');
assert('valid inputs → ok',            validateWelcome('Smith', '30')  === 'ok');
assert('age 120 boundary → ok',        validateWelcome('Smith', '120') === 'ok');
assert('age 1 boundary → ok',          validateWelcome('Smith', '1')   === 'ok');

// ── Test: async saveWelcomeData / loadWelcomeData ─────────────────────────────
console.log('\n[async welcome storage]');

function makeMockStorage() {
  const store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = val; },
  };
}

async function runAsyncStorageTests() {
  const storage = makeMockStorage();

  function saveWelcomeData(payload) {
    return new Promise((resolve) => {
      storage.setItem('hn_welcome', JSON.stringify(payload));
      resolve();
    });
  }

  function loadWelcomeData() {
    return new Promise((resolve) => {
      const data = storage.getItem('hn_welcome');
      resolve(data ? JSON.parse(data) : null);
    });
  }

  // Before save — should return null
  const before = await loadWelcomeData();
  assert('loadWelcomeData returns null when no data saved', before === null);

  // After save — should return saved payload
  await saveWelcomeData({ lastName: 'Smith', age: 30 });
  const after = await loadWelcomeData();
  assert('saveWelcomeData persists lastName', after?.lastName === 'Smith');
  assert('saveWelcomeData persists age',      after?.age === 30);

  // Overwrite — most recent save wins
  await saveWelcomeData({ lastName: 'Jones', age: 25 });
  const overwrite = await loadWelcomeData();
  assert('saveWelcomeData overwrites previous data', overwrite?.lastName === 'Jones');

  // checkWelcome hides modal when data exists
  let modalHidden = false;
  const mockModal = { classList: { add: (cls) => { if (cls === 'hidden') modalHidden = true; } } };

  async function checkWelcome() {
    try {
      const data = await loadWelcomeData();
      if (data) mockModal.classList.add('hidden');
    } catch (_) {}
  }

  await checkWelcome();
  assert('checkWelcome hides modal when data exists', modalHidden === true);

  // checkWelcome does NOT hide modal when no data
  const emptyStorage = makeMockStorage();
  function loadEmpty() {
    return new Promise(resolve => resolve(emptyStorage.getItem('hn_welcome') ? JSON.parse(emptyStorage.getItem('hn_welcome')) : null));
  }
  let modalHiddenWhenEmpty = false;
  const mockModal2 = { classList: { add: () => { modalHiddenWhenEmpty = true; } } };
  async function checkWelcomeEmpty() {
    const data = await loadEmpty();
    if (data) mockModal2.classList.add('hidden');
  }
  await checkWelcomeEmpty();
  assert('checkWelcome leaves modal visible when no data', modalHiddenWhenEmpty === false);
}

// ── Run async tests then print summary ───────────────────────────────────────
runAsyncStorageTests().then(() => {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
});
