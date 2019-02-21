// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

/*
All the shortcut command calls.
*/
//TODO: Default settings
//TODO: Add descriptions to the popup (either tooltip or text)
//TODO: Add titles to popup settings
//TODO: Update style
//TODO: Better record option
//TODO: Optimise shortcut storage.
//TODO: Check for deleting content (also from manifest).

var returnFromAuthor = false;
var savedId = null;
var showNotifications = true;

let getFlowID = (url) => {
  let re = RegExp("\\?(flowId|id)=([0-9]*)", "g");
  let flowId = re.exec(url);
  if (flowId === null) {
      return "ID missing";
  } else {
      savedId = flowId[2]
      return flowId[2];
  }
};

let findBranchURL = (url) => {
  let re = RegExp("(europe|europe-stage|europe-test).wiseflow.net");
  let branch = re.exec(url);
  if (branch !== null) {
      return branch[0];
  }
}

let basicNotification = (id, message) => {
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

let useSavedID = (id) => {
    if (savedId !== null) {
        basicNotification("id_missing", "Using saved ID")
        return true;
    } else {
        basicNotification("id_missing", "No flow ID found for current page.")
        return false;
    }
}

let isSamePage = (url, role) => {
  let re = RegExp("wiseflow.net/(.*)/")
  return role == re.exec(url)[1];
}

let searchForGoSwitchBack = () => {
  return document.querySelector('a[href="/index.php?switchUser=true"]')
};

let superFieldFocus = () => {
  document.querySelector('input[id="flowid"]').focus().select();
};

let resetUser = (id, branch) => {
    // Check for switch back user element and go back if necessary
    chrome.tabs.executeScript(id, {
        code: '(' + searchForGoSwitchBack + ')();'
    }, result => {
        if (result[0] !== null) {
            chrome.tabs.update(
                id,
                {url: "https://" + branch + "/index.php?switchUser=true"}
            )
        }
    });
}

let resetUserGoTo = (id, flowId, role, branch) => {
  // Check for switch back user element and go back if necessary
  chrome.tabs.executeScript(id, {
      code: '(' + searchForGoSwitchBack + ')();'
    }, (result) => {
        
        if (result[0] !== null) {

            chrome.tabs.update(
                id,
                {url: "https://" + branch + "/index.php?switchUser=true"}
            )

            let listener = (tabId, info) => {
                if (info.status === 'complete' && tabId === id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.update(
                        id,
                        {url: "https://" + branch + "/" + role + "/display.php?id=" + flowId}
                    )
                }
            }

            chrome.tabs.onUpdated.addListener(listener);
        } else {
            chrome.tabs.update(
                id,
                {url: "https://" + branch + "/" + role + "/display.php?id=" + flowId}
            )
        }

    });
}

let handleAction = (command) => {
    
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
  
        let tab = tabs[0];
        let url = tab.url;
        let id = tab.id;
  
        if (url.search("wiseflow.net") === -1) {
            basicNotification("not_wiseflow", "Not WISEflow site.");
            return;
        }
        
        // Get flow ID and branch.
        let flowId = getFlowID(url);
        let branch = findBranchURL(url);

        // Check if ID is missing, use saved ID if possible, super and author go to the normal page.
        if (flowId === "ID missing") {
            if (useSavedID(flowId)) {
                // If saved ID available
                flowId = savedId;
                commandHandler(command, url, id, flowId, branch);
            } else if (command === "to-super-page-original") {
                // If no ID and no saved ID, but go to super page, 
                // just go to normal super.
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/admin/super"}
                )
            } else if (command === "go-to-author") {
                // If no ID and no saved ID, but go to author, 
                // just go to normal author without return ID.
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/admin/super"}
                )
            }
        } else {
            commandHandler(command, url, id, flowId, branch);
        }
    });
}



let commandHandler = (command, url, id, flowId, branch) => {

    switch(command) {

        case "to-manager-page-original":
            if (!isSamePage(url, "manager")) {
                resetUserGoTo(id, flowId, "manager", branch)
            }
            break;
        
        case "to-assessor-page-original":
            if (!isSamePage(url, "assessor")) {
                resetUserGoTo(id, flowId, "assessor", branch)
            }
            break;

        case "to-participant-page-original":
            if (!isSamePage(url, "participant")) {
                resetUserGoTo(id, flowId, "participant", branch)
            }
            break;
        
        case "to-super-page-original":
            if (!useSavedID(flowId)) {
                
            } else {
    
                // Check for switch back user element and go back if necessary
    
                chrome.tabs.executeScript(id, {
                    code: '(' + searchForGoSwitchBack + ')();'
                }, (result) => {
    
                    let focusListener = (tabId, info) => {
                        if (info.status === 'complete' && tabId === id) {
                            chrome.tabs.onUpdated.removeListener(focusListener);
                            chrome.tabs.executeScript(id, {
                                code: '(' + superFieldFocus + ')();'
                            });
                        }
                    }
    
                    if (result[0] !== null) {
    
                        chrome.tabs.update(
                            id,
                            {url: "https://" + branch + "/index.php?switchUser=true"}
                        )
    
                        let listener = (tabId, info) => {
                            if (info.status === 'complete' && tabId === id) {
                                chrome.tabs.onUpdated.removeListener(listener);
                                chrome.tabs.update(
                                    id,
                                    {url: "https://" + branch + "/admin/super/flow/index.php?id=" + flowId}
                                )
    
                                chrome.tabs.onUpdated.addListener(focusListener);
                            }
                        }
    
                        chrome.tabs.onUpdated.addListener(listener);
                    } else {
                        chrome.tabs.update(
                            id,
                            {url: "https://" + branch + "/admin/super/flow/index.php?id=" + flowId}
                        )
                        chrome.tabs.onUpdated.addListener(focusListener);
                    }
    
                });
    
            }
            break;

        case "switch-to-own-user":
            resetUser(id, branch);
            break;
        
        case "go-to-author":
            if (!returnFromAuthor) {
                returnFromAuthor = true;
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/author/"}
                )
            } else {
                returnFromAuthor = false;
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/manager/display.php?id=" + flowId}
                )
            }
            
    };
}

console.log("Background script initiated");

// Current editable shortcut names:
var currentShortcuts = [];
currentShortcuts.push("switch-to-own-user");
currentShortcuts.push("to-super-page-original");
currentShortcuts.push("to-manager-page-original");
currentShortcuts.push("to-assessor-page-original");
currentShortcuts.push("to-participant-page-original");

// Setup local storage:
var currentInStore = localStorage.shortcuts;
if (currentInStore === undefined || Object.keys(JSON.parse(currentInStore)) != 6) {
    let shortcuts = {
        "to-super-page-original": "shift+alt+1",
        "to-manager-page-original": "shift+alt+2",
        "to-assessor-page-original": "shift+alt+3",
        "to-participant-page-original": "shift+alt+4",
        "switch-to-own-user": "shift+alt+5",
        "go-to-author": "shift+alt+a"
    };
    localStorage.shortcuts = JSON.stringify(shortcuts);
}

chrome.commands.onCommand.addListener(function (command) {
    console.log("Recieved action: " + command);
    handleAction(command);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let message = request.message;
    console.log("Recieved action: " + message)
    if (message === 'getShortcuts' ) {
        console.log("Recieved request for shortcuts")
        console.log("Sending shortcuts for binding")
        let shortcuts = JSON.parse(localStorage.shortcuts);
        sendResponse(shortcuts);
    } else {
        handleAction(message)
    }
});