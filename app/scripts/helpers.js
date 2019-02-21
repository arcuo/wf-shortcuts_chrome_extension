
var showNotifications = true;

export function basicNotification (id, message) {
    if (showNotifications) {
        chrome.notifications.clear(id);
        chrome.notifications.create(id, {
            type: "basic",
            iconUrl: "images/extension_icon.png",
            title: "WF Shortcuts",
            message: message
        }, function (notificationId) {});
    }
}

