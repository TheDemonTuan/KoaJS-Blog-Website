"use strict";

const showLoading = () => {
	$("#preloader").fadeIn("slow");
};

const hideLoading = () => {
	$("#preloader").fadeOut("slow");
};

const toastDetails = {
	timer: 5000,
	success: {
		icon: "fa-circle-check",
	},
	error: {
		icon: "fa-circle-xmark",
	},
	warning: {
		icon: "fa-triangle-exclamation",
	},
	info: {
		icon: "fa-circle-info",
	},
};

const removeToast = (toast) => {
	toast.classList.add("hide");
	if (toast.timeoutId) clearTimeout(toast.timeoutId); // Clearing the timeout for the toast
	setTimeout(() => toast.remove(), 500); // Removing the toast after 500ms
};

const createToast = (type, message) => {
	// Getting the icon and text for the toast based on the id passed
	const { icon } = toastDetails[type];
	const toast = document.createElement("li");
	toast.className = `tdt-toast ${type}`;
	toast.innerHTML = `<div class="column">
												<i class="fa-solid ${icon}"></i>
												<span>${message}</span>
											</div>
											<i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>`;
	$(".notifications").append(toast);
	toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
};
// Send Data
const sendData = async (method, url, data) => {
	return new Promise((resolve, reject) => {
		showLoading();
		try {
			$.ajax({
				method: method,
				url: url,
				data: data,
				dataType: "json",
			})
				.done((result) => {
					if (!result.success) {
						createToast("error", result.message);
					} else {
						createToast("success", result.message);
					}
					resolve(result);
				})
				.fail((jqXHR, textStatus, errorThrown) => {
					if (jqXHR.status == 400) {
						createToast("error", jqXHR.responseJSON.message);
					} else if (jqXHR.status == 500) {
						createToast("error", "Internal Server Error");
					} else {
						reject(jqXHR);
					}
				})
				.always((result) => {
					//console.clear();
					hideLoading();
				});
		} catch (error) {
			reject(error);
		}
	});
};

// // Image Preview
// const imagePreview = (input) => {
// 	if (input.files && input.files[0]) {
// 		var reader = new FileReader();
// 		reader.onload = (e) => {
// 			$("#imagePreview").css(
// 				"background-image",
// 				"url(" + e.target.result + ")"
// 			);
// 			$("#imagePreview").hide();
// 			$("#imagePreview").fadeIn(650);
// 		};
// 		reader.readAsDataURL(input.files[0]);
// 	}
// };

// // Load More Datapacks
// const loadDatapacks = async (type) => {
// 	return new Promise((resolve, reject) => {
// 		$.ajax({
// 			method: "GET",
// 			url: `/api/v1/datapacks/load/${type}`,
// 			dataType: "json",
// 		})
// 			.done((result) => {
// 				$("#datapackList").append(result.htmlCode);
// 				Toast.fire({
// 					icon: `${result.status}`,
// 					title: `${result.message}`,
// 				});
// 				resolve(result.lastId);
// 			})
// 			.fail((e) => {
// 				reject(e);
// 			});
// 	});
// };

//Router
const signUpRoute = () => {
	const showValid = (element) => {
		element.removeClass("is-invalid");
		element.addClass("is-valid");
	};

	const showInvalid = (element) => {
		element.removeClass("is-valid");
		element.addClass("is-invalid");
	};

	const isAlphaNum = (element) => {
		const regex = /^[a-zA-Z0-9]+$/;
		return regex.test(element.val());
	};

	const isValidMail = (mail) => {
		const mailRegx = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/g;
		if (mailRegx.test(mail)) {
			return true;
		}
		return false;
	}

	$(() => {
		const signUpForm = $("#signup-form");
		signUpForm.on("submit", async (e) => {
			e.preventDefault();
			try {
				const result = await sendData(
					"POST",
					"/api/v1/users/signup",
					signUpForm.serialize()
				);
				if (result.success) signUpForm.trigger("reset");
				grecaptcha.reset();
			} catch (err) {
				createToast("error", "Can't sign up, please try again later!");
			}
		});

		$("#display-name").on("input", (e) => {
			const display_name = e.target.value;
			if (
				display_name.length < 6 ||
				display_name.length > 20 ||
				!isAlphaNum($(e.target))
			) {
				showInvalid($(e.target));
			} else {
				showValid($(e.target));
			}
		});

		$("#email").on("input", (e) => {
			const email = e.target.value;
			if (!isValidMail(email)) {
				showInvalid($(e.target));
			} else {
				showValid($(e.target));
			}
		});

		$("#username").on("input", (e) => {
			const username = e.target.value;
			if (
				username.length < 6 ||
				username.length > 20 ||
				!isAlphaNum($(e.target))
			) {
				showInvalid($(e.target));
			} else {
				showValid($(e.target));
			}
		});

		$("#password").on("input", (e) => {
			let power = 0;
			let strongPasswordArr = [
				/[0-9]/,
				/[a-z]/,
				/[A-Z]/,
				/[^0-9a-zA-Z]/,
				/.{8,}/,
			];
			const password = e.target.value;
			strongPasswordArr.forEach((item) => {
				if (item.test(password)) {
					power += 20;
				}
			});

			let processBarColor = "";
			showInvalid($(e.target));

			if (power <= 20) {
				processBarColor = "bg-danger";
			} else if (power <= 40) {
				processBarColor = "bg-warning";
			} else if (power <= 60) {
				processBarColor = "bg-info";
			} else if (power <= 80) {
				processBarColor = "bg-primary";
			} else {
				processBarColor = "bg-success";
				showValid($(e.target));
			}
			$(".progress-bar").removeClass(
				"bg-danger bg-warning bg-info bg-primary bg-success"
			);
			$(".progress-bar").addClass(processBarColor);
			$(".progress-bar").css("width", `${power}%`);
		});

		$("#confirm-password").on("input", (e) => {
			const password = $("#password").val();
			const confirmPassword = e.target.value;
			if (password === confirmPassword) {
				showValid($(e.target));
			} else {
				showInvalid($(e.target));
			}
		});
	});
};

