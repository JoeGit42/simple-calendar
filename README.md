# simple-calendar
Simple calendar widget to be used in smart stacks

Layout is clean and simple.
There are several switches to configure the widget. (most of them in code, 2 important ones as widget parameter)
E.g. 
  * US-style (other calculation of weeks, and weeks starts on Sundays)
  * calender weeks are shown, but this can be disabled.
  * State (german:Bundesland) to show Public holidays (german: Feiertage) and Holidays (german: Ferien)

![](hell.mov) ![](dunkel.mov)

![](farsi.mov)

### Configuration
Most important configuration is to define the month to show and the state (if you want to see marked holidays)
Parameters have to be divided by ','
Example shows the configuration for the upcoming month, and the state Hessen

Input parameters are parsed in a flexible way, so they don't have to be 100% accurate.
Order doesn't matter. If parameters are missing, useful estimation will be done.

![](parameter.jpg)

#### 1st (and maybe the only parameter) is the numeric offset for the month.
-1 means the previous month is shown.
2 means the month after the next month is shown.
This mechanism allows multiple widget in one stack. So you can swipe through the month.
#### 2nd parameter is state (german: Bundesland)
2-character abbreviation 
* BW = Baden-Württemberg
* BY = Bayern
* BE = Berlin
* BB = Brandenburg
* HB = Bremen
* HH = Hamburg
* HE = Hessen
* MV = Mecklenburg-Vorpommern
* NI = Niedersachsen
* NW = Nordrhein-Westfalen
* RP = Rheinland-Pfalz
* SL = Saarland
* SN = Sachsen
* ST = Sachsen-Anhalt
* SH = Schleswig-Holstein
* TH = Thüringen


* US = USA (att: special handling, calender get's US style, only public holidays are not supported)


* ??   any code, which is supported by https://date.nager.at/Home/Countries 

* FA = Persian/Farsi calendar (att: special handling, calender get's persian style, weeknumbers are not supported)

       - this code can be extend by country codes (e.g. FA-EG for Egypt)

#### 3rd, 4th parameter (used for 2nd sheet in medium widget)
e.g. 0,he,1,he

shows the current and the next month
![](medium_2month.jpeg)

e.g. 0,he,0,nrw

To compare different states. Useful to check different holidays
![](medium_2states.jpeg)

e.g. 0,he,0,us

To compare german state with USA.

As calendar weeks calculated in different ways, they are not the same in 2021.
![](medium_de_us.jpeg)


#### Image support
* For transparent backgrounds use the following script to create the correct image:
    https://gist.github.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9
* After creating the image and saving it to photo library, you have to start the calendar script within scriptable app
* Change in code: forceImageSelection = true -> After next start you will get a dialog to select an image from library.
* The selected image will be saved with the filename <imgFileName> (default is image.jpg)
* You have to set the same filename as one of the wdiget parameters
* e.g. 0,he,image.jpg 

#### Private Holidays
* It's possible to dispay your private holidays in green font color. (Saturday remains red).
* To enter your holiday dates you have to fill the array <privateHoliday> with your data.
  Each entry gets start and end-date. If you want to enter a single day, take this as start and end-date

### Known Bugs

### ChangeLog
- 2020-11-07 initial version
- 2020-11-08 ADD: Support of public holidays (uses feiertage-api.de). Indicated with same color as Sundays.
- 2020-11-08 CHG: Saturdays, Sundays and Holidays in next and previous month, so also get the right color, but will remain with thin font.
- 2020-11-08 FIX: Some finetuning, for today circle incl. font color
- 2020-11-09 FIX: color handling
- 2010-11-10 ADD: Support of holiday (state dependend)
- 2020-11-10 ADD: state (german:Bundesland) can be configured by widget parameter, no need to touch code
- 2020-11-17 CHG: increased font size, month in upper case
- 2020-11-17 ADD: to support us, you can give "us" as state (US szyle calender will be enabled in this case, and holidays will not be shown - maybe in the future, if there's a request)
- 2020-11-11 ADD: Widget get's a reasonable link (forward to web calendar which fits to your region)
- 2020-11-11 FIX: last week in month lost in some cases
- 2020-11-28 ADD: Support for large widget
- 2020-11-28 ADD: Public Holidays will be displayed as emoji (if available). If you think it_#s to colorful, you can switch this off with showHolidayIcons = false
- 2020-11-29 ADD: Support for medium widget
- 2020-12-03 ADD: Support for Persian / Farsi calendar 
- 2020-12-04 ADD: Support for international public holiday
- 2020-12-04 ADD: Support for background images (you can fake transparent effect with this)
- 2020-12-11 ADD: Support for private holidays. 
- 2021-01-07 CHG: Emojis are changed to icons from https://www.streamlineicons.com (great collection of thousands of icons)
- 2021-01-08 FIX: last day of holiday was handled incorrect
- 2021-01-08 CHG: Emojis and Icons are supported in parallel. (You can set showHolidayIcons or showHolidayEmojis to true in code. Default is Emoji-style)
- 2021-01-08 CHG: Emojis/Icons are only shown within month to display. If first or last row contains days for previous or next month, only numbers are shown.
- 2021-01-08 ADD: Emoji/Icon support for Fronleichnam / Corpus Christi
- 2021-01-11 FIX: Bigfix in emoji/icon handling
- 2021-01-12 FIX: problem with us style calender
