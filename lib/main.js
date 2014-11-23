var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var pageworkers = require("sdk/page-worker");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var data = require('sdk/self').data;
var fileObj = data.url('hook.js');
var scripthook = data.load(fileObj);

background = pageworkers.Page({
	contentScriptFile: [data.url("libs/underscore.js"), data.url("libs/Immutable.js"), data.url("tools.js"), data.url("background.js")],
	contentURL: data.url("index.html")
});

var icons = {
    "16": "./icon16.png",
    "32": "./icon32.png",
    "64": "./icon64.png"};
    
var icons_unread = {
    "16": "./icon16s.png",
    "32": "./icon32s.png",
    "64": "./icon64s.png"};
    
var icon0 = {
    "16": "./icon16/0.png",
    "32": "./icon32/0.png",
    "64": "./icon64/0.png"};
    
var icon10 = {
    "16": "./icon16/10.png",
    "32": "./icon32/10.png",
    "64": "./icon64/10.png"};

var button = ToggleButton({
	id: "dvachmon-button",
	label: "dvachmon",
	icon: icons,
	onChange: handleChange,
	badge: 0,
	badgeColor: "#990010"
});

var popup = panels.Panel({
	width: 540,
	height: 180,
	contentURL: self.data.url("popup.html"),
	contentScriptFile: [data.url("libs/underscore.js"), data.url("libs/jquery-2.1.1.js"), data.url("libs/sprintf.js"), data.url("popup.js")],
	onHide: handleHide,
	onShow: handleShow
});

function handleChange(state) {
	if (state.checked) {
		popup.show({
			position: button
		});
	}
}

function handleHide() {
	button.state('window', {checked: false});
}

function handleShow() {
	button.state('window', {checked: true});
	popup.port.emit("to-popup", { type: "popup-onshow" });
}

var pageMod = require('sdk/page-mod').PageMod({
	include: ["https://2ch.hk/*", "http://2ch.hk/*", "https://2ch.pm/*", "http://2ch.pm/*"],
  	contentScriptWhen: 'ready',
 	contentScriptFile: [data.url("contentscript.js")],
  	attachTo: ["existing", "top"],
	onAttach: function(worker) {
		worker.port.emit("hookjs", scripthook);
		worker.port.on("to-background", function(data) {
			background.port.emit("to-background", data);
		});
		worker.port.on("to-popup", function(data) {
			popup.port.emit("to-popup", data);
		});
  	}
});

function url(domain, board, num) {
	return "http://" + domain + "/" + board + "/res/" + num + ".json";
}

function httpGet(data)
{
    var Request = require("sdk/request").Request;
    var result;
    Request({
        url: url(data.domain, data.board, data.thread),
        onComplete: function (response) {
        	if(response.status == 200) {
        		result = response.text;
        	} else if(response.status == 404) {
        		result = "NOT_FOUND";
        	} else {
        		result = "CONNECTION_ERROR"
        	}
        	background.port.emit("to-background", {type: "http-get-re", thread: data.thread, data: result});
        }
    }).get();
}

function GetIconSet(number) {
	if (number < 1) {
		return icon0;
	} else if (number > 9) {
		return icon10;
	} else {
		return {
	    "16": "./icon16/"+number.toString()+".png",
	    "32": "./icon32/"+number.toString()+".png",
	    "64": "./icon64/"+number.toString()+".png"};
   }
}

popup.port.on("to-background", function(data) {
	background.port.emit("to-background", data);
});

popup.port.on("to-main", function(data) {
	if (data.type == "create-tab") {
		popup.hide();
		tabs.open(data.theurl);
	}
});

background.port.on("to-popup", function(data) {
	popup.port.emit("to-popup", data);
});

background.port.on("to-main", function(data) {
	if (data.type == "http-get") {
		httpGet(data);
	}
	if (data.type == "set-badge") {
		button.icon = GetIconSet(data.unreads);
	}
});
