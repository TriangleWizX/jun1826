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

console.log('Client availability JS test passed!');
