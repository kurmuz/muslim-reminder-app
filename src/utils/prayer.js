import { getPrayerTimes, PRAYER_ORDER } from '../data/adhan';

export function calculateTimes(date, city) {
  if (!city) return null;
  return getPrayerTimes(date, city.lat, city.lng, city.tz, city.method);
}

export function getNextPrayer(times) {
  if (!times) return null;
  const now = new Date();
  const hm = now.getHours() * 60 + now.getMinutes();
  for (const name of PRAYER_ORDER) {
    const t = times[name];
    if (t && t.totalMinutes > hm) return { name, time: t };
  }
  return { name: PRAYER_ORDER[0], time: times[PRAYER_ORDER[0]] };
}

export function getCountdown(nextPrayer) {
  if (!nextPrayer) return '';
  const now = new Date();
  const target = new Date(now);
  target.setHours(Math.floor(nextPrayer.time.totalMinutes / 60));
  target.setMinutes(nextPrayer.time.totalMinutes % 60);
  target.setSeconds(0);
  let diff = Math.floor((target - now) / 1000);
  if (diff < 0) diff += 86400;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
