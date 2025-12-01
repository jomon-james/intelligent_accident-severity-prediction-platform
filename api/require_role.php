<?php
// api/require_role.php
require_once __DIR__ . '/init.php';

// Call like: require_role('admin');
function require_role($role) {
    if (!isset($_SESSION['user_id'])) {
        respond(['error' => 'Unauthorized'], 401);
    }
    $user_role = $_SESSION['user_role'] ?? null;
    if ($user_role !== $role) {
        respond(['error' => 'Forbidden: insufficient role'], 403);
    }
}
