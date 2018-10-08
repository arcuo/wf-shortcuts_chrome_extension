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

let searchForGoSwitchBack = () => {
    return document.querySelector('a[href="/index.php?switchUser=true"]')
};

function commandHandler(command, url, id, flowId) {

    if (flowId === "ID missing") {
        console.log(flowId);
        return;
    }

    if (command === "to-manager-page") {

        chrome.tabs.update(
            id,
            {url: "https://europe.wiseflow.net/manager/display.php?id=" + flowId}
        )

    } else if (command === "to-manager-page-original") {

        console.log("here1")

        // Check for switch back user element and go back if necessary
        chrome.tabs.executeScript(id, {
            code: '(' + searchForGoSwitchBack + ')();'
        }, (result) => {
            console.log("here2")
            console.log(result[0] !== null)
            if (result[0] !== null) {
                console.log("here3")
                chrome.tabs.update(
                    id,
                    {url: "https://europe.wiseflow.net/index.php?switchUser=true"}
                )

                let listener = function(tabId, info) {
                    if (info.status === 'complete' && tabId === id) {
                        chrome.tabs.onUpdated.removeListener(listener);
                        chrome.tabs.update(
                            id,
                            {url: "https://europe.wiseflow.net/manager/display.php?id=" + flowId}
                        )
                    }
                }

                chrome.tabs.onUpdated.addListener(listener);
            } else {
                chrome.tabs.update(
                    id,
                    {url: "https://europe.wiseflow.net/manager/display.php?id=" + flowId}
                )
            }
        });
    }
}

chrome.commands.onCommand.addListener(function (command) {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {

        let tab = tabs[0];
        let url = tab.url;
        let id = tab.id;

        if (url.search("wiseflow.net") === -1) {
            console.log("Not WISEflow site.");
            return;
        }

        let flowId = getFlowID(url);

        commandHandler(command, url, id, flowId)

    });

});


