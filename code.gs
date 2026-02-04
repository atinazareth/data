
/**
 * ATI PORTAL - UNIFIED BACKEND SCRIPT
 * Handles standard data, Attendance Matrix, and adding/updating records.
 * Uses Header Mapping for maximum reliability.
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const result = {
    students: getStandardSheetData(ss.getSheetByName("Students")),
    payments: getStandardSheetData(ss.getSheetByName("Payments")),
    attendance: getAttendanceMatrixData(ss.getSheetByName("Attendance")),
    teachers: getStandardSheetData(ss.getSheetByName("Teachers"))
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postData.action;

    // 1. ADD NEW STUDENT - Maps by Column Names
    if (action === 'addStudent') {
      const sheet = ss.getSheetByName("Students");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const mapping = {
        "رقم الهوية": postData.nationalId,
        "الاسم الكامل": postData.fullName,
        "نوعية التعليم": postData.educationType,
        "اسم الاب": postData.fatherName,
        "عيد الميلاد": postData.birthday,
        "الهاتف": postData.phone,
        "الجنس": postData.gender === 'Male' ? 'ذكر' : 'أنثى',
        "العنوان": postData.address,
        "البريد الالكتروني": postData.email,
        "المهنة": postData.job || "",
        "المستوى الدراسي": postData.educationLevel,
        "الطائفة": postData.denomination,
        "سنة التسجيل": postData.registrationYear,
        "هدف التسجيل": postData.reasonToSign
      };

      // Construct row based on existing sheet headers
      const newRow = headers.map(h => {
        const headerName = String(h).trim();
        return mapping[headerName] !== undefined ? mapping[headerName] : "";
      });

      sheet.appendRow(newRow);
    } 
    
    // 2. ADD NEW PAYMENT - Maps by Column Names
    else if (action === 'addPayment') {
      const sheet = ss.getSheetByName("Payments");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const mapping = {
        "رقم الهوية": postData.studentId,
        "الاسم الكامل": postData.studentName,
        "رقم الوصل": postData.billNumber,
        "مبلخ الدفع": postData.amount,
        "تاريخ الدفع": postData.date,
        "طريقة الدفع": postData.method === 'Cash' ? 'Cash' : 'Bank Transfer'
      };

      const newRow = headers.map(h => {
        const headerName = String(h).trim();
        return mapping[headerName] !== undefined ? mapping[headerName] : "";
      });

      sheet.appendRow(newRow);
    }
    
    // 3. UPDATE ATTENDANCE MATRIX CELL
    else if (action === 'updateAttendance') {
      const sheet = ss.getSheetByName("Attendance");
      const name = String(postData.studentName || "").trim();
      const dateStr = postData.date;
      const status = postData.status;

      const data = sheet.getDataRange().getValues();
      const datesRow = data[1]; // Row 2
      
      let studentRowIdx = -1;
      for (let i = 2; i < data.length; i++) {
        const currentName = String(data[i][0] || "").trim();
        if (currentName === name) {
          studentRowIdx = i + 1;
          break;
        }
      }
      
      let dateColIdx = -1;
      for (let j = 1; j < datesRow.length; j++) {
        let cellVal = datesRow[j];
        let formattedCellDate = "";
        if (cellVal instanceof Date) {
          formattedCellDate = Utilities.formatDate(cellVal, Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          formattedCellDate = String(cellVal).trim();
        }
        if (formattedCellDate === dateStr) {
          dateColIdx = j + 1;
          break;
        }
      }
      
      if (studentRowIdx !== -1 && dateColIdx !== -1) {
        sheet.getRange(studentRowIdx, dateColIdx).setValue(status);
      } else {
        throw new Error("Could not find student or date: " + name + " / " + dateStr);
      }
    }

    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function getStandardSheetData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      // Force date formatting for any column that looks like a date or birthday
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy");
      }
      obj[header] = val;
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
  return studentRows.map(row => {
    const obj = { "الاسم": String(row[0]).trim() };
    for (let i = 1; i < row.length; i++) {
      let dateKey = datesRow[i];
      if (dateKey) {
        if (dateKey instanceof Date) {
          dateKey = Utilities.formatDate(dateKey, Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          dateKey = String(dateKey).trim();
        }
        obj[dateKey] = (row[i] === true || String(row[i]).toLowerCase() === 'true');
      }
    }
    return obj;
  });
}
