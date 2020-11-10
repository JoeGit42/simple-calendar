// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: calendar;
// creator: https://github.com/JoeGit42

const DEBUG = false
  let debugRow
  let debugText

/////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////
const showCW =  true            // true: shows number of week
const styleUS = false           // Showes calendar in US style (1st of the week is Sunday / 1st week in the year is always 1st Jan)
  let markPublicHoliday = true  // does only work for german public holiday (Feiertage)
  let markHoliday = true        // does only work for german holiday (Ferien)

// Fonts and Colors
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
const cellColorHoliday = new Color('bbbbbb', 0.42)

// Date format
const dfHeaderFormat = "MMMM"
const dfHeaderCurrentMonthFormat = "d. MMMM"  // will be used, if the shown month is the current one
const dfHeaderOtherYearFormat = "MMMM yyyy"  // will be used, if the shown month is the current one
const dfDayFormat = "d"
const dfWeekdayFormat = "EEEEE"

// Size of fields
const cellSizeVertical = 16
const cellSizeHori = 18
const cellCWSizeHori = 24

// Misc
const forceApiDownload = false
  let wParameter = []
  let monthShift = 0

// Feiertage (bereitgestellt von https://feiertage-api.de)
//
// Auf der Webseite gibt es einen Spenden-Button, um diesen 
// tollen Serivce zu unterstützen, der kostenlos bereitgestellt wird
// 
// Für jedes Bundesland kann hier eine Liste der Daten für ein bestimmtes Jahr abgefragt werden.
// Kürzel der Bundesländer:
// BW, BY, BE, BB, HB, HH, HE, MV, NI, NW, RP, SL, SN, ST, SH, TH
//
// Beispiel (Daten für Hessen):      https://feiertage-api.de/api/?jahr=2020&nur_land=HE
// Beispiel (Daten für Deutschland): https://feiertage-api.de/api/?jahr=2020&nur_daten
//
const feiertageApiURL = "https://feiertage-api.de/api/?jahr="
  var ft1, ft2
  
// Ferien (bereitgestellt von https://ferien-api.de)
//
// Auf der Webseite gibt es einen Spenden-Button, um diesen 
// tollen Serivce zu unterstützen, der kostenlos bereitgestellt wird
// 
// Für jedes Bundesland kann hier eine Liste der Daten (ggf. für ein bestimmtes Jahr) abgefragt werden.
// Kürzel der Bundesländer:
// BW, BY, BE, BB, HB, HH, HE, MV, NI, NW, RP, SL, SN, ST, SH, TH
//
// Beispiel (Daten für Hessen):      https://ferien-api.de/api/v1/holidays/HE
//
const ferienApiURL = "https://ferien-api.de/api/v1/holidays/"
  var ferien
  
