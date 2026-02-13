<?php
    $inData = getRequestInfo();

    if(!isset($inData["userId"], $inData["search"]))
    {
        returnWithError("Missing required field(s).");
        exit();
    }

    $userId = (int)$inData["userId"];
    $search = trim((string)$inData["search"]);

    if($userId <= 0)
    {
        returnWithError("Invalid input.");
        exit();
    }

    $conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager");

    if($conn->connect_error)
    {
        returnWithError($conn->connect_error);
        exit();
    } 
    else 
    {
        $like = "%" . $search . "%";

        $stmt = $conn->prepare("select ID, FirstName, LastName, Phone, Email 
                                from Contacts where UserID = ? 
                                    and (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?) 
                                order by LastName, FirstName");

        if(!$stmt)
        {
            returnWithError("Prepare failed: " . $conn->error);
            $conn->close();
            exit();
        }

        $stmt->bind_param("issss", $userId, $like, $like, $like, $like);
        $stmt->execute();

        $result = $stmt->get_result();
        $results = [];

        while($row = $result->fetch_assoc())
        {
            $results[] = [
                "contactId" => (int)$row["ID"],
                "firstName" => $row["FirstName"],
                "lastName" => $row["LastName"],
                "phone" => $row["Phone"],
                "email" => $row["Email"]
            ];
        }

        $stmt->close();
        $conn->close();

        returnWithResults($results);
    }

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
        $retValue = json_encode(["results" => [], "error" => $err]);
        sendResultInfoAsJson($retValue);
    }

    function returnWithResults( $results )
    {
		$retValue = json_encode(["results" => $results, "error" => ""]);
		sendResultInfoAsJson( $retValue );
	}
?>