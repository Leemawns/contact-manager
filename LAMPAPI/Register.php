
<?php
	$inData = getRequestInfo();
	

	// Validating that required keys exist
	if(!isset($inData["firstName"]) || !isset($inData["lastName"])
		|| !isset($inData["login"]) || !isset($inData["password"]))
	{
		returnWithError("Missing required field(s)");
		exit;
	}

	// pull values form the json and trim the whitespace
	$firstName = trim($inData["firstName"]);
	$lastName = trim($inData["lastName"]);
	$login = trim($inData["login"]);
	$password = trim($inData["password"]);

	if($firstName === "" || $lastName === "" || $login === "" || $password === "")
	{
		returnWithError("Fields cannot be empty");
		exit();
	}

	// connect to database
	$conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
		exit();
	}

	// check if login already exists
	$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=? LIMIT 1");
	$stmt->bind_param("s", $login);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->fetch_assoc())
	{
		$stmt->close();
		$conn->close();
		returnWithError("Login already exists");
		exit();
	}
	$stmt->close();

	$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
	$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
	$stmt->execute();

	if($stmt->affected_rows > 0)
	{
		// insert_id is the auto_generated ID for the newly inserted row
		returnWithInfo($firstName, $lastName, $conn->insert_id);
	}
	else
	{
		returnWithError("Registration failed");
	}

	$stmt->close();
	$conn->close();
	
	function getRequestInfo()
	{
		$raw = file_get_contents("php://input"); // reads the raw request body
		$data = json_decode($raw, true); // turns JSON string into associative array
		return is_array($data) ? $data : [];
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
