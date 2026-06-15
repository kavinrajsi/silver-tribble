<?php
/**
 * Samriddhi 400 — "Apply now" lead form handler.
 *
 * Receives the form POST (via fetch or a normal submit), re-validates every
 * field server-side, and — when valid — emails the lead to the configured
 * To / Cc / Bcc recipients.
 *
 * Responds with JSON: { success: bool, message: string, errors?: {field: msg} }
 *
 * NOTE: requires a PHP-capable host. The local Gulp/BrowserSync dev server
 * serves static files only and will NOT execute this file.
 */

// ---------------------------------------------------------------------------
// Configuration — set these to the desired recipients.
// Comma-separate multiple addresses in any of the three.
// Environment variables (if present) take precedence so you can keep real
// addresses out of source control.
// ---------------------------------------------------------------------------
$MAIL_TO   = getenv('LEAD_MAIL_TO')   ?: 'leads@example.com';
$MAIL_CC   = getenv('LEAD_MAIL_CC')   ?: '';
$MAIL_BCC  = getenv('LEAD_MAIL_BCC')  ?: '';
$MAIL_FROM = getenv('LEAD_MAIL_FROM') ?: 'no-reply@example.com';
$MAIL_SUBJECT = 'New Samriddhi 400 enquiry';

// Cities offered in the form's dropdown. Must stay in sync with the
// <select id="apply-city"> options in index.html.
$ALLOWED_CITIES = array(
    'Ahmedabad',
    'Bengaluru',
    'Chennai',
    'Coimbatore',
    'Delhi',
    'Hyderabad',
    'Karur',
    'Kochi',
    'Kolkata',
    'Madurai',
    'Mumbai',
    'Pune',
    'Salem',
    'Tiruchirappalli',
    'Tirunelveli',
    'Vijayawada',
    'Visakhapatnam',
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Send a JSON response and stop. */
function respond($code, $payload) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

/** Trim + collapse a posted scalar; returns '' for anything non-scalar. */
function field($name) {
    if (!isset($_POST[$name]) || !is_scalar($_POST[$name])) {
        return '';
    }
    return trim((string) $_POST[$name]);
}

/**
 * Strip CR/LF so user input can never be smuggled into mail headers
 * (header-injection protection).
 */
function header_safe($value) {
    return str_replace(array("\r", "\n", "%0a", "%0d"), '', $value);
}

// ---------------------------------------------------------------------------
// Only accept POST
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, array(
        'success' => false,
        'message' => 'Method not allowed.',
    ));
}

// ---------------------------------------------------------------------------
// Collect input
// ---------------------------------------------------------------------------
$name     = field('name');
$mobile   = field('mobile');
$email    = field('email');
$city     = field('city');
$pincode  = field('pincode');
$comments = field('comments');
$consent  = field('consent'); // checkbox: present (e.g. "on") when checked

// ---------------------------------------------------------------------------
// Validate — mirrors the client-side rules so the server is authoritative.
// ---------------------------------------------------------------------------
$errors = array();

if ($name === '') {
    $errors['name'] = 'Please enter your name.';
} elseif (mb_strlen($name) < 2) {
    $errors['name'] = 'Name must be at least 2 characters.';
} elseif (!preg_match("/^[a-zA-Z][a-zA-Z .'-]*$/", $name)) {
    $errors['name'] = 'Please enter a valid name.';
}

if ($mobile === '') {
    $errors['mobile'] = 'Please enter your mobile number.';
} elseif (!preg_match('/^[6-9]\d{9}$/', $mobile)) {
    $errors['mobile'] = 'Please enter a valid 10-digit mobile number.';
}

if ($email === '') {
    $errors['email'] = 'Please enter your email address.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}

if ($city === '') {
    $errors['city'] = 'Please select a city.';
} elseif (!in_array($city, $ALLOWED_CITIES, true)) {
    $errors['city'] = 'Please select a valid city.';
}

if ($pincode === '') {
    $errors['pincode'] = 'Please enter your pincode.';
} elseif (!preg_match('/^\d{6}$/', $pincode)) {
    $errors['pincode'] = 'Please enter a valid 6-digit pincode.';
}

if ($consent === '') {
    $errors['consent'] = 'Please provide your consent to proceed.';
}

if (!empty($errors)) {
    respond(422, array(
        'success' => false,
        'message' => 'Please correct the highlighted fields and try again.',
        'errors'  => $errors,
    ));
}

// ---------------------------------------------------------------------------
// Build the email
// ---------------------------------------------------------------------------
$lines = array(
    'A new enquiry was submitted for the Samriddhi 400 scheme.',
    '',
    'Name:     ' . $name,
    'Mobile:   ' . $mobile,
    'Email:    ' . $email,
    'City:     ' . $city,
    'Pincode:  ' . $pincode,
    'Comments: ' . ($comments !== '' ? $comments : '-'),
    '',
    'Submitted: ' . date('Y-m-d H:i:s'),
    'IP:        ' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown'),
);
$body = implode("\n", $lines);

$fromName  = header_safe($name);
$fromEmail = header_safe($MAIL_FROM);
$replyTo   = header_safe($email);

$headers = array();
$headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . $replyTo;
if (trim($MAIL_CC) !== '') {
    $headers[] = 'Cc: ' . header_safe($MAIL_CC);
}
if (trim($MAIL_BCC) !== '') {
    $headers[] = 'Bcc: ' . header_safe($MAIL_BCC);
}
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$subject = header_safe($MAIL_SUBJECT) . ' — ' . $fromName;

$sent = mail(
    header_safe($MAIL_TO),
    $subject,
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    respond(500, array(
        'success' => false,
        'message' => 'We could not send your application right now. Please try again later.',
    ));
}

respond(200, array(
    'success' => true,
    'message' => 'Thank you! Your application has been submitted. We will get in touch shortly.',
));
