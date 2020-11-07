// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: calendar;
// creator: https://github.com/JoeGit42

const DEBUG = false

// Configuration
const showCW =  true
const styleUS = false
const fontHeader = Font.mediumSystemFont(15) 
const fontCal = Font.mediumSystemFont(10) 
const fontToday = Font.heavySystemFont(10) 
const fontCalOtherMonth = Font.thinSystemFont(10) 
const fontWeekday = Font.mediumSystemFont(10) 
const fontColorWeekdays = Color.gray()
const fontColorCW = Color.gray()
const fontColorSat = null // null will result in default color
const fontColorSun = Color.red()
const fontColorOtherMonth = Color.gray()
const fontColorToday = Color.green()
const fontColorMonth = null  // null will result in default color
const dfHeaderFormat = "MMMM"
const dfHeaderCurrentMonthFormat = "d. MMMM"  // will be used, if the shown month is the current one
const dfHeaderOtherYearFormat = "MMMM yyyy"  // will be used, if the shown month is the current one
const dfDayFormat = "d"
const dfWeekdayFormat = "EEEEE"
const dfWeekday = new DateFormatter().dateFormat = dfWeekdayFormat
const cellSizeVertical = 16
const cellSizeHori = 18
const cellCWSizeHori = 24

Date.prototype.getWeekISO = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Returns the week of date calculated in US style (01.01.yyyy is week #01)
Date.prototype.getWeekUS = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Returns the week of the date.
Date.prototype.getWeek = function() {
  if (styleUS == true) {
    return this.getWeekUS()
  } else {
    return this.getWeekISO()
  }
}


// small widget instance
let widget = await createWidget()
if (!config.runsInWidget) await widget.presentSmall()
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let w = new ListWidget()
  let cell

// Date string init
  const dfHeaderOtherYear = new DateFormatter()
  dfHeaderOtherYear.dateFormat = dfHeaderOtherYearFormat
  const dfHeaderCurrentMonth = new DateFormatter()
  dfHeaderCurrentMonth.dateFormat = dfHeaderCurrentMonthFormat
  const dfHeader = new DateFormatter()
  dfHeader.dateFormat = dfHeaderFormat
  const dfDay = new DateFormatter()
  dfDay.dateFormat = dfDayFormat
  const dfWeekday = new DateFormatter()
  dfWeekday.dateFormat = dfWeekdayFormat

  w.setPadding(5,5,5,2)

  // check parameter (month to display can be adjusted)
  // -1 shows the last month, 2 shows the month ofter the next month
  let monthShift = 0
  let param = args.widgetParameter
  if (param != null && param.length > 0) {
    monthShift = parseInt(param)
  }

// collect all the necessary data
  const today = new Date()
  const dayToCalculateWith = new Date() // = today, will be configurable as widget-parameter in the future
  if (monthShift != 0) addMonth(dayToCalculateWith, monthShift)
  const thisWeek = today.getWeek()
  const thisMonthFirst = new Date(dayToCalculateWith.getFullYear(), dayToCalculateWith.getMonth(), 1)
  const thisMonthFirstWeekday = thisMonthFirst.getDay()  // Sunday = 0, Monday = 1, ...
  const thisMonthFirstWeek = thisMonthFirst.getWeek() 
  const thisMonthLast = new Date(dayToCalculateWith.getFullYear(), dayToCalculateWith.getMonth()+1, 0)
  const thisMonthLastWeek = thisMonthLast.getWeek() 
  const weeksInMonth = weekCount(dayToCalculateWith.getFullYear(), dayToCalculateWith.getMonth(), styleUS ? 0 : 1)
  let cellSizeVert = cellSizeVertical
  
  if (weeksInMonth == 4) { cellSizeVert += cellSizeVertical/4 }
  if (weeksInMonth == 5) { cellSizeVert += 2 }
  
  // Prepare an array with the weekday.
  var weekdayHeader = ["KW", "M", "D", "M", "D", "F", "S", "S"];
  const weekday = new Date() // will be set to Monday 02.11.2020 (or 1st Nov, if weeks starts on Sunday in US-style
  if (styleUS == true) { weekday.setDate(1) } else { weekday.setDate(2) }
  weekday.setMonth(10) // 10=November
  weekday.setFullYear(2020)
  
  // overwrite weekdays with local strings
  for (var i = 1; i <=7; i++) {
    weekdayHeader[i] = dfWeekday.string(weekday)
    addDay(weekday, 1)
  }
  
  // DEBUG
  let debugRow
  let row0
  if (DEBUG) {
    debugRow = w.addStack()
    row0 = debugRow.addText("" + weekdayHeader[0] + weekdayHeader[1] + weekdayHeader[2] + weekdayHeader[3] + "-" + thisMonthLastWeek + ":" + weeksInMonth)
    row0.font = Font.mediumSystemFont(8)
  }
  // DEBUG_END
  
  // first row will be the month
  // e.g. November
  if ( sameDay(dayToCalculateWith, today) ) {
   headerStr = dfHeaderCurrentMonth.string(dayToCalculateWith)  // show day, if it's the current month
  } else if (dayToCalculateWith.getFullYear() != today.getFullYear()) {
    headerStr = dfHeaderOtherYear.string(dayToCalculateWith)  // show year, if it's not this year
  } else {
    headerStr = dfHeader.string(dayToCalculateWith)  // show the month
  }
   
  let monthHeaderRow = w.addStack()
  monthHeaderRow.size = new Size(150, 0)
  if (DEBUG){ monthHeaderRow.borderWidth = 1; monthHeaderRow.borderColor = Color.yellow(); }  
  monthHeaderRow.addSpacer(0)
  let row1 = monthHeaderRow.addText(headerStr)
  monthHeaderRow.addSpacer(0)
  monthHeaderRow.centerAlignContent()
  row1.font = fontHeader
  row1.textColor = fontColorMonth
  row1.centerAlignText()
  
  w.addSpacer(4)
  
  let fullCal = w.addStack()
  let dayToPrint = new Date()
  
  if (DEBUG) { fullCal.borderWidth = 1; }
  
  //w.addSpacer(20)
  
  if (showCW) {
    // first column 
    // e.g.
    // KW
    // #44
    // #45
    // ...
    let cwCol = fullCal.addStack()
    if (DEBUG){ cwCol.borderWidth = 1; cwCol.borderColor = Color.gray(); }
    cwCol.layoutVertically()
    cwCol.centerAlignContent()
    let cwCell = cwCol.addStack()
    cwCell.size = new Size(cellCWSizeHori, cellSizeVert)
    cwCell.centerAlignContent()
    let cwTxt = cwCell.addText(" ") // empty cell 
    cwTxt.font = fontCal
    cwTxt.textColor = fontColorCW
    cwTxt.centerAlignText()
    setDay(dayToPrint, thisMonthFirst)
    let weekToShow = dayToPrint.getWeek()
    for (var i = 0; i < weeksInMonth; i++) {
      let cwCell = cwCol.addStack()
      if (DEBUG){ cwCell.borderWidth = 1; cwCell.borderColor = Color.green(); }
      cwCell.size = new Size(cellCWSizeHori, cellSizeVert)
      cwCell.centerAlignContent()
      weekToShow = dayToPrint.getWeek()
      let weekToShowStr = (weekToShow < 10) ? "#0" + weekToShow : "#" + weekToShow
      let cwTxt = cwCell.addText( weekToShowStr )
      cwTxt.font = fontCal
      cwTxt.leftAlignText()
      if (thisWeek == weekToShow && today.getFullYear() == dayToCalculateWith.getFullYear()) { cwTxt.textColor = fontColorToday } else {  cwTxt.textColor = fontColorCW }
      addDay(dayToPrint, 7) // prepare for the next week/row
    }
  } else { // some space instead of calender weeks
    fullCal.addSpacer(15)
  }
  
  // now we come to the numbers 
  //   - 7 columns - one for each weekday 
  //   - 4 to 6 row for the week
  let diff = styleUS ? thisMonthFirstWeekday : getDay1(thisMonthFirstWeekday) - 1 // number of days which have to be filled with old month in the first row

  for (var wd = 1; wd <= 7; wd++) { // one column for each weekday
    setDay(dayToPrint, thisMonthFirst)
    addDay(dayToPrint, (diff * (-1)) + (wd-1))  // set the day to the first day in the week (might be the previous month in the 1st week of the month)
    let wdCol = fullCal.addStack()
    if (DEBUG){ wdCol.borderWidth = 1; wdCol.borderColor = Color.red(); }
    wdCol.layoutVertically()
    wdCol.centerAlignContent()
    let dayCell = wdCol.addStack()
    dayCell.size = new Size(cellSizeHori, cellSizeVert)
    dayCell.centerAlignContent()
    let cellTxt = dayCell.addText(weekdayHeader[wd])
    cellTxt.font = fontWeekday
    cellTxt.textColor = fontColorWeekdays
    cellTxt.centerAlignText()
    if (dayToPrint.getDay() == 6 && fontColorSat) cellTxt.textColor = fontColorSat
    if (dayToPrint.getDay() == 0 && fontColorSun) cellTxt.textColor = fontColorSun
    for (var r = 0; r < weeksInMonth; r++) {
      let dayCell = wdCol.addStack()
      if (DEBUG){ dayCell.borderWidth = 1; dayCell.borderColor = Color.green(); }
      dayCell.size = new Size(cellSizeHori, cellSizeVert)
      dayCell.centerAlignContent()
      let cellTxt = dayCell.addText( dfDay.string(dayToPrint) )
      setCellStyle(dayToPrint, thisMonthFirst, dayCell, cellTxt) 
      addDay(dayToPrint, 7) // prepare for the next week/row
    }
    /*
    if (weeksInMonth < 5) {
      for (var r = weeksInMonth; r < 5; r++) {
        let dayCell = wdCol.addStack()
        if (DEBUG){ dayCell.borderWidth = 1; dayCell.borderColor = Color.green(); }
        dayCell.size = new Size(cellSizeHori, cellSizeVert)
        dayCell.centerAlignContent()
      }
    }
    */
  } 
  
  return w
}

