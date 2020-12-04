// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: calendar;
// creator: https://github.com/JoeGit42

//////////////////////////////////////////////////////////////////////////////////////////////
// Description of this widget
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// Simple calendar widget to be used in smart stacks
// 
// Layout is clean and simple. There are several switches to configure the widget. 
// (most of them in code, 2 important ones as widget parameter) E.g.
//   • US-style (other calculation of weeks, and weeks starts on Sundays)
//   • calender weeks are shown, but this can be disabled.
//   • State (german:Bundesland) to show Public holidays (german: Feiertage) and Holidays (german: Ferien)
//
// Installation/Configuration
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// Most important configuration is to define the month to show and the state (if you want to see marked holidays) 
// Parameters have to be divided by ',' Example shows the configuration for the upcoming month, and the state Hessen
// 
// 1st (and maybe the only parameter) is the numeric offset for the month.
//   • -1 means the previous month is shown. 
//   • 2 means the month after the next month is shown. 
//   • This mechanism allows multiple widget in one stack. So you can swipe through the month.
// 
// 2nd parameter is state (german: Bundesland)
//   • 2-character abbreviation
//     BW = Baden-Württemberg
//     BY = Bayern
//     BE = Berlin
//     BB = Brandenburg
//     HB = Bremen
//     HH = Hamburg
//     HE = Hessen
//     MV = Mecklenburg-Vorpommern
//     NI = Niedersachsen
//     NW = Nordrhein-Westfalen
//     RP = Rheinland-Pfalz
//     SL = Saarland
//     SN = Sachsen
//     ST = Sachsen-Anhalt
//     SH = Schleswig-Holstein
//     TH = Thüringen
//
//     US = USA (att: special handling, calender get's US style, and holidays are not supported)
//     FA = Persian/Farsi calendar
//
// 
// ToDo / Ideas
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// (1) Support of US holidays
// 
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// DEBUG-CONFIG - DON'T TOUCH THIS
//////////////////////////////////////////////////////////////////////////////////////////////
//
const DEBUG = false
  let debugRow
  let debugText
const appArgs = "" // used in app environment, to have widget configuration 
//
//////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////
// Configuration
/////////////////////////////////////////////////////////////
  let showCW =  true            // true: shows number of week
  let styleUS = false           // Shows calendar in US style (1st of the week is Sunday / 1st week in the year is always 1st Jan)
  let styleFA = false           // Shows persian calendar EXPERIMENTAL !!!
  let markPublicHoliday = true  // does only work for german public holiday (Feiertage)
  let markHoliday = true        // does only work for german holiday (Ferien)
  let showHolidayIcons = true   // shows emojis for well known public holidays
  // config for right sheet (in medium widget)
  let showCWR =  showCW 
  let styleUSR = styleUS
  let styleFAR = styleFA 
  let markPublicHolidayR = markPublicHoliday
  let markHolidayR = markHoliday
  let showHolidayIconsR = showHolidayIcons


// Sizes for small/medium widget
const S_FONT_SIZE_HEADER    =  15
const S_FONT_SIZE_CAL       =  11
const S_SPACER_AFTER_HEADER =   4
const S_HEADER_WIDTH        = 150
const S_CELL_SIZE_HEIGHT    =  17
const S_CELL_SIZE_WIDTH     =  18
const S_CELL_SIZE_CW_WIDTH  =  25

// Sizes for large widget (doubling the values works pretty well)
const L_FONT_SIZE_HEADER    = 2.2 * S_FONT_SIZE_HEADER
const L_FONT_SIZE_CAL       = 2.2 * S_FONT_SIZE_CAL
const L_SPACER_AFTER_HEADER = 2.2 * S_SPACER_AFTER_HEADER
const L_HEADER_WIDTH        = 2.2 * S_HEADER_WIDTH
const L_CELL_SIZE_HEIGHT    = 2.2 * S_CELL_SIZE_HEIGHT
const L_CELL_SIZE_WIDTH     = 2.2 * S_CELL_SIZE_WIDTH
const L_CELL_SIZE_CW_WIDTH  = 2.2 * S_CELL_SIZE_CW_WIDTH

// Fonts and Colors
let fontHeader = Font.mediumSystemFont(S_FONT_SIZE_HEADER) 
let fontCal = Font.mediumSystemFont(S_FONT_SIZE_CAL) 
let fontToday = Font.heavySystemFont(S_FONT_SIZE_CAL) 
let fontCalOtherMonth = Font.thinSystemFont(S_FONT_SIZE_CAL) 
let fontWeekday = Font.mediumSystemFont(S_FONT_SIZE_CAL)
let spacerAfterHeader = S_SPACER_AFTER_HEADER
let headerWidth = S_HEADER_WIDTH
const fontColorWeekdays = Color.gray()
const fontColorCW = Color.gray()
const fontColorSat = null // null will result in default color
const fontColorSun = Color.red()
const fontColorOtherMonth = Color.gray()
const fontColorToday = Color.green()
const fontColorMonth = null  // null will result in default color
const cellColorHoliday = new Color('bbbbbb', 0.42)

