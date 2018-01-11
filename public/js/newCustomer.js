$(function(){

	$("#signUpSubmit").click(function(e){

		e.stopImmediatePropagation();
		e.preventDefault();

		// take input values
		var firstName = $("#firstName").val(),
			lastName = $("#lastName").val(),
			email = $("#email").val(),
			day = $("#day").val(),
			month = $("#month").val(),
			year = $("#year").val(),
			nationality = $("#registration").val(),
			password = $("#password").val(),
			passwordConfirm = $("#passwordConfirm").val();



		// store values as object data
		const data = {
			firstName: firstName,
			lastName: lastName,
			email: email,
			DOB: [year, month, day].join("-"),
			nationality: nationality,
			password: password,
			passwordConfirm: passwordConfirm
		};

		// sending data
		$.ajax({
			type: "POST",
			url: location.origin + "/users/add",
			data: JSON.stringify(data),
			contentType: "application/json"})
		 .done(function(){


		});


		/*
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: location.origin + "/users/add",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(newCustomer) {
				$("#result").text("Your account has been created.");
				$(".customerList").append(`<i>${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.email})</i>`);
				console.log(newCustomer);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$("#result").text("Something's wrong: " + textStatus + " ---> " + errorThrown);
				console.log(jqXHR);
			},
		});
		*/

		return 0;

	});

});