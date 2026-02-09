<?php
    $inData = getRequestInfo();

    if(!isset($inData["userId"], $inData["contactId"], $inData["firstName"], $inData["lastName"], $inData["phone"], $inData["email"]))
    {
        returnWithError("Missing required field(s)");
        exit();
    }

    $userId = (int)$inData["userId"];
    $contactId = (int)$inData["contactId"];
    $firstName = trim($inData["firstName"]);
    $lastName = trim($inData["lastName"]);
    $phone = trim($inData["phone"]);
    $email = trim($inData["email"]);

    if($userId <= 0 || $contactId <= 0 || $firstName === "" || $lastName === "" || $phone === "" || $email === "")
    {
        returnWithError("Fields cannot be empty");
        exit();
    }

    $conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager");

    if($conn->connect_error)
    {
        returnWithError($conn->connect_error);
        exit();
    }

    $stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?");
    $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);
    $stmt->execute();

    if($stmt->affected_rows > 0)
    {
        returnWithInfo();
    }
    else
    {
        returnWithError("Contact not found or no changes made");
    }

    $stmt->close();
    $conn->close();

    function getRequestInfo()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if(is_array($data))
        {
            return $data;
        }
        else
        {
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
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo()
    {
        $retValue = '{"error":""}';
        sendResultInfoAsJson($retValue);
    }

?>