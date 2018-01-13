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
		browserDetect.showInfo(
				'Your browser is ' + b.browser.name /*+ '</br>' +
				'Your device type is ' + b.device.type + '</br>' +
				'Your operating system is ' + b.os.name + '</br>'*/
		);
	},
	// Update message area with the string argument
	showInfo: function (m) {
		console.log(typeof m);
		console.log( $(".DOB-group").length );
		console.log(m);

		if ( m.indexOf('Mobile') > -1 || m.indexOf('Tablet') > -1 || !(m.indexOf('Chrome') > -1) ) {
			$("video").attr("controls", "true");
			$(".DOB-group").html('<label class="sr-only">Date of Birth</label> <input class="form-control details" type="text" id="DOB" name="DOB" placeholder="Date of birth" onfocus="(this.type="date")" onblur="(this.type="text")" style>');
		} else {
			$(".DOB-group").html('<label>Date of Birth</label> <input class="form-control details" type="number" id="day" name="day" placeholder="Day" min="01" max="31"> <input class="form-control details" type="number" id="month" name="month" placeholder="Month" min="01" max="12"> <input class="form-control details" type="number" id="year" name="year" placeholder="Year" value="2017" min="1930" max="2017">');
		}

		// return m;
	}
}
// Call browserDetect object when DOM is ready 
jQuery(document).ready(browserDetect.init);
