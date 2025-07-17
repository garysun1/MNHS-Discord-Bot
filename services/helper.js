// import fs from 'fs/promises';
// import { google } from 'googleapis';
// import path from 'path';

// const SHEET_ID = '1Yk6E0tRk97LebJ4ad46RAd1VSM13mwRHFgyhtoUooi0';

// let sheetsClient;
// async function sheets() {
//   if (sheetsClient) return sheetsClient;

//   const auth = new google.auth.GoogleAuth({
//     keyFile: path.resolve('google-sheets-api-key.json'),
//     scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
//   });
//   sheetsClient = google.sheets({ version: 'v4', auth });
//   return sheetsClient;
// }

// const TAB_FALL = 'Info + Fall Hours';
// const TAB_SPR  = 'Spring Hours';

// const COL_FALL = {
//   FIRST: 0,
//   LAST:  1,
//   HOURS: 8,
// };

// const COL_SPR = {
//   FIRST: 0,
//   LAST:  1,
//   HOURS: 2,
// };

// export async function findRowFall({ first, last }) {
//   const { data } = await (await sheets()).spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: `${TAB_FALL}!A:Z`,
//   });
//   const rows = data.values ?? [];
//   return rows.find(r =>
//     r[COL_FALL.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
//     r[COL_FALL.LAST]?.trim().toLowerCase()  === last.trim().toLowerCase()
//   ) || null;
// }

// export async function findRowSpring({ first, last }) {
//   const { data } = await (await sheets()).spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: `${TAB_SPR}!A:Z`,
//   });
//   const rows = data.values ?? [];
//   return rows.find(r =>
//     r[COL_SPR.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
//     r[COL_SPR.LAST]?.trim().toLowerCase()  === last.trim().toLowerCase()
//   ) || null;
// }

// // export async function getHours({ first, last }) {
// //   const [fallRow, sprRow] = await Promise.all([
// //     findRowFall({ first, last }),
// //     findRowSpring({ first, last }),
// //   ]);

// //   const fallHours = fallRow ? fallRow[COL_FALL.HOURS] ?? '0' : null;
// //   const sprHours  = sprRow ? sprRow[COL_SPR.HOURS]  ?? '0' : null;

// //   return { fall: fallHours, spring: sprHours };
// // }

// export async function getHours({ first, last }) {
//   const sheet = await sheets();

//   // Step 1: Fetch FALL headers + rows
//   const fallResp = await sheet.spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: `${TAB_FALL}!A:Z`,
//   });
//   const fallRows = fallResp.data.values ?? [];
//   const fallHeaders = fallRows[0] ?? [];
//   const fallRow = fallRows.find(r =>
//     r[COL_FALL.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
//     r[COL_FALL.LAST]?.trim().toLowerCase() === last.trim().toLowerCase()
//   );

//   // Step 2: Fetch SPRING headers + rows
//   const springResp = await sheet.spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: `${TAB_SPR}!A:Z`,
//   });
//   const springRows = springResp.data.values ?? [];
//   const springHeaders = springRows[0] ?? [];
//   const springRow = springRows.find(r =>
//     r[COL_SPR.FIRST]?.trim().toLowerCase() === first.trim().toLowerCase() &&
//     r[COL_SPR.LAST]?.trim().toLowerCase() === last.trim().toLowerCase()
//   );

//   // Step 3: Find the hour total + dynamic event columns
//   const fallTotal = fallRow?.[COL_FALL.HOURS] ?? '0';
//   const springTotal = springRow?.[COL_SPR.HOURS] ?? '0';

//   const fallBreakdown = fallRow
//     ? fallRow
//         .map((val, i) => ({ label: fallHeaders[i] || `Col ${i}`, hours: val || '0' }))
//         .filter((entry, i) =>
//           i > COL_FALL.HOURS && parseFloat(entry.hours) > 0
//         )
//     : [];

//   const springBreakdown = springRow
//     ? springRow
//         .map((val, i) => ({ label: springHeaders[i] || `Col ${i}`, hours: val || '0' }))
//         .filter((entry, i) =>
//           i > COL_SPR.HOURS && parseFloat(entry.hours) > 0
//         )
//     : [];

//   return {
//     fall: fallTotal,
//     spring: springTotal,
//     fallBreakdown: fallBreakdown,
//     sprBreakdown: springBreakdown,
//   };
// }


// const NAME_MAP_PATH = path.resolve('names.json');

// async function loadNameMap() {
//   try {
//     const raw = await fs.readFile(NAME_MAP_PATH, 'utf-8');
//     return JSON.parse(raw);
//   } catch (err) {
//     if (err.code === 'ENOENT') return {};
//     throw err;
//   }
// }

// async function saveNameMap(data) {
//   await fs.writeFile(NAME_MAP_PATH, JSON.stringify(data, null, 2));
// }

// export async function setRealName(discordId, nameObj) {
//   const map = await loadNameMap();
//   map[discordId] = nameObj;
//   await saveNameMap(map);
// }

// export async function getRealName(discordId) {
//   const map = await loadNameMap();
//   return map[discordId] || null;
// }

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
    keyFile: path.resolve('google-sheets-api-key.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getHours({ first, last }) {
  const sheet = await sheets();

  const [fallResp, springResp] = await Promise.all([
    sheet.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TAB_FALL}!A:Z` }),
    sheet.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TAB_SPR}!A:Z` }),
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

// Persistent name store
const NAME_MAP_PATH = path.resolve('names.json');

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
