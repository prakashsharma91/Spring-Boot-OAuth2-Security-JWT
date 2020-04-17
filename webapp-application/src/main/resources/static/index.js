$(document).ready(function() {
	$('#emailAddressTxt').keyup(function() {
		checkAllowLogin();
	});

	$('#pwd').keyup(function() {
		checkAllowLogin();
	});

	$("#submitBtn").click(function() {
		getToken($('#emailAddressTxt').val().trim(), $('#pwd').val());
	});

	$('#email_id').keyup(function() {
		checkAllowRegister();
	});

	$('#first_name').keyup(function() {
		checkAllowRegister();
	});

	$('#last_name').keyup(function() {
		checkAllowRegister();
	});

	$('#mobile_number').keyup(function() {
		checkAllowRegister();
	});

	$('#country').keyup(function() {
		checkAllowRegister();
	});

	$('#password').keyup(function() {
		checkAllowRegister();
	});

	$("#registerationForm").click(function() {
		$("#registrationModal").modal('show');
	});

	$("#registerBtn").click(function() {
		registerUser();
	});

	$("#sendEmailLink").click(function() {

		send2facode(sessionStorage.getItem("email_two_fa_url"), function() {
			$("#2fa_error").hide();
			$(".alert-success").show();
			$(".alert-success").html("Your code has been sent your email id");
		});
	});

	$("#sendSMSLink").click(function() {
		send2facode(sessionStorage.getItem("mobile_two_fa_url"), function() {
			$(".alert-success").show();
			$("#2fa_error").hide();
			$(".alert-success").html("Your code has been sent your mobile");
		});
	});

	$("#verifyBtn").click(function() {
		verify2faCode();
	});

});

function allowLogin() {
	if (localStorage.getItem("access_token") != null) {
		window.location.href = "permissions.html";
	}
}

function checkAllowLogin() {
	if ($("#emailAddressTxt").val() != null && $("#pwd").val() != null
			&& $("#emailAddressTxt").val().length > 0
			&& $("#pwd").val().length > 0
			&& validateEmail($("#emailAddressTxt").val())) {
		$("#submitBtn").removeAttr("disabled");
	} else if (!$("#submitBtn").attr("disabled")) {
		$("#submitBtn").attr("disabled", "disabled");
	}
}

function checkAllowRegister() {
	if ($("#email_id").val() != null && $("#first_name").val() != null
			&& $("#country").val() != null && $("#last_name").val() != null
			&& $("#mobile_number").val() != null
			&& $("#password").val() != null && $("#email_id").val().length > 0
			&& $("#first_name").val().length > 2
			&& $("#country").val().length > 2
			&& $("#last_name").val().length > 0
			&& $("#mobile_number").val().length > 0
			&& $("#password").val().length > 0
			&& validateEmail($("#email_id").val())) {
		$("#registerBtn").removeAttr("disabled");
	} else if (!$("#registerBtn").attr("disabled")) {
		$("#registerBtn").attr("disabled", "disabled");
	}
}

function validateEmail(sEmail) {
	var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
	return filter.test(sEmail);
}

function getToken(username, password) {
	$.ajax({
		type : "POST",
		url : "http://localhost:8080/oauth/token",
		data : "username=" + username + "&password=" + password
				+ "&grant_type=password",
		beforeSend : function(request) {
			request.setRequestHeader("Authorization", "Basic "
					+ btoa("clientid:clientSecret"));
			request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
		},
		success : function(msg) {
			if (JSON.parse(JSON.stringify(msg)).is_2fa_enabled == "Y") {

				var email_two_fa_url = "http://localhost:8087/users/"
						+ JSON.parse(JSON.stringify(msg)).id + "/emails/"
						+ JSON.parse(JSON.stringify(msg)).email_id + "/2fa";

				var mobile_two_fa_url = "http://localhost:8087/users/"
						+ JSON.parse(JSON.stringify(msg)).id
						+ "/mobilenumbers/"
						+ JSON.parse(JSON.stringify(msg)).mobile + "/2fa";

				var verify_2fa_url = "http://localhost:8087/users/"
						+ JSON.parse(JSON.stringify(msg)).id + "/codes/";

				sessionStorage.setItem("email_two_fa_url", email_two_fa_url);
				sessionStorage.setItem("mobile_two_fa_url", mobile_two_fa_url);
				sessionStorage.setItem("verify_2fa_url", verify_2fa_url);

				sessionStorage.setItem("access_token", JSON.parse(JSON
						.stringify(msg)).access_token);
				sessionStorage.setItem("refresh_token", JSON.parse(JSON
						.stringify(msg)).refresh_token);

				if (JSON.parse(JSON.stringify(msg)).tfa_default_type == "sms") {
					two_fa_url = mobile_two_fa_url;
				} else {
					two_fa_url = email_two_fa_url;
				}

				send2facode(two_fa_url, function() {
					$("#myModal").modal('show');
				});
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$(".alert-danger").show();
		}
	});
}

function send2facode(two_fa_code_url, callbackmethod) {
	$.ajax({
		type : "PUT",
		url : two_fa_code_url,
		success : function(msg) {
			callbackmethod();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$(".alert-danger").show();
			$(".alert-danger").html(
					"Unable to send 2FA code. Please try again.");
		}
	});
}

function verify2faCode() {

	$.ajax({
		type : "PUT",
		url : sessionStorage.getItem("verify_2fa_url") + $("#tfa_code").val(),
		success : function(msg) {
			localStorage.setItem("access_token", sessionStorage
					.getItem("access_token"));
			localStorage.setItem("refresh_token", sessionStorage
					.getItem("refresh_token"));
			window.location.reload("permissions.html");
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$("#2fa_error").show();
			$(".alert-success").hide();
			$("#2fa_error").html("Invalid code. Please try again.");
		}
	});
}

function registerUser() {

	var user_type = "user";
	$
			.ajax({
				type : "POST",
				url : "http://localhost:9090/user",
				data : JSON.stringify({
					"first_name" : $("#first_name").val(),
					"last_name" : $("#last_name").val(),
					"mobile" : $("#mobile").val(),
					"country" : $("#country").val(),
					"email_id" : $("#email_id").val(),
					"password" : $("#password").val(),
					"user_type" : user_type
				}),
				success : function(msg) {
					$(".alert-success").html(
							'<strong>User added successfully</strong>');
					$(".alert-success").show();
					$(".alert-danger").hide();
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if (XMLHttpRequest.status == 403 || XMLHttpRequest.status == 401) {
						$(".alert-danger")
								.html(
										'<strong>You don\'t have the permission to do add a new user</strong>');
						$(".alert-danger").show();
						$(".alert-success").hide();
					} else {
						localStorage.clear();
						window.location.href = "index.html";
					}
				}
			});
}