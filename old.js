// Get canvas object, set context and game.
var canvas, canvas_context, canvas_context_tmp, canvas_image_data, canvas_tmp;
var crt_filter		= false;
var height			= 224;
var height_scaled	= 448;
var game			= new Game();
var width			= 256;
var width_scaled	= 512;

// Start the game.
game.initialize();

/**
 * When you get image data from a canvas element's 2D context you're left with
 * a one-dimensional array contanining four items for every pixel in the image
 * (opacity, and red, green, and blue values). This means it's very fast to
 * access the data but that your head will hurt when trying to work out what
 * pixel is where.
 *
 * CanvasImageData makes it much easier for you to work with image data. It
 * provides methods to get and set individual pixel data, and to convert x and
 * y coordinates to the correct index.
 *
 * @constructor
 * @param imageData The base image data.
 */
var CanvasImageData = function (imageData) {
	this.width = imageData.width;
	this.height = imageData.height;
	this.data = imageData.data;
	this.imageData = imageData;
};
CanvasImageData.prototype = {
	/**
	 * Convert a pair of x and y coordinates to the index of the first of the
	 * four elements for that particular pixel in the image data. For example,
	 * if you have a 100x100 image and you pass in x=34, y=56, the function
	 * will return 22536, the position of the opacity value for the pixel at
	 * position (34, 56).  The red, green, and blue values will be the
	 * following three elements in the array.
	 *
	 * @param {int} x The horizontal position of the pixel.
	 * @param {int} y The vertical position of the pixel.
	 * @throws CoordinateError The x or y coordinate is out of range.
	 * @return Index of the pixel's first element within the image data array.
	 * @type int
	 */
	convertCoordsToIndex: function (x, y) {
		if (x < 0 || x > this.width || y < 0 || y > this.height) {
			throw CoordinateError;
		}
		return (y * this.width * 4) + (x * 4);
	},

	/**
	 * Returns a four-element array containing the opacity, red, green, and
	 * blue values for the pixel at the given x, y position.
	 *
	 * @param {int} x The horizontal position of the pixel.
	 * @param {int} y The vertical position of the pixel.
	 * @return Array of opacity, red, green, and blue values for the pixel.
	 * @type Array
	 */
	getPixel: function (x, y) {
		var pos;
		try {
			pos = this.convertCoordsToIndex(x, y);
			return [
				this.imageData.data[pos],
				this.imageData.data[pos + 1],
				this.imageData.data[pos + 2],
				this.imageData.data[pos + 3]
			];
		}
		catch (e) {
			return false;
		}
	},

	/**
	 * Sets the opacity, red, green, and blue values for the pixel at the given
	 * x, y position.
	 *
	 * @param {int} x The horizontal position of the pixel.
	 * @param {int} y The vertical position of the pixel.
	 * @param {Array} pixelValues Opacity, red, green, and blue values.
	 */
	setPixel: function (x, y, pixelValues) {
		var pos;
		try {
			pos = this.convertCoordsToIndex(x, y);
		}
		catch (e) {
			return false;
		}
		this.imageData.data[pos] = pixelValues[0];
		this.imageData.data[pos + 1] = pixelValues[1];
		this.imageData.data[pos + 2] = pixelValues[2];
		this.imageData.data[pos + 3] = pixelValues[3];
	}
};

