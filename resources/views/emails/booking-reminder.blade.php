@extends('emails.layout')

@section('subject', 'Reminder: your booking is coming up')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Your booking is coming up</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->customer->name }},</p>
<p style="margin:0 0 8px 0;">This is a friendly reminder about your upcoming appointment with <strong>{{ $booking->provider->name }}</strong>.</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Scheduled' => $booking->scheduled_at->format('l, F j, Y \a\t g:i A'),
    'Address' => $address,
    'Payment Method' => ucfirst($booking->payment_method),
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote])

<p style="margin:24px 0 0 0;">We look forward to seeing you! If anything needs to change, just reply to this email and {{ $booking->provider->name }} will get back to you.</p>
@endsection