// Size of fields
let cellSizeHeight = S_CELL_SIZE_HEIGHT
let cellSizeWidth = S_CELL_SIZE_WIDTH
let cellSizeWidthR = S_CELL_SIZE_WIDTH
let cellCWSizeWidth = S_CELL_SIZE_CW_WIDTH
let cellCWSizeWidthR = S_CELL_SIZE_CW_WIDTH

// Date format
const dfHeaderFormat = "MMMM"
const dfHeaderCurrentMonthFormat = "d. MMMM"  // will be used, if the shown month is the current one
const dfHeaderOtherYearFormat = "MMMM yyyy"  // will be used, if the shown month is the current one
const dfDayFormat = "d"
const dfWeekdayFormat = "EEEEE"

const faLocalizationString = "fa-IR"

const faHeaderFormat = {month: 'long'}
const faHeaderCurrentMonthFormat = {day: 'numeric', month: 'long'}
const faHeaderOtherYearFormat = {month: 'long', year: 'numeric'}
const faDayFormat = {day: 'numeric'}
const faWeekdayFormat = {weekday: 'narrow'}

// Misc
const forceApiDownload = false
  let monthShift = 0
  let areaString = "HE"
  let monthShiftR = 1
  let areaStringR = "HE"

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
const feiertageApiURLworld = "https://date.nager.at/api/v2/PublicHolidays/#yyyy#/#area#"
const feiertageApiURLde = "https://feiertage-api.de/api/?jahr=#yyyy#&nur_land=#area#"
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
  var ferienFromAPI

// Days which can be displayed as Emoji
// variable days will be added in initEmojiDays()
let commonDays = [
    [ 1,  1, "🧨"],
    [ 6,  1, "👑"],
    [14,  2, "💝"],  // Valentine's day
    [ 1,  5, "🙅🏼‍♂️"],  // Tag der Arbeit, German Labour day
    [17,  7, "😀"],  // World Emoji Day
    [ 3, 10, "🇩🇪"],  // Tag der deutschen Einheit
    [31, 10, "🎃"],
    [ 1, 11, "👼🏼"],    
    [ 6, 12, "🎅🏼"],
    [24, 12, "🎄"],
    [25, 12, "🤶🏼"],
    [26, 12, "🎁"],
    [31, 12, "🎉"]
  ];
const commonDaysLength = commonDays.length
  
const bl = [
    ["BW", "Baden_Wuerttemberg"],
    ["BY", "Bayern"],
    ["BE", "Berlin"],
    ["BB", "Brandenburg"],
    ["HB", "Bremen"],
    ["HH", "Hamburg"],
    ["HE", "Hessen"],
    ["MV", "Mecklenburg_Vorpommern"],
    ["NI", "Niedersachsen"],
    ["NW", "Nordrhein_Westfalen"],
    ["RP", "Rheinland_Pfalz"],
    ["SL", "Saarland"],
    ["SN", "Sachsen"],
    ["ST", "Sachsen_Anhalt"],
    ["SH", "Schleswig_Holstein"],
    ["TH", "Thueringen"]
  ];

  
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

Date.prototype.getFaInLatin = function() {
  var date = new Date(this.getTime());
  return date.toLocaleDateString('fa-IR').replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728));
}

Date.prototype.getDateFa = function() {
  var date = new Date(this.getTime());
  return parseInt( date.toLocaleDateString('fa-IR', {day: 'numeric'}).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728)) );
}

// get Farsi month (zero-based !) 
Date.prototype.getMonthFa = function() {
  var date = new Date(this.getTime());
  return parseInt( date.toLocaleDateString('fa-IR', {month: 'numeric'}).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728)) -1);
}

Date.prototype.getFullYearFa = function() {
  var date = new Date(this.getTime());
  return parseInt( date.toLocaleDateString('fa-IR', {year: 'numeric'}).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728)) );
}

//returns the day which is the first day in persian calender
Date.prototype.get1stDayInMonthFa = function() {
  var date = new Date(this.getTime());

  // ATT gregorian_to_jalali() and jalali_to_gregorian() are workin with "correct" month nmot zero-based as usual

  faDate = gregorian_to_jalali(date.getFullYear(), date.getMonth()+1, date.getDate())  
  grDate = jalali_to_gregorian(faDate["y"], faDate["m"], 1)
  let returnDate = new Date(grDate["y"], grDate["m"]-1, grDate["d"]);

  return returnDate
}


// from https://github.com/hat3ck/Persian-Calendar-Qt
// month from 1..12
function gregorian_to_jalali(gy, gm, gd) {
    var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var jy = (gy <= 1600) ? 0 : 979;

    gy -= (gy <= 1600) ? 621 : 1600;

    var gy2 = (gm > 2) ? (gy + 1) : gy;
    var days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) +
        (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];

    jy += 33 * (parseInt(days / 12053));
    days %= 12053;
    jy += 4 * (parseInt(days / 1461));
    days %= 1461;
    jy += parseInt((days - 1) / 365);

    if (days > 365)
        days = (days - 1) % 365;

    var jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
    var jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));

    return {"y":jy, "m":jm, "d":jd};
}

