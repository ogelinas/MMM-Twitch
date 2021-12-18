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
		channels: 		[]
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */

	getChannelsId: function() {
		var channels_id = [];
		this.config.channels.forEach(channel => {
			channels_id.push(channel["channel_id"]);
		})
		return channels_id;
	},

	getData: function() {
		var self = this;

		var channels_id = this.getChannelsId();

		console.log("channels_id.join()");
		console.log(channels_id.join());

		var urlApi = "https://api.twitch.tv/kraken/streams/?stream_type=all&channel=" + channels_id.join();
		var retry = true;

		console.log("urlApi");
		console.log(urlApi);

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);

		dataRequest.setRequestHeader("client-Id", this.config.client_id);
		dataRequest.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");

		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
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
		var status = false
		if (streams["streams"].length > 0) {
			streams["streams"].forEach(stream => {
				if (channel["channel_id"] == stream["channel"]["_id"]) {
					status = true;
				}
			});
		}
		return status;
	},

	getDom: function() {
		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		if (this.config.client_id == null) {
			var message = document.createElement("div");
			message.classList.add("small", "bright");
			message.innerHTML = "client_id must be specifiy";
			wrapper.appendChild(message);
			return wrapper;
		}

		// If this.dataRequest is not empty
		var streams = this.streams;
		if (streams) {
			var self = this;
			this.config.channels.forEach(channel => {
				var isOnline = self.isOnline(channel, streams);
				console.log(isOnline);

				var stream = document.createElement("div");
				stream.classList.add("small");

				var channel_status = document.createElement('div');
				channel_status.classList.add("small", "channel_status");

				var channel_name = document.createElement("span");
				channel_name.classList.add("small", "channel_name");
				channel_name.innerHTML = channel["display_name"];
				
				if (isOnline) {
					//channel_status.src = this.file("icons/online.png");
					channel_status.classList.add("channel_online");
					channel_name.classList.add("bright");
				} else {
					//channel_status.src = this.file("icons/offline.png");
					channel_status.classList.add("channel_offline");
					channel_name.classList.add("light", "dimmed");
				}

				stream.appendChild(channel_status);

				stream.appendChild(channel_name);

				wrapper.appendChild(stream);
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
			this.streams = payload;
			console.log("MMM-Twitch-Reciever");
			// console.log(payload);
			this.updateDom();
		}
	},
});
