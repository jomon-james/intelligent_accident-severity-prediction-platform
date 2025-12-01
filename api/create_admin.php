<?php
// api/create_admin.php  -- DEV ONLY. Run once and DELETE.
// Creates an admin user. Do NOT leave this file on the server.

require_once __DIR__ . '/db.php';

$username = 'admin';
$email = 'admin@example.com';
$password_plain = 'Admin@123'; // change before running

$hash = password_hash($password_plain, PASSWORD_DEFAULT);

try {
    // Prefer password_hash column; fallback to password if you don't have password_hash
    // Try to insert into password_hash column; if it fails, insert into password.
    $inserted = false;

    // Try password_hash column first
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (:u, :e, :p, 'admin')");
        $stmt->execute([':u'=>$username, ':e'=>$email, ':p'=>$hash]);
        $inserted = true;
    } catch (PDOException $ex) {
        // fallback - maybe table has only `password` column
    }

    if (!$inserted) {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (:u, :e, :p, 'admin')");
        $stmt->execute([':u'=>$username, ':e'=>$email, ':p'=>$hash]);
        $inserted = true;
    }

    header('Content-Type: application/json');
    echo json_encode(['ok'=>true, 'msg'=>'Admin created. DELETE this file now.', 'username'=>$username, 'email'=>$email]);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['ok'=>false, 'error'=>$e->getMessage()]);
}
