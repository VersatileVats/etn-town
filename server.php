<?php
    // Enable CORS
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    header("Access-Control-Allow-Origin: *");
    header('content-type: application/json; charset=utf-8');

    // other dependencies
    require '/home/u195637119/domains/hackathonmaverick.in/public_html/phpComposer/phpmailer/vendor/autoload.php';
    require '/home/u195637119/domains/hackathonmaverick.in/public_html/phpComposer/dotEnv/vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable("/home/u195637119/domains/hackathonmaverick.in/public_html/phpComposer");
    $dotenv->load();
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    
    // Connect to the database
    $servername = $_ENV['REMOTE_SQL_IP'];
    $dbname = $_ENV['DB_2_NAME'];
    $password = $_ENV['DB_2_PWD'];
    $username = $_ENV['DB_2_USER'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Function to calculate the number of days between two dates
    function diffBtwDates($date1, $date2) {
        $diff = strtotime($date2) - strtotime($date1);
        return floor($diff / (60 * 60 * 24));
    }

    $action = $_GET['action'];

    if (php_sapi_name() === 'cli') {
        $action = 'distributeWeeklyRewards';
        echo "Distributing the weekly rewards via the CLI..";
    }

    // Handle the login/signup process
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'userDetails') {
        $input = json_decode(file_get_contents('php://input'), true);
        $walletAdd = $input['wallet'];

        if (empty($walletAdd)) {
            http_response_code(400);
            echo json_encode(["message" => "ERROR:Invalid wallet address"]);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $walletAdd);
        $stmt->execute();
        $result = $stmt->get_result();

        $d = date('Y-m-d');

        if ($result->num_rows == 0) {
            $stmt = $conn->prepare("INSERT INTO tronplay (walletAddress, lastLogin, doj) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $walletAdd, $d, $d);
            $stmt->execute();

            echo json_encode([
                "streak" => 0,
                "earnedTRX" => 0,
                "score" => 0,
                "songs" => "1",
                "txnHashes" => [],
                "loggedInToday" => false,
                "visited" => 0,
                "flipLevel" => 1,
                "mazeLevel" => 1,
                "videoLevel" => 1,
                "npatLevels" => ""
            ]);
        } else {
            $user = $result->fetch_assoc();
            $diff = diffBtwDates($user['lastLogin'], date('Y-m-d'));
            $streak = $user['streak'];

            $visited = 0;

            if ($diff == 1) {
                $streak++;
                $stmt = $conn->prepare("UPDATE tronplay SET streak = ?, lastLogin = ? WHERE walletAddress = ?");
                $stmt->bind_param("iss", $streak, $d, $walletAdd);
                $stmt->execute();
            } elseif ($diff > 1) {
                $streak = 0;
                $stmt = $conn->prepare("UPDATE tronplay SET streak = 0, lastLogin = ? WHERE walletAddress = ?");
                $stmt->bind_param("ss", $d, $walletAdd);
                $stmt->execute();
            } else if($diff == 0) {
                $visited = 1;
            }

            $txnHashes = [];
            $txnStmt = $conn->prepare("SELECT * FROM tronplayPayments WHERE walletAddress = ?");
            $txnStmt->bind_param("s", $walletAdd);
            $txnStmt->execute();
            $txnResult = $txnStmt->get_result();

            while ($txnRow = $txnResult->fetch_assoc()) {
                $txnHashes[] = [
                    "explorer" => $txnRow["explorer"],
                    "txnHash" => $txnRow["txnHash"],
                    "memo" => $txnRow["memo"],
                    "trx" => $txnRow["trx"]
                ];
            }

            $loggedInToday = ($diff == 0);
            echo json_encode([
                "streak" => $streak,
                "earnedTRX" => $user['earnedTRX'],
                "score" => $user['score'],
                "songs" => $user['songs'],
                "txnHashes" => $txnHashes,
                "loggedInToday" => $loggedInToday,
                "npatLevels" => $user['npatLevels'],
                "visited" => $visited,
                "flipLevel" => $user['flipLevel'],
                "mazeLevel" => $user['mazeLevel'],
                "videoLevel" => $user['videoLevel']
            ]);
        }
        exit();
    }

    // Handle updateScore request
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'updateScore') {
        $input = json_decode(file_get_contents('php://input'), true);
        $wallet = $input['wallet'];
        $score = $input['score'];

        $stmt = $conn->prepare("SELECT score FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $newScore = $user['score'] + (int)$score;

            $stmt = $conn->prepare("UPDATE tronplay SET score = ? WHERE walletAddress = ?");
            $stmt->bind_param("is", $newScore, $wallet);
            $stmt->execute();

            echo json_encode(["message" => "Score updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "User not found"]);
        }
        exit();
    }

    // Handle updateSongs request
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'updateSongs') {
        $input = json_decode(file_get_contents('php://input'), true);
        $song = $input['song'];
        $wallet = $input['wallet'];

        $stmt = $conn->prepare("SELECT songs FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (!strpos($user['songs'], $song)) {
                $updatedSongs = $user['songs'] . $song;
                $stmt = $conn->prepare("UPDATE tronplay SET songs = ? WHERE walletAddress = ?");
                $stmt->bind_param("ss", $updatedSongs, $wallet);
                $stmt->execute();

                echo json_encode(["message" => "Song updated"]);
            } else {
                echo json_encode(["message" => "Song already purchased"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "User not found"]);
        }
        exit();
    }

    // Handle updateTADA request
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'updateTADA') {
        $input = json_decode(file_get_contents('php://input'), true);
        $trx = $input['trx'];
        $wallet = $input['wallet'];

        $stmt = $conn->prepare("SELECT earnedTRX FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $newTADA = $user['earnedTRX'] + (int)$trx;

            $stmt = $conn->prepare("UPDATE tronplay SET earnedTRX = ? WHERE walletAddress = ?");
            $stmt->bind_param("is", $newTADA, $wallet);
            $stmt->execute();

            echo json_encode(["message" => "TADA updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "User not found"]);
        }
        exit();
    }

    // Handle updateHashes request
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'updateHashes') {
        $input = json_decode(file_get_contents('php://input'), true);
        $memo = $input['memo'];
        $wallet = $input['wallet'];
        $txnHash = $input['txnHash'];
        $explorer = $input['explorer'];
        $timestamp = $input['timestamp'];

        $stmt = $conn->prepare("SELECT * FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $stmt = $conn->prepare("INSERT INTO tronplayPayments (walletAddress, txnHash, memo, trx, explorer) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssss", $wallet, $txnHash, $memo, $timestamp, $explorer);
            $stmt->execute();

            echo json_encode(["message" => "Hash updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "User not found"]);
        }
        exit();
    }

    // Handle weeklyRewards request
    if ($_SERVER['REQUEST_METHOD'] == 'GET' && $action == 'weeklyRewards') {
        $stmt = $conn->prepare("SELECT * FROM tronplay WHERE score > 0 AND id > 81 ORDER BY score DESC");
        $stmt->execute();
        $result = $stmt->get_result();

        $users = [];
        while ($user = $result->fetch_assoc()) {
            $users[] = $user;
        }

        echo json_encode($users);
        exit();
    }
    
    // Handle updateLevel request
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && $action == 'updateLevel') {
        $input = json_decode(file_get_contents('php://input'), true);
        $game = $input['game'];
        $level = $input['level'];
        $wallet = $input['wallet'];

        $stmt = $conn->prepare("SELECT earnedTRX FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $stmt = $conn->prepare("UPDATE tronplay SET ".$game." = ? WHERE walletAddress = ?");
            $stmt->bind_param("is", $level, $wallet);
            $stmt->execute();

            echo json_encode(["message" => "Level updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "User not found"]);
        }
        exit();
    }

    // updating the npatLevels
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $action == "updateNPATLevel") {
        $input = json_decode(file_get_contents('php://input'), true);
        $wallet = $input['wallet'];
        $npatLevel = $input['npatLevel'];

        $stmt = $conn->prepare("SELECT earnedTRX FROM tronplay WHERE walletAddress = ?");
        $stmt->bind_param("s", $wallet);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (!strpos($user['songs'], $song)) {
                $updatedSongs = $user['songs'] . $song;
                $stmt = $conn->prepare("UPDATE tronplay SET npatLevels = ? WHERE walletAddress = ?");
                $stmt->bind_param("ss", $npatLevel, $wallet);
                $stmt->execute();

                echo json_encode(["message" => "NPAT level updated"]);
            } else {
                echo json_encode(["error" => "Level already cleared"]);
            }
        }  else {
            http_response_code(400);
            echo json_encode(["error" => "User not found"]);
        }
        exit();
    }
    
    // for rewarding the best player
    if($action == "distributeWeeklyRewards") {
        $stmt = $conn->prepare("
            SELECT walletAddress, score, earnedTRX 
            FROM tronplay 
            WHERE id > 81 AND score > 0
            ORDER BY score DESC 
            LIMIT 1
        ");

        $stmt->execute();
        $result = $stmt->get_result();
        $winner = $result->fetch_assoc();

        if (!$winner) {
            echo "No winner found this week as none played the game";
            exit();
        }

        // Wallet address of the winner
        $wallet = $winner['walletAddress'];
        $rewardAmount = 0.0025;

        // API URL to credit the reward
        $apiUrl = "https://etn-server-clashingvats-dev.apps.rm2.thpm.p1.openshiftapps.com/sendETN";

        $data = [
            "receiver" => $wallet,
            "amount" => $rewardAmount,
            "memo" => "Weekly Top Scorer Reward"
        ];

        $options = [
            "http" => [
                "header"  => "Content-Type: application/json",
                "method"  => "POST",
                "content" => json_encode($data)
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($apiUrl, false, $context);
        $responseData = json_decode($response, true);
        
        // Reset all participants' scores to zero
        $resetStmt = $conn->prepare("UPDATE tronplay SET score = 0 WHERE id > 81");
        $resetStmt->execute();

        echo "Reward sent to: $wallet";

        // Update the "earnedTRX" field before resetting scores
        $newEarnedTRX = (float)($winner['earnedTRX'] ?? 0) + $rewardAmount;
        $updateTRX = $conn->prepare("UPDATE tronplay SET earnedTRX = ? WHERE walletAddress = ?");
        $updateTRX->bind_param("ds", $newEarnedTRX, $wallet);
        $updateTRX->execute();
        
        // create the txn in database
        $trxTime = (string) round(microtime(true) * 1000);
        $txnHash = $responseData['success'];
        $memo = "Winning the weekly rewards";
        $explorer = "https://blockexplorer.electroneum.com";
        
        $stmt = $conn->prepare("INSERT INTO tronplayPayments (walletAddress, txnHash, memo, trx, explorer) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $wallet, $txnHash, $memo, $trxTime, $explorer);
        $stmt->execute();

        exit();
    }

    // Default case for undefined actions
    if (!isset($action) || !in_array($action, ['userDetails', 'updateScore', 'updateSongs', 'updateTADA', 'updateHashes', 'weeklyRewards', 'updateLevel', 'updateNPATLevel', 'distributeWeeklyRewards'])) {
        http_response_code(400);
        echo json_encode(["message" => "ERROR:Invalid or undefined action"]);
        exit();
    }

    // Close the connection
    $conn->close();
?>