// from https://github.com/hat3ck/Persian-Calendar-Qt
// month from 1..12
function jalali_to_gregorian(jy, jm, jd) {
    var gy = (jy <= 979) ? 621 : 1600;

    jy -= (jy <= 979) ? 0 : 979;

    var days = (365 * jy) + ((parseInt(jy / 33)) * 8) + (parseInt(((jy % 33) + 3) / 4)) +
        78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);

    gy += 400 * (parseInt(days / 146097));
    days %= 146097;

    if (days > 36524) {
        gy += 100 * (parseInt(--days / 36524));
        days %= 36524;

        if (days >= 365)
            days++;
    }

    gy += 4 * (parseInt((days) / 1461));
    days %= 1461;
    gy += parseInt((days - 1) / 365);

    if (days > 365)
        days = (days - 1) % 365;

    var gd = days + 1;
    var sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var gm

    for (gm = 0; gm < 13; gm++) {
        var v = sal_a[gm];
        if (gd <= v) break;
        gd -= v;
    }
    return {"y":gy, "m":gm, "d":gd};
    //return [gy, gm, gd];
}

// from https://github.com/hat3ck/Persian-Calendar-Qt
// month from 1..12
function dayInMonthFa(year, month) {
    month = month - 1

    if (month < 0) return -1;
    if (month < 6) return 31;
    if (month < 11) return 30;

    var ary = [1, 5, 9, 13, 17, 22, 26, 30];
    var b = year % 33;

    for (var i = 0; i < ary.length; i++)
        if (b === ary[i])
            return 30;

    return 29;
}

// month from 1..12
// return from 0..6
function weekdayFa(jy, jm, jd) {
    var d = jalali_to_gregorian(jy, jm, jd)
    var g = new Date(d["y"], d["m"] - 1, d["d"])

    return g.getDay()
}

// small widget instance
let widget = await createWidget()
if (!config.runsInWidget) await widget.presentMedium()
Script.setWidget(widget)
Script.complete()

function globalInit() {      
  // init for app environment is done at declaration
  if (config.runsInWidget) {
    switch (config.widgetFamily) {
      case 'small':
      case 'medium':
        fontHeader = Font.mediumSystemFont(S_FONT_SIZE_HEADER)
        fontCal = Font.mediumSystemFont(S_FONT_SIZE_CAL)
        fontToday = Font.heavySystemFont(S_FONT_SIZE_CAL)
        fontCalOtherMonth = Font.thinSystemFont(S_FONT_SIZE_CAL)
        fontWeekday = Font.mediumSystemFont(S_FONT_SIZE_CAL)
        spacerAfterHeader = S_SPACER_AFTER_HEADER  
        cellSizeHeight = S_CELL_SIZE_HEIGHT
        cellSizeWidth   = (!showCW) ? 1.2 * S_CELL_SIZE_WIDTH    : S_CELL_SIZE_WIDTH
        cellCWSizeWidth = (!showCW) ? 0.1 * S_CELL_SIZE_CW_WIDTH : S_CELL_SIZE_CW_WIDTH
        cellSizeWidthR   = (!showCWR) ? 1.2 * S_CELL_SIZE_WIDTH    : S_CELL_SIZE_WIDTH
        cellCWSizeWidthR = (!showCWR) ? 0.1 * S_CELL_SIZE_CW_WIDTH : S_CELL_SIZE_CW_WIDTH
        headerWidth = S_HEADER_WIDTH              
        break;
      case 'large':
      default:
        fontHeader = Font.mediumSystemFont(L_FONT_SIZE_HEADER) 
        fontCal = Font.mediumSystemFont(L_FONT_SIZE_CAL)
        fontToday = Font.heavySystemFont(L_FONT_SIZE_CAL) 
        fontCalOtherMonth = Font.thinSystemFont(L_FONT_SIZE_CAL)
        fontWeekday = Font.mediumSystemFont(L_FONT_SIZE_CAL) 
        spacerAfterHeader = L_SPACER_AFTER_HEADER 
        cellSizeHeight = L_CELL_SIZE_HEIGHT
        cellSizeWidth   = (!showCW) ? 1.2 * L_CELL_SIZE_WIDTH    : L_CELL_SIZE_WIDTH
        cellCWSizeWidth = (!showCW) ? 0.1 * L_CELL_SIZE_CW_WIDTH : L_CELL_SIZE_CW_WIDTH
        cellSizeWidthR   = (!showCWR) ? 1.2 * L_CELL_SIZE_WIDTH    : L_CELL_SIZE_WIDTH
        cellCWSizeWidthR = (!showCWR) ? 0.1 * L_CELL_SIZE_CW_WIDTH : L_CELL_SIZE_CW_WIDTH
        headerWidth = L_HEADER_WIDTH
    }   
  }
}

