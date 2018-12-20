/*
All the shortcut command calls.
 */
//TODO: Make work with stage and test.
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
    console.log(branch)
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

let switchUserGoTo = (id, flowId, role, branch) => {
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



let commandHandler = (command, url, id, flowId, branch) => {

    if (command === "to-manager-page") {

        if (checkMissingID(flowId)) {
            return;
        } else {
            if (!isSamePage(url, "manager")) {
                chrome.tabs.update(
                    id,
                    {url: "https://" + branch + "/manager/display.php?id=" + flowId}
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
                    {url: "https://" + branch + "/manager/display.php?id=" + flowId}
                )
            }
        }

    } else if (command === "to-assessor-page-original") {

        if (checkMissingID(flowId)) {
            console.log("here1")
            return;
        } else {
            console.log("here2")
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
                    {url: "https://" + branch + "/manager/display.php?id=" + flowId}
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
                {url: "https://" + branch + "/admin/super"}
            )
            return;
        } else {

            // Check for switch back user element and go back if necessary

            chrome.tabs.executeScript(id, {
                code: '(' + searchForGoSwitchBack + ')();'
            }, (result) => {

                console.log(result);

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
                            console.log('here')

                            let focusListener = (tabId, info) => {
                                if (info.status === 'complete' && tabId === id) {
                                    chrome.tabs.onUpdated.removeListener(focusListener);
                                    chrome.tabs.executeScript(id, {
                                        code: '(' + superFieldFocus + ')();'
                                    });
                                }
                            }
                            chrome.tabs.onUpdated.addListener(focusListener);
                        }
                    }

                    chrome.tabs.onUpdated.addListener(listener);
                } else {
                    chrome.tabs.update(
                        id,
                        {url: "https://" + branch + "/admin/super/flow/index.php?id=" + flowId}
                    )
                }

            });

        }

    }

};

console.log("initiate");

let savedId = null;

chrome.commands.onCommand.addListener(function (command) {

    console.log("command");
    console.log(command);

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

        commandHandler(command, url, id, flowId, branch)

    });


});


