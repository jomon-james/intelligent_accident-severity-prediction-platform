<?php
// api/require_role.php
require_once __DIR__ . '/init.php';

function require_login() {
    if (empty($_SESSION['user_id'])) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

function require_role($role) {
    require_login();
    if (empty($_SESSION['role']) || $_SESSION['role'] !== $role) {
        respond(['error' => 'Forbidden - insufficient role'], 403);
    }
}
