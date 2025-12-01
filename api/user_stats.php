<?php
// user_stats.php — returns simple stats for logged-in user
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    respond(['error' => 'Unauthorized'], 401);
}

$uid = (int)$_SESSION['user_id'];

try {
    // datasets count
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM datasets WHERE user_id = :uid");
    $stmt->execute([':uid' => $uid]);
    $datasets_count = (int)$stmt->fetchColumn();

    // predictions count
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM predictions WHERE user_id = :uid");
    $stmt->execute([':uid' => $uid]);
    $predictions_count = (int)$stmt->fetchColumn();

    // active model info
    $stmt = $pdo->query("SELECT id, name, version, filepath, created_at FROM models WHERE active = 1 ORDER BY created_at DESC LIMIT 1");
    $model = $stmt->fetch(PDO::FETCH_ASSOC);

    respond([
        'datasets_count' => $datasets_count,
        'predictions_count' => $predictions_count,
        'active_model' => $model ?: null
    ], 200);
} catch (Exception $e) {
    error_log("user_stats error: " . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