// main function
async function createWidget(items) {
  let w = new ListWidget()
  w.setPadding(5,3,5,2)

  let showSheetR = false
  let thisMonth 
  let thisYear 
  let weeksInMonth

  
  // DEBUG init
  if (DEBUG) {
    debugRow = w.addStack()
    debugText = debugRow.addText("DEBUG")
    debugText.font = Font.mediumSystemFont(6)
  }
  // DEBUG_END
    
  // check parameter (month to display can be adjusted)
  // state (german: Bundesland) can be given as second parameter
  // e.g.
  //  -1, NW   -> last month, holiday of NRW
  //  0, BY    -> current month, holiday of Bayern
  // <empty>   -> no paremeter means current month, holiday of Hessen (default)
  // 2, HE     -> shows the month ofter the next month, holiday of Hessen
  let parCount = parseInput(args.widgetParameter)

  globalInit()

  setWidgetURL(w, areaString)
  
  // Check the number of rows to display (should be equal in both sheets in medium widget)
  let dayToCalculateWith = new Date() 
  if (monthShift != 0) addMonth(dayToCalculateWith, monthShift, styleFA)
  if (!styleFA) {
    thisMonth = dayToCalculateWith.getMonth()
    thisYear = dayToCalculateWith.getFullYear()
    weeksInMonth = weekCount(thisYear, thisMonth, styleUS ? 0 : 1)
  } else { // styleFA
    thisMonth = dayToCalculateWith.getMonthFa()
    thisYear = dayToCalculateWith.getFullYearFa()
    weeksInMonth = weekCountFa(thisYear, thisMonth+1)
  }
    
  if (config.runsInWidget) {
    if (config.widgetFamily == "medium") { showSheetR = true }
  } else { showSheetR = true } // in app
  
  // the other sheet might have to display more weeks
  if (showSheetR) { 
    dayToCalculateWith = new Date() 
    if (monthShiftR != 0) addMonth(dayToCalculateWith, monthShiftR, styleFAR)
    if (!styleFAR) {
      thisMonth = dayToCalculateWith.getMonth()
      thisYear = dayToCalculateWith.getFullYear()
      weeksInMonth = Math.max(weeksInMonth, weekCount(thisYear, thisMonth, styleUSR ? 0 : 1))
    } else { // styleFA
      thisMonth = dayToCalculateWith.getMonthFa()
      thisYear = dayToCalculateWith.getFullYearFa()
      weeksInMonth = Math.max(weeksInMonth, weekCountFa(thisYear, thisMonth+1))
    }
  }
  
  // a bit more space between the rows, if 5 or 4 weeks are shown
  if (weeksInMonth < 6) {
    cellSizeHeight = (cellSizeHeight*6)/(weeksInMonth*1.1)
  }
  doubleSheet =  w.addStack()
  doubleSheet.layoutHorizontally()
    
  let sheetLeft = doubleSheet.addStack()
  sheetLeft.layoutVertically()
  await drawSheet(sheetLeft, monthShift, weeksInMonth, areaString, showCW, styleUS, styleFA, markPublicHoliday, markHoliday, showHolidayIcons, areaString != areaStringR);

  // show 2nd in medium widget
  if (showSheetR) { 
    cellCWSizeWidth = cellCWSizeWidthR
    cellSizeWidth = cellSizeWidthR
    doubleSheet.addSpacer(15)
    let sheetRight = doubleSheet.addStack()
    sheetRight.layoutVertically()
    await drawSheet(sheetRight, monthShiftR, weeksInMonth, areaStringR, showCWR, styleUSR, styleFAR, markPublicHolidayR, markHolidayR, showHolidayIconsR, areaString != areaStringR);
  }
  
  return w
}