// Returns the week of date, calculated according ISO standard
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
Date.prototype.getWeek = function(styleUS) {
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


// main function
async function createWidget(items) {
  let w = new ListWidget()
  w.setPadding(5,5,5,2)

  let cell

  // DEBUG init
  if (DEBUG) {
    debugRow = w.addStack()
    debugText = debugRow.addText("DEBUG")
    debugText.font = Font.mediumSystemFont(6)
  }
  // DEBUG_END
  
  // Date string init
  const dfHeaderOtherYear = dfCreateAndInit(dfHeaderOtherYearFormat)
  const dfHeaderCurrentMonth = dfCreateAndInit(dfHeaderCurrentMonthFormat)
  const dfHeader = dfCreateAndInit(dfHeaderFormat)
  const dfDay = dfCreateAndInit(dfDayFormat)
  const dfWeekday = dfCreateAndInit(dfWeekdayFormat)

  // check parameter (month to display can be adjusted)
  // state (german: Bundesland) can be given as second parameter
  // e.g.
  //  -1, NW   -> last month, holiday of NRW
  //  0, BY    -> current month, holiday of Bayern
  // <empty>   -> no paremeter means current month, holiday of Hessen (default)
  // 2, HE     -> shows the month ofter the next month, holiday of Hessen
  let parCount = parseInput(args.widgetParameter)

  // collect all the necessary data
  const today = new Date()
  const dayToCalculateWith = new Date() // = today, will be configurable as widget-parameter in the future
    if (monthShift != 0) addMonth(dayToCalculateWith, monthShift)
  const thisWeek = today.getWeek(styleUS)
  const thisMonth = dayToCalculateWith.getMonth()
  const thisYear = dayToCalculateWith.getFullYear()
  const otherYear = (thisMonth == 0) ? thisYear-1 : thisYear+1  // to get public Holidays in previos year or next year 
  const thisMonthFirst = new Date(thisYear, thisMonth, 1)
  const thisMonthFirstWeekday = thisMonthFirst.getDay()  // Sunday = 0, Monday = 1, ...
  const thisMonthFirstWeek = thisMonthFirst.getWeek(styleUS) 
  const thisMonthLast = new Date(thisYear, thisMonth + 1, 0)
  const thisMonthLastWeek = thisMonthLast.getWeek(styleUS) 
  const weeksInMonth = weekCount(thisYear, thisMonth, styleUS)
  
  // a bit more space between the rows, if 5 or 4 weeks are shown
  let cellSizeVert = cellSizeVertical
  if (weeksInMonth == 4) { cellSizeVert += cellSizeVertical/4 }
  if (weeksInMonth == 5) { cellSizeVert += 2 }
  
  // get holiday info
  // if it not succeeds, feature will be disabled 
  if (markPublicHoliday) {
    markPublicHoliday = await fetchPublicHolidayInfo(thisYear, otherYear, areaString)
  }

  // get holiday info
  // if it not succeeds, feature will be disabled 
  if (markHoliday) {
    markHoliday = await fetchHolidayInfo(areaString)
  }
    
  // Prepare an array with the weekday.
  weekdayHeader = prepareWeekdayHeader (styleUS)
  
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
  let monthHeaderRowTxt = monthHeaderRow.addText(headerStr)
  monthHeaderRow.addSpacer(0)
  monthHeaderRow.centerAlignContent()
  monthHeaderRowTxt.font = fontHeader
  monthHeaderRowTxt.textColor = fontColorMonth
  monthHeaderRowTxt.centerAlignText()
  
  w.addSpacer(4)
  
  let fullCal = w.addStack()
  let dayToPrint = new Date()
  
  if (DEBUG) { fullCal.borderWidth = 1; }
  
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
    let weekToShow = dayToPrint.getWeek(styleUS)
    for (var i = 0; i < weeksInMonth; i++) {
      let cwCell = cwCol.addStack()
      if (DEBUG){ cwCell.borderWidth = 1; cwCell.borderColor = Color.green(); }
      cwCell.size = new Size(cellCWSizeHori, cellSizeVert)
      cwCell.centerAlignContent()
      weekToShow = dayToPrint.getWeek(styleUS)
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
    if (day.getDay() == 6 && fontColorSat) cellText.textColor = fontColorSat
    if (day.getDay() == 0 && fontColorSun) cellText.textColor = fontColorSun
    cellText.font = fontCalOtherMonth
  } else {
    if (day.getDay() == 6 && fontColorSat) cellText.textColor = fontColorSat
    if (day.getDay() == 0 && fontColorSun) cellText.textColor = fontColorSun
    cellText.font = fontCal
  }
  
  if (markPublicHoliday && ft1 && ft2) {
    if (isPublicHoliday (day) && fontColorSun) cellText.textColor = fontColorSun
  }
  
  if (markHoliday && ferien) {
    if (isHoliday (day) ) cellStack.backgroundColor = cellColorHoliday 
  }
    
  // today get a nice circle
  if ( sameDay(day, today) ) {
    cellText.font = fontToday
    const highlightedDate = getHighlightedDate(cellText.text, cellText.textColor)
    cellText.text = "" // delete text, as circle includes the text
    cellStack.addImage(highlightedDate);
  }
  cellText.centerAlignText()
}

// creates circle for a highlighted day
function getHighlightedDate(date, color) {
  const drawing = new DrawContext()
  drawing.respectScreenScale = true
  const size = 50
  drawing.size = new Size(size, size)
  drawing.opaque = false
  drawing.setFillColor(fontColorToday)
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2))
  drawing.setFont(Font.boldSystemFont(28))
  if (color) drawing.setTextColor(color)  
  drawing.setTextAlignedCenter()
  drawing.drawTextInRect(date, new Rect(0, 9, size, size))
  const currentDayImg = drawing.getImage()
  return currentDayImg
}

// Preparation of Header line with Weekdays - localized
function prepareWeekdayHeader (styleUS) {
  let headerArray = ["KW", "M", "D", "M", "D", "F", "S", "S"];
  const weekday = new Date() // will be set to Monday 02.11.2020 (or 1st Nov, if weeks starts on Sunday in US-style
  const dfWeekday = dfCreateAndInit (dfWeekdayFormat)
  
  if (styleUS == true) { weekday.setDate(1) } else { weekday.setDate(2) }
  weekday.setMonth(10) // 10=November
  weekday.setFullYear(2020)
  
  // overwrite weekdays with local strings
  for (var i = 1; i <=7; i++) {
    headerArray[i] = dfWeekday.string(weekday)
    addDay(weekday, 1)
  }
  
  return headerArray
}