const signInRoute = () => {
	var showValid = (element) => {
		element.removeClass("is-invalid");
		element.addClass("is-valid");
	};

	var showInvalid = (element) => {
		element.removeClass("is-valid");
		element.addClass("is-invalid");
	};

	var isAlphaNum = (element) => {
		const regex = /^[a-zA-Z0-9]+$/;
		return regex.test(element.val());
	};

	var renderRecaptcha = () => {
		$("#signin-submit").hide();
		grecaptcha.ready(() => {
			grecaptcha
				.execute("6LeHzKQjAAAAAB2suSQorn4HvsCJSeG12NkIyAiy", {
					action: "signin",
				})
				.then((token) => {
					$('input[name="_grecaptcha"]').val(token);
				});
			$("#signin-submit").show();
		});
	};

	$(() => {
		renderRecaptcha();
		const signInForm = $("#signin-form");
		signInForm.on("submit", async (e) => {
			e.preventDefault();
			try {
				const result = await sendData(
					"POST",
					"/api/v1/users/signin",
					signInForm.serialize()
				);
				if (result.success) {
					signInForm.trigger("reset");
				}
				renderRecaptcha();
			} catch (err) {
				createToast("error", "Can't sign in, please try again later!");
			}
		});
		$("#username").on("input", (e) => {
			const username = e.target.value;
			if (
				username.length < 6 ||
				username.length > 20 ||
				!isAlphaNum($(e.target))
			) {
				showInvalid($(e.target));
			} else {
				showValid($(e.target));
			}
		});

		$("#password").on("input", (e) => {
			let power = 0;
			let strongPasswordArr = [
				/[0-9]/,
				/[a-z]/,
				/[A-Z]/,
				/[^0-9a-zA-Z]/,
				/.{8,}/,
			];
			const password = e.target.value;
			strongPasswordArr.forEach((item) => {
				if (item.test(password)) {
					power += 1;
				}
			});
			showInvalid($(e.target));

			if (power === 5) {
				showValid($(e.target));
			}
		});
	});
};

const handleRoute = () => {
	const currentUrl = window.location.pathname;

	const signUpRegex = /^\/signup$/;
	const signInRegex = /^\/signin$/;

	if (signUpRegex.test(currentUrl)) {
		signUpRoute();
	} else if (signInRegex.test(currentUrl)) {
		signInRoute();
	} else {
		console.log("Đã gọi hàm xử lý cho route mặc định hoặc 404");
	}
};

$(window).on("DOMContentLoaded", handleRoute);
$(window).on("popstate", handleRoute);

//Preloader
$(window).on("load", () => {
	hideLoading();
});

(($) => {
	$('[id=toggle-password]').on('click', (e) => {
		e.preventDefault();
		console.log(e.target)
		$(e.currentTarget).parent().find('input').attr('type', (index, attr) => {
			return attr == 'password' ? 'text' : 'password';
		});
		$(e.currentTarget).find('i').toggleClass('fa-eye-slash fa-eye');
	})


	$(window).on("scroll", function () {
		var scrolling = $(this).scrollTop();
		if (scrolling > 10) {
			$(".navigation").addClass("nav-bg");
		} else {
			$(".navigation").removeClass("nav-bg");
		}
	});

	// tab
	$(".tab-content")
		.find(".tab-pane")
		.each(function (idx, item) {
			var navTabs = $(this).closest(".code-tabs").find(".nav-tabs"),
				title = $(this).attr("title");
			navTabs.append(
				'<li class="nav-item"><a class="nav-link" href="#">' +
				title +
				"</a></li>"
			);
		});

	$(".code-tabs ul.nav-tabs").each(function () {
		$(this).find("li:first").addClass("active");
	});

	$(".code-tabs .tab-content").each(function () {
		$(this).find("div:first").addClass("active");
	});

	$(".nav-tabs a").click(function (e) {
		e.preventDefault();
		var tab = $(this).parent(),
			tabIndex = tab.index(),
			tabPanel = $(this).closest(".code-tabs"),
			tabPane = tabPanel.find(".tab-pane").eq(tabIndex);
		tabPanel.find(".active").removeClass("active");
		tab.addClass("active");
		tabPane.addClass("active");
	});

	// Accordions
	$(".collapse")
		.on("shown.bs.collapse", function () {
			$(this)
				.parent()
				.find(".ti-plus")
				.removeClass("ti-plus")
				.addClass("ti-minus");
		})
		.on("hidden.bs.collapse", function () {
			$(this)
				.parent()
				.find(".ti-minus")
				.removeClass("ti-minus")
				.addClass("ti-plus");
		});

	// copy to clipboard
	$(".copy").click(function () {
		$(this).siblings(".inputlink").select();
		document.execCommand("copy");
	});

	$(".menu-sticky").on("click", function (e) {
		e.preventDefault();
		alert("hi");
	});

	// popup video
	var $videoSrc;
	$(".video-btn").click(function () {
		$videoSrc = $(this).data("src");
	});

	$("#myModal").on("shown.bs.modal", function (e) {
		$("#video").attr(
			"src",
			$videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0"
		);
	});
	$("#myModal").on("hide.bs.modal", function (e) {
		$("#video").attr("src", $videoSrc);
	});
})(jQuery);
