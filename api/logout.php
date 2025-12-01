<?php
// logout.php
require_once __DIR__ . '/init.php';

// destroy session server-side
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    // expire cookie in browser
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

respond(['success' => true], 200);