async function drawSheet(drawstack, m_shift, num_rows, area, cw, us, fa, p_holiday, holiday, emojis, showArea) {

  // Date string init
  const dfHeaderOtherYear = dfCreateAndInit(dfHeaderOtherYearFormat)
  const dfHeaderCurrentMonth = dfCreateAndInit(dfHeaderCurrentMonthFormat)
  const dfHeader = dfCreateAndInit(dfHeaderFormat)
  const dfDay = dfCreateAndInit(dfDayFormat)
  const dfWeekday = dfCreateAndInit(dfWeekdayFormat)

  // collect all the necessary data
  const today = new Date()
    let dayToCalcWith = new Date()
    if (m_shift != 0) { addMonth(dayToCalcWith, m_shift, fa) }
  
  const thisWeek = today.getWeek(us)
  const thisMonth = dayToCalcWith.getMonth()
  const thisYear = dayToCalcWith.getFullYear()
  const thisMonthFa = dayToCalcWith.getMonthFa()
  const thisYearFa = dayToCalcWith.getFullYearFa()
  const otherYear = (thisMonth == 0) ? thisYear-1 : thisYear+1  // to get public Holidays for previos year or next year 
  const thisMonthFirst = new Date(thisYear, thisMonth, 1)
  const thisMonthFirstFa = dayToCalcWith.get1stDayInMonthFa() 
  const thisMonthFirstWeekday = thisMonthFirst.getDay()  // Sunday = 0, Monday = 1, ...
  //const thisMonthFirstWeek = thisMonthFirst.getWeek(us) 
  //const thisMonthLast = new Date(thisYear, thisMonth + 1, 0)
  //const thisMonthLastWeek = thisMonthLast.getWeek(us) 
  const weeksInMonth = num_rows // weekCount(thisYear, thisMonth, us ? 0 : 1)
  
  // get holiday info
  // if it not succeeds, feature will be disabled 
  if (p_holiday) {
    p_holiday = await fetchPublicHolidayInfo(thisYear, otherYear, area)
  }

  // get holiday info
  // if it not succeeds, feature will be disabled 
  if (holiday) {
    holiday = await fetchHolidayInfo(area)
  }
  
  // Prepare the days, which are replaced with Emojis
  if (emojis) initEmojiDays(dayToCalcWith)

    
  // Prepare an array with the weekday.
  weekdayHeader = prepareWeekdayHeader (us, fa)
  
  // first row will be the month
  // e.g. November
  if (!fa) {
    if ( sameDay(dayToCalcWith, today) ) {
     headerStr = dfHeaderCurrentMonth.string(dayToCalcWith)  // show day, if it's the current month
    } else if (dayToCalcWith.getFullYear() != today.getFullYear()) {
      headerStr = dfHeaderOtherYear.string(dayToCalcWith)  // show year, if it's not this year
    } else {
      headerStr = dfHeader.string(dayToCalcWith)  // show the month
    }    
  } else { // styleFA
    if ( sameDay(dayToCalcWith, today) ) {
     headerStr = dayToCalcWith.toLocaleDateString(faLocalizationString, faHeaderCurrentMonthFormat)
    } else if (dayToCalcWith.getFullYearFa() != today.getFullYearFa()) {
     headerStr = dayToCalcWith.toLocaleDateString(faLocalizationString, faHeaderOtherYearFormat)
    } else {
     headerStr = dayToCalcWith.toLocaleDateString(faLocalizationString, faHeaderFormat)
    }  
  }
   
  let monthHeaderRow = drawstack.addStack()
  monthHeaderRow.size = new Size(headerWidth, 0)
  if (DEBUG){ monthHeaderRow.borderWidth = 1; monthHeaderRow.borderColor = Color.yellow(); }  
  monthHeaderRow.addSpacer(0)
  let monthHeaderRowTxt = monthHeaderRow.addText(headerStr.toUpperCase())
  monthHeaderRow.addSpacer(0)
  monthHeaderRow.centerAlignContent()
  monthHeaderRowTxt.font = fontHeader
  monthHeaderRowTxt.textColor = fontColorMonth
  monthHeaderRowTxt.centerAlignText()
  
  drawstack.addSpacer(spacerAfterHeader)
  
  let fullCal = drawstack.addStack()
  let dayToPrint = new Date()
  
  if (DEBUG) { fullCal.borderWidth = 1; }
  
  if (cw) {
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
    cwCell.size = new Size(cellCWSizeWidth, cellSizeHeight)
    cwCell.centerAlignContent()
    let cwTxt = cwCell.addText(" ") // empty cell 
    if (showArea) {
      cwTxt.text = area.toLowerCase()
      if (cwTxt.text == "nw") {cwTxt.text = "nrw"}
      //if (cwTxt.text == "us") {cwTxt.text = "🇺🇸"}
    }
    cwTxt.font = fontCal
    cwTxt.textColor = fontColorCW
    cwTxt.centerAlignText()
    setDay(dayToPrint, thisMonthFirst)
    let weekToShow = dayToPrint.getWeek(us)
    for (var i = 0; i < weeksInMonth; i++) {
      let cwCell = cwCol.addStack()
      if (DEBUG){ cwCell.borderWidth = 1; cwCell.borderColor = Color.green(); }
      cwCell.size = new Size(cellCWSizeWidth, cellSizeHeight)
      cwCell.centerAlignContent()
      weekToShow = dayToPrint.getWeek(us)
      let weekToShowStr = (weekToShow < 10) ? "#0" + weekToShow : "#" + weekToShow
      let cwTxt = cwCell.addText( weekToShowStr )
      cwTxt.font = fontCal
      cwTxt.leftAlignText()
      if (thisWeek == weekToShow && today.getFullYear() == dayToCalcWith.getFullYear()) { cwTxt.textColor = fontColorToday } else {  cwTxt.textColor = fontColorCW }
      dayToPrint = addDay(dayToPrint, 7) // prepare for the next week/row
    }
  } else { // some space instead of calender weeks
    fullCal.addSpacer(cellCWSizeWidth)
  }
  
  // now we come to the numbers 
  //   - 7 columns - one for each weekday 
  //   - 4 to 6 rows for the week
  let diff = us ? thisMonthFirstWeekday : getDay1(thisMonthFirstWeekday) - 1 // number of days which have to be filled with old month in the first row
  if (fa) {
    var firstOfMonthDay = weekdayFa(thisMonthFirstFa.getFullYearFa(), thisMonthFirstFa.getMonthFa()+1, 1)
    diff = (firstOfMonthDay - 6 + 7) % 7;
  }

  for (var wd = 1; wd <= 7; wd++) { // one column for each weekday
    if (!fa) {
      setDay(dayToPrint, thisMonthFirst)
      dayToPrint = addDay(dayToPrint, (diff * (-1)) + (wd-1))  // set the day to the first day in the week (might be the previous month in the 1st week of the month)
    } else { // styleFA
      setDay(dayToPrint, thisMonthFirstFa)
      dayToPrint = addDay(dayToPrint, (7 - (diff+1)) - (wd-1) )  // set the day to the first day in the week (might be the previous month in the 1st week of the month)
    }
    let wdCol = fullCal.addStack()
    if (DEBUG){ wdCol.borderWidth = 1; wdCol.borderColor = Color.red(); }
    wdCol.layoutVertically()
    wdCol.centerAlignContent()
    let dayCell = wdCol.addStack()
    dayCell.size = new Size(cellSizeWidth, cellSizeHeight)
    dayCell.centerAlignContent()
    let cellTxt = dayCell.addText(weekdayHeader[wd])
    cellTxt.font = fontWeekday
    cellTxt.textColor = fontColorWeekdays
    cellTxt.centerAlignText()
    if (!fa && dayToPrint.getDay() == 6 && fontColorSat) cellTxt.textColor = fontColorSat
    if (!fa && dayToPrint.getDay() == 0 && fontColorSun) cellTxt.textColor = fontColorSun
    if (fa && dayToPrint.getDay() == 5 && fontColorSun) cellTxt.textColor = fontColorSun // persian calendar get the Friday in red
    for (var r = 0; r < weeksInMonth; r++) {
      let dayCell = wdCol.addStack()
      if (DEBUG){ dayCell.borderWidth = 1; dayCell.borderColor = Color.green(); }
      dayCell.size = new Size(cellSizeWidth, cellSizeHeight)
      dayCell.centerAlignContent()
      let cellTxt = dayCell.addText( dfDay.string(dayToPrint) )
      if (fa) cellTxt.text = dayToPrint.toLocaleDateString(faLocalizationString, faDayFormat) 
      setCellStyle(dayToPrint, (fa) ? thisMonthFirstFa : thisMonthFirst, dayCell, cellTxt, p_holiday, holiday, emojis, fa) 
      dayToPrint = addDay(dayToPrint, 7) // prepare for the next week/row
    }
  } 
}

