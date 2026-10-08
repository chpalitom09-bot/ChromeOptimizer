// Logique partagée : réglages, analyse des onglets, optimisation.
// Rien ne tourne ici tant qu'une fonction n'est pas appelée.

export const DEFAULTS = {
  mode: 'auto',            // 'auto' : une alarme par minute | 'manual' : aucun réveil
  idleMinutes: 30,         // délai avant mise en veille
  duplicates: 'manual',    // 'off' | 'manual' (sur clic) | 'auto' (à chaque cycle)
  protectedSites: []       // domaines à ne jamais toucher
};
export const MIN_IDLE = 5;

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  const s = { ...DEFAULTS, ...(settings || {}) };
  s.idleMinutes = Math.max(MIN_IDLE, Number(s.idleMinutes) || DEFAULTS.idleMinutes);
  if (!Array.isArray(s.protectedSites)) s.protectedSites = [];
  return s;
}

export async function saveSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ settings: next });
  return next;
}

export async function getStats() {
  const { stats } = await chrome.storage.local.get('stats');
  return { slept: 0, closed: 0, runs: 0, lastRun: 0, ...(stats || {}) };
}

export async function resetStats() {
  await chrome.storage.local.remove('stats');
}

/* ---------- Adresses ---------- */

export function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return ''; }
}

export function normalizeSites(text) {
  const out = [];
  String(text || '').split(/[\s,;]+/).forEach((raw) => {
    let d = raw.trim().toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
    if (d && !out.includes(d)) out.push(d);
  });
  return out;
}

export function isProtectedSite(url, sites) {
  const h = hostOf(url);
  return !!h && sites.some((d) => h === d || h.endsWith('.' + d));
}

const TRACKING = /^(utm_|fbclid$|gclid$|msclkid$|mc_eid$|igshid$|yclid$)/i;

// Deux onglets sont des doublons s'ils ont la même adresse une fois
// retirés le fragment (#), les paramètres de suivi et le "/" final.
export function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!/^#[!/]/.test(u.hash)) u.hash = '';   // on garde les routes en #/ et #!
    [...u.searchParams.keys()].forEach((k) => { if (TRACKING.test(k)) u.searchParams.delete(k); });
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
    return u.toString();
  } catch { return null; }
}

/* ---------- Analyse (pure, sans effet de bord) ---------- */

export function analyze(tabs, settings, now = Date.now()) {
  const idleMs = settings.idleMinutes * 60000;
  const web = (t) => /^https?:/i.test(t.url || '');
  const guarded = (t) => t.active || t.pinned || t.audible || t.autoDiscardable === false || isProtectedSite(t.url, settings.protectedSites);
  const touchable = (t) => web(t) && !guarded(t);
  const rank = (t) => (t.active ? 4 : 0) + (t.pinned ? 2 : 0) + (t.audible ? 1 : 0) + (isProtectedSite(t.url, settings.protectedSites) ? 3 : 0);

  const close = new Set();
  if (settings.duplicates !== 'off') {
    const groups = new Map();
    for (const t of tabs) {
      const key = normalizeUrl(t.url);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      // On garde l'onglet le plus important, puis le plus récemment utilisé.
      group.sort((a, b) => rank(b) - rank(a) || (b.lastAccessed || 0) - (a.lastAccessed || 0));
      group.slice(1).forEach((t) => { if (touchable(t)) close.add(t.id); });
    }
  }

  const sleep = [];
  for (const t of tabs) {
    if (close.has(t.id) || t.discarded || t.status === 'loading' || !touchable(t)) continue;
    if (t.lastAccessed && now - t.lastAccessed >= idleMs) sleep.push(t.id);
  }
  return { sleep, close: [...close] };
}

/* ---------- Optimisation ---------- */

export async function optimize({ manual = false } = {}) {
  const settings = await getSettings();
  const tabs = await chrome.tabs.query({});
  const plan = analyze(tabs, settings);
  let closed = 0, slept = 0;

  if (plan.close.length && (manual || settings.duplicates === 'auto')) {
    try { await chrome.tabs.remove(plan.close); closed = plan.close.length; }
    catch { /* un onglet a pu disparaître entre-temps */ }
  }
  for (const id of plan.sleep) {
    try { if (await chrome.tabs.discard(id)) slept++; } catch { /* onglet fermé ou non éligible */ }
  }

  if (slept || closed || manual) {
    const st = await getStats();
    await chrome.storage.local.set({
      stats: { slept: st.slept + slept, closed: st.closed + closed, runs: st.runs + 1, lastRun: Date.now() }
    });
  }
  return { slept, closed };
}
