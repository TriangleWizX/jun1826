import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const code = fs.readFileSync(path.join(process.cwd(), 'js/first-visit-availability.js'), 'utf8');

const makeContext = () => {
  const domListeners = {};
  const elements = [];
  const events = [];

  const document = {
    readyState: 'complete',
    addEventListener(type, handler) {
      domListeners[type] = handler;
    },
    querySelectorAll(selector) {
      return elements.filter((el) => el.matches(selector));
    },
    createElement(tag) {
      return { tagName: tag, classList: { add() {}, remove() {} }, setAttribute() {} };
    }
  };

  const storage = new Map();
  const sessionStorage = {
    getItem(k) { return storage.get(k) || null; },
    setItem(k, v) { storage.set(k, String(v)); },
    removeItem(k) { storage.delete(k); }
  };

  const window = {
    document,
    sessionStorage,
    dataLayer: [],
    gtag(type, name, payload) {
      if (type === 'event') events.push({ name, payload });
    },
    fetch() {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'available',
          month: 'September',
          monthNumber: 9,
          year: 2026,
          daysRemaining: 19,
          availableSlotCount: 5,
          nextAvailableAt: '2026-09-14T16:00:00-04:00',
          nextAvailableLabel: 'Mon, Sep 14',
          availabilityLevel: 'low',
          generatedAt: new Date().toISOString()
        })
      });
    }
  };

  const context = {
    window,
    document,
    sessionStorage,
    fetch: window.fetch,
    Intl,
    Date,
    Math,
    parseInt,
    console
  };
  context.globalThis = context;
  return { context, events, storage };
};

const { context, events } = makeContext();
const vmContext = vm.createContext(context);
vm.runInContext(code, vmContext);

const api = context.window.SenseiAvailability;
assert.ok(api, 'SenseiAvailability should be exposed');

// Test formatScarcityCopy
// 1. High inventory (>= 13)
const high = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 20,
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(high.text, /First visits available this week/);
assert.match(high.text, /Mon, Sep 14/);
assert.doesNotMatch(high.text, /20/);

// 2. Medium inventory (7-12)
const med = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 8,
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(med.text, /8 first visits available this week/);
assert.match(med.text, /Mon, Sep 14/);

// 3. Low inventory (3-6)
const low = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 4,
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(low.text, /Only 4 first visits left this week/);
assert.match(low.text, /Mon, Sep 14/);

// 4. Very low inventory (1-2)
const veryLow = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 1,
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(veryLow.text, /Only 1 first visit left this week/);

// 5. Full (0)
const full = api.formatScarcityCopy({
  status: 'full',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 0
});
assert.match(full.text, /This week is full · Check next week’s availability/);

// 6. Fallback
const fallback = api.formatScarcityCopy({
  status: 'unavailable',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: null
});
assert.match(fallback.text, /First visits available this week · Check available times/);

// 7. Coming week framing (Sunday / upcoming week)
const coming = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this coming week',
  availableSlotCount: 8,
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(coming.text, /8 first visits available this coming week · Next opening: Mon, Sep 14/);

// 8. Coming week full
const comingFull = api.formatScarcityCopy({
  status: 'full',
  timeframe: 'week',
  timeframeLabel: 'this coming week',
  availableSlotCount: 0
});
assert.match(comingFull.text, /This coming week is full · Check next week’s availability/);

// 9. getNYDateInfo structure test
const dateInfo = api.getNYDateInfo();
assert.ok(typeof dateInfo.year === 'number', 'year should be number');
assert.ok(typeof dateInfo.monthNumber === 'number', 'monthNumber should be number');
assert.ok(typeof dateInfo.dayOfWeek === 'number', 'dayOfWeek should be number');
assert.ok(dateInfo.dayOfWeek >= 1 && dateInfo.dayOfWeek <= 7, 'dayOfWeek between 1 and 7');
assert.ok(typeof dateInfo.timeframeLabel === 'string', 'timeframeLabel should be string');
assert.ok(typeof dateInfo.daysRemaining === 'number', 'daysRemaining should be number');

// 10. Medium inventory with daily adaptive parameters
const dailyMed = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 8,
  spotsPerDayLabel: '1–2 spots left each day',
  spotsPerDayRange: '1–2',
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(dailyMed.text, /8 first visits available this week · 1–2 spots left each day · Next opening: Mon, Sep 14/);
assert.equal(dailyMed.badge, '1–2/day');
assert.equal(dailyMed.detail, '1–2 spots left each day');

// 11. Low inventory with daily adaptive parameters
const dailyLow = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 4,
  spotsPerDayLabel: '1 spot left each day',
  spotsPerDayRange: '1',
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(dailyLow.text, /Only 4 first visits left this week · 1 spot left each day · Next opening: Mon, Sep 14/);
assert.equal(dailyLow.badge, '1/day');
assert.match(dailyLow.detail, /1 spot left each day/);

// 12. High inventory with daily adaptive parameters
const dailyHigh = api.formatScarcityCopy({
  status: 'available',
  timeframe: 'week',
  timeframeLabel: 'this week',
  availableSlotCount: 18,
  spotsPerDayLabel: '2–3 spots left each day',
  spotsPerDayRange: '2–3',
  nextAvailableLabel: 'Mon, Sep 14'
});
assert.match(dailyHigh.text, /First visits available this week · 2–3 spots left each day · Next opening: Mon, Sep 14/);
assert.equal(dailyHigh.badge, '2–3/day');

// 13. Requested date adaptive copy with spots left
const reqDate = api.formatScarcityCopy({
  status: 'available',
  requestedDate: '2026-09-15',
  requestedDateSpots: 2,
  requestedDateLabel: 'Tue, Sep 15'
});
assert.match(reqDate.text, /Only 2 spots left on Tue, Sep 15 · Reserve your first visit/);
assert.equal(reqDate.badge, '2 Left');
assert.equal(reqDate.status, 'low');

// 14. Requested date full
const reqDateFull = api.formatScarcityCopy({
  status: 'full',
  requestedDate: '2026-09-15',
  requestedDateSpots: 0,
  requestedDateLabel: 'Tue, Sep 15'
});
assert.match(reqDateFull.text, /Tue, Sep 15 is full · Check other days this week/);
assert.equal(reqDateFull.badge, 'Full');
assert.equal(reqDateFull.status, 'full');

// 15. Helper functions exposed
assert.equal(typeof api.getDailyAvailability, 'function', 'getDailyAvailability should be function');
assert.equal(typeof api.getSpotsForDate, 'function', 'getSpotsForDate should be function');
assert.equal(typeof api.fetchAvailability, 'function', 'fetchAvailability should be function');

console.log('Client availability JS test passed!');
