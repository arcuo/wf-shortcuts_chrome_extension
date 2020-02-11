/*
All the shortcut command calls.
 */
//TODO: Make work with stage and test.
//TODO: make options page to change shortcuts.
//TODO: Check for deleting content (also from manifest).


const DISPLAY_STR = "/display.php?id=";
const FLOWID_RE = "\\??(flowId|id|flow)(/|=)([0-9]+)"

let getFlowID = (url) => {
    let re = RegExp(FLOWID_RE, "g");
    let flowId = re.exec(url);
    console.log("Found ID: '" + flowId[3] + "'")
    if (flowId === null) {
        return "ID missing";
    } else {
        savedId = flowId[3]
        return flowId[3];
    }
};

let findBranchURL = (url) => {
    let re = RegExp("(https\:\/\/)?((europe|europe-stage|europe-test).wiseflow.net|localhost:8000|http://local.wiseflow.net:8000)");
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
    let re = RegExp("(wiseflow.net|localhost:8000|http://local.wiseflow.net:8000)/(.*)/")
    let re_display = RegExp("display.php")

    return re_display.test(url) && role === re.exec(url)[2];
}

let searchForGoSwitchBack = () => {
    return document.querySelector('a[href="/index.php?switchUser=true"]')
};

let superFieldFocus = () => {
    document.querySelector('input[id="flowid"]').focus().select();
};

let switchUserGoTo = (id, flowId, role, branch) => {
    // Check for switch back user element and go back if necessary
    chrome.tabs.executeScript(id, {
        code: '(' + searchForGoSwitchBack + ')();'
    }, (result) => {

        if (result[0] !== null) {

            chrome.tabs.update(
                id,
                {url: branch + "/index.php?switchUser=true"}
            )

            let listener = (tabId, info) => {
                if (info.status === 'complete' && tabId === id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.update(
                        id,
                        {url: branch + "/" + role + DISPLAY_STR + flowId}
                    )
                }
            }

            chrome.tabs.onUpdated.addListener(listener);
        } else {
            chrome.tabs.update(
                id,
                {url: branch + "/" + role + DISPLAY_STR + flowId}
            )
        }

    });
}



let commandHandler = (command, url, id, flowId, branch) => {

    if (command === "to-manager-page") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "manager")) {
                chrome.tabs.update(
                    id,
                    {url: branch + "/manager" + DISPLAY_STR + flowId}
                )
            }
        }

    } else if (command === "to-manager-page-original") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "manager")) {
                switchUserGoTo(id, flowId, "manager", branch)
            }
        }

    } else if (command === "to-assessor-page") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "assessor")) {
                chrome.tabs.update(
                    id,
                    {url: branch + "/manager" + DISPLAY_STR + flowId}
                )
            }
        }

    } else if (command === "to-assessor-page-original") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "assessor")) {
                switchUserGoTo(id, flowId, "assessor", branch)
            }
        }

    } else if (command === "to-participant-page") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "participant")) {
                chrome.tabs.update(
                    id,
                    {url: branch + "/manager" + DISPLAY_STR + flowId}
                )
            }
        }

    } else if (command === "to-participant-page-original") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "participant")) {
                switchUserGoTo(id, flowId, "participant", branch)
            }
        }

    } else if (command === "to-super-page-original") {

        if (checkMissingID(flowId)) {
            chrome.tabs.update(
                id,
                {url: branch + '/admin/super'}
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
                        {url: branch + "/index.php?switchUser=true"}
                    )

                    let listener = (tabId, info) => {
                        if (info.status === 'complete' && tabId === id) {
                            chrome.tabs.onUpdated.removeListener(listener);
                            chrome.tabs.update(
                                id,
                                {url: branch + "/admin/super/flow/index.php?id=" + flowId}
                            )

                            chrome.tabs.onUpdated.addListener(focusListener);
                        }
                    }

                    chrome.tabs.onUpdated.addListener(listener);
                } else {
                    chrome.tabs.update(
                        id,
                        {url: branch + "/admin/super/flow/index.php?id=" + flowId}
                    )
                    chrome.tabs.onUpdated.addListener(focusListener);
                }

            });

        }

    }

};

console.log("initiate");

let savedId = null;

chrome.commands.onCommand.addListener(function (command) {

    console.log("command: " + command);

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {

        let tab = tabs[0];
        let url = tab.url;
        let id = tab.id;

        if (url.search("(wiseflow.net|localhost:8000|http://local.wiseflow.net:8000)") === -1) {
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
            console.log(savedId)
            console.log(flowId)
        }
        let branch = findBranchURL(url);

        commandHandler(command, url, id, flowId, branch)

    });


});


