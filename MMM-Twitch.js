/* global Module */

/* Magic Mirror
 * Module: MMM-Twitch
 *
 * By Olivier Gélinas
 * MIT Licensed.
 */

Module.register("MMM-Twitch", {
	defaults: {
		updateInterval:	15*60*1000,
		retryDelay: 	5000,
		client_id:		null,
		client_secret:	null,
		channels: 		[]
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		
		this.access_token = null;
		this.response = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	getAccessToken: function() {
		var self = this;
		var http = new XMLHttpRequest();
		var url = 'https://id.twitch.tv/oauth2/token?client_id=' + this.config.client_id + '&client_secret=' + this.config.client_secret + '&grant_type=client_credentials';
		http.open('POST', url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				var oauth2 = JSON.parse(http.responseText);
				self.access_token = oauth2.access_token;
			}
		}
		http.send();
	},

	getChannelsId: function() {
		var channels_id = [];
		this.config.channels.forEach(channel => {
			channels_id.push("user_id=" + channel["channel_id"]);
		})
		return channels_id;
	},

	getData: function() {
		var self = this;

		// Retreive an array of id of the channels
		var channels_id = this.getChannelsId();

		var urlApi = "https://api.twitch.tv/helix/streams?" + channels_id.join("&");
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);

		dataRequest.setRequestHeader("Authorization", "Bearer " + this.access_token);
		dataRequest.setRequestHeader("client-Id", this.config.client_id);

		dataRequest.onreadystatechange = function() {
			if (dataRequest.readyState === 4) {
				if (dataRequest.status === 200) {
					self.processData(JSON.parse(dataRequest.response).data);
				} else if (dataRequest.status === 401) {
					self.getAccessToken();
				} else {
					console.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	isOnline: function(channel, streams){
		var viewer_count = 0;
		if (streams.length > 0) {
			streams.forEach(stream => {
				if (channel["channel_id"] == stream.user_id) {
					viewer_count = stream.viewer_count;
				}
			});
		}
		return viewer_count;
	},

	getDom: function() {
		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		if (this.config.client_id == null) {
			var message = document.createElement("div");
			message.classList.add("small", "bright");
			message.innerHTML = "client_id and client_secret must be specifiy";
			wrapper.appendChild(message);
			return wrapper;
		}

		// If this.dataRequest is not empty
		
		if (this.response) {

			var twitch_wrapper = document.createElement("div");
			wrapper.appendChild(twitch_wrapper);

			var table = document.createElement("table");
			twitch_wrapper.appendChild(table);
			
			var self = this;
			var streams = self.response;
			this.config.channels.forEach(channel => {
				var isOnline = self.isOnline(channel, streams);

				var tr = document.createElement("tr");
				tr.classList.add("small");
				table.appendChild(tr);

				var status = document.createElement('td');
				tr.appendChild(status);
				var channel_status = document.createElement('div');
				channel_status.classList.add("small", "channel_status");
				tr.appendChild(channel_status);

				var channel_name = document.createElement("td");
				channel_name.classList.add("small", "channel_name");
				channel_name.innerHTML = channel["display_name"];
				tr.appendChild(channel_name);
				
				var viewers = document.createElement("td");
				tr.appendChild(viewers);
				if (isOnline > 0) {
					//channel_status.src = this.file("icons/online.png");
					channel_status.classList.add("channel_online");
					channel_name.classList.add("bright");
					viewers.innerHTML = isOnline;
				} else {
					//channel_status.src = this.file("icons/offline.png");
					channel_status.classList.add("channel_offline");
					channel_name.classList.add("light", "dimmed");
				}
				
			});
			
		};
		
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-Twitch.css",
		];
	},

	svgIconFactory: function(glyph) {
		var object = document.createElementNS('http://www.w3.org/2000/svg', "object");
		object.setAttributeNS(null, "data", this.file("icons/" + glyph + ".svg"));
		object.setAttributeNS(null, "type", "image/svg+xml");
		// object.setAttributeNS(null, "class", "ico-container-size");
		return(object)
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-Twitch-Sender", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Twitch-Reciever") {
			// set dataNotification
			this.dataNotification = payload;

			this.response = payload;
			this.updateDom();
		}
	},
});
