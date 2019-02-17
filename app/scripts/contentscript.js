'use strict'

let DEBUG=true; // Enable logging

let log = function(){
    if(DEBUG){
        console.log.apply(console, arguments);
    }
}

// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

let WFshortcuts = {};

WFshortcuts.activateKey = (shortcut) => {
    log("WF-Shortcuts: Binding " + shortcut.key + " to action: " + shortcut.action)
    let action = function() {
        log("WF-Shortcuts: Caught shortcut! Sending to background script.")
        chrome.runtime.sendMessage(shortcut);
        return false;
    }
    Mousetrap.bind(shortcut.key, action)
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
log("WF-Shortcuts: Requesting shortcuts for binding.")
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
