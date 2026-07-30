<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Something went wrong — LetsBook</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|lexend:600,700,800" rel="stylesheet">
<style>
 :root {
 --primary: #0284c7;
 --primary-dark: #0369a1;
 --ink: #0f172a;
 --muted: #64748b;
 --border: #e2e8f0;
 --bg: #f8fafc;
 }
 * { box-sizing: border-box; }
 body {
 margin: 0;
 min-height: 100dvh;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 24px;
 background: var(--bg);
 font-family: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
 color: var(--ink);
 }
 .logo {
 display: flex;
 align-items: center;
 gap: 8px;
 text-decoration: none;
 margin-bottom: 28px;
 }
 .logo-mark {
 width: 32px;
 height: 32px;
 border-radius: 8px;
 background: var(--primary);
 display: flex;
 align-items: center;
 justify-content: center;
 box-shadow: 0 4px 10px -2px rgba(2, 132, 199, 0.35);
 }
 .logo-mark svg { width: 19px; height: 19px; }
 .logo-text {
 font-family: 'Lexend', 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
 font-weight: 800;
 font-size: 18px;
 color: var(--ink);
 letter-spacing: -0.2px;
 }
 .card {
 width: 100%;
 max-width: 440px;
 background: #ffffff;
 border: 1px solid var(--border);
 border-radius: 20px;
 box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -12px rgba(15, 23, 42, 0.12);
 padding: 40px 32px;
 text-align: center;
 }
 .icon {
 width: 64px;
 height: 64px;
 margin: 0 auto 20px;
 border-radius: 50%;
 background: #f0f9ff;
 display: flex;
 align-items: center;
 justify-content: center;
 }
 h1 {
 font-family: 'Lexend', 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
 font-size: 21px;
 font-weight: 700;
 margin: 0 0 10px;
 letter-spacing: -0.3px;
 }
 p {
 margin: 0;
 font-size: 14.5px;
 line-height: 1.6;
 color: var(--muted);
 }
 .actions {
 margin-top: 26px;
 display: flex;
 flex-direction: column;
 gap: 10px;
 }
 .btn {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 padding: 11px 20px;
 border-radius: 10px;
 font-size: 14px;
 font-weight: 600;
 text-decoration: none;
 cursor: pointer;
 border: 1px solid transparent;
 }
 .btn-primary {
 background: var(--primary);
 color: #ffffff;
 }
 .btn-primary:hover { background: var(--primary-dark); }
 .btn-secondary {
 background: transparent;
 color: var(--ink);
 border-color: var(--border);
 }
 .btn-secondary:hover { background: #f1f5f9; }
 .help-link {
 margin-top: 22px;
 font-size: 13px;
 color: var(--muted);
 }
 .help-link a { color: var(--primary); font-weight: 600; text-decoration: none; }
 .help-link a:hover { text-decoration: underline; }
</style>
</head>
<body>
 <a href="/" class="logo">
 <span class="logo-mark">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff">
 <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"/>
 </svg>
 </span>
 <span class="logo-text">LetsBook</span>
 </a>

 <div class="card">
 <div class="icon">
 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
 <path d="M12 9v4"/>
 <path d="M12 17h.01"/>
 <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
 </svg>
 </div>
 <h1>Something went wrong on our end</h1>
 <p>This one's on us, not you — nothing was lost. Please try again in a moment, or head back to where you started.</p>

 <div class="actions">
 <a href="/" class="btn btn-primary">Go to homepage</a>
 <a href="#" class="btn btn-secondary" onclick="if (window.history.length > 1) { history.back(); return false; }">Go back</a>
 </div>
 </div>

 <p class="help-link">Need help? Visit our <a href="/help">Help Center</a>.</p>
</body>
</html>
