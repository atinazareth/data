const WIX_ACCOUNT_ID = "fd0684b6-ad65-4cf5-8c4c-7a384e52fce0";
const WIX_SITE_ID = "2c082a1e-3386-46a0-8a47-9495faa91757";

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const result = {
    students: getStandardSheetData(ss.getSheetByName("Students")),
    payments: getStandardSheetData(ss.getSheetByName("Payments")),
    attendance: getAttendanceMatrixData(ss.getSheetByName("Attendance")),
    teachers: getStandardSheetData(ss.getSheetByName("Teachers")),
    tasks: getStandardSheetData(ss.getSheetByName("Tasks")),
  };

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postData.action;

    if (action === "addStudent") {
      const sheet = ss.getSheetByName("Students");
      sheet.appendRow([
        postData.nationalId,
        postData.fullName,
        postData.fatherName,
        postData.educationType,
        postData.birthday,
        postData.phone,
        postData.email,
        postData.address,
        postData.gender,
        postData.educationLevel,
        postData.denomination,
        postData.registrationYear,
        postData.reasonToSign,
      ]);
      createWixMember(postData);
    } else if (action === "addPayment") {
      const sheet = ss.getSheetByName("Payments");
      sheet.appendRow([
        postData.studentId,
        postData.studentName,
        postData.billNumber,
        postData.amount,
        postData.date,
        postData.method,
      ]);
    } else if (action === "updateAttendance") {
      const sheet = ss.getSheetByName("Attendance");
      const name = postData.studentName;
      const dateStr = postData.date;
      const status = postData.status;

      const data = sheet.getDataRange().getValues();
      const datesRow = data[1];

      let studentRowIdx = -1;
      for (let i = 2; i < data.length; i++) {
        if (data[i][0] === name) {
          studentRowIdx = i + 1;
          break;
        }
      }

      let dateColIdx = -1;
      for (let j = 1; j < datesRow.length; j++) {
        let cellVal = datesRow[j];
        let formattedCellDate = formatDateSafe(cellVal);

        if (formattedCellDate === dateStr) {
          dateColIdx = j + 1;
          break;
        }
      }

      if (studentRowIdx !== -1 && dateColIdx !== -1) {
        sheet.getRange(studentRowIdx, dateColIdx).setValue(status);
      } else {
        throw new Error("Student or Date not found: " + name + " / " + dateStr);
      }
    } else if (action === "updateTask") {
      const sheet = ss.getSheetByName("Tasks");
      const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
      const data = sheet.getDataRange().getValues();
      const taskTitle = String(postData.taskTitle || "").trim();
      const newStatus = postData.status;
      const newComment = postData.comment;

      // Find column indices
      let taskDescIdx = -1;
      let statusIdx = -1;
      let commentIdx = -1;

      headers.forEach((h, i) => {
        const headerName = String(h).trim();
        if (headerName === "task_desc") taskDescIdx = i;
        if (headerName === "status") statusIdx = i;
        if (headerName === "comment") commentIdx = i;
      });

      // Find task row
      let taskRowIdx = -1;
      for (let i = 1; i < data.length; i++) {
        const currentTask = String(data[i][taskDescIdx] || "").trim();
        if (currentTask === taskTitle) {
          taskRowIdx = i + 1;
          break;
        }
      }

      if (taskRowIdx !== -1) {
        if (statusIdx !== -1) {
          sheet.getRange(taskRowIdx, statusIdx + 1).setValue(newStatus);
        }
        if (commentIdx !== -1) {
          sheet.getRange(taskRowIdx, commentIdx + 1).setValue(newComment);
        }
      }
    }

    return ContentService.createTextOutput("Success").setMimeType(
      ContentService.MimeType.TEXT,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      "Error: " + err.toString(),
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * NEW HELPER: Ensures dates are formatted as DD/MM/YYYY
 */
function formatDateSafe(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy");
  }
  // Check if string looks like an ISO date
  if (typeof val === "string" && !isNaN(Date.parse(val)) && val.includes("-")) {
    return Utilities.formatDate(
      new Date(val),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy",
    );
  }
  return val;
}

function getStandardSheetData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      // Apply the date formatting here
      obj[header] = formatDateSafe(row[i]);
    });
    return obj;
  });
}

function getAttendanceMatrixData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 3) return [];

  const datesRow = data[1];
  const studentRows = data.slice(2);

  return studentRows.map((row) => {
    const obj = { الاسم: row[0] };
    for (let i = 1; i < row.length; i++) {
      let dateKey = datesRow[i];
      if (dateKey) {
        dateKey = formatDateSafe(dateKey);
        obj[dateKey] =
          row[i] === true || String(row[i]).toLowerCase() === "true";
      }
    }
    return obj;
  });
}

function createWixMember(studentData) {
  const url = "https://www.wixapis.com/members/v1/members";
  const payload = {
    member: {
      contact: {
        firstName: studentData.fullName.split(" ")[0],
        lastName:
          studentData.fullName.split(" ").slice(1).join(" ") || "Student",
        emails: [studentData.email],
        phones: [studentData.phone],
      },
      loginEmail: studentData.email,
      password: studentData.nationalId,
    },
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: WIX_API_KEY,
      "wix-account-id": WIX_ACCOUNT_ID,
      "wix-site-id": WIX_SITE_ID,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
  } catch (err) {
    Logger.log("Wix Member Error: " + err);
  }
}
