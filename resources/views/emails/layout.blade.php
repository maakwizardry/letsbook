<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>@yield('subject', 'LetsBook')</title>
<!--[if mso]>
<style>table { border-collapse: collapse; }</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
<tr>
<td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
<tr>
<td style="background-color:#0284c7;padding:22px 40px;border-radius:12px 12px 0 0;">
<span style="font-family:Helvetica,Arial,sans-serif;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">LetsBook</span>
</td>
</tr>
<tr>
<td style="padding:40px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;">
@yield('content')
</td>
</tr>
<tr>
<td style="padding:20px 40px;border-top:1px solid #e2e8f0;background-color:#f8fafc;border-radius:0 0 12px 12px;">
<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#64748b;">
@yield('footer', "This is an automated message from LetsBook — please don't reply directly to this email.")
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
