'use strict'

// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

let WFshortcuts = {};

WFshortcuts.activateKey = (shortcut) => {
    console.log("WF-Shortcuts: Binding " + shortcut.key + " to action: " + shortcut.action);
    Mousetrap.bind(shortcut.key, function () {
        chrome.runtime.sendMessage(shortcut.action);
    })
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // If the received message has the expected format...
    if (request.text === 'check-real-user') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.body);
    }
});

// Request shortcuts and bind with Mousetrap.
console.log("WF-Shortcuts: Requesting shortcuts for binding.")
chrome.runtime.sendMessage({action: 'getShortcuts'}, function (response) {
    if (response) {
        let shortcuts = response;
        if (shortcuts.length > 0) {
            shortcuts.forEach(shortcut => {
                WFshortcuts.activateKey(shortcut)
            });
        }
    }
})
