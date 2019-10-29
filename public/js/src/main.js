$(function() {
	Galleria.loadTheme("https://cdnjs.cloudflare.com/ajax/libs/galleria/1.5.7/themes/classic/galleria.classic.min.js").configure({ transition: 'fade', showInfo: false, thumbnails: false });

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
	/*function randomColour() {
		var arr = [];

		for (var i = 0; i < 3; i++) arr.push(Math.round(Math.random() * 255));

		arr = "rgb(" + arr.join(",") + ")";
		return arr;
	}*/

	function smoothScrollTo(offsetTop) {
		$("html, body").stop().animate({ scrollTop: offsetTop }, 700, "easeInOutExpo")
	}

	// change div.textbox inner text whenever carousel caption changes
	function changeText(section) {
		$(section).each(function() {
			$(this).find(".slide-title").text( $(this).find(".item.active .carousel-caption-title").text() );
			$(this).find(".slide-artist").text( $(this).find(".item.active .carousel-caption-artist").text() );
			if ($(this).find(".item.active .carousel-caption-info").length) {
				$(this).find(".slide-info").text( $(this).find(".item.active .carousel-caption-info").text() );
			}
		})
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

	function togglePlayback() {
		try {
			var aboveSection = window.pageYOffset < $("section.videos").offset().top - $("section.videos").height()/4;
			var belowSection = window.pageYOffset >= $("section.videos").offset().top + $("section.videos").height() - $("section.videos").height()/4;
			var activeVideo = $(".videos .item.active video").get(0);

			if ( aboveSection || belowSection ) {
				// stop video once scrolled outside the section region
				if ( activeVideo.playing ) {
					activeVideo.pause();
					activeVideo.currentTime = 0;
				}
			} else {
				// play video if within section
				activeVideo.play();
			}
		} catch(err) {
			console.log(err)
		}
	}

	toggleOnScroll(); markLink(); changeText( $("section") );

	$(window).scroll(markLink);
	$(window).scroll(toggleOnScroll);
	$(window).scroll(togglePlayback);

	$(document.body).click(function(e) {
		// check if menu icon not hidden and if cursor is outside menu
		if (!$("#menu").is(":hidden") && e.clientY > parseInt($("#menu.is-active").css("height"))) { // offset top not required because top position is already 0
			let headerFixed = $(".inner-header").hasClass("fixed");
			let menuOpen = $("#menu").hasClass("is-active");
			if (headerFixed && menuOpen) $("#menu").click();
		}
	})

	// overriding default method actions when displaying a bootstrap modal
	$(".modal").on('shown.bs.modal', function() {
		$("body, .modal").css("padding-right", "");
	});

	// bg auto-playing slideshow
	$("#bgreel > div:gt(0)").fadeTo(0, 0);
	setInterval(function() {
		$('#bgreel > div:first')
			.fadeTo(2000, 0)
			.dequeue()
			.next()
			.fadeTo(0, 1)
			.end()
			.appendTo('#bgreel');
	}, 5000);

	// TEST: sets random colours as background color each page
	/*$("section").each(function(){
		$(this).css({
			backgroundColor: randomColour()
		});
	});*/

	$("#menu").click(function() {
		$(this).toggleClass("is-active");
		$(".link-group").stop().slideToggle(function() {
			if ($(this).is(":hidden")) $(this).css("display", "").removeAttr("style")
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

	// Dynamically loading videos from Flickr
	var flickr = new Galleria.Flickr();
	flickr.setOptions({description: true}).set("72157710305001647", function(data) {
		data.forEach(function(video, i) {
			let description = JSON.parse(video.description.replace(/&quot;/g, '"'));

			$("section.videos")
			.find(".carousel-indicators").append(
				'<li id="cover'+ i +'" data-target="#videos-carousel" data-slide-to="'+ i +'" '+ (i < 1 ? ' class="active"' : '') +'></li>'
			)
			.end().find(".carousel-inner").append(
				'<div class="item'+ (i < 1 ? ' active' : '') +'">' +
					'<video class="img" loop controls playsinline><source src="'+ video.big.replace(/_b.jpg|_z.jpg/, "_l.jpg") +'"/></video>' +
					'<div class="carousel-caption">' +
						'<h3 class="carousel-caption-title">'+ video.title +'</h3>' +
						'<p class="carousel-caption-artist">'+ description.artist +'</p>' +
						'<p class="carousel-caption-info">'+ description.info.replace(/\n/g, "<br>") +'</p>' +
					'</div>' +
				'</div>'
			);
			// invoking functions after loading videos
			if (i === data.length-1) togglePlayback(), changeText($("section.videos"));
		})
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

	$(".carousel").on("slid.bs.carousel", function() {
		// stop all video playback when navigating to another slide
		let $carousel = $(this).closest(".carousel");
		if ( $carousel.find("video").length ) {
			$carousel.find("video").each(function(){
				let currentVideo = $(this).get(0);
				currentVideo.pause();
				currentVideo.currentTime = 0;
				if ($(currentVideo).parent(".item").hasClass("active")) currentVideo.play();
			})
		}
		// play video in current carousel slide
		changeText( $(this).closest("section") );
	});

	// toggle manual playing and pausing of video
	var isPlaying = true;
	$("video")
	.attr({oncontextmenu: "return false"})
	.css({cursor: "pointer"})
	.click(function(){
		$(this).get(0)[isPlaying ? "pause" : "play"]()
		isPlaying = isPlaying ? false : true;
	});

	/* FORMS */
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
