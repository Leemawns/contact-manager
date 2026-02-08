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
        



    }


?>