<?php
// register.php
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) respond(['error' => 'Invalid JSON'], 400);

$username = trim($input['username'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $email === '' || $password === '') {
    respond(['error' => 'Missing username, email or password'], 400);
}

// basic email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Invalid email'], 400);
}

try {
    // check username/email uniqueness
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :u OR email = :e LIMIT 1");
    $stmt->execute([':u' => $username, ':e' => $email]);
    if ($stmt->fetch(PDO::FETCH_ASSOC)) {
        respond(['error' => 'Username or email already exists'], 409);
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $insert = $pdo->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (:u, :e, :p, 'user')");
    $insert->execute([':u' => $username, ':e' => $email, ':p' => $password_hash]);

    $userId = (int)$pdo->lastInsertId();

    // Optionally auto-login: set session
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['user_role'] = 'user';

    $user_out = [
        'id' => $userId,
        'username' => $username,
        'email' => $email,
        'role' => 'user'
    ];

    respond(['success' => true, 'user' => $user_out], 201);

} catch (Exception $e) {
    error_log("Register error: " . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
