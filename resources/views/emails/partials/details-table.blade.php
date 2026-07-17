{{-- Expects: $rows (assoc array label => value); blank/null values are skipped. --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:20px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
@foreach ($rows as $label => $value)
@continue(is_null($value) || $value === '')
<tr>
<td style="padding:10px 16px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#64748b;white-space:nowrap;vertical-align:top;">{{ $label }}</td>
<td style="padding:10px 16px 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">{{ $value }}</td>
</tr>
@endforeach
</table>
