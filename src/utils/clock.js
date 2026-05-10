let interval = null;

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone:     'America/New_York',
  weekday:      'long',
  month:        'long',
  day:          'numeric',
  year:         'numeric',
  hour:         '2-digit',
  minute:       '2-digit',
  second:       '2-digit',
  hour12:       false,
  timeZoneName: 'short',
});

function format(date) {
  const p   = Object.fromEntries(FORMATTER.formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.month} ${p.day} ${p.year}, ${p.hour}:${p.minute}:${p.second} ${p.timeZoneName}`;
}

export function initClock() {
  if (interval) { clearInterval(interval); interval = null; }

  const el = document.querySelector('#timeCurrent');
  if (!el) return;

  const tick = () => { el.textContent = format(new Date()); };
  tick();
  interval = setInterval(tick, 1000);
}