// days are equal?
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

// same month in the same year 
function sameMonth(d1, d2, fa) {
  if (!fa) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() 
  } else { // styleFA
    return d1.getFullYearFa() === d2.getFullYearFa() && d1.getMonthFa() === d2.getMonthFa()
  }
}


// Change a weekday to have sunday = 7 (instead of 0): Monday = 1, Sunday = 7
function getDay1(d) { return (d==0) ? 7 : d}

// days will be added (can be negative)
function addDay(d, diff) {
  d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
  //d.setTime( d2.getTime() )
  return d2
}


// set d1 to the same time as d2
function setDay(d1, d2) { d1.setTime(d2.getTime()) }

// shifts the month. rollover will be handled automatically
function addMonth(d, shift, fa) { 
  if (!fa) {
    d.setDate(1)
    d.setMonth(d.getMonth() + shift)
  } else { // shifts the month in persian calendar
    let faDay1 = d.get1stDayInMonthFa()
    let currentFaMonth = faDay1.getMonthFa()  // zero based
    let currentFaYear = faDay1.getFullYearFa()
    
    let newFaMonth = (currentFaMonth + shift) % 12          // zero based
    let yDiff = Math.floor( (currentFaMonth + shift) / 12 ) 
    let newFaYear = currentFaYear + yDiff
    
    let grDay = jalali_to_gregorian(newFaYear, newFaMonth+1, 1)
    let grDate = new Date(grDay["y"], grDay["m"]-1, grDay["d"]);
  
    d.setTime( grDate.getTime() )
  }  
}

