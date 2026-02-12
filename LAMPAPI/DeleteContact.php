<?php
	$inData = getRequestInfo();

    if (!isset($inData["userId"], $inData["contactId"]))
	{
        returnWithError("Missing required field(s)");
        exit();
    }
	
	$userId = (int)$inData["userId"];
	$contactId = (int)($inData["contactId"]);

    if($userId <= 0 || $contactId <= 0)
	{
        returnWithError("Invalid input.");
        exit();
    }

	$conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
        exit();
	}
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
		$stmt->bind_param("ii", $contactId, $userId);
		$stmt->execute();

        if( $stmt->affected_rows > 0)
		{
            returnWithInfo();
        } 
		else
		{
            returnWithError("Contact not found");
        }

		$stmt->close();
		$conn->close();
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo()
	{
		$retValue = '{"error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>