$(function() {

	// define property for all video/audio elements to check if video is currently playing
	try {
		if (HTMLMediaElement.prototype.playing === undefined) {
			Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
				get: function(){
					return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
				}
			});
		}
	} catch(err) {
		console.log(err)
	}

	// TEST (for each section bg): generate random colours
	function randomColour() {
		var arr = [];

		for (var i = 0; i < 3; i++) arr.push(Math.round(Math.random() * 255));

		arr = "rgb(" + arr.join(",") + ")";
		return arr;
	}

	function smoothScrollTo(offsetTop) {
		$("html, body").stop().animate({ scrollTop: offsetTop }, 700, "easeInOutExpo")
	}

	// change div.textbox inner text whenever carousel caption changes
	function changeText(className){
		var text = $("."+className+" .item.active .carousel-caption-title").text();
		var change = setInterval(function() {

			if ( text !== $("."+className+" .item.active .carousel-caption-title").text() ) {
				$("."+className+" .slide-title").text( $("."+className+" .item.active .carousel-caption-title").text() );
				$("."+className+" .slide-artist").text( $("."+className+" .item.active .carousel-caption-artist").text() );

				// play video element in active slide (item)
				if (className === "videos") {
					$(".videoInfo").text( $(".videos .item.active .carousel-caption-info").text() );
					$(".videos .item.active video").get(0).play();
				}

				clearInterval(change);
			}

		});
	}

	// change state of contents when scrolling the page
	function toggleOnScroll(){

		// toggle toTop button visibility
		if ( window.pageYOffset > 40 ) {
			$("#toTop").css({transform: "translateX(-100%)"});
			if (location.pathname === '/') $(".socials").removeClass("fixed");
		} else {
			$("#toTop").css({transform: ""});
			if (location.pathname === '/') $(".socials").addClass("fixed");
		}

		// position toTop button on top of footer if they visually overlap
		let windowOffsetBottom = window.pageYOffset + window.innerHeight;
		let footerOffsetTop = $("footer").offset().top;
		let bottom = windowOffsetBottom >= footerOffsetTop ? (window.innerHeight - ($("footer").offset().top - window.pageYOffset))+"px" : "";
		$("#toTop").css("bottom", bottom);

		try {
			// fix header position to viewport when scrolling past second section
			let top = $("section").length > 1 ? $("section").eq(1).offset().top - 100 : parseInt($("header").css("height"));
			if ( window.pageYOffset > top ) {
				$(".inner-header").addClass("fixed");
			} else {
				$(".inner-header").removeClass("fixed");
			}
		} catch(err) {
			return 0
		}

	}


	// emphasize nav link text when scrolling to / past section with which it is associated (desktop view only)
	function markLink() {
		$("nav .link").css({
			borderBottom: ""
		});

		if (window.innerWidth > 767) {
			$("section").each(function(i){
				if ( $(window).scrollTop() >= $(this).offset().top - 100 ) {

					var $lastVisitedSection = $(this);

					$("nav .link")
					.css({
						borderBottom: ""
					})
					.each(function() {
						if ( $(this).attr('id') === $lastVisitedSection.attr('class') ) {

							$(this).css({
								borderBottom: "2px solid white"
							})

						}
					})
				}
			});
		}
	}

	var togglePlayback = function() {
		try {
			var aboveSection = window.pageYOffset < $("section.videos").offset().top - $("section.videos").height()/4;
			var belowSection = window.pageYOffset >= $("section.videos").offset().top + $("section.videos").height()/2;

			if ( aboveSection || belowSection ) {
				// stop video once scrolled outside the section region
				if ( $(".videos .item.active video").get(0).playing ) {
					$(".videos .item.active video").get(0).pause();
					$(".videos .item.active video").get(0).currentTime = 0;
				}
			} else {
				// play video if within section
				$(".videos .item.active video").get(0).play();
			}
		} catch(err) {
			console.log(err)
		}
	}

	toggleOnScroll(); markLink(); togglePlayback();

	$(window).scroll(markLink);
	$(window).scroll(toggleOnScroll);
	$(window).scroll(togglePlayback);

	// display text from carousel captions into .textbox element
	$(".musicTitle").text( $(".music .item.active .carousel-caption-title").text() );
	$(".musicArtist").text( $(".music .item.active .carousel-caption-artist").text() );
	$(".videoTitle").text( $(".videos .item.active .carousel-caption-title").text() );
	$(".videoArtist").text( $(".videos .item.active .carousel-caption-artist").text() );
	$(".videoInfo").text( $(".videos .item.active .carousel-caption-info").text() );


	// overriding default method actions when displaying a bootstrap modal
	$(".modal").on('shown.bs.modal', function() {
		$("body, .modal").css("padding-right", "");
	});

	// bg auto-playing slideshow
	$("#bgreel > div:gt(0)").hide();
	setInterval(function() {
		$('#bgreel > div:first')
			.delay(1000)
			.fadeOut(2000)
			.next()
			.fadeIn(2000)
			.end()
			.appendTo('#bgreel');
	}, 4000);

	// TEST: sets random colours as background color each page
	$("section").each(function(){
		$(this).css({
			backgroundColor: randomColour()
		});
	});

	$("#menu").click(function() {
		$(this).toggleClass("is-active");
		$(".link-group").stop().slideToggle(function() {
			if ($(this).css("display") == "none") $(this).css("display", "").removeAttr("style")
		});
	});

	// scroll to section corresponding to chosen nav link
	$(".link").click(function() {
		if (window.innerWidth <= 768 && $("#menu").hasClass("is-active")) $("#menu").click();

		try {
			var page = $(this).attr("id");
			smoothScrollTo($("section." + page).offset().top);
		} catch(err) {
			console.log("Section doesn't exist OR registration modal is now open")
		}
	});
	
	$("#toTop, #header-logo").click(function() {
		(this.id === "header-logo" && location.pathname !== "/") ? location.pathname = "/" : smoothScrollTo(0);
	});

	// Activating the carousel (disabling automatic transition)
	$(".carousel").carousel({interval: false});

	// Enabling Carousel Indicators
	$(".carousel-indicators > li").click(function(){
		$(this).closest("section").find(".carousel").carousel( $(this).index() );
	});

	// Enabling Carousel Controls
	$(".left").click(function(){
		$($(this).closest("section").get(0)).find(".carousel").carousel("prev");
	});

	$(".right").click(function(){
		$($(this).closest("section").get(0)).find(".carousel").carousel("next");
	});

	$(".carousel-indicators > li, .left, .right").click(function(){
		// stop all video playback when navigating to another slide
		if ( $(this).closest(".carousel").find(".item.active video").length ) {
			for (var i = 0; i < $(this).closest(".carousel").find("video").length; i++) {
				$(this).closest(".carousel").find("video").get(i).pause();
				$(this).closest(".carousel").find("video").get(i).currentTime = 0;
			}
		}
		// play video in current carousel slide
		changeText($(this).closest("section").get(0).className);
	});

	// toggle manual playing and pausing of video

	var isPlaying = true;

	$("video")
	.attr({oncontextmenu: "return false"})
	.css({cursor: "pointer"})
	.click(function(){
		if ( isPlaying ) {
			$(this).get(0).pause()
			isPlaying = false;
		} else {
			$(this).get(0).play()
			isPlaying = true;
		}
	});


	// on page load: plays current video if section is shown within the viewport
	try {
		var boundaryBottom = window.pageYOffset <= $("section.videos").offset().top + $("section.videos").height()/2;
		var boundaryTop = window.pageYOffset > $("section.videos").offset().top - $("section.videos").height()/4;

		if ( boundaryTop && boundaryBottom && !$(".videos .item.active video").get(0).playing ) {
			$(".videos .item.active video").get(0).play() // play current video if conditions are met
		}
	} catch(err) {
		console.log(err)
	}

	$("#signup_body").submit(function(e) {
		e.preventDefault();
		var data = {};

		$(this).serializeArray().forEach(function(field) {
			var name = field.name;
			data[name] = field.value;
		});

		$.post('/users/register', data, function(result, status) {
			$(".result").empty();

			if (result.login_error) {
				$("#signup_body .result").append("<p>"+result.login_error+"</p>");
			}
			if (result.login_error_chars) {
				result.login_error_chars.forEach(function(msg) {
					$("#signup_body .result").append("<p>"+msg+"</p>");
				});
			}
			if (result.success_msg) {
				$("#signup_body .result").html("<p>"+result.success_msg+"</p>");
				$details.val("");
			}
		});
	});

	$("#update_form").submit(function(e) {
		e.preventDefault();
		var data = {};

		$(this).serializeArray().forEach(function(field) {
			var name = field.name;
			data[name] = field.value;
		});

		$.post('/users/update', data, function(result, status) {
			$(".result").empty();
			if (result.error) {
				result.error = "<p>" + result.error + "</p>";
				$("#update_form .result").append(result.error);
				$("#update_form input[name='old_password']").val("");
				$("#update_form input[name='new_password']").val("");
			}
			else if (result.changed) {
				var info = '<li>Name: ' + result.name + '</li>' +
				'<li>Email: ' + result.email + '</li>' +
				'<li>Date of birth: ' + result.DOB + '</li>' +
				'<li>Nationality: ' + result.nationality + '</li><br>';

				$(".profile-info span").fadeOut(function(){
					$(this).html(info).fadeIn();
				});
				$details.val("");
				$details.closest(".modal").modal("hide");
			}
		});
	});

	$("#forgot_body").submit(function(e) {
		e.preventDefault();
		var data = {};

		$(this).serializeArray().forEach(function(field) {
			var name = field.name;
			data[name] = field.value;
		});

		$.post('/account/forgot', data, function(msg, status) {
			$(".result").empty();
			if (msg.error) {
				console.log(msg.error);
				$(".result").html("<p>"+msg.error+"</p>")
			}
			else if (msg.success) {
				$(".result").html("<p>"+msg.success+"</p>")
			}
		});
	});

	$("#reset_password_form").submit(function(e) {
		e.preventDefault();
		var data = {};

		$(this).serializeArray().forEach(function(field) {
			var name = field.name;
			data[name] = field.value;
		});

		$.post(location.pathname, data, function(msg, status) {
			$(".result").empty();
			if (msg.invalidToken) {
				$(".result").html("<p>"+msg.invalidToken+"</p>")
			}
			else if (msg.noMatch) {
				$(".result").html("<p>"+msg.noMatch+"</p>")
			}
			else {
				$(".result").html("<p>"+msg.success+"</p>");
				$details.closest(".modal").modal("hide");
			}
		});
	});

	$(".modal-header > *").click(function(){
		$(".result").empty();
		$(".details").val("");
	});

	$("#forgot_pass_link").click(function(){
		$("#registration .tabs li:last").find("a").click();
	});

});
