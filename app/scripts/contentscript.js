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
var shortcuts = {};

WFshortcuts.activateKey = (action) => {
    log("WF-Shortcuts: Binding " + shortcuts[action] + " to action: " + action)
    let sendAction = function() {
        log("WF-Shortcuts: Caught shortcut! Sending " + action + " to background script.")
        chrome.runtime.sendMessage({message: action});
        return false;
    }
    Mousetrap.bind(shortcuts[action], sendAction)
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
chrome.runtime.sendMessage({message: 'getShortcuts'}, function (response) {
    if (response) {
        shortcuts = response;
        if (Object.keys(response).length > 0) {
            Object.keys(shortcuts).forEach(action => {
                WFshortcuts.activateKey(action)
            });
        }
    }
})
