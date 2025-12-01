<?php
// api/admin_stats.php
require_once __DIR__ . '/require_role.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(['error'=>'Method not allowed'], 405);
require_role('admin');

try {
    $r = [];
    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM users");
    $r['user_count'] = (int)$stmt->fetchColumn();

    // predictions table optional
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM predictions");
        $r['prediction_count'] = (int)$stmt->fetchColumn();
    } catch (PDOException $e) {
        // table may not exist
        $r['prediction_count'] = null;
    }

    respond(['stats' => $r]);
} catch (PDOException $e) {
    respond(['error' => 'Failed to load stats'], 500);
}