// days are equal?
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

// Change a weekday to have sunday = 7 (instead of 0): Monday = 1, Sunday = 7
function getDay1(d) { return (d==0) ? 7 : d}

// does not work in Ocotber, due to time shift.
// e.g. 19. Oct + 7 days results in 25. Oct (23:00)
//function addDay(d, diff) { d.setTime(d.getTime() + 86400000 * diff) } 

// days will be added (can be negative)
function addDay(d, diff) {
 d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
 d.setTime( d2.getTime() )
 }

// set d1 to the same time as d2
function setDay(d1, d2) { d1.setTime(d2.getTime()) }

// shifts the month. rollover will be handled automatically
function addMonth(d, shift) { 
  d.setDate(1)
  d.setMonth(d.getMonth() + shift)
}

// how many weeks does given month have
function weekCount(year, month_number, startDayOfWeek) {
  // month_number is in the range 0..11
  // Get the first day of week week day (0: Sunday, 1: Monday, ...)
  var firstDayOfWeek = startDayOfWeek || 0;

  var firstOfMonth = new Date(year, month_number, 1);
  var lastOfMonth = new Date(year, month_number+1, 0);
  var numberOfDaysInMonth = lastOfMonth.getDate();
  var firstWeekDay = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7;

  var used = firstWeekDay + numberOfDaysInMonth;

  return Math.ceil( used / 7);
}

// set style for the calender
function setCellStyle(day, reference, cellStack, cellText) {
    const today = new Date()
    
  // different style for days of previous and next month 
  if (day.getMonth() != reference.getMonth()) {
    cellText.textColor = fontColorOtherMonth
    cellText.font = fontCalOtherMonth
  } else {
    if (day.getDay() == 6 && fontColorSat) cellText.textColor = fontColorSat
    if (day.getDay() == 0 && fontColorSun) cellText.textColor = fontColorSun
    cellText.font = fontCal
  }
  if ( sameDay(day, today) ) {
    //cellText.textColor = fontColorToday
    cellText.font = fontToday
    //(cellStack.backgroundColor = fontColorToday
    //cellStack.cornerRadius = 4
    const highlightedDate = getHighlightedDate(cellText.text)
    cellText.text = ""
    cellStack.addImage(highlightedDate);
  }
  cellText.centerAlignText()
}

function getHighlightedDate(date) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 50;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(fontColorToday);
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(28));
  drawing.setTextAlignedCenter();
  drawing.drawTextInRect(date, new Rect(0, 9, size, size));
  const currentDayImg = drawing.getImage();
  return currentDayImg;
}

//EOF
