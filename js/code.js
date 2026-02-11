const urlBase = 'http://group15.sedsucf/LAMPAPI';
const extension = 'php';

let firstName = "";
let lastName = "";
let currentContactId = null;
let userId = 0;

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
    if (userId <= 0)
    {
        document.getElementById("contactAddResult").innerHTML = "Not logged in";
        return;
    }

    let tmp = {
        firstName: document.getElementById("firstNameText").value,
        lastName: document.getElementById("lastNameText").value,
        email: document.getElementById("emailText").value,
        phone: document.getElementById("phoneNumber").value,
        userId: userId  
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/AddContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let res = JSON.parse(xhr.responseText);
            document.getElementById("contactAddResult").innerHTML =
                res.error === "" ? "Contact Added" : res.error;
        }
    };

    xhr.send(JSON.stringify(tmp));
}

function searchContact()
{
    let srch = document.getElementById("searchText").value.trim();
    document.getElementById("contactTable").innerHTML = "";

    let tmp = { search: srch, userId: userId };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/SearchContacts." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let res = JSON.parse(xhr.responseText);
			document.getElementById("contactSearchResult").innerHTML = 
				res.error === "" ? "Contact(s) Retrieved" : res.error;

            let container = document.getElementById("contactTable");
            let template = document.getElementById("contactButtonTemplate");

            res.results.forEach(c =>
{
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

  document.getElementById('firstNameText').value = '';
  document.getElementById('lastNameText').value = '';
  document.getElementById('emailText').value = '';
  document.getElementById('phoneNumber').value = '';
  document.getElementById('contactAddResult').innerHTML = '';


  modal.addEventListener('animationend', function() {
    if (modal.classList.contains('exit')) {
      modal.classList.remove('open');
    }
  }, { once: true });
}

function contactAdded() {
	addContact();
}
function deleteCurrentContact()
{

    let tmp = {
        contactId: currentContactId,
        userId: userId
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/DeleteContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let res = JSON.parse(xhr.responseText);
            document.getElementById("contactDeleteResult").innerHTML =
            res.error === "" ? "Contact Deleted" : res.error;

        }
    };

    xhr.send(JSON.stringify(tmp));
}


function openContactModal(id, firstName, lastName, phone, email)
{
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

    document.getElementById("contactModal").style.display = "block";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("cancelButton").style.display = "none";
}

function closedeleteModal()
{
    document.getElementById("deleteModal").style.display = "none";
}

function opendeleteModal(){
	document.getElementById("deleteModal").style.display = "block";
}
function deleteWarning(){
	opendeleteModal();
	closeContactModal();
}

function deleteContact(){
	deleteCurrentContact();
	setTimeout(closedeleteModal, 2000);
	setTimeout(closeContactModal, 2000);
	document.getElementById("contactDeleteResult").style.display = "inline";
	setTimeout(function () {
        document.getElementById("contactDeleteResult").style.display = "none";
    }, 2000)
	setTimeout(searchContact, 2000);
}

function closeContactModal()
{
    document.getElementById("contactModal").style.display = "none";
	document.getElementById("editButton").style.display = "inline";
	document.getElementById("deleteButton").style.display = "inline";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("contactUpdateResult").innerHTML = " "
}

function enableEdit()
{
    document.getElementById("modalFirstName").disabled = false;
    document.getElementById("modalLastName").disabled = false;
    document.getElementById("modalPhone").disabled = false;
    document.getElementById("modalEmail").disabled = false;
	document.getElementById("editButton").style.display= "none";
	document.getElementById("deleteButton").style.display="none";
	document.getElementById("saveButton").style.display = "inline";
	document.getElementById("cancelButton").style.display = "inline";
}

function disableEdit(){

	document.getElementById("modalFirstName").value = originalContact.firstName;
    document.getElementById("modalLastName").value = originalContact.lastName;
    document.getElementById("modalPhone").value = originalContact.phone;
    document.getElementById("modalEmail").value = originalContact.email;
	document.getElementById("modalFirstName").disabled = true;
	document.getElementById("modalLastName").disabled = true;
	document.getElementById("modalPhone").disabled = true;
	document.getElementById("modalEmail").disabled = true;
	document.getElementById("editButton").style.display= "inline";
	document.getElementById("deleteButton").style.display="inline";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("cancelButton").style.display = "none";

}

function saveEdit()
{
    let firstName = document.getElementById("modalFirstName").value.trim();
    let lastName = document.getElementById("modalLastName").value.trim();
    let phone = document.getElementById("modalPhone").value.trim();
    let email = document.getElementById("modalEmail").value.trim();

    let tmp = {
        contactId: currentContactId,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userId: userId
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/UpdateContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let res = JSON.parse(xhr.responseText);
            document.getElementById("contactUpdateResult").innerHTML =
            res.error === "" ? "Contact Updated" : res.error;


        }
		
    };

	disableEdit();

    xhr.send(JSON.stringify(tmp));
}



