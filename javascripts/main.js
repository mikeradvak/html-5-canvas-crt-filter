function Main (background_image, canvas_element, crt_filter, height, width) {
	this.background_image	= background_image;
	this.canvas_element	= canvas_element;
	this.crt_filter		= crt_filter;
	this.crt_filter_active	= false;
	this.height		= height;
	this.width		= width;
}
Main.prototype = {
	// Clear the context.
	clear: function () {
		// Check whether browser supports getting canvas context.
		if (this.canvas_element && this.canvas_element.getContext) {
			this.canvas_context_tmp.clearRect(0, 0, width , height);
		}
	},
	
	// Draw a frame.
	draw: function () {
		// Draw the background image.
		this.canvas_context_tmp.drawImage(this.background_image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
		if (this.crt_filter_active) {
			// Note: Needed for local testing.
			// netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			this.canvas_image_data = new CanvasImageData(this.canvas_context_tmp.getImageData(0, 0, this.width, this.height));
			this.crt_filter.filter(this.canvas_image_data, this.height, this.width);
			this.canvas_context_tmp.putImageData(this.canvas_image_data.imageData, 0, 0);
		}
		// Set the canvas from the tmp image.
		this.canvas_context.drawImage(this.canvas_tmp, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
	},

	// Initialize game attributes, start the game.
	initialize: function () {
		// Check whether browser supports getting canvas context.
		if (this.canvas_element && this.canvas_element.getContext) {
			// Set the main object to this.
			this.main_object	= this;
			// Set the context as 2D.
			this.canvas_context	= this.canvas_element.getContext('2d');
			// Create a off-screen canvas to draw on.
			this.canvas_tmp		= document.createElement('canvas');
			this.canvas_tmp.width	= this.width;
			this.canvas_tmp.height	= this.height;
			this.canvas_context_tmp	= this.canvas_tmp.getContext('2d');
			// Initialize the CRT filter.
			this.crt_filter.initialize();
		}
	},
	
	toggleCrtFilter: function (crt_link_element) {
		this.crt_filter_active		= this.crt_filter_active ? false : true;
		crt_link_element.innerHTML	= this.crt_filter_active ? 'Turn CRT Filter Off' : 'Turn CRT Filter On';
	},

	// Update between frames.
	update: function () {
		// Do nothing, for now.
	}
}