// CRT class.
function Crt () {
	var phosphor_bleed;
	var phosphor_bloom;
	var phosphor_bloom_linspace;
	var scale_add;
	var scale_times;
	var scan_lower_limit;
	var scan_range;
	var scan_upper_limit;
	// Initialize the attributes.
	this.initialize = function () {
		phosphor_bleed			= 0.78;
		phosphor_bloom			= [];
		phosphor_bloom_linspace	= [];
		scale_add				= 1;
		scale_times				= 0.8;
		scan_lower_limit		= 0.6;
		scan_range				= [];
		scan_upper_limit		= 0.65;
		var i					= 0;
		for (i = 0; i < 256; i++) {
			phosphor_bloom_linspace[i] = i / (255);
		}
		for (i = 0; i < 256; i++) {
			phosphor_bloom[i] = (scale_times * phosphor_bloom_linspace[i] ^ (1 / 2.2)) + scale_add;
		}
		var current	= scan_lower_limit;
		var step	= (scan_upper_limit - scan_lower_limit) / 256;
		for (i = 0; i < 256; i++) {
			current += step;
			scan_range[i] = current;
		}
	}
	this.filter = function () {
		var current_pixel_data, x, y;
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				current_pixel_data = canvas_image_data.getPixel(x, y);
				// Every other line is a scan line.
				if (y % 2 == 0) {
					// Normal line. Handle red data.
					var red = current_pixel_data[1];
					if (x % 2 == 1) {
						var previous_pixel_data = canvas_image_data.getPixel(x - 1, y);
						if (previous_pixel_data[1] > 0) {
							red = previous_pixel_data[1] * phosphor_bleed * phosphor_bloom[previous_pixel_data[1]];
						}
					}
					// Handle green data.
					var green = current_pixel_data[2];
					if (current_pixel_data[2] > 0) {
						green = (current_pixel_data[2] / 2) + ((current_pixel_data[2] / 2) * phosphor_bleed * phosphor_bloom[current_pixel_data[2]]);
					}
					// Handle blue data.
					var blue = current_pixel_data[3];
					if (x % 2 == 1) {
						blue = current_pixel_data[3] * phosphor_bleed * phosphor_bloom[previous_pixel_data[3]];
					}
					canvas_image_data.setPixel(x, y, [current_pixel_data[0], red, green, blue]);
				} else {
					// Scan line. Get the previous line's information.
					var previous_pixel_data	= canvas_image_data.getPixel(x, y - 1);
					var red					= scan_range[previous_pixel_data[1]] * previous_pixel_data[1];
					var green				= scan_range[previous_pixel_data[2]] * previous_pixel_data[2];
					var blue				= scan_range[previous_pixel_data[3]] * previous_pixel_data[3];
					canvas_image_data.setPixel(x, y, [current_pixel_data[0], red, green, blue]);
				}
			}
		}
	}
}

// Turn on/off the CRT filter.
function crtEngage() {
	crt_filter = crt_filter ? false : true;
	if (crt_filter) {
		document.getElementById('crt_link').innerHTML = 'CRT Filter On';
	} else {
		document.getElementById('crt_link').innerHTML = 'CRT Filter Off';
	}
}

// Game class.
function Game() {
	// Game attributes.
	var background_image;
	var crt;
	var game_object;
	var player;
	var update_interval;

	// Clear the context.
	this.clear = function () {
		canvas_context_tmp.clearRect (0, 0, width , height);
	}

	// Draw a frame.
	this.draw = function () {
		// Get the player information.
		var player_dimensions	= player.getDimensions();
		var player_position		= player.getPosition();
		var player_source_point	= player.getSourcePoint();
		// Draw the background image.
		// NOTE: All drawing done on the tmp image.
		// TODO: Really should be removed, pulled into a class.
		canvas_context_tmp.drawImage(background_image, 0, 0, width, height, 0, 0, width, height);
		// Draw the player on the context. For reference:
		// drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
		canvas_context_tmp.drawImage(player.getImage(), player_source_point[0], player_source_point[1], player_dimensions[0], player_dimensions[1], player_position[0], player_position[1], player_dimensions[0], player_dimensions[1]);
		if (crt_filter) {
			// TODO: Only needed for local testing.
			// netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			canvas_image_data = new CanvasImageData(canvas_context_tmp.getImageData(0, 0, width, height));
			crt.filter();
			canvas_context_tmp.putImageData(canvas_image_data.imageData, 0, 0);
		}
		// Set the canvas from the tmp image.
		canvas_context.drawImage(canvas_tmp, 0, 0, width, height, 0, 0, width_scaled, height_scaled);
	}

	// Initialize game attributes, start the game.
	this.initialize = function () {
		canvas = document.getElementById('canvas')
		// Check whether browser supports getting canvas context.
		if (canvas && canvas.getContext) {
			// Setup the background image.
			// TODO: Really should be removed, pulled into a class.
			background_image		= new Image();
			background_image.src	= 'http://awesomeradicalgaming.com/wp-content/uploads/2011/10/back.png';
			// Set the context as 2D.
			canvas_context			= canvas.getContext('2d');
			// Create a off-screen canvas to draw on.
			canvas_tmp				= document.createElement('canvas');
			canvas_tmp.width		= width;
			canvas_tmp.height		= height;
			canvas_context_tmp		= canvas_tmp.getContext('2d');
			// Initialize the CRT filter.
			crt						= new Crt();
			crt.initialize();
			// This is a game object.
			game_object				= this;
			// Initialize the player.
			player					= new Player();
			player.initialize();
			// Set the update interval and begin the game loop.
			update_interval			= 100;
			this.game_loop			= setInterval(this.runGameLoop, update_interval);
		}
	}

	// Update between frames.
	this.update = function () {
		// Update the player frame, position.
		player.updateFrameCurrent();
		player.updatePosition([width, height]);
	}

	// The game loop, update then draw.
	this.runGameLoop = function (game) {
		game_object.update();
		game_object.clear();
		game_object.draw();
	}
}