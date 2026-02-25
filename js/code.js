const urlBase = 'http://group15.sedsucf.org.org/LAMPAPI';
const extension = 'php';

let firstName = "";
let lastName = "";
let currentContactId = null;
let userId = -1;

function validateEmail(email) {
	let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	return regex.test(email);
}

function validatePhone(phone) {
	let regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

	return regex.test(phone);
}

function doLogout() {
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "userId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	document.cookie = "userId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {
	if (userId < 0) {
		document.getElementById("contactAddResult").innerHTML = "Not logged in";
		return;
	}

	data = validateContactFields("add");

	valid = data[0];
	tmp = data[1];

	// invalid data, skip
	if (!valid)
		return;

	tmp['userId'] = userId;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", urlBase + "/AddContact." + extension, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let res = JSON.parse(xhr.responseText);
			document.getElementById("contactAddResult").innerHTML =
				res.error === "" ? "Contact Added" : res.error;
		}
	};

	xhr.send(JSON.stringify(tmp));
}

function validateContactFields(mode) {
	let valid = true;

	let first = null;
	let last = null;
	let emailAddress = null;
	let phoneNumber = null;

	let firstError = null;
	let lastError = null;
	let emailError = null;
	let phoneError = null;
	
	if (mode == "add") {
		// get add values
		first = document.getElementById("firstNameText").value.trim();
		last = document.getElementById("lastNameText").value.trim();
		emailAddress = document.getElementById("emailText").value.trim();
		phoneNumber = document.getElementById("phoneNumber").value.trim();

		// get error rows
		firstError = document.getElementById("add-first-error");
		lastError = document.getElementById("add-last-error");
		emailError = document.getElementById("add-email-error");
		phoneError = document.getElementById("add-phone-error");
	}
	else {
		// get edit values
		first = document.getElementById("modalFirstName").value.trim();
		last = document.getElementById("modalLastName").value.trim();
		emailAddress = document.getElementById("modalEmail").value.trim();
		phoneNumber = document.getElementById("modalPhone").value.trim();

		// get error rows
		firstError = document.getElementById("edit-first-error");
		lastError = document.getElementById("edit-last-error");
		emailError = document.getElementById("edit-email-error");
		phoneError = document.getElementById("edit-phone-error");
	}

	// reset errors
	firstError.innerHTML = "";
	lastError.innerHTML = "";
	emailError.innerHTML = "";
	phoneError.innerHTML = "";

	// check if first name is empty
	if (first == "") {
		firstError.innerHTML = "Please enter a first name.";
		valid = false;
	}

	// check if last name is empty
	if (last == "") {
		lastError.innerHTML = "Please enter a last name.";
		valid = false;
	}

	// verify email
	if (!validateEmail(emailAddress)) {
		emailError.innerHTML = "Invalid email address.";
		valid = false;
	}

	// verify phone
	if (!validatePhone(phoneNumber)) {
		phoneError.innerHTML = "Invalid phone number.";
		valid = false;
	}

	return [valid, {
		firstName: first,
		lastName: last,
		email: emailAddress,
		phone: phoneNumber,
	}];
}

function searchContact() {
	let srch = document.getElementById("searchText").value.trim();
	document.getElementById("contactTable").innerHTML = "";

	let tmp = { search: srch, userId: userId };

	let xhr = new XMLHttpRequest();
	xhr.open("POST", urlBase + "/SearchContacts." + extension, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let res = JSON.parse(xhr.responseText);
			document.getElementById("contactSearchResult").innerHTML =
				res.error === "" ? "Contact(s) Retrieved" : res.error;

			let container = document.getElementById("contactTable");
			let template = document.getElementById("contactButtonTemplate");

			res.results.forEach(c => {
				let contactId =
					c.id ??
					c.ID ??
					c.contactId ??
					c.ContactID;

				if (!contactId) return;

				let clone = template.content.cloneNode(true);
				let button = clone.querySelector("button");
				let name = clone.querySelector(".contactName");

				name.textContent = c.firstName + " " + c.lastName;

				button.onclick = () =>
					openContactModal(
						contactId,
						c.firstName,
						c.lastName,
						c.phone,
						c.email
					);

				container.appendChild(clone);
			});

		}
	};

	xhr.send(JSON.stringify(tmp));
}


function openAddModal() {
	const modal = document.getElementById('addModal');
	modal.classList.remove('exit');
	modal.classList.add('open');

}

