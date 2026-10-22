/**
 * iBrand Africa — Prospect Discovery Form
 * Google Apps Script backend.
 *
 * SETUP
 * 1. Open https://script.google.com and create a new project.
 * 2. Replace Code.gs with this file and save.
 * 3. Deploy > New deployment > Web app:
 *      Execute as: Me
 *      Who has access: Anyone
 *    Then authorize the requested permissions.
 * 4. Copy the deployment URL (ends in /exec) into SHEETS_WEB_APP_URL at the top of
 *    prospect-form/script.js.
 * 5. The Google account running the script must have edit access to the spreadsheet.
 *
 * CONFIGURATION
 * - SPREADSHEET_ID is the spreadsheet you provided.
 * - SHEET_NAME is the tab that receives responses. If it does not exist, the script
 *   creates it and writes the headers on the first submission. Existing tabs and data
 *   are never deleted. To use an existing tab, change SHEET_NAME to its exact name.
 */

var SPREADSHEET_ID = '1B5UwNVlU2zBIgk30eRbZvSlW4NHgEGtTYcSegVwdl3c';
var SHEET_NAME = 'Prospect Form Responses';
var MAX_PAYLOAD_CHARS = 50000;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond_({ ok: false, error: 'No form data was received.' });
    }
    if (e.postData.contents.length > MAX_PAYLOAD_CHARS) {
      return respond_({ ok: false, error: 'The form data is too large.' });
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return respond_({ ok: false, error: 'The form data could not be read.' });
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return respond_({ ok: false, error: 'The form data could not be read.' });
    }

    // Honeypot field: real visitors never see or fill this in.
    if (data.hp_note && String(data.hp_note).trim() !== '') {
      return respond_({ ok: false, error: 'Submission rejected.' });
    }
    delete data.hp_note;
    delete data._meta;

    var keys = Object.keys(data);
    if (!keys.length) {
      return respond_({ ok: false, error: 'No form data was received.' });
    }

    var hasValue = false;
    for (var i = 0; i < keys.length; i++) {
      var raw = data[keys[i]] == null ? '' : data[keys[i]];
      if (String(raw).trim() !== '') {
        hasValue = true;
        break;
      }
    }
    if (!hasValue) {
      return respond_({ ok: false, error: 'Please fill in at least one field before submitting.' });
    }

    var saved = saveSubmission_(data);
    return respond_({
      ok: true,
      message: 'Response saved to Google Sheets.',
      row: saved.row,
      sheet: saved.sheet
    });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    if (err && err.publicMessage) {
      return respond_({ ok: false, error: err.message });
    }
    return respond_({ ok: false, error: 'Could not save your response. Please try again.' });
  }
}

function doGet() {
  return respond_({ ok: true, service: 'Prospect Discovery Form — Google Sheets endpoint' });
}

function saveSubmission_(data) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    var busy = new Error('The form is busy right now. Please try again in a moment.');
    busy.publicMessage = true;
    throw busy;
  }

  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    var keys = Object.keys(data);
    var headers = readHeaders_(sheet);
    var lastColumn = sheet.getLastColumn();

    var hasHeaders = false;
    for (var h = 0; h < headers.length; h++) {
      if (headers[h] !== '') {
        hasHeaders = true;
        break;
      }
    }

    if (!hasHeaders) {
      headers = ['Timestamp'].concat(keys);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      lastColumn = headers.length;
    } else {
      var wanted = ['Timestamp'].concat(keys);
      var missing = [];
      for (var w = 0; w < wanted.length; w++) {
        if (headers.indexOf(wanted[w]) === -1) {
          missing.push(wanted[w]);
        }
      }
      if (missing.length) {
        var startColumn = Math.max(headers.length, lastColumn) + 1;
        sheet.getRange(1, startColumn, 1, missing.length).setValues([missing]);
        for (var m = 0; m < missing.length; m++) {
          headers.push(missing[m]);
        }
        lastColumn = startColumn + missing.length - 1;
      }
    }

    var row = [];
    for (var c = 0; c < headers.length; c++) {
      var header = headers[c];
      if (header === 'Timestamp') {
        row.push(new Date());
      } else if (Object.prototype.hasOwnProperty.call(data, header)) {
        row.push(safeCell_(data[header]));
      } else {
        row.push('');
      }
    }

    var targetRow = sheet.getLastRow() + 1;
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
    return { row: targetRow, sheet: SHEET_NAME };
  } finally {
    lock.releaseLock();
  }
}

function readHeaders_(sheet) {
  if (sheet.getLastRow() < 1) {
    return [];
  }
  var width = sheet.getLastColumn();
  if (width < 1) {
    return [];
  }
  var values = sheet.getRange(1, 1, 1, width).getValues()[0];
  var headers = [];
  for (var i = 0; i < values.length; i++) {
    headers.push(String(values[i] == null ? '' : values[i]).trim());
  }
  return headers;
}

function safeCell_(value) {
  var text = String(value == null ? '' : value);
  // Prevent values from being interpreted as spreadsheet formulas.
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function respond_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
