<?php
/****************************************************************************************
 *  predict.php  –  PHP → FastAPI proxy with full CORS support + session auth + logging
 ****************************************************************************************/

// ---------- CORS HEADERS (must be at top, before ANY output) ----------
$ALLOWED_ORIGIN = "http://localhost:3000";

header("Access-Control-Allow-Origin: $ALLOWED_ORIGIN");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ---------- Include app bootstrap files ----------
require_once __DIR__ . "/init.php";
require_once __DIR__ . "/db.php";

// ---------- Enforce authenticated user ----------
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized - please login first"]);
    exit();
}

// ---------- Only allow POST ----------
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

// ---------- Read JSON body ----------
$body = file_get_contents("php://input");
if (!$body) {
    http_response_code(400);
    echo json_encode(["error" => "Empty request body"]);
    exit();
}

// ---------- Forward request to FastAPI ----------
$FAST_API_URL = "http://127.0.0.1:8000/predict";  // Adjust if FastAPI runs on another port

$ch = curl_init($FAST_API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);
$curl_error = curl_error($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ---------- Handle FastAPI connection failure ----------
if ($curl_error) {
    http_response_code(502);
    echo json_encode([
        "error" => "Failed to contact model service",
        "details" => $curl_error
    ]);
    exit();
}

// ---------- Log prediction into database (best-effort) ----------
try {
    $stmt = $pdo->prepare("
        INSERT INTO predictions (user_id, input_json, output_json)
        VALUES (:uid, :input, :output)
    ");
    $stmt->execute([
        ":uid" => $_SESSION["user_id"],
        ":input" => $body,
        ":output" => $response
    ]);
} catch (Exception $e) {
    error_log("Prediction logging failed: " . $e->getMessage());
    // Do NOT stop execution. Logging is optional.
}

// ---------- Return FastAPI response ----------
header("Content-Type: application/json");
http_response_code($http_status ?: 200);
echo $response;
exit();