// how many weeks does given month have
function weekCountFa(year, month) {
  // month is in the range 1..12
  // first day of the week is Saturday (ATT: it's the column on the _right_ edge!)
  var firstDayOfWeek = 6;
  var numberOfDaysInMonth = dayInMonthFa(year, month) 
  var firstOfMonthDay = weekdayFa(year, month, 1)
  var firstWeekDay = (firstOfMonthDay - firstDayOfWeek + 7) % 7;
  var used = firstWeekDay + numberOfDaysInMonth;
  
  return Math.ceil( used / 7);
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
function setCellStyle(day, reference, cellStack, cellText, p_holiday, holiday, showEmojis, fa) {
  const today = new Date()
  
  //check if date can be replaced by emoji
  if (showEmojis)  cellText.text = getEmoji(day, cellText.text)
    
  // different style for days of previous and next month 
  if ( !sameMonth(day, reference, fa) ) {
    cellText.textColor = fontColorOtherMonth
    if (!fa && day.getDay() == 6 && fontColorSat) cellText.textColor = fontColorSat
    if (!fa && day.getDay() == 0 && fontColorSun) cellText.textColor = fontColorSun
    if (fa && day.getDay() == 5 && fontColorSun) cellText.textColor = fontColorSun    // persian calendar get the Friday in red
    cellText.font = fontCalOtherMonth
  } else {
    if (!fa && day.getDay() == 6 && fontColorSat) cellText.textColor = fontColorSat
    if (!fa && day.getDay() == 0 && fontColorSun) cellText.textColor = fontColorSun
    if (fa && day.getDay() == 5 && fontColorSun) cellText.textColor = fontColorSun     // persian calendar get the Friday in red
    cellText.font = fontCal
  }
  
  if (p_holiday && ft1 && ft2) {
    if (isPublicHoliday (day) && fontColorSun) cellText.textColor = fontColorSun
  }
  
  if (holiday && ferien) {
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
  drawing.setFont(Font.boldSystemFont(30))
  if (color) drawing.setTextColor(color)  
  drawing.setTextAlignedCenter()
  drawing.drawTextInRect(date, new Rect(0, 6, size, size))
  const currentDayImg = drawing.getImage()
  return currentDayImg
}


function initEmojiDays(date) {

  // delete last entries
  if (commonDaysLength < commonDays.length) {
    for (i = (commonDays.length - commonDaysLength); i; i--) {
      commonDays.pop()
    }    
  }

  // Special hanbdling for days to calculate
  // 1. Advent 
  let xmasEve = new Date(date.getFullYear(), 11, 24)
  let diff = ((-3) * 7) + ((-1)*xmasEve.getDay())
  xmasEve = addDay(xmasEve, diff) // xmasEve becomes 1st Advent
  commonDays.push([xmasEve.getDate(), (xmasEve.getMonth())+1, "🕯"])

  // Easter Monday  
  let EasterMonday = getDate4Holidaystring("Ostermontag")
  if (EasterMonday) {
    let EasterSunday = addDay(EasterMonday, -1)
    commonDays.push([EasterSunday.getDate(), (EasterSunday.getMonth())+1, "🐰"])
  }

  // Good Friday
  if (EasterMonday) {
    let GoodFriday = addDay(EasterMonday, -3)
    commonDays.push([GoodFriday.getDate(), (GoodFriday.getMonth())+1, "✝️"])
  }
  
  // Ascension Day
  if (EasterMonday) {
    let AscensionDay = addDay(EasterMonday, 38)
    commonDays.push([AscensionDay.getDate(), (AscensionDay.getMonth())+1, "☄️"])
  }
  
  // Karneval ("Altweiber")
  if (EasterMonday) {
    let Altweiber = addDay(EasterMonday, -53)
    commonDays.push([Altweiber.getDate(), (Altweiber.getMonth())+1, "🎭"])
  }
  
  // Black Friday (the day after the 4th Thursday in November)
  let Nov1 = new Date(date.getFullYear(), 10, 1)
  let wdNov1 = Nov1.getDay()
  let bfDay = Nov1
  if ( wdNov1 <= 4) { bfDay = addDay(Nov1, (4-wdNov1)  + (3*7) + 1) } 
  if ( wdNov1 > 4)  { bfDay = addDay(Nov1, (11-wdNov1) + (3*7) + 1) }  
  commonDays.push([bfDay.getDate(), (bfDay.getMonth())+1, "🛍"])
}

// return emojis for special days
function getEmoji(date, originalText) {
  let day = date.getDate()
  let month = date.getMonth()
  
  for (i=0; i < commonDays.length; i++) {
    if ( commonDays[i][0] == day && commonDays[i][1] == (month + 1) ) {
      return commonDays[i][2]
    }
  }

  return originalText
}

// Preparation of Header line with Weekdays - localized
function prepareWeekdayHeader (styleUS, styleFA) {
  let headerArray = ["KW", "M", "D", "M", "D", "F", "S", "S"];
  let weekday = new Date() // will be set to Monday 02.11.2020 (or 1st Nov, if weeks starts on Sunday in US-style
  const dfWeekday = dfCreateAndInit (dfWeekdayFormat)
  
  // styleUS starts on Sunday
  // styleFA starts on Friday, Thursday, Wednesday, ... Saturday  (or starts on Saturday right2left)
  // other starts on Monday
  if (styleUS == true) { 
    weekday.setDate(1) 
  } else if (styleFA == true) { 
    weekday.setDate(6)
  } else { 
    weekday.setDate(2) 
  }
  weekday.setMonth(10) // 10=November
  weekday.setFullYear(2020)
  
  // overwrite weekdays with local strings
  for (var i = 1; i <=7; i++) {
    if (styleFA == true) {
      headerArray[i] = weekday.toLocaleDateString(faLocalizationString, faWeekdayFormat)
      weekday = addDay(weekday, -1)
    }
    else {
      headerArray[i] = dfWeekday.string(weekday)
      weekday = addDay(weekday, 1)
    }
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
      ferienFromAPI = await req.loadJSON()
      ferienFromAPI.dateStr = new Date().toJSON();  // timestamp of fetch
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(ferienFromAPI, null, 2))
      ferien = ferienFromAPI
    } catch (err) {
      // API not working :-(
      return  false
    }  
  }

  return true
}

function isGermanState(area) {
  for (i=0; i<bl.length; i++) {
    if ( area.toUpperCase() == bl[i][0].toUpperCase() ) return true
  }
}

// fetches the public holiday (german: Feiertage) info and does caching
async function fetchPublicHolidayInfo(thisYear, otherYear, areaCode) {
  // get public holidays for this year and the previous year in January or the next year in December

  let areaStr = areaCode.toUpperCase()
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "feiertage_" + thisYear + "_" + areaStr + ".json")
  let path2 = fm.joinPath(dir, "feiertage_" + otherYear + "_" + areaStr + ".json")
  let apiURL, apiURL2

  if ( isGermanState(areaStr) ) {
    apiURL = feiertageApiURLde
  } else {
    apiURL = feiertageApiURLworld
  }
  apiURL = apiURL.replace("#area#", areaStr)
  apiURL2 = apiURL
  apiURL = apiURL.replace("#yyyy#", thisYear)
  apiURL2 = apiURL2.replace("#yyyy#", otherYear)
     
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
function getDate4Holidaystring( holidaystring ){
  // convert d to a string, which compares to the date in the json-array
  let returnDay = 0
        
  // check only the current year
  for (feiertagsname in ft1) {
    if (feiertagsname.toString() == holidaystring ) {
      // datum has format "yyyy-MM-dd"
      let datum  = ft1[feiertagsname].datum 
      returnDay = new Date (parseInt( datum.substring(0,4) ), parseInt( datum.substring(5,7) ) - 1, parseInt( datum.substring(8,10) ))
    }
  }  
  return returnDay
}

