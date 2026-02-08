<?php
    $inData = getRequestInfo();

    if(!isset($inData["userId"], $inData["search"])){
        returnWithError("Missing required field(s).");
        exit()
    }

    $userId = (int)$inData["userId"];
    $search = $inData["search"];
    $searchResults = ""
    $searchCount = 0;

    if($userId <= 0){
        returnWIthError("Invalid input.");
        exit();
    }

    $conn = new mysqli("localhost", "contact_api", "1JERKApassword", "contact_manager");

    if($conn->connect_error){
        returnWithError($conn->connect_error)
    } 
    else {
        $stmt = $conn->prepare("select FirstName from Contacts where FirstName like ? and UserID = ?");
        $contactName = "%" . $search . "%";
        $stmt->bind_param("ss", $contactName, $search)
        $stmt->execute();

        while($row = $result->fetch_assoc()){
            if($searchCount > 0){
                $searchResults .= ",";
            }
            $searchCount++;
            $searchResults .= '"' . $row["FirstName"] . '"';
        }

        if($searchCOunt == 0){
            returnWithError("No Records Found");
            exit();
        } else {
            returnWithInfo($searchResults);
        }

        $stmt->close();
        $conn->close();
    }

    
?>