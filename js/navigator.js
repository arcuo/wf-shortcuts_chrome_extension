/*
Helper functions for commands.
 */

 function getFlowId() {
     var url = window.location.href;
     var re = RegExp("\?id=(\d*)", "g");
     return re.exec(url)[1];
 }

