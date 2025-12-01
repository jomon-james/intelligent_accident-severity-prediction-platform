<?php
// me.php
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    respond(['user' => null], 200);
}

try {
    $stmt = $pdo->prepare("SELECT id, username, email, role FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => (int)$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // session exists but user not found
        respond(['user' => null], 200);
    }

    $user_out = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ];

    respond(['user' => $user_out], 200);

} catch (Exception $e) {
    error_log("me.php error: " . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
