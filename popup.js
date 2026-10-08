import { getSettings, saveSettings, getStats, analyze, optimize, hostOf, isProtectedSite } from './lib.js';

const $ = (id) => document.getElementById(id);
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const gb = (bytes) => (bytes / 1073741824).toFixed(1).replace('.', ',');

/* ---------- Performances du système (lues uniquement popup ouverte) ---------- */

let prevCpu = null;

async function readMemory() {
  const m = await chrome.system.memory.getInfo();
  const used = m.capacity - m.availableCapacity;
  const pct = Math.round((used / m.capacity) * 100);
  $('memText').textContent = `${gb(used)} sur ${gb(m.capacity)} Go`;
  $('memBar').style.width = pct + '%';
}

async function readCpu() {
  const info = await chrome.system.cpu.getInfo();
  const total = info.processors.reduce((a, p) => ({ idle: a.idle + p.usage.idle, total: a.total + p.usage.total }), { idle: 0, total: 0 });
  if (prevCpu && total.total > prevCpu.total) {
    const pct = Math.round((1 - (total.idle - prevCpu.idle) / (total.total - prevCpu.total)) * 100);
    $('cpuText').textContent = pct + ' %';
    $('cpuBar').style.width = pct + '%';
  }
  prevCpu = total;
}

function tick() { readMemory().catch(() => {}); readCpu().catch(() => {}); }

/* ---------- Onglets ---------- */

async function refreshTabs() {
  const [settings, tabs] = await Promise.all([getSettings(), chrome.tabs.query({})]);
  const plan = analyze(tabs, settings);
  $('open').textContent = tabs.length;
  $('sleeping').textContent = tabs.filter((t) => t.discarded).length;
  $('todo').textContent = plan.sleep.length + plan.close.length;
  const dup = settings.duplicates === 'off' ? 'doublons ignorés' : plural(plan.close.length, 'doublon', 'doublons');
  $('hint').textContent = `${plural(plan.sleep.length, 'inactif', 'inactifs')} depuis ${settings.idleMinutes} min ou plus, ${dup}`;
}

async function refreshTotals() {
  const st = await getStats();
  $('totals').textContent = st.runs
    ? `Depuis le début : ${plural(st.slept, 'onglet mis en veille', 'onglets mis en veille')}, ${plural(st.closed, 'doublon fermé', 'doublons fermés')}`
    : 'Aucune optimisation pour le moment';
}

async function refreshProtect() {
  const btn = $('protect');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const host = tab && /^https?:/i.test(tab.url || '') ? hostOf(tab.url) : '';
  if (!host) { btn.disabled = true; btn.textContent = 'Protéger ce site'; return; }
  const settings = await getSettings();
  const on = isProtectedSite(tab.url, settings.protectedSites);
  btn.disabled = false;
  btn.dataset.host = host;
  btn.dataset.on = on ? '1' : '';
  btn.textContent = on ? `Ne plus protéger ${host}` : `Protéger ${host}`;
  btn.title = btn.textContent;
}

/* ---------- Actions ---------- */

$('run').addEventListener('click', async () => {
  const btn = $('run');
  btn.disabled = true; btn.textContent = 'Optimisation…'; $('result').textContent = '';
  try {
    const { slept, closed } = await optimize({ manual: true });
    $('result').textContent = slept || closed
      ? `${plural(slept, 'onglet mis en veille', 'onglets mis en veille')}, ${plural(closed, 'doublon fermé', 'doublons fermés')}.`
      : 'Rien à optimiser avec ces réglages.';
  } catch {
    $('result').textContent = "L'optimisation a échoué. Réessayez.";
  }
  btn.disabled = false; btn.textContent = 'Optimiser maintenant';
  await Promise.all([refreshTabs(), refreshTotals()]);
  setTimeout(tick, 1200);
});

$('auto').addEventListener('change', async (e) => {
  await saveSettings({ mode: e.target.checked ? 'auto' : 'manual' });
});

$('protect').addEventListener('click', async () => {
  const btn = $('protect'), host = btn.dataset.host;
  if (!host) return;
  const s = await getSettings();
  const list = btn.dataset.on ? s.protectedSites.filter((d) => host !== d && !host.endsWith('.' + d)) : [...new Set([...s.protectedSites, host])];
  await saveSettings({ protectedSites: list });
  await Promise.all([refreshProtect(), refreshTabs()]);
});

$('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());

/* ---------- Démarrage ---------- */

(async () => {
  const s = await getSettings();
  $('auto').checked = s.mode === 'auto';
  await Promise.all([refreshTabs(), refreshTotals(), refreshProtect()]);
  tick();
  setInterval(tick, 1500);   // s'arrête avec la fermeture du popup
})();
