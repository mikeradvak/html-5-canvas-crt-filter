function Crt () {
	this.phosphor_bleed				= 0.78;
	this.phosphor_bloom				= [];
	this.phosphor_bloom_linspace	= [];
	this.scale_add					= 1;
	this.scale_times				= 0.8;
	this.scan_lower_limit			= 0.6;
	this.scan_range					= [];
	this.scan_upper_limit			= 0;
}

Crt.prototype = {
	initialize: function () {
		var i = 0;
		for (i = 0; i < 256; i++) {
			this.phosphor_bloom_linspace[i] = i / (255);
		}
		for (i = 0; i < 256; i++) {
			this.phosphor_bloom[i] = (this.scale_times * this.phosphor_bloom_linspace[i] ^ (1 / 2.2)) + this.scale_add;
		}
		var current	= this.scan_lower_limit;
		var step	= (this.scan_upper_limit - this.scan_lower_limit) / 256;
		for (i = 0; i < 256; i++) {
			current += step;
			this.scan_range[i] = current;
		}
	},
	filter: function (canvas_image_data) {
		var current_pixel_data, previous_pixel_data, x, y;
		var red, green, blue;
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				current_pixel_data = canvas_image_data.getPixel(x, y);
				// Every other line is a scan line.
				if (y % 2 == 0) {
					// Regular line.
					// Transform the red value.
					red = current_pixel_data[1];
					if (x % 2 == 1) {
						previous_pixel_data = canvas_image_data.getPixel(x - 1, y);
						if (previous_pixel_data[1] > 0) {
							red = previous_pixel_data[1] * phosphor_bleed * phosphor_bloom[previous_pixel_data[1]];
						}
					}
					// Transform the green value.
					green = current_pixel_data[2];
					if (current_pixel_data[2] > 0) {
						green = (current_pixel_data[2] / 2) + ((current_pixel_data[2] / 2) * phosphor_bleed * phosphor_bloom[current_pixel_data[2]]);
					}
					// Transform the blue value.
					blue = current_pixel_data[3];
					if (x % 2 == 1) {
						blue = current_pixel_data[3] * phosphor_bleed * phosphor_bloom[previous_pixel_data[3]];
					}
					canvas_image_data.setPixel(x, y, [current_pixel_data[0], red, green, blue]);
				} else {
					// Scan line.
					// Get the information from the pixel above this pixel.
					previous_pixel_data	= canvas_image_data.getPixel(x, y - 1);
					red					= scan_range[previous_pixel_data[1]] * previous_pixel_data[1];
					green				= scan_range[previous_pixel_data[2]] * previous_pixel_data[2];
					blue				= scan_range[previous_pixel_data[3]] * previous_pixel_data[3];
					canvas_image_data.setPixel(x, y, [current_pixel_data[0], red, green, blue]);
				}
			}
		}
	}
};