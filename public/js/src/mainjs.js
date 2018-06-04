$(function() {

	// define property for all video/audio elements to check if video is currently playing
	Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
		get: function(){
			return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
		}
	});

	// TEST (for each section bg): generate random colours
	function randomColour() {
		var arr = [];

		for (var i = 0; i < 3; i++) {
			arr.push(Math.floor(Math.random() * 255));
		}

		arr = "rgb(" + arr.join(",") + ")";
		return arr;
	}

	// change div.textbox inner text whenever carousel caption changes
	function changeText(){
		var match_music = $(".music .item.active .carousel-caption-title").text(),
			match_video = $(".videos .item.active .carousel-caption-title").text();

		var change = setInterval(function() {

			if ( match_music !== $(".music .item.active .carousel-caption-title").text() ) {
				$(".musicTitle").text( $(".music .item.active .carousel-caption-title").text() );
				$(".musicArtist").text( $(".music .item.active .carousel-caption-artist").text() );
				clearInterval(change);
			}
			else if ( match_video !== $(".videos .item.active .carousel-caption-title").text() ) {
				$(".videoTitle").text( $(".videos .item.active .carousel-caption-title").text() );
				$(".videoArtist").text( $(".videos .item.active .carousel-caption-artist").text() );
				$(".videoInfo").text( $(".videos .item.active .carousel-caption-info").text() );

				// play video element in active slide (item)
				if ( $(".videos").find(".item.active video").length ) {
					$(".videos .item.active video").get(0).play();
				}

				clearInterval(change);
			}

		});
	}

	// hide/show contents when scrolling up/down the page
	function toggleOnScroll(){

		// toggle toTop button display
		if ( window.pageYOffset > 40) {
			$("#toTop").css({transform: "translateX(-100%)"});
		} else {
			$("#toTop").css({transform: ""});
		}

		try {
			// fix header position to viewport when scrolling past second section
			if ( window.pageYOffset > $("section").eq(1).offset().top - 100) {
				if ( !$(".inner-header").hasClass("fixed") ) {
					$(".inner-header").addClass("fixed");
				}
			} else {
				$(".inner-header").removeClass("fixed");
			}
		} catch(err) {
			console.log(err)
		}

	}


	// emphasize nav link text when scrolling to / past section with which it is associated (desktop view only)
	function markLink() {
		$("nav .link").css({
			borderBottom: ""
		});

		if (window.innerWidth > 768) {
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


	toggleOnScroll();
	markLink();


	// display text from carousel captions into .textbox element
	$(".musicTitle").text( $(".music .item.active .carousel-caption-title").text() );
	$(".musicArtist").text( $(".music .item.active .carousel-caption-artist").text() );
	$(".videoTitle").text( $(".videos .item.active .carousel-caption-title").text() );
	$(".videoArtist").text( $(".videos .item.active .carousel-caption-artist").text() );
	$(".videoInfo").text( $(".videos .item.active .carousel-caption-info").text() );


	// overriding default method actions when displaying a bootstrap modal
	$(".modal").on('shown.bs.modal', function() {
		$("body, .modal").css({
			paddingRight: ""
		});
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

	// Mobile view: show menu options on click.
	// Increments delay time through each menu link before fading in, using function variable 'i'
	$("#menu").click(function() {
		$(".link-group").fadeToggle(function(){
			if ($(this).css("display") == "none") {
				$(this).css("display", "");
			}
		});

		if ($(".link").css("display") == "none") {
			$(".inner-header").css("box-shadow", "none");

			// fade in each link (almost) sequentially
			$(".link").each(function(i) {
				$(this).delay(i * 200).fadeIn();
			})
		} else {
			$(".inner-header").css("box-shadow", "");

			// fade out the links + set prop to default value
			$(".link").fadeOut(function(){
				$(this).css("display","")
			})
		}
	});

	// scroll to section corresponding to chosen nav link
	$(".link").click(function() {
		if (window.innerWidth <= 768) {
			$("#menu").click()
		}

		try {
			var page = $(this).attr("id");
			$("html, body").stop().animate({
				scrollTop: $("section." + page).offset().top
			}, 700)
		} catch(err) {
			console.log("Section doesn't exist OR registration modal is now open")
		}
	});
	
	$("#toTop, #header-logo").click(function() {
		if (this.id === 'header-logo' && !( $('.home, .index').length )) {
			location.pathname = '/'
		} else {
			$("html, body").stop().animate({
				scrollTop: 0
			}, 700);
			$(".inner-header").css("box-shadow", ""); // for if link-group is visible
			if (window.innerWidth <= 768) {
				$(".link-group, .link").fadeOut(function(){
					$(this).css("display", "");
				});
			}
		}
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
		changeText();
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
		if ( window.pageYOffset > $("section.videos").offset().top - $("section.videos").height()/4 &&
			 window.pageYOffset <= $("section.videos").offset().top + $("section.videos").height()/2 &&
			 !$(".videos .item.active video").get(0).playing ) {

			$(".videos .item.active video").get(0).play() // play current video if conditions are met
		}
	} catch(err) {
		console.log(err)
	}

	$("#signup_body .submit").click(function(e) {
		e.preventDefault();

		var $details = $("#signup_body .details");
		var data = {};

		$details.each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.ajax({
			type: 'post',
			url: '/users/register', 
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(result, status) {
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
			},
			error: function(jqHXR, status, err) {
				console.log("ERROR: " + err);
				console.log("jqHXR: " + jqHXR);
				console.log("status: " + status);
			}
		});
	});

	$("#update-form .submit").click(function(e) {
		e.preventDefault();

		var $details = $("#update-form .details");
		var data = {};

		$details.each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.ajax({
			type: 'post',
			url: '/users/update', 
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(result, status) {
				$(".result").empty();
				if (/Incorrect|Please fill/.test(result)) {
					result = "<p>" + result + "</p>";
					$("#update-form .result").append(result);
					$("#update-form input[name='old_password']").val("");
					$("#update-form input[name='new_password']").val("");
				} else {
					var info = '<li>Name: ' + result.name + '</li>' +
					'<li>Email: ' + result.email + '</li>' +
					'<li>Date of birth: ' + result.DOB + '</li>' +
					'<li>Nationality: ' + result.nationality + '</li><br>';

					$(".profile-info span").html(info);
					$("#update-form .close").click();
					$details.val("");
				}
			},
			error: function(jqHXR, status, err) {
				console.log("ERROR: " + err);
				console.log("jqHXR: " + jqHXR);
				console.log("status: " + status);
			}
		});
	});

	$("#forgot_body .submit").click(function(e) {
		e.preventDefault();

		var $details = $("#forgot_body .details");
		var data = {};

		$details.each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.ajax({
			type: 'post',
			url: '/account/forgot',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(msg, status) {
				$(".result").empty();
				if (msg.error) {
					console.log(msg.error);
					$(".result").html("<p>"+msg.error+"</p>")
				}
				else if (msg.success) {
					$(".result").html("<p>"+msg.success+"</p>")
				}
				// $(".result p").delay(3000).fadeOut(function(){
				// 	$(this).remove("p")
				// });
			},
			error: function(jqHXR, status, err) {
				console.log("ERROR: " + err);
				console.log("jqHXR: " + jqHXR);
				console.log("status: " + status);
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


	$(window).scroll(function() {

		toggleOnScroll();
		markLink();

		// stop video once scrolled outside the region of videos section
		// else, play video
		if ( window.pageYOffset < $("section.videos").offset().top - $("section.videos").height()/4 ||
			 window.pageYOffset >= $("section.videos").offset().top + $("section.videos").height()/2 ) {
			
			if ( $(".videos .item.active video").get(0).playing ) {
				$(".videos .item.active video").get(0).pause();
				$(".videos .item.active video").get(0).currentTime = 0;
			}

		} else {
			$(".videos .item.active video").get(0).play();
		}

	});

});