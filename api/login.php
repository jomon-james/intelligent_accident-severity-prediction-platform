<?php
// api/login.php (robust: supports multiple password column names)
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) respond(['error' => 'Invalid JSON'], 400);

$identifier = trim($input['identifier'] ?? '');
$password = $input['password'] ?? '';

if ($identifier === '' || $password === '') {
    respond(['error' => 'Missing username/email or password'], 400);
}

try {
    // Select all columns for the matched user so we can handle different schemas
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :id OR email = :id LIMIT 1");
    $stmt->execute([':id' => $identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        respond(['error' => 'Invalid credentials'], 401);
    }

    // Determine which password column the table uses
    $pwFields = ['password_hash', 'password', 'passwd', 'pwd']; // common names
    $foundPwField = null;
    foreach ($pwFields as $f) {
        if (array_key_exists($f, $user)) {
            $foundPwField = $f;
            break;
        }
    }

    if (!$foundPwField) {
        // No password-like column found — return helpful error
        error_log("Login failed: no password column found in users table. Available columns: " . implode(", ", array_keys($user)));
        respond(['error' => 'Server error: user table missing password column (expected password_hash or password). Contact admin.'], 500);
    }

    $stored = $user[$foundPwField];

    $auth_ok = false;
    // If the stored value looks like a password_hash (starts with $2y$ or contains $), try password_verify
    if ($foundPwField === 'password_hash' || (is_string($stored) && strpos($stored, '$') === 0)) {
        if (password_verify($password, $stored)) $auth_ok = true;
    } else {
        // fallback: direct comparison (likely plaintext) — not recommended
        if ($password === $stored) {
            $auth_ok = true;
            error_log("Warning: user {$user['username']} authenticated using plaintext password comparison. Consider migrating to password_hash()");
        }
    }

    if (!$auth_ok) {
        respond(['error' => 'Invalid credentials'], 401);
    }

    // Successful login — set session
    $_SESSION['user_id']   = (int)$user['id'];
    $_SESSION['username']  = $user['username'] ?? '';
    // If role column exists use it, otherwise default to 'user'
    $_SESSION['user_role'] = $user['role'] ?? 'user';

    $user_out = [
        'id'       => (int)$user['id'],
        'username' => $user['username'] ?? '',
        'email'    => $user['email'] ?? null,
        'role'     => $_SESSION['user_role']
    ];

    respond(['success' => true, 'user' => $user_out], 200);

} catch (Throwable $e) {
    error_log("Login exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    respond(['error' => 'Server error'], 500);
}
