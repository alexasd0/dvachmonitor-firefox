var background;
var connected = false;

console.log("contentscript");

self.port.on("hookjs", function(data) {	
    var libScript = document.createElement("script");
    libScript.onload = function() {
		this.parentNode.removeChild(this);
	};
    libScript.textContent = data;
    document.body.appendChild(libScript);
    
	window.addEventListener("message", function(event) {
		if (event.source != window.toString(window))
			return;
		
		if (event.data.type && (event.data.type == "thread-added")) {
			console.log("User added thread: " + event.data.data);
		}	
		
		if (event.data.type && (event.data.type == "thread-removed")) {
			console.log("User removed thread: " + event.data.data);
		}
		
		self.port.emit("to-background", event.data);
	
	}, false);
});
