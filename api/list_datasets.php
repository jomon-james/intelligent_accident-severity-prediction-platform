<?php
// api/list_datasets.php
// Returns datasets. Admin sees all; normal users see only their own datasets.
// Handles OPTIONS preflight for CORS.

require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

// respond to preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // init.php probably already set CORS headers, but respond OK for preflight
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    respond(['error' => 'Unauthorized'], 401);
}

try {
    $isAdmin = ($_SESSION['user_role'] ?? '') === 'admin';
    if ($isAdmin) {
        $stmt = $pdo->query("SELECT id, user_id, filename, filepath, target_column, created_at FROM datasets ORDER BY created_at DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare("SELECT id, user_id, filename, filepath, target_column, created_at FROM datasets WHERE user_id = :uid ORDER BY created_at DESC");
        $stmt->execute([':uid' => (int)$_SESSION['user_id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    respond(['datasets' => $rows], 200);
} catch (Exception $e) {
    error_log("list_datasets error: " . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
