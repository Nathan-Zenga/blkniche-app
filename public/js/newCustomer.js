$(function(){

	var action = $("#registration form").attr("action");

	$("#registration form").removeAttr("action");

	$("#signUpSubmit").click(function(e){

		e.stopImmediatePropagation();
		e.preventDefault();

		// take input values
		var firstName = $("#firstName").val(),
			lastName = $("#lastName").val(),
			email = $("#email").val(),
			DOB = $("#DOB").val(),
			day = $("#day").val(),
			month = $("#month").val(),
			year = $("#year").val(),
			nationality = $("#registration").val(),
			password = $("#password").val(),
			passwordConfirm = $("#passwordConfirm").val();



		// store values as object data
		var data = {
			firstName: firstName,
			lastName: lastName,
			email: email,
			DOB: DOB,
			nationality: nationality,
			password: password,
			passwordConfirm: passwordConfirm
		};

		if ( !$("#DOB").length ) data.DOB = [year, month, day].join("-");

		// sending data
		$.ajax({
			type: "POST",
			crossDomain: true,
			url: "users/add/Profile/profile",
			data: JSON.stringify(data),
			contentType: "application/json"
		})
		.done(function(newCustomer) {
			$("#result").text("Your account has been created.");
			$(".customerList").append(`<i>${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.email})</i>`);
			$("#registration fieldset *").not(".submit").val('');
			console.log(newCustomer);
		});
		

		// $.ajax({
		// 	type: "POST",
		// 	url: action,
		// 	data: JSON.stringify(data),
		// 	contentType: "application/json",
		// 	success: function(newCustomer) {
		// 		$("#result").text("Your account has been created.");
		// 		$(".customerList").append(`<i>${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.email})</i>`);
		// 		console.log(newCustomer);
		// 	},
		// 	error: function(jqXHR, textStatus, errorThrown) {
		// 		$("#result").text("Something's wrong: " + textStatus + " ---> " + errorThrown);
		// 		console.log(jqXHR);
		// 	}
		// });


		return 0;

	});

});