// fetches the holiday (german: Ferien) info and does caching
async function fetchHolidayInfo(areaCode) {
  // get holidays for this area

  let areaStr = areaCode.toUpperCase()
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "ferien_" + areaStr + ".json")
  let apiURL = ferienApiURL + areaStr
  let file_exists = true
  let req = new Request(apiURL)
  const today = new Date()

  // check if file already exists and is from today
  try {
    ferien = JSON.parse(fm.readString(path), null)
    if (!ferien) { 
      file_exists = false 
    } else { 
      // check, if file is from today
      let fetchTime = new Date(ferien.dateStr)
      if (sameDay(fetchTime, today)) { file_exists = true } else { file_exists = false }
    }
  } catch (err) {
    file_exists = false 
  }

  if (forceApiDownload) file_exists = false
  
  // If file does not exist, or is outdated, get a new one from feiertage-api.de
  if (file_exists == false) {
    try {
      // Fetch data from feiertage-api.de
      ferien = await req.loadJSON()
      ferien.dateStr = new Date().toJSON();  // timestamp of fetch
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(ferien, null, 2))
    } catch (err) {
      // API not working :-(
      return  false
    }  
  }

  return true
}

// fetches the public holiday (german: Feiertage) info and does caching
async function fetchPublicHolidayInfo(thisYear, otherYear, areaCode) {
  // get public holidays for this year and the previous year in January or the next year in December

  let areaStr = areaCode.toUpperCase()
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "feiertage_" + thisYear + "_" + areaStr + ".json")
  let path2 = fm.joinPath(dir, "feiertage_" + otherYear + "_" + areaStr + ".json")
  let apiURL = feiertageApiURL + thisYear + "&nur_land=" + areaStr
  let apiURL2 = feiertageApiURL + otherYear + "&nur_land=" + areaStr
  let file_exists = true
  let req = new Request(apiURL)
  let req2 = new Request(apiURL2)
  const today = new Date()

  // check if file already exists and is from today
  try {
    ft1 = JSON.parse(fm.readString(path), null)
    ft2 = JSON.parse(fm.readString(path2), null)
    if (!ft1 || !ft2) { 
      file_exists = false 
    } else { 
      // check, if file is from today
      let fetchTime = new Date(ft1.dateStr)
      let fetchTime2 = new Date(ft2.dateStr)
      if (sameDay(fetchTime, today) && sameDay(fetchTime2, today)) { file_exists = true } else { file_exists = false }
    }
  } catch (err) {
    file_exists = false 
  }

  if (forceApiDownload) file_exists = false
  
  // If file does not exist, or is outdated, get a new one from feiertage-api.de
  if (file_exists == false) {
    try {
      // Fetch data from feiertage-api.de
      ft1 = await req.loadJSON()
      ft2 = await req2.loadJSON()
      ft1.dateStr = new Date().toJSON();  // timestamp of fetch
      ft2.dateStr = new Date().toJSON();  // timestamp of fetch
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(ft1, null, 2))
      fm.writeString(path2, JSON.stringify(ft2, null, 2))
    } catch (err) {
      // API not working :-(
      return  false
    }  
  }

  return true
}

// Is given date a public holiday (checks two years)
function isPublicHoliday( d ){
  // convert d to a string, which compares to the 'datum' in the json-array
  const dfJsonDate = dfCreateAndInit("yyyy-MM-dd")
  
  checkDate = dfJsonDate.string(d)
  
  // check the current year
  for (feiertagsname in ft1) {
    if( ft1[feiertagsname].datum == checkDate ) {
      return feiertagsname
    }
  }
  // check the other year needed in January and December
  for (feiertagsname in ft2) {
    if( ft2[feiertagsname].datum == checkDate ) {
      return feiertagsname
    }
  }
  
  return false
}

function isHoliday( d ){
  var dStartStr, dEndStr

  for (index in ferien) {
    dStartStr = "" + ferien[index].start
    dStart =  new Date(dStartStr)
    dStart.setHours(0)
    dEndStr = "" + ferien[index].end
    dEnd = new Date(dEndStr) 
    dEnd.setHours(0)
    
    if( d >= dStart && d <= dEnd ) {
      return true
    }
  }
  return false
}

// creates and inits a DateFormatter
function dfCreateAndInit (format) {
  const df = new DateFormatter()
  df.dateFormat = format
  return df
}

// parses the widget parameters
function parseInput(input) {
  // load defaults
  monthShift = 0    // default
  areaString = "HE" // default

  if (input != null && input.length > 0) {
    wParameter = input.split(",")
    
    let parCount = wParameter.length
    
    // take over the given parameters to global variables
    if (parCount > 0) { monthShift = parseInt(wParameter[0]) }
    if (parCount > 1) { areaString = wParameter[1].toUpperCase().trim() }
    
    return wParameter.length
  } 
  return 0
}

//EOF
