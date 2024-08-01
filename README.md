# Canvas Quick Menu 🔍
Canvas quick menu is a userscript for Instructure Canvas that adds a menu for quick search and navigation.

## Features
- 📚 Search courses, upcoming assignments, canvas pages, announcements, and more
- ⚡ Instant search results
- ⌨ Quick access anywhere with one key
- 🔁 Sync your settings across devices with no setup
- ➕ Add your own custom shortcuts to course specific resources or anything else
- ⭐ Quick actions for new inbox messages and calendar events
- 🖼️ Replace course card images and banners with your own images (not supported by all schools)

## Usage
You can press <kbd>Esc</kbd> to toggle the menu, but you can also use <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>. If it's not opening, check to see if there are any embedded webpages on the page and make sure they don't have focus by clicking somewhere on the main page. Once the menu is open, search anything and press enter to navigate to the top result. Pressing <kbd>Ctrl</kbd> + <kbd>Enter</kbd> will open the top reuslt in a new tab. If you want to open something that's not the top result, you can just click it.

To replace a course card or banner image, right click the image and paste your new image url. If you find the image somewhere online (google images, etc) you can right click the image and select "Copy image address" and use that.

### Custom Shortcuts
Type "Custom Shortcuts" into the menu to open up the custom shortcuts menu. Add your own shortcut using the form. For icons, click the <kbd>Icon List</kbd> button at the bottom to open up a list of icons, then type the name of the icon in the box.

## Installation

1. Install the free chrome extension [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (alternatives exist for firefox and other browsers but your millage may vary)
2. Copy the userscript code from [this page](https://raw.githubusercontent.com/pikapower9080/canvas-quickmenu/main/userscript.js)
3. Activate the Tampermonkey extension and click the "Create A New Script" button
4. Delete everything in the script and paste what you copied from the page
5. Save by pressing <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>S</kbd>
6. Open up your school's canvas page and select the option to always allow cross origin requests

## Troubleshooting
**Q:** Pressing escape causes a bunch of error popups 
**A:** This is an unavoidable chrome feature, pressing escape while a page is loading does the equivalent of pressing the X icon that the reload button turns into which causes errors. Wait until the page is fully loaded before pressing escape.

**Q:** My assignments won't show up!
**A:** Canvas quick search only shows upcoming assignments and won't show assignments that are far into the future or already submitted.

**Q:** Nothing works!
**A:** If your school's canvas website doesn't end in `.instructure.com` then change the text at the top of the code where it says `@match` to show your school's canvas url like so:
```javascript
// @match        https://yourcanvasurl.com/*
```
