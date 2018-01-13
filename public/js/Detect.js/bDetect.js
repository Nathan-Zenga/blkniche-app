// http://sixrevisions.com/javascript/browser-detection-javascript/
var browserDetect = {
	init: function () {
		// $(".button").click(function(){
			// Feature detection: Check if navigator.userAgent exists
			if (typeof navigator.userAgent === 'undefined') {
				browserDetect.showInfo('navigator.userAgent is not available in your browser.');
			// } else if ($(this).attr('id') === 'navigator-obj') {
			//   browserDetect.navigatorObj();
			} else {
				browserDetect.detectJS();
			}
		// });
	},
	// Display navigator.userAgent string in the message area
	navigatorObj: function () {
		browserDetect.showInfo(navigator.userAgent);
	},
	detectJS: function () {
		b = detect.parse(navigator.userAgent);
		// Display the Detect.js parsed properties in the message area
		browserDetect.showInfo(b.browser.name, b.device.type, b.os.name);
	},
	// Update message area with the string argument
	showInfo: function (browser, device, os) {
		console.log(typeof device);
		console.log(device);

		if ( device == 'Mobile' || device == 'Tablet' || !(browser.indexOf('Chrome') > -1) ) {
			$("video").attr("controls", "true");
			$("#registration .DOB-group").html('<label class="group-item">Date of Birth</label> <input class="form-control details group-item" type="number" id="day" name="day" placeholder="Day" min="01" max="31"> <input class="form-control details group-item" type="number" id="month" name="month" placeholder="Month" min="01" max="12"> <input class="form-control details group-item" type="number" id="year" name="year" placeholder="Year" min="1930" max="2017">');
			$("#update-form .DOB-group").html('<label class="group-item">Date of Birth</label> <input class="form-control details group-item" type="number" id="day_update" name="day_update" placeholder="Day" min="01" max="31"> <input class="form-control details group-item" type="number" id="month_update" name="month_update" placeholder="Month" min="01" max="12"> <input class="form-control details group-item" type="number" id="year_update" name="year_update" placeholder="Year" min="1930" max="2017">');
		}

		return 0;
	}
}
// Call browserDetect object when DOM is ready 
jQuery(document).ready(browserDetect.init);