// Is given date a public holiday (checks two years)
function isPublicHoliday( d ){
  // convert d to a string, which compares to the date in the json-array
  const dfJsonDate = dfCreateAndInit("yyyy-MM-dd")  // same for world and de json-files
  const checkDate = dfJsonDate.string(d)
  
  // check the current year
  for (feiertagsname in ft1) {
    if( ft1[feiertagsname].datum == checkDate ) {   // german api useses "datum"
      return feiertagsname
    }
    if( ft1[feiertagsname].date == checkDate ) {    // world api uses "date"
      return feiertagsname
    }
  }
  // check the other year needed in January and December
  for (feiertagsname in ft2) {
    if( ft2[feiertagsname].datum == checkDate ) {
      return feiertagsname
    }
    if( ft2[feiertagsname].date == checkDate ) {
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
  monthShiftR = 1    // default for right sheet in medium widget
  areaStringR = "HE" // default for right sheet in medium widget
  let num = 0
  let area
  let get1stNum  = false
  let get2ndNum  = false
  let get1stArea = false
  let wParameter = []

  if (!config.runsInWidget) {
    input = appArgs
  }

  if (input != null && input.length > 0) {
    wParameter = input.split(",")
    let parCount = wParameter.length
    
    for (i=0; i < parCount; i++) {
      num = parseInt(wParameter[i])
      if ( isNaN(num) ) {
        area = wParameter[i].toUpperCase().trim() 
        if (!get1stArea) { // 1st number for the left or only sheet
          areaString = area
          areaStringR = area
          get1stArea = true
        } else { // 2nd number for the right sheet
          areaStringR = area
        }        
      } else { // is number
        if (!get1stNum) { // 1st number for the left or only sheet
          monthShift = num
          monthShiftR = num + 1
          get1stNum = true
        } else { // 2nd number for the right sheet
          monthShiftR = num
          get2ndNum = true
        }        
      }
    } 
    
    // if only 1 number is given, but 2 different state, the same month is display on both sheets
    if (get2ndNum == false && areaString != areaStringR) {monthShiftR = monthShift}
    
    // special handling for NRW
    if (areaString == "NRW")  areaString  = "NW"
    if (areaStringR == "NRW") areaStringR = "NW"
    
    if (!isGermanState(areaString))   {showHolidayIcons  = false}
    if (!isGermanState(areaStringR))  {showHolidayIconsR = false}
    
    // special handling for US
    if (areaString == "US") {
      styleUS = true
      markPublicHoliday = true   
      markHoliday = false        // does only work for german  holiday (Ferien)
    }
    if (areaStringR == "US") {
      styleUSR = true
      markPublicHolidayR = true    
      markHolidayR = false        // does only work for german  holiday (Ferien)
    }
    
    // special handling for Farsi
    if (areaString.indexOf("FA") >= 0) {
      styleFA = true
      markPublicHoliday = false  // check, which country to choose
      markHoliday = false        // does only work for german  holiday (Ferien)
      showCW = false
      // FA can be extended with country code to search public holidays - see https://date.nager.at/Home/Countries for list of supported countries
      if (areaString.length >= 4) {
        areaString = areaString.replace("FA","").trim() 
        areaString = areaString.replace("-","").trim() 
        areaString = areaString.replace("_","").trim() 
        markPublicHoliday = true
      } 
    }
    if (areaStringR.indexOf("FA") >= 0) {
      styleFAR = true
      markPublicHolidayR = false 
      markHolidayR = false        // does only work for german  holiday (Ferien)
      showCWR = false
      // FA can be extended with country code to search public holidays - see https://date.nager.at/Home/Countries for list of supported countries
      if (areaStringR.length >= 4) {
        areaStringR = areaStringR.replace("FA","").trim() 
        areaStringR = areaStringR.replace("-","").trim() 
        areaStringR = areaStringR.replace("_","").trim() 
        markPublicHolidayR = true
      } 
    }
    
    return wParameter.length
  } 
  return 0
}

// sets URL of widget, to forward user to Kalender after wwidget-klick
function setWidgetURL(w, areaCode) {
  var baseURL = "https://www.schulferien.org/Kalender_mit_Ferien/#BL#.html" 
  var shortStr = areaCode
  var longStr = ""
  var replaceStr = "#BL#"

  if (styleFA) {
    w.url = "http://www.iranian-calendar.com"
  } else if (styleUS) {
    w.url = "https://www.timeanddate.com/calendar/?country=1"    
  } else {
    for (i=0; i<bl.length; i++) {
      if (shortStr == bl[i][0]) longStr = bl[i][1]
    }
    w.url = baseURL.replace(replaceStr, longStr)
  }
  
}


//EOF
