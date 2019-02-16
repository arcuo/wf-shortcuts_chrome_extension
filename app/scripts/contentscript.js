// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'check-real-user') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.body);
    }
});
