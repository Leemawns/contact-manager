<?php
    $inData = getRequestInfo();

    if(!isset($inData["userId"], $inData["firstName"], $inData["lastName"], $inData["phone"], $inData["email"]))
    {
        returnWithError("Missing required field(s)");
        exit();
    }

    $userId = (int)$inData["userId"];
    $firstName = trim($inData["firstName"]);
    $lastName = trim($inData["lastName"]);
    $phone = trim($inData["phone"]);
    $email = trim($inData["email"]);

    if($userId <= 0 || $firstName === "" || $lastName === "" || $phone === "" || $email === "")
    {
        returnWithError("Fields cannot be empty");
        exit();
    }

    $conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager");

    if( $conn->connect_error )
    {
        returnWithError($conn->connect_error);
        exit();
    }

    $stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
    $stmt->execute();

    if($stmt->affected_rows > 0) 
    {
        returnWithInfo($conn->insert_id);
    }
    else
    {
        returnWithError("Could not add contact");
    }

    $stmt->close();
    $conn->close();

    function getRequestInfo()
    {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if (is_array($data))
        {
            return $data;
        } else {
            return [];
        }
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"contactId":0,"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($contactId)
    {
        $retValue = '{"contactId":' . $contactId . ',"error":""}';
        sendResultInfoAsJson($retValue);
    }
?>