function closeAddModal() {
	const modal = document.getElementById('addModal');
	modal.classList.add('exit');

	setTimeout(() => {
		modal.classList.remove('open');
		modal.classList.remove('exit');
	}, 400);

	document.getElementById('firstNameText').value = '';
	document.getElementById('lastNameText').value = '';
	document.getElementById('emailText').value = '';
	document.getElementById('phoneNumber').value = '';
	document.getElementById('contactAddResult').innerHTML = '';

	// remove all errors
	firstError = document.getElementById("add-first-error").innerHTML = "";
	lastError = document.getElementById("add-last-error").innerHTML = "";
	emailError = document.getElementById("add-email-error").innerHTML = "";
	phoneError = document.getElementById("add-phone-error").innerHTML = "";

}

function contactAdded() {
	addContact();
}

function deleteCurrentContact() {

	let tmp = {
		contactId: currentContactId,
		userId: userId
	};

	let xhr = new XMLHttpRequest();
	xhr.open("POST", urlBase + "/DeleteContact." + extension, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let res = JSON.parse(xhr.responseText);
			document.getElementById("contactDeleteResult").innerHTML =
				res.error === "" ? "Contact Deleted" : res.error;

		}
	};

	xhr.send(JSON.stringify(tmp));
}


function openContactModal(id, firstName, lastName, phone, email) {
	currentContactId = id;

	originalContact = {
		firstName,
		lastName,
		phone,
		email
	};

	document.getElementById("modalFirstName").value = firstName;
	document.getElementById("modalLastName").value = lastName;
	document.getElementById("modalPhone").value = phone;
	document.getElementById("modalEmail").value = email;

	document.getElementById("modalFirstName").disabled = true;
	document.getElementById("modalLastName").disabled = true;
	document.getElementById("modalPhone").disabled = true;
	document.getElementById("modalEmail").disabled = true;

	document.getElementById("modalName").innerHTML =
		firstName + " " + lastName;

	const modal = document.getElementById("contactModal");
  	modal.classList.remove("exit");
  	modal.classList.add("open");
	
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("cancelButton").style.display = "none";
}

function closeModal(id) {
	const modal = document.getElementById(id);

	modal.classList.add("exit");

	setTimeout(() => {
		modal.classList.remove("open");
    	modal.classList.remove("exit");
	}, 400); // match animation duration
}

function closedeleteModal() {
	closeModal("deleteModal");
}

function opendeleteModal() {
	const modal = document.getElementById("deleteModal");
	modal.classList.remove("exit");
	modal.classList.add("open");
}

function deleteContact() {
	deleteCurrentContact();
	setTimeout(closedeleteModal, 2000);
	setTimeout(closeContactModal, 2000);
	document.getElementById("contactDeleteResult").style.display = "inline";
	setTimeout(function () {
		document.getElementById("contactDeleteResult").style.display = "none";
	}, 2000)
	setTimeout(searchContact, 2000);
}

function closeContactModal() {
	closeModal("contactModal");
	document.getElementById("editButton").style.display = "inline";
	document.getElementById("deleteButton").style.display = "inline";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("contactUpdateResult").innerHTML = " "
}

function enableEdit() {
	document.getElementById("modalFirstName").disabled = false;
	document.getElementById("modalLastName").disabled = false;
	document.getElementById("modalPhone").disabled = false;
	document.getElementById("modalEmail").disabled = false;
	document.getElementById("editButton").style.display = "none";
	document.getElementById("deleteButton").style.display = "none";
	document.getElementById("saveButton").style.display = "inline";
	document.getElementById("cancelButton").style.display = "inline";
}

function cancelEdit() {
	document.getElementById("modalFirstName").value = originalContact.firstName;
	document.getElementById("modalLastName").value = originalContact.lastName;
	document.getElementById("modalPhone").value = originalContact.phone;
	document.getElementById("modalEmail").value = originalContact.email;
	disableEdit();
}

function disableEdit() {
	document.getElementById("modalFirstName").disabled = true;
	document.getElementById("modalLastName").disabled = true;
	document.getElementById("modalPhone").disabled = true;
	document.getElementById("modalEmail").disabled = true;
	document.getElementById("editButton").style.display = "inline";
	document.getElementById("deleteButton").style.display = "inline";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("cancelButton").style.display = "none";
	
	// remove all errors
	firstError = document.getElementById("edit-first-error").innerHTML = "";
	lastError = document.getElementById("edit-last-error").innerHTML = "";
	emailError = document.getElementById("edit-email-error").innerHTML = "";
	phoneError = document.getElementById("edit-phone-error").innerHTML = "";

}

function saveEdit() {
	data = validateContactFields("edit");

	valid = data[0];
	tmp = data[1];

	// invalid data, skip
	if (!valid)
		return;
	
	tmp['contactId'] = currentContactId;
	tmp['userId'] = userId;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", urlBase + "/UpdateContact." + extension, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let res = JSON.parse(xhr.responseText);
			document.getElementById("contactUpdateResult").innerHTML =
				res.error === "" ? "Contact Updated" : res.error;

			if(res.error === "") {
				originalContact = {
					firstName: tmp.firstName,
					lastName: tmp.lastName,
					phone: tmp.phone,
					email: tmp.email
				};
				disableEdit();
			}

		}

	};

	xhr.send(JSON.stringify(tmp));
}

