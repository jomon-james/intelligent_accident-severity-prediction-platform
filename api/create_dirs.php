<?php
// api/create_dirs.php  (run once, then DELETE or protect)
$base = realpath(__DIR__ . 'C:\xampp\htdocs\my-project\api'); // project root: htdocs/my-project
$dirs = [
    $base . '/datasets',
    $base . '/saved_models',
];

$result = [];
foreach ($dirs as $d) {
    if (!file_exists($d)) {
        $ok = mkdir($d, 0755, true);
        $result[$d] = $ok ? 'created' : 'failed';
    } else {
        $result[$d] = 'exists';
    }
    // try to set permissions (best effort)
    @chmod($d, 0755);
}
header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
