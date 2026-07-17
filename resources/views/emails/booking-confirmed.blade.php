@extends('emails.layout')

@section('subject', 'Your booking is confirmed')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Your booking is confirmed</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->customer->name }},</p>
<p style="margin:0 0 8px 0;">Thanks for booking with <strong>{{ $booking->provider->name }}</strong>! Here's a summary of your appointment.</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Scheduled' => $booking->scheduled_at->format('l, F j, Y \a\t g:i A'),
    'Address' => $address,
    'Payment Method' => ucfirst($booking->payment_method),
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote])

<p style="margin:24px 0 0 0;">We'll email you again as soon as your cleaning starts. If anything needs to change, just reply to this email and {{ $booking->provider->name }} will get back to you.</p>
@endsection