let isRegisterMode = false;

function toggleRegister() {
	isRegisterMode = !isRegisterMode;

	const registerFields = document.getElementById("registerFields");
	const loginButton = document.getElementById("loginButton");
	const registerButton = document.getElementById("registerButton");

	if (isRegisterMode) {
		// Switch to register mode
		registerFields.classList.add('show');
		loginButton.textContent = 'Create Account';
		loginButton.onclick = doRegister;
		registerButton.textContent = 'Back to Login';
		document.body.style.overflowY = "auto";
	} else {
		// Switch to login mode
		registerFields.classList.remove('show');
		loginButton.textContent = 'Login';
		loginButton.onclick = doLogin;
		registerButton.textContent = 'Register';
		document.body.style.overflowY = "hidden";

		// Clear registration fields
		document.getElementById("confirmPassword").value = "";
		document.getElementById("firstName").value = "";
		document.getElementById("lastName").value = "";
		document.getElementById("email").value = "";
		document.getElementById("phone").value = "";
	}
	
	// clear error fields any time when swapping
	let loginResult = document.getElementById("loginResult").innerHTML = "";
	let usernameError = document.getElementById("usernameError").innerHTML = "";
	let passwordError = document.getElementById("passwordError").innerHTML = "";
	let confirmPasswordError = document.getElementById("confirmPasswordError").innerHTML = "";

	document.getElementById("loginResult").innerHTML = "";
}

function saveCookie(name, value, days) {
	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}

	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function doRegister() {
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	let confirmPassword = document.getElementById("confirmPassword").value;
	let firstName = document.getElementById("firstName").value;
	let lastName = document.getElementById("lastName").value;

	// error messages
	let loginResult = document.getElementById("loginResult");
	let passwordError = document.getElementById("passwordError");
	let confirmPasswordError = document.getElementById("confirmPasswordError");


	let valid = true;

	// Ensure no empty inputs
	if (!login || !password || !confirmPassword || !firstName || !lastName) {
		loginResult.innerHTML = "Please fill in all required fields";
		valid = false;
	}
	else {
		loginResult.innerHTML = "";
	}

	// password length check
	if (password.length < 8) {
		passwordError.innerHTML = "Password must be at least 8 characters long";
		valid = false;
	}
	else {
		passwordError.innerHTML = "";
	}

	// password match check
	if (password != confirmPassword) {
		confirmPasswordError.innerHTML = "Passwords do not match";
		valid = false;
	}
	else {
		confirmPasswordError.innerHTML = "";
	}

	if (!valid) {
		console.log("invalid input")
		return;
	}

	console.log("valid input.")

	let tmp = {
		login: login,
		password: password,
		firstName: firstName,
		lastName: lastName
	};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error) {
					document.getElementById("loginResult").innerHTML = jsonObject.error;
					return;
				}

				document.getElementById("loginResult").innerHTML = "Registration successful! Please login.";

				// Switch back to login mode after successful registration
				setTimeout(function () {
					toggleRegister();
					document.getElementById("loginName").value = login;
					document.getElementById("loginPassword").value = "";
					document.getElementById("loginResult").innerHTML = "";
				}, 2000);
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doLogin() {
	// handle registration if needed
	if (isRegisterMode){
		doRegister();
		return;
	}

	let login = document.getElementById("loginName").value.trim();
	let password = document.getElementById("loginPassword").value.trim();
	//	var hash = md5( password );

	let usernameError = document.getElementById("usernameError");
	let passwordError = document.getElementById("passwordError");

	usernameError.innerHTML = "";
	passwordError.innerHTML = "";

	let isValid = true;

	if (login == "")
	{
		usernameError.innerHTML = "Please provide a valid username."
		isValid = false;
	}

	if (password == "")
	{
		passwordError.innerHTML = "Please provide a valid password."
		isValid = false;
	}

	if (!isValid) {
		return;
	}

	document.getElementById("loginResult").innerHTML = "";

	let tmp = { login: login, password: password };
	//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie("userId", userId, 7);

				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function readSessionCookie() {
	userId = -1;

	const cookieName = "userId=";

	cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i];
		
        if (c.indexOf(cookieName) === 0) {
			userId = parseInt(decodeURIComponent(c.substring(cookieName.length, c.length)));
			return;
        }
    }

	// no session cookie found, kick back out to main page
	if (userId = -1 && window.location.href.endsWith("contacts.html")) {
		window.location.href = "index.html";
	}
}

document.addEventListener('DOMContentLoaded',  function() {
	readSessionCookie();
})