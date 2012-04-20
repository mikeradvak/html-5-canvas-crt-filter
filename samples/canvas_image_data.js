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
