/*
All the shortcut command calls.
 */
//TODO: Make work with stage and test.
//TODO: make options page to change shortcuts.
//TODO: Check for deleting content (also from manifest).

let getFlowID = (url) => {
    let re = RegExp("\\?id=(.*)", "g");
    let flowId = re.exec(url);
    if (flowId === null) {
        return "ID missing";
    } else {
        return flowId[1];
    }
};

let getBranchName = (url) => {
    let re = RegExp("europe?-(.*)\.wiseflow");
    return re.exec(url)[1];
};

let isSamePage = (url, role) => {
    let re = RegExp("wiseflow.net/(.*)/")
    return role == re.exec(url)[1];
}

let searchForGoSwitchBack = () => {
    return document.querySelector('a[href="/index.php?switchUser=true"]')
};

let switchUserGoTo = (id, flowId, role) => {
    // Check for switch back user element and go back if necessary
    chrome.tabs.executeScript(id, {
        code: '(' + searchForGoSwitchBack + ')();'
    }, (result) => {

        if (result[0] !== null) {

            chrome.tabs.update(
                id,
                {url: "https://europe.wiseflow.net/index.php?switchUser=true"}
            )

            let listener = (tabId, info) => {
                if (info.status === 'complete' && tabId === id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.update(
                        id,
                        {url: "https://europe.wiseflow.net/" + role + "/display.php?id=" + flowId}
                    )
                }
            }

            chrome.tabs.onUpdated.addListener(listener);
        } else {
            chrome.tabs.update(
                id,
                {url: "https://europe.wiseflow.net/" + role + "/display.php?id=" + flowId}
            )
        }

    });
}

let commandHandler = (command, url, id, flowId) => {

    if (command === "to-manager-page") {

        if (!isSamePage(url, "manager")) {
            chrome.tabs.update(
                id,
                {url: "https://europe.wiseflow.net/manager/display.php?id=" + flowId}
            )
        }

    } else if (command === "to-manager-page-original") {

        if (!isSamePage(url, "manager")) {
            switchUserGoTo(id, flowId, "manager")
        }

    } else if (command === "to-assessor-page") {

        if (!isSamePage(url, "assessor")) {
            chrome.tabs.update(
                id,
                {url: "https://europe.wiseflow.net/assessor/display.php?id=" + flowId}
            )
        }

    } else if (command === "to-assessor-page-original") {

        console.log(isSamePage(url, "assessor"));

        if (!isSamePage(url, "assessor")) {
            switchUserGoTo(id, flowId, "assessor")
        }

    } else if (command === "to-participant-page") {

        if (!isSamePage(url, "participant")) {
            chrome.tabs.update(
                id,
                {url: "https://europe.wiseflow.net/participant/display.php?id=" + flowId}
            )
        }

    } else if (command === "to-participant-page-original") {

        if (!isSamePage(url, "participant")) {
            switchUserGoTo(id, flowId, "participant")
        }

    } else if (command === "to-super-page-original") {

        // Check for switch back user element and go back if necessary
        chrome.tabs.executeScript(id, {
            code: '(' + searchForGoSwitchBack + ')();'
        }, (result) => {

            if (result[0] !== null) {

                chrome.tabs.update(
                    id,
                    {url: "https://europe.wiseflow.net/index.php?switchUser=true"}
                )

                let listener = (tabId, info) => {
                    if (info.status === 'complete' && tabId === id) {
                        chrome.tabs.onUpdated.removeListener(listener);
                        chrome.tabs.update(
                            id,
                            {url: "https://europe.wiseflow.net/admin/super/flow/index.php?id=" + flowId}
                        )
                    }
                }

                chrome.tabs.onUpdated.addListener(listener);
            } else {
                chrome.tabs.update(
                    id,
                    {url: "https://europe.wiseflow.net/admin/super/flow/index.php?id=" + flowId}
                )
            }

        });

    }

};

chrome.commands.onCommand.addListener(function (command) {

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
            }, function(notificationId) {});

            return;
        }

        let flowId = getFlowID(url);

        if (flowId === "ID missing") {
            chrome.notifications.clear("id_missing");
            chrome.notifications.create("id_missing", {
                type: "basic",
                iconUrl: "images/extension_icon.png",
                title: "Benjamin's WISEflow shortcuts",
                message: "No flow ID found."
            }, function(notificationId) {});

            return;
        }

        commandHandler(command, url, id, flowId)

    });

});


