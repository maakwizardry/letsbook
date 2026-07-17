{{-- Expects: $items (Collection<BookingItem> with serviceItem loaded), $total (numeric). Optional: $paid (bool), $showTotal (bool, default true). --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr>
<td colspan="2" style="padding:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">
Services
</td>
</tr>
@foreach ($items as $item)
<tr>
<td style="padding:10px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f172a;border-bottom:1px solid #f1f5f9;">{{ $item->serviceItem->name ?? 'Service' }}</td>
<td align="right" style="padding:10px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f172a;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${{ number_format($item->price_at_booking, 2) }}</td>
</tr>
@endforeach
@if ($showTotal ?? true)
<tr>
<td style="padding:14px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0f172a;">
Total
@if ($paid ?? false)
<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background-color:#dcfce7;color:#15803d;font-size:11px;font-weight:700;letter-spacing:0.02em;">PAID IN FULL</span>
@endif
</td>
<td align="right" style="padding:14px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0284c7;white-space:nowrap;">${{ number_format($total, 2) }}</td>
</tr>
@endif
</table>
