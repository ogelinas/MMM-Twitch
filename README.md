# MMM-Twitch
Twitch MagicMirror module

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/ogelinas/MMM-Twitch`.  A new folder `MMM-Twitch` will appear, navigate into it.
2. Execute `npm install` to install the node dependencies.

```
cd ~/MagicMirror/modules 
git clone https://github.com/ogelinas/MMM-Twitch
```

## Configuration
Go to the MagicMirror/config directory and edit the config.js file.
Add the module to your modules array in your config.js.

Here is an example of an entry in `config.js`
```
{
    module:		'MMM-Twitch',
    position:	'top_left',
    header:		'Twitch',
    config: {
	    client_id:				"<YOUR_KEY>",
		channels: [
		    {
		        display_name:	"<DISPLAY_NAME>",
		        channel_id:		<CHANNEL_ID>
		    }
		]
	},
},
```

## Module configuration
Here is the documentation of options for the modules configuration:

| Option               | Description
|--------------------- |-----------
| `client_id`          | *Required* Twitch Authentication api key.<br><br>**Type:** `string`
| `updateInterval`     | Optional set to desired update interval (in ms), default is 900000 (15 minutes).<br><br>**Type:**  `int` <br> **Default value:** 900000
| `channels`           | *Required* List of Twitch channel. The object is formatted as follows: ```{display_name:	"<DISPLAY_NAME>", channel_id:<CHANNEL_ID>}``` where DISPLAY_NAME is a string wich represent the name of the channel and CHANNEL_ID is an integer wich is the id of the channel.<br><br>**Type:**  `array` <br> **Default value:** `[]`


## Special thanks
- [Michael Teeuw](https://github.com/MichMich) for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) framework that made this module possible.

## License
### The MIT License (MIT)

Copyright © 2019 Harm Tilburgs

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.