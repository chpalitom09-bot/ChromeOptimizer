// Service worker : il ne fait rien tant que Chrome ne le réveille pas.
// Mode automatique : une seule alarme par minute. Mode manuel : aucune alarme.
import { getSettings, optimize } from './lib.js';

const ALARM = 'chromeoptimizer-cycle';

async function syncAlarm() {
  const { mode } = await getSettings();
  if (mode === 'auto') {
    if (!(await chrome.alarms.get(ALARM))) chrome.alarms.create(ALARM, { delayInMinutes: 1, periodInMinutes: 1 });
  } else {
    chrome.alarms.clear(ALARM);
  }
}

chrome.runtime.onInstalled.addListener(syncAlarm);
chrome.runtime.onStartup.addListener(syncAlarm);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) syncAlarm();
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) optimize();
});
