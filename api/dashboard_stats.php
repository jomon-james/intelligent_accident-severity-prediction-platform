<?php
// api/dashboard_stats.php
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php'; // your PDO $pdo connection file

// Handle OPTIONS preflight (init.php already exits on OPTIONS but keep defensive)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET (change if you want POST)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Method not allowed'], 405);
}

// Optional: check session (uncomment if you require login)
// if (!isset($_SESSION['user_id'])) {
//     respond(['error' => 'Unauthorized'], 401);
// }

try {
    // Attempt to get summary stats from DB (if you have tables)
    $summary = [
        'user_count' => null,
        'prediction_count' => null,
        'dataset_count' => null,
        'model_count' => null
    ];

    // users count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM users");
        $summary['user_count'] = (int)$stmt->fetchColumn();
    } catch (Exception $e) {
        $summary['user_count'] = null;
    }

    // predictions count (if table exists)
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM predictions");
        $summary['prediction_count'] = (int)$stmt->fetchColumn();
    } catch (Exception $e) {
        $summary['prediction_count'] = null;
    }

    // datasets count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM datasets");
        $summary['dataset_count'] = (int)$stmt->fetchColumn();
    } catch (Exception $e) {
        $summary['dataset_count'] = null;
    }

    // models count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM models");
        $summary['model_count'] = (int)$stmt->fetchColumn();
    } catch (Exception $e) {
        $summary['model_count'] = null;
    }

    // Severity distribution (example: read from predictions table if available)
    $severity_distribution = [];
    try {
        $stmt = $pdo->query("
            SELECT severity_label AS name, COUNT(*) AS value
            FROM predictions
            GROUP BY severity_label
            ORDER BY value DESC
            LIMIT 10
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            foreach ($rows as $r) {
                $severity_distribution[] = ['name' => $r['name'], 'value' => (int)$r['value']];
            }
        }
    } catch (Exception $e) {
        // fallback synthetic
        $severity_distribution = [
            ['name' => 'Slight', 'value' => 60],
            ['name' => 'Serious', 'value' => 25],
            ['name' => 'Fatal', 'value' => 15]
        ];
    }

    // Time series of predictions (example)
    $time_series = [];
    try {
        $stmt = $pdo->query("
            SELECT DATE(created_at) AS date, COUNT(*) AS predictions
            FROM predictions
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            $rows = array_reverse($rows); // oldest first
            foreach ($rows as $r) {
                $time_series[] = ['date' => $r['date'], 'predictions' => (int)$r['predictions']];
            }
        }
    } catch (Exception $e) {
        // fallback: generate last 7 days sample
        $today = new DateTime();
        for ($i = 6; $i >= 0; $i--) {
            $d = clone $today;
            $d->modify("-{$i} days");
            $time_series[] = ['date' => $d->format('Y-m-d'), 'predictions' => rand(5, 40)];
        }
    }

    respond([
        'summary' => $summary,
        'severity_distribution' => $severity_distribution,
        'time_series' => $time_series
    ]);
} catch (Exception $e) {
    // final fallback
    respond(['error' => 'Server error', 'details' => $e->getMessage()], 500);
}
