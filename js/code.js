const urlBase = 'http://cop4331spring2026.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let isRegisterMode = false;

function toggleRegister()
{
	isRegisterMode = !isRegisterMode;
	
	const registerFields = document.getElementById("registerFields");
	const loginButton = document.getElementById("loginButton");
	const registerButton = document.getElementById("registerButton");
	const registerText = document.getElementById("registertext");
	
	if (isRegisterMode) {
		// Switch to register mode
		registerFields.classList.add('show');
		loginButton.textContent = 'Create Account';
		loginButton.onclick = doRegister;
		registerButton.textContent = 'Back to Login';
		registerText.textContent = 'Already have an account?';
		document.body.style.overflowY = "auto";
	} else {
		// Switch to login mode
		registerFields.classList.remove('show');
		loginButton.textContent = 'Login';
		loginButton.onclick = doLogin;
		registerButton.textContent = 'Register';
		registerText.textContent = "Don't have an account?";
		document.body.style.overflowY = "hidden";
		
		// Clear registration fields
		document.getElementById("confirmPassword").value = "";
		document.getElementById("firstName").value = "";
		document.getElementById("lastName").value = "";
		document.getElementById("email").value = "";
		document.getElementById("phone").value = "";
	}
	
	document.getElementById("loginResult").innerHTML = "";
}

function doRegister()
{
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	let confirmPassword = document.getElementById("confirmPassword").value;
	let firstName = document.getElementById("firstName").value;
	let lastName = document.getElementById("lastName").value;
	let email = document.getElementById("email").value;
	let phone = document.getElementById("phone").value;
	
	document.getElementById("loginResult").innerHTML = "";
	
	// Validate inputs
	if (!login || !password || !confirmPassword || !firstName || !lastName || !email) {
		document.getElementById("loginResult").innerHTML = "Please fill in all required fields";
		return;
	}
	
	if (password !== confirmPassword) {
		document.getElementById("loginResult").innerHTML = "Passwords do not match";
		return;
	}
	
	if (password.length < 8) {
		document.getElementById("loginResult").innerHTML = "Password must be at least 8 characters long";
		return;
	}
	
	let tmp = {
		login: login,
		password: password,
		firstName: firstName,
		lastName: lastName,
		email: email,
		phone: phone
	};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/Register.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
				
				if (jsonObject.error) {
					document.getElementById("loginResult").innerHTML = jsonObject.error;
					return;
				}
				
				document.getElementById("loginResult").innerHTML = "Registration successful! Please login.";
				
				// Switch back to login mode after successful registration
				setTimeout(function() {
					toggleRegister();
					document.getElementById("loginName").value = login;
					document.getElementById("loginPassword").value = "";
					document.getElementById("loginResult").innerHTML = "";
				}, 2000);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}