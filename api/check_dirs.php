<?php
$base = realpath(__DIR__ . '/..');
$dirs = [$base . '/datasets', $base . '/saved_models'];
$out = [];
foreach ($dirs as $d) {
    $out[$d] = [
        'exists' => file_exists($d),
        'is_writable' => is_writable($d)
    ];
}
header('Content-Type: application/json');
echo json_encode($out, JSON_PRETTY_PRINT);
