/*
All the shortcut command calls.
 */
//TODO: Make work with stage and test.
//TODO: make options page to change shortcuts.
//TODO: make check for switch user work.
//TODO: Check for deleting content (also from manifest).

let getFlowID = (url) => {
    let re = RegExp("\\?id=(.*)", "g");
    return re.exec(url)[1];
};

let getBranchName = (url) => {
    let re = RegExp("europe?-(.*)\.wiseflow")
    return re.exec(url)[1];
};

let searchForGoSwitchBack = () => {
    return document.querySelector('a[href="/index.php?switchUser=true"]')
};

function commandHandler(command, url, id) {

    if (command == "to-manager-page") {
        chrome.tabs.update(
            id,
            {url: "https://europe.wiseflow.net/manager/display.php?id=" + getFlowID(url)}
        )
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

        chrome.tabs.executeScript(id, {
            code: '(' + searchForGoSwitchBack + ')();'
        }, (result) => {
            console.log(result)
            console.log(result.length > 0)
        })

        commandHandler(command, url, id)

    });

});


