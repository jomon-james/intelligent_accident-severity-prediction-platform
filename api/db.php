<?php
// api/db.php
// Update the DB credentials to match your project/environment.

$DB_HOST = '127.0.0.1';
$DB_NAME = 'mcaproject';     // <-- change
$DB_USER = 'root';     // <-- change
$DB_PASS = 'jomon27james'; // <-- change

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
