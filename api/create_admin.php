<?php
// api/create_admin.php
require_once __DIR__ . '/db.php';

$username = 'admin';
$email = 'admin@example.com';
$password = 'Admin@123'; // change immediately

$hash = password_hash($password, PASSWORD_DEFAULT);
try {
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (:u,:e,:p,'admin')");
    $stmt->execute([':u'=>$username, ':e'=>$email, ':p'=>$hash]);
    echo "OK: admin created. Username: $username Password: $password - delete this file now.";
} catch (PDOException $e) {
    echo "Error: ". $e->getMessage();
}
