const METHODS = {
  MWL: { fajr: 18, isha: 17 },
  Russia: { fajr: 16, isha: 15 },
};

function deg2rad(d) { return d * Math.PI / 180; }
function rad2deg(r) { return r * 180 / Math.PI; }
function sin(d) { return Math.sin(deg2rad(d)); }
function cos(d) { return Math.cos(deg2rad(d)); }
function tan(d) { return Math.tan(deg2rad(d)); }
function arcsin(x) { return rad2deg(Math.asin(x)); }
function arccos(x) { return rad2deg(Math.acos(x)); }
function arctan(x) { return rad2deg(Math.atan(x)); }
function fix(a) { return ((a + 180) % 360 + 360) % 360 - 180; }

function sunPosition(jd) {
  var d = jd - 2451545.0;
  var g = fix(357.529 + 0.98560028 * d);
  var q = fix(280.459 + 0.98564736 * d);
  var L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
  var e = 23.439 - 0.00000036 * d;
  var ra = arctan(cos(e) * sin(L) / cos(L));
  if (cos(L) < 0) ra += 180;
  var dec = arcsin(sin(e) * sin(L));
  return { ra, dec };
}

function getPrayerTimes(date, lat, lng, tz, methodName) {
  var method = METHODS[methodName] || METHODS.MWL;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  function jd(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  var jdNow = jd(year, month, day);
  var sun = sunPosition(jdNow);
  var d = sun.dec;
  var eq = (sun.ra - 18.697374558 - 24.065709824 * (jdNow - 2451545.0)) * 0.997269566;
  eq = fix(eq);

  var noon = 12 + (tz - lng / 15) - eq / 24;

  function hourAngle(angle) {
    var x = (sin(angle) - sin(lat) * sin(d)) / (cos(lat) * cos(d));
    if (x > 1 || x < -1) return null;
    return fix(arccos(x)) / 15;
  }

  var sunriseHA = hourAngle(-0.833);
  var fajrHA = hourAngle(-method.fajr);
  var ishaHA = hourAngle(-method.isha);

  var sunrise = sunriseHA !== null ? noon - sunriseHA : null;
  var fajr = fajrHA !== null ? noon - fajrHA : null;
  var isha = ishaHA !== null ? noon + ishaHA : null;

  // High-latitude fallback (1/7 night)
  if (fajr === null && sunrise !== null) {
    var night = 24 - sunrise + sunrise;
    fajr = sunrise - night / 7;
  }
  if (isha === null && sunrise !== null) {
    var night = 24 - sunrise + (sunrise || 0);
    isha = sunrise + night / 7;
  }

  var dhuhr = noon + 0.0667;
  var asrHA = hourAngle(arctan(1 / (tan(Math.abs(lat - d)) + 1)));
  var asr = asrHA !== null ? noon + asrHA : null;
  var maghrib = sunriseHA !== null ? noon + sunriseHA : null;

  function toTime(hours) {
    if (hours === null) return { hours: 0, minutes: 0, label: '--:--' };
    var h = Math.floor(hours);
    var m = Math.floor((hours - h) * 60);
    h = h >= 24 ? h - 24 : h;
    return {
      hours: h,
      minutes: m,
      label: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'),
      totalMinutes: h * 60 + m,
    };
  }

  return {
    fajr: toTime(fajr),
    sunrise: toTime(sunrise),
    dhuhr: toTime(dhuhr),
    asr: toTime(asr),
    maghrib: toTime(maghrib),
    isha: toTime(isha),
  };
}

export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const PRAYER_LABELS = { fajr: 'Фаджр', dhuhr: 'Зухр', asr: 'Аср', maghrib: 'Магриб', isha: 'Иша' };
export const PRAYER_ICONS = { fajr: '🌙', dhuhr: '☀️', asr: '🌤', maghrib: '🌅', isha: '🌃' };

export { getPrayerTimes };
