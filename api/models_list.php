<?php
// api/models_list.php
// Returns list of models. Only admin can see/manage models (we enforce role).
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/require_role.php';

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(['error' => 'Method not allowed'], 405);

// ensure admin
require_role('admin');

try {
    $stmt = $pdo->query("SELECT id, name, version, filepath, active, notes, created_at FROM models ORDER BY created_at DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respond(['models' => $rows], 200);
} catch (Exception $e) {
    error_log("models_list error: " . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
