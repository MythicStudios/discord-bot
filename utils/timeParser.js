module.exports = (timeString) => {
  const timeRegex = /(\d+)([smhdwy])/g;
  let totalMs = 0;
  let match;

  const timeUnits = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    y: 1000 * 60 * 60 * 24 * 365,
  };

  while ((match = timeRegex.exec(timeString)) !== null) {
    const amount = parseInt(match[1]);
    const unit = match[2];

    if (timeUnits[unit]) {
      totalMs += amount * timeUnits[unit];
    }
  }

  return totalMs;
};
