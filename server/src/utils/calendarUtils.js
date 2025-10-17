/**
 * Generate ICS calendar file for appointment (UC-002 Step 7)
 * @param {Object} options - Event options
 * @returns {String} ICS file content
 */
export const generateICSFile = (options) => {
  const {
    title,
    description,
    location,
    startDate,
    startTime,
    duration = 30, // duration in minutes
  } = options;

  // Parse start date and time
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(startDate);
  start.setHours(hours, minutes, 0, 0);

  // Calculate end time
  const end = new Date(start.getTime() + duration * 60000);

  // Format date to ICS format (YYYYMMDDTHHMMSS)
  const formatICSDate = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  };

  const uid = `${Date.now()}@smarthealthcare.com`;
  const timestamp = formatICSDate(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smart Health Care System//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description}` : '',
    location ? `LOCATION:${location}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Appointment Reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return icsContent;
};

/**
 * Parse time string to minutes
 * @param {String} timeString - Time in format "HH:MM"
 * @returns {Number} Minutes from midnight
 */
export const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Generate time slots for a day
 * @param {String} startTime - Start time "HH:MM"
 * @param {String} endTime - End time "HH:MM"
 * @param {Number} intervalMinutes - Interval between slots
 * @returns {Array} Array of time strings
 */
export const generateTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  const slots = [];
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
  }

  return slots;
};
