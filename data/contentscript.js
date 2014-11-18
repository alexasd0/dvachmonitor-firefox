var background;
var connected = false;

// TODO: add "script.js" to web_accessible_resources in manifest.json

console.log("contentscript");

self.port.on("hookjs", function(data) {	
	console.log("if (self.port.on) data: ");
    var libScript = document.createElement("script");
    libScript.onload = function() {
		this.parentNode.removeChild(this);
	};
    libScript.textContent = data;
    document.body.appendChild(libScript);
    
	window.addEventListener("message", function(event) {
	
		console.log("message CS ***** "+event.data.type+" data: "+event.data.data);
		/*console.log("event.source "+event.source);
		console.log("t "+Object.prototype.toString.call(event.source)+", "+Object.prototype.toString.call(window));
		console.log("t "+event.source.toString()+", "+window.toString(window));*/
		
		if (event.source != window.toString(window))
			return;
		
		if (event.data.type && (event.data.type == "thread-added")) {
			console.log("User added thread: " + event.data.data);
		}	
		
		if (event.data.type && (event.data.type == "thread-removed")) {
			console.log("User removed thread: " + event.data.data);
		}
		
		self.port.emit("to-background", event.data);
		
		//if(connected)
			//background.postMessage(event.data);
	
	}, false);
});



window.addEventListener("load", function(event) {
	/*opera.extension.onmessage = function(event) {
		if(event.data == "background") {
			background = event.source;
			connected = true;
			console.log("from background");
		} 
	};*/
	
	
	//console.log("window.thread.id "+window.thread.id);
	//var fileObj = opera.extension.getFile("/hook.js");
	
	/*if (fileObj) {
	    var fr = new FileReader();
	    fr.onload = function() {              
	        var libScript = document.createElement("script");
	        libScript.onload = function() {
			    this.parentNode.removeChild(this);
			};
	        libScript.textContent = fr.result;
	        document.body.appendChild(libScript);
	    };
	    fr.readAsText(fileObj);
	}*/
	
	//hookjs();
   
   /*window.addEventListener("message", function(event) {
   	
   	console.log("message "+event.data);

	if (event.source != window)
		return;
	
	if (event.data.type && (event.data.type == "thread-added")) {
		console.log("User added thread: " + event.data.data);
	}	
	
	if (event.data.type && (event.data.type == "thread-removed")) {
		console.log("User removed thread: " + event.data.data);
	}
	
	//if(connected)
		//background.postMessage(event.data);

	}, false);*/
});
