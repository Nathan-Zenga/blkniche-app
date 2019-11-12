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

	function smoothScrollTo(offsetTop) {
		$("html, body").stop().animate({ scrollTop: offsetTop }, 700, "easeInOutExpo")
	}

	// change div.textbox inner text whenever carousel caption changes
	function changeText(section) {
		$(section).find(".slide-title").text( $(section).find(".item.active .carousel-caption-title").text() );
		$(section).find(".slide-artist").text( $(section).find(".item.active .carousel-caption-artist").text() );
		$(section).find(".slide-info").text( $(section).find(".item.active .carousel-caption-info").text() );
	}

	// change state of contents when scrolling the page
	function toggleOnScroll(){

		// toggle toTop button visibility
		var state = window.pageYOffset > 40;
		$("#toTop").css({transform: state ? "translateX(-100%)" : ""});
		if (location.pathname === '/') $(".socials").toggleClass("fixed", !state);

		// position toTop button on top of footer if they visually overlap
		var windowOffsetBottom = window.pageYOffset + window.innerHeight;
		var footerOffsetTop = $("footer").offset().top;
		var bottom = windowOffsetBottom >= footerOffsetTop ? (window.innerHeight - (footerOffsetTop - window.pageYOffset))+"px" : "";
		$("#toTop").css("bottom", bottom);

		try {
			// fix header position to viewport when scrolling past second section
			var top = $("section").length > 1 ? $("section").eq(1).offset().top - 100 : parseInt($("header").css("height"));
			$(".inner-header").toggleClass("fixed", window.pageYOffset > top);
		} catch(err) {
			return 0
		}

	}


	// emphasize nav link text when scrolling to / past section with which it is associated (desktop view only)
	function markLink() {
		try {
			$("nav .link").css({
				borderBottom: ""
			});

			if (window.innerWidth >= 768) {
				$("section").each(function(i){
					if ( $(window).scrollTop() >= $(this).offset().top - 100 ) {

						var $lastVisitedSection = $(this);

						$("nav .link")
						.css({
							borderBottom: ""
						})
						.each(function() {
							if ( $lastVisitedSection.attr('class').includes($(this).attr('id')) ) {

								$(this).css({
									borderBottom: "2px solid white"
								})

							}
						})
					}
				});
			}
		} catch(e) {
			return; // Section not found
		}
	}

	toggleOnScroll(); markLink(); changeText( $("section") );

	$(window).scroll(markLink);
	$(window).scroll(toggleOnScroll);

	$(document.body).click(function(e) {
		var $menu = $("#menu");
		var navHeight = $(".inner-header.fixed nav").height();
		// check cursor hovers outside nav boundary...
		if (navHeight && e.clientY > navHeight) {
			// ...and outside menu icon boundary
			if ( !(e.clientX > $menu.offset().left && e.clientY < parseInt($menu.css("height"))) ) {
				var headerFixed = $(".inner-header").hasClass("fixed");
				var menuOpen = $menu.hasClass("is-active");
				if (headerFixed && menuOpen) $menu.click();
			}
		}
	});

	// overriding default method actions when displaying a bootstrap modal
	$(".modal").on('shown.bs.modal', function() {
		$("body, .modal").css("padding-right", "");
	});

	var device = detect.parse(navigator.userAgent).device;
	var prop = device.type == "Tablet" ? "initial" : "";
	$(".bgreel > div").css("background-attachment", prop);

	// bg auto-playing slideshow
	$(".bgreel").each(function() {
		var bgreel = this;
		$(bgreel).children("div:gt(0)").fadeTo(0, 0);
		setInterval(function() {
			$(bgreel).children('div:first')
				.fadeTo(2000, 0)
				.dequeue()
				.next()
				.fadeTo(0, 1)
				.end()
				.appendTo(bgreel);
		}, 5000);
	});

	$("#menu").click(function() {
		$(this).toggleClass("is-active");
		$(".link-group").stop().slideToggle(function() {
			if ($(this).is(":hidden")) $(this).css("display", "").removeAttr("style")
		});
	});

	// scroll to section corresponding to chosen nav link
	$(".link").click(function() {
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
			var description = JSON.parse(video.description.replace(/&quot;/g, '"'));

			$("section.videos")
			.find(".carousel-indicators").append(
				'<li id="video'+ i +'" data-target="#videos-carousel" data-slide-to="'+ i +'" '+ (i < 1 ? ' class="active"' : '') +'></li> '
			)
			.end().find(".carousel-inner").append(
				'<div class="item'+ (i < 1 ? ' active' : '') +'">' +
					'<video class="img" loop playsinline><source src="'+ video.big.replace(/_b.jpg|_z.jpg/, "_l.jpg") +'"/></video>' +
					'<div class="carousel-caption">' +
						'<h3 class="carousel-caption-title">'+ video.title +'</h3>' +
						'<p class="carousel-caption-artist">'+ description.artist +'</p>' +
						'<p class="carousel-caption-info">'+ description.info.replace(/\n/g, "<br>") +'</p>' +
					'</div>' +
				'</div>'
			);
			// invoking functions after loading videos
			if (i === data.length-1) changeText($("section.videos"));
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
		// stop all video playback when showing another slide
		var carousel = this;
		if ( $(carousel).find("video").length ) {
			$(carousel).find("video").each(function(){
				var currentVideo = $(this).get(0);
				currentVideo.pause();
				currentVideo.currentTime = 0;
				currentVideo.volume = 1;
				// play video in current carousel slide
				if ($(currentVideo).parent(".item").hasClass("active")) {
					currentVideo.play();
					$(currentVideo).closest("section").find(".playback-button .symbol").removeClass("fa-play").addClass("fa-pause");
				}
			})
		}
		changeText( $(this).closest("section") );
	});

	$(".playback-button").click(function() {
		var currentVideo = $(this).closest("section").find(".item.active video").get(0);
		var $symbol = $(this).find(".symbol");
		if (currentVideo.playing) {
			currentVideo.pause();
			$symbol.removeClass("fa-pause").addClass("fa-play");
		} else {
			currentVideo.play();
			$symbol.removeClass("fa-play").addClass("fa-pause");
		}
	});

	$(".mute-button").click(function() {
		var currentVideo = $(this).closest("section").find(".item.active video").get(0);
		currentVideo.volume = currentVideo.volume ? 0 : 1;
	});

	$(".back-button, .forward-button").click(function() {
		var currentVideo = $(this).closest("section").find(".item.active video").get(0);
		currentVideo.currentTime += this.className.includes("back-button") ? -15 : 15;
	});

	/* FORMS */
	$("#signup_body").submit(function(e) {
		e.preventDefault();
		var form = this;
		var data = {};

		$(form).serializeArray().forEach(function(field) {
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
				$(form).find(".details").val("");
			}
		});
	});

	$("#update_form").submit(function(e) {
		e.preventDefault();
		var form = this;
		var data = {};

		$(form).serializeArray().forEach(function(field) {
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
				$(form).find(".details").val("");
				$(form).closest(".modal").modal("hide");
			}
		});
	});

	$("#forgot_body").submit(function(e) {
		e.preventDefault();
		var form = this;
		var data = {};

		$(form).serializeArray().forEach(function(field) {
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
		var form = this;
		var data = {};

		$(form).serializeArray().forEach(function(field) {
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
				$(form).closest(".modal").modal("hide");
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
