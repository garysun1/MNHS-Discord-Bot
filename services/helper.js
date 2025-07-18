const fs = require('fs/promises');
const path = require('path');
const { google } = require('googleapis');

const SHEET_ID = '1Yk6E0tRk97LebJ4ad46RAd1VSM13mwRHFgyhtoUooi0';
const TAB_FALL = 'Info + Fall Hours';
const TAB_SPR = 'Spring Hours';

const COL_FALL = { FIRST: 0, LAST: 1, HOURS: 8 };
const COL_SPR  = { FIRST: 0, LAST: 1, HOURS: 2 };

let sheetsClient;
async function sheets() {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '..', 'config', 'google-sheets-api-key.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getHours({ first, last }) {
  const sheet = await sheets();

  const [fallResp, springResp] = await Promise.all([
    sheet.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TAB_FALL}` }),
    sheet.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TAB_SPR}` }),
  ]);

  const fallRows = fallResp.data.values ?? [];
  const sprRows = springResp.data.values ?? [];
  const fallHeaders = fallRows[0] ?? [];
  const sprHeaders = sprRows[0] ?? [];

  const fallRow = fallRows.find(r =>
    r[COL_FALL.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
    r[COL_FALL.LAST]?.trim().toLowerCase() === last.trim().toLowerCase()
  );
  const sprRow = sprRows.find(r =>
    r[COL_SPR.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
    r[COL_SPR.LAST]?.trim().toLowerCase() === last.trim().toLowerCase()
  );

  const fall = fallRow?.[COL_FALL.HOURS] ?? '0';
  const spring = sprRow?.[COL_SPR.HOURS] ?? '0';

  const fallBreakdown = fallRow ? fallRow.map((val, i) => ({
    label: fallHeaders[i] || `Col ${i}`,
    hours: val || '0',
  })).filter((e, i) => i > COL_FALL.HOURS && parseFloat(e.hours) > 0) : [];

  const sprBreakdown = sprRow ? sprRow.map((val, i) => ({
    label: sprHeaders[i] || `Col ${i}`,
    hours: val || '0',
  })).filter((e, i) => i > COL_SPR.HOURS && parseFloat(e.hours) > 0) : [];

  return { fall, spring, fallBreakdown, sprBreakdown };
}

const NAME_MAP_PATH = path.resolve('data', 'names.json');

async function loadNames() {
  try {
    const raw = await fs.readFile(NAME_MAP_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function saveNames(data) {
  await fs.writeFile(NAME_MAP_PATH, JSON.stringify(data, null, 2));
}

async function setRealName(discordId, nameObj) {
  const map = await loadNames();
  map[discordId] = nameObj;
  await saveNames(map);
}

async function getRealName(discordId) {
  const map = await loadNames();
  return map[discordId] || null;
}

module.exports = {
  getHours,
  getRealName,
  setRealName,
};