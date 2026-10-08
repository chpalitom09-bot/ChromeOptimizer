import { getSettings, saveSettings, getStats, resetStats, normalizeSites, MIN_IDLE } from './lib.js';

const $ = (id) => document.getElementById(id);
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
let toastTimer;

function toast() {
  const t = $('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}

async function showStats() {
  const st = await getStats();
  $('stats').textContent = st.runs
    ? `${plural(st.slept, 'onglet mis en veille', 'onglets mis en veille')} et ${plural(st.closed, 'doublon fermé', 'doublons fermés')} depuis le début.`
    : 'Aucune optimisation pour le moment.';
}

async function init() {
  $('ver').textContent = chrome.runtime.getManifest().version;
  const s = await getSettings();
  document.querySelector(`input[name=mode][value=${s.mode}]`).checked = true;
  $('idle').value = s.idleMinutes;
  $('dups').value = s.duplicates;
  $('sites').value = s.protectedSites.join('\n');
  await showStats();
}

document.querySelectorAll('input[name=mode]').forEach((r) =>
  r.addEventListener('change', async () => { await saveSettings({ mode: r.value }); toast(); }));

$('idle').addEventListener('change', async () => {
  const v = Math.min(1440, Math.max(MIN_IDLE, Math.round(Number($('idle').value) || 30)));
  $('idle').value = v;
  await saveSettings({ idleMinutes: v });
  toast();
});

$('dups').addEventListener('change', async () => { await saveSettings({ duplicates: $('dups').value }); toast(); });

$('sites').addEventListener('change', async () => {
  const list = normalizeSites($('sites').value);
  $('sites').value = list.join('\n');
  await saveSettings({ protectedSites: list });
  toast();
});

$('reset').addEventListener('click', async () => { await resetStats(); await showStats(); toast(); });

init();
