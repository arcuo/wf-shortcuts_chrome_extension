/*
All the shortcut command calls.
 */
//TODO: make options page to change shortcuts.

const DISPLAY_STR = "/display.php?id=";
const FLOWID_RE = "\\??(flowId|id|flow|scoreboard|assessment|reassess)(/|=)([0-9]+)";
const localhost_urls = "localhost:[0-9]+|http://local.wiseflow.net:[0-9]+";
const europe_urls = "europe|europe-stage|europe-test";

const test = "test2"

if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

let getFlowID = (url) => {
  let re = RegExp(FLOWID_RE, "g");
  let flowId = re.exec(url);
  if (flowId === null) {
    return "ID missing";
  } else {
    console.log("Found ID: '" + flowId[3] + "'");
    savedId = flowId[3];
    return flowId[3];
  }
};

let findBranchURL = (url) => {
  let re = RegExp(
    `(https\:\/\/)?((${europe_urls}).wiseflow.net|${localhost_urls})`
  );
  let branch = re.exec(url);
  if (branch !== null) {
    return branch[0];
  }
};

let useSavedID = (id) => {
  if (id === "ID missing" && savedId !== null) {
    chrome.notifications.clear("id_missing");
    chrome.notifications.create(
      "id_missing",
      {
        type: "basic",
        iconUrl: "images/extension_icon.png",
        title: "Benjamin's WISEflow shortcuts",
        message: "No flow ID found, using saved ID",
      },
      function (notificationId) {}
    );
    return true;
  }
  return false;
};

let checkMissingID = (id) => {
  if (id === "ID missing") {
    chrome.notifications.clear("id_missing");
    chrome.notifications.create(
      "id_missing",
      {
        type: "basic",
        iconUrl: "images/extension_icon.png",
        title: "Benjamin's WISEflow shortcuts",
        message: "No flow ID found.",
      },
      function (notificationId) {}
    );

    return true;
  }

  return false;
};

let isSamePage = (url, role) => {
  let re = RegExp(`(wiseflow.net|${localhost_urls})/(.*)/`);
  let re_display = RegExp("display.php");

  return re_display.test(url) && role === re.exec(url)[2];
};

let isOnSuperFlowPage = (url) => {
  return /admin\/super\/flow/.test(url);
};

const switchUserString = "/login.php?switchUser=true";

let searchForGoSwitchBack = () => {
  let foundSwitchBack = document.querySelector(
    `a[href$="/login.php?switchUser=true"]`
  )
    ? true
    : false;
  console.log(
    `WF shortcuts: ${
      foundSwitchBack ? "found switchback" : "found no switchback"
    }`
  );
  return foundSwitchBack;
};

let superFieldFocus = () => {
  console.log(document.querySelector('input[id="flowid"]'));
  document.querySelector('input[id="flowid"]').select();
};

findHostName = () => {
  return window.location.hostname;
};

let switchUserGoTo = (id, flowId, role, branch, url) => {
  chrome.tabs.executeScript(id, { code: `(${findHostName})()` }, (r) => {
    let domain = r[0];
    // Check for switch back user element and go back if necessary
    chrome.cookies.getAll(
      { name: "wf-admin-login", domain: domain },
      function (cookies) {
        if (cookies.length) {
          console.log("Admin login found", cookies);
          chrome.tabs.update(id, {
            url: `${branch}/controller/admin/${switchUserString}`,
          });

          let listener = (tabId, info) => {
            if (info.status === "complete" && tabId === id) {
              chrome.tabs.onUpdated.removeListener(listener);
              chrome.tabs.update(id, {
                url: `${branch}/${url ? url : role + DISPLAY_STR + flowId}`,
              });
            }
          };

          chrome.tabs.onUpdated.addListener(listener);
        } else {
          console.log("No admin login found");
          chrome.tabs.update(id, {
            url: `${branch}/${url ? url : role + DISPLAY_STR + flowId}`,
          });
        }
      }
    );
  });
};

let commandHandler = (command, url, id, flowId, branch) => {
  if (command === "to-manager-page") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "manager")) {
        chrome.tabs.update(id, {
          url: branch + "/manager" + DISPLAY_STR + flowId,
        });
      }
    }
  } else if (command === "to-manager-page-original") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "manager")) {
        switchUserGoTo(id, flowId, "manager", branch);
      }
    }
  } else if (command === "to-assessor-page") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "assessor")) {
        chrome.tabs.update(id, {
          url: branch + "/manager" + DISPLAY_STR + flowId,
        });
      }
    }
  } else if (command === "to-assessor-page-original") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "assessor")) {
        switchUserGoTo(id, flowId, "assessor", branch);
      }
    }
  } else if (command === "to-participant-page") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "participant")) {
        chrome.tabs.update(id, {
          url: branch + "/manager" + DISPLAY_STR + flowId,
        });
      }
    }
  } else if (command === "to-participant-page-original") {
    if (checkMissingID(flowId)) {
      return;
    } else {
      if (!isSamePage(url, "participant")) {
        switchUserGoTo(id, flowId, "participant", branch);
      }
    }
  } else if (command === "to-super-page-original") {
    if (checkMissingID(flowId) || isOnSuperFlowPage(url)) {
      switchUserGoTo(id, flowId, "", branch, "admin/super/");
      return;
    } else {
      // Check for switch back user element and go back if necessary

      let focusListener = (tabId, info) => {
        if (info.status === "complete" && tabId === id) {
          chrome.tabs.onUpdated.removeListener(focusListener);
          chrome.tabs.executeScript(id, {
            code: "(" + superFieldFocus + ")();",
          });
        }
      };
      switchUserGoTo(
        id,
        flowId,
        "",
        branch,
        `admin/super/flow/index.php?id=${flowId}`
      );
      chrome.tabs.onUpdated.addListener(focusListener);
    }
  }
};

console.log("initiate");

let savedId = null;

chrome.commands.onCommand.addListener(function (command) {
  console.log("command: " + command);

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      let tab = tabs[0];
      let url = tab.url;
      let id = tab.id;

      if (url.search(`(wiseflow.net|${localhost_urls})`) === -1) {
        chrome.notifications.clear("not_wiseflow");
        chrome.notifications.create(
          "not_wiseflow",
          {
            type: "basic",
            iconUrl: "images/extension_icon.png",
            title: "Benjamin's WISEflow shortcuts",
            message: "Not WISEflow site.",
          },
          function (notificationId) {}
        );

        return;
      }

      let flowId = getFlowID(url);
      if (useSavedID(flowId)) {
        flowId = savedId;
        console.log(savedId);
        console.log(flowId);
      }
      let branch = findBranchURL(url);

      commandHandler(command, url, id, flowId, branch);
    }
  );
});
