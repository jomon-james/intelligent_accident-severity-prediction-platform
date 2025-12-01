<?php
/******************************************************************************
 * init.php — Global initialization for ALL API endpoints
 * - CORS headers
 * - OPTIONS preflight handler
 * - Session configuration
 * - JSON respond() helper
 ******************************************************************************/

// ---------- CORS CONFIG ----------
$ALLOWED_ORIGIN = "http://localhost:3000";

header("Access-Control-Allow-Origin: $ALLOWED_ORIGIN");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept, Authorization");

// Preflight handler
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ---------- SESSION CONFIG (Local Development) ----------
session_set_cookie_params([
    "lifetime" => 0,
    "path"     => "/",
    "domain"   => "",        // empty = same host (localhost)
    "secure"   => false,     // HTTPS only in production
    "httponly" => true,
    "samesite" => "Lax"      // Lax = works on localhost without HTTPS
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ---------- JSON RESPONSE HELPER ----------
function respond($data, $code = 200) {
    http_response_code($code);
    header("Content-Type: application/json");
    echo json_encode($data);
    exit();
}
