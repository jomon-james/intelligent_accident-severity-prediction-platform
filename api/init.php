<?php
// api/init.php
// Central init for API: CORS headers, session, helpers.

error_reporting(E_ALL);
ini_set('display_errors', '0'); // set to '1' for dev debugging if needed

// Allowed origins for development (frontend)
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Allow credentials (cookies / PHP session)
header('Access-Control-Allow-Credentials: true');

// Allow these headers & methods for preflight
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Optional: recommend JSON responses by default (endpoints can override)
header('Content-Type: application/json; charset=utf-8');

// If this is a preflight request, return immediately with 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // No body for preflight
    http_response_code(200);
    exit;
}

// Start session (so session cookie works)
if (session_status() === PHP_SESSION_NONE) {
    // Set SameSite=None to allow cross-site cookies from Chrome if using https.
    // On localhost, modern browsers allow cookies with SameSite=None only over HTTPS,
    // but Chrome/Firefox are tolerant on localhost. Keep HttpOnly.
    session_start();
}

/**
 * Small helper to send JSON responses
 */
function respond($data, $status = 200) {
    http_response_code($status);
    // ensure correct header
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
