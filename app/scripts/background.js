// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

/*
All the shortcut command calls.
*/
//TODO: make options page to change shortcuts.
//TODO: Check for deleting content (also from manifest).

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

let useSavedID = (id) => {
  if (id === "ID missing" && savedId !== null) {
      chrome.notifications.clear("id_missing");
      chrome.notifications.create("id_missing", {
          type: "basic",
          iconUrl: "images/extension_icon.png",
          title: "Benjamin's WISEflow shortcuts",
          message: "No flow ID found, using saved ID"
      }, function (notificationId) {
      });
      return true;
  }
  return false;
}

let checkMissingID = (id) => {

  if (id === "ID missing") {

      chrome.notifications.clear("id_missing");
      chrome.notifications.create("id_missing", {
          type: "basic",
          iconUrl: "images/extension_icon.png",
          title: "Benjamin's WISEflow shortcuts",
          message: "No flow ID found."
      }, function (notificationId) {
      });

      return true;

  }

  return false;
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
            chrome.notifications.clear("not_wiseflow");
            chrome.notifications.create("not_wiseflow", {
                type: "basic",
                iconUrl: "images/extension_icon.png",
                title: "Benjamin's WISEflow shortcuts",
                message: "Not WISEflow site."
            }, function (notificationId) {
            });
            return;
        }
  
        let flowId = getFlowID(url);
        if (useSavedID(flowId)) {
            flowId = savedId;
        }
        let branch = findBranchURL(url);

    commandHandler(command, url, id, flowId, branch);
    });
}



let commandHandler = (command, url, id, flowId, branch) => {

    switch(command) {

        case "to-manager-page-original":
            if (checkMissingID(flowId)) {
                return;
            } else {
                if (!isSamePage(url, "manager")) {
                    resetUserGoTo(id, flowId, "manager", branch)
                }
            }
            break;
        
        case "to-assessor-page-original":
            if (checkMissingID(flowId)) {
                return;
            } else {
                if (!isSamePage(url, "assessor")) {
                    resetUserGoTo(id, flowId, "assessor", branch)
                }
            }
            break;

        case "to-participant-page-original":
            if (checkMissingID(flowId)) {
                return;
            } else {
                if (!isSamePage(url, "participant")) {
                    resetUserGoTo(id, flowId, "participant", branch)
                }
            }
            break;
        
        case "to-super-page-original":
            if (checkMissingID(flowId)) {
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/admin/super"}
                )
                return;
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

    }
};

console.log("Background script initiated");

let savedId = null;

// Setup local storage:

// Current editable shortcut names:
var currentShortcuts = [];
currentShortcuts.push("switch-to-own-user");
currentShortcuts.push("to-super-page-original");
currentShortcuts.push("to-manager-page-original");
currentShortcuts.push("to-assessor-page-original");
currentShortcuts.push("to-participant-page-original");

var currentInStore = JSON.parse(localStorage.shortcuts);
if (currentInStore === null || Object.keys(currentInStore) != 5) {
    let shortcuts = {
        "switch-to-own-user": "",
        "to-super-page-original": "",
        "to-manager-page-original": "",
        "to-assessor-page-original": "",
        "to-participant-page-original": ""
    };
    localStorage.shortcuts = JSON.stringify(shortcuts);
} else {

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
})


