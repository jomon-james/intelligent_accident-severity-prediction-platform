<?php
// api/upload_dataset.php
// Production / non-debug version.
// Accepts POST multipart/form-data:
//  - file: CSV file
//  - target_column: (optional) name of target column from header
//
// Returns JSON:
//  { success: true, dataset: { id, filename, filepath, target_column, rows_count, cols } }
// or { error: 'message' } with appropriate HTTP status codes.

require_once __DIR__ . '/init.php';
require_once __DIR__ . '/db.php';

// Respond to preflight (init.php handles OPTIONS globally but be defensive)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

// Require authenticated user
if (empty($_SESSION['user_id'])) {
    respond(['error' => 'Unauthorized'], 401);
}

// Validate upload presence
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    respond(['error' => 'No file uploaded or upload error'], 400);
}

$uploaddir = __DIR__ . '/datasets';
if (!is_dir($uploaddir)) {
    if (!mkdir($uploaddir, 0755, true)) {
        respond(['error' => 'Failed to create datasets directory'], 500);
    }
}

$uploaded = $_FILES['file'];
$origName = basename($uploaded['name']);
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
$allowed = ['csv', 'txt'];

if (!in_array($ext, $allowed, true)) {
    respond(['error' => 'Only CSV/TXT files are allowed'], 400);
}

// Sanitize base filename and add timestamp to avoid collisions
$safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($origName, PATHINFO_FILENAME));
$targetFile = $uploaddir . '/' . $safeBase . '_' . time() . '.' . $ext;
$relativePath = 'datasets/' . basename($targetFile);

// Move uploaded file
if (!move_uploaded_file($uploaded['tmp_name'], $targetFile)) {
    respond(['error' => 'Failed to save uploaded file'], 500);
}

// Quick CSV header + row count read
$rowsCount = null;
$colsInfo = null;
if (($handle = fopen($targetFile, 'r')) !== false) {
    $header = fgetcsv($handle);
    if ($header === false || count($header) < 1) {
        @unlink($targetFile);
        respond(['error' => 'Uploaded file is not a valid CSV (no header found)'], 400);
    }
    $cols = array_map('trim', $header);
    $colsInfo = json_encode(array_values($cols));

    // Count rows up to a safe cap to avoid huge loops
    $count = 0;
    while (($row = fgetcsv($handle)) !== false) {
        $count++;
        if ($count > 100000) break;
    }
    $rowsCount = $count;
    fclose($handle);
} else {
    // if file cannot be read
    @unlink($targetFile);
    respond(['error' => 'Failed to read uploaded file'], 500);
}

// Validate optional target column
$target_column = isset($_POST['target_column']) ? trim((string)$_POST['target_column']) : null;
if ($target_column !== null && $target_column !== '' && !in_array($target_column, json_decode($colsInfo, true))) {
    // target not found in header — reject (or you could accept null)
    respond(['error' => 'Selected target column not found in CSV header'], 400);
}

// Insert metadata into DB
try {
    $stmt = $pdo->prepare("
        INSERT INTO datasets (user_id, filename, filepath, target_column, rows_count, cols_info)
        VALUES (:uid, :fn, :fp, :tc, :rc, :ci)
    ");
    $stmt->execute([
        ':uid' => (int)$_SESSION['user_id'],
        ':fn'  => $origName,
        ':fp'  => $relativePath,
        ':tc'  => $target_column,
        ':rc'  => $rowsCount,
        ':ci'  => $colsInfo
    ]);
    $id = (int)$pdo->lastInsertId();

    respond([
        'success' => true,
        'dataset' => [
            'id' => $id,
            'filename' => $origName,
            'filepath' => $relativePath,
            'target_column' => $target_column,
            'rows_count' => $rowsCount,
            'cols' => json_decode($colsInfo, true)
        ]
    ], 201);
} catch (PDOException $e) {
    // Log internal error to server log for debugging, do NOT expose details to clients
    error_log("upload_dataset.php DB error: " . $e->getMessage());
    // Remove saved file to avoid orphan files if DB insert failed
    @unlink($targetFile);
    respond(['error' => 'Database insert failed'], 500);
}
