@extends('emails.layout')

@section('subject', 'Your booking has been updated')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Your booking has been updated</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->customer->name }},</p>
<p style="margin:0 0 8px 0;"><strong>{{ $booking->provider->name }}</strong> made a change to your upcoming cleaning. Here's the latest:</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Scheduled' => $booking->scheduled_at->format('l, F j, Y \a\t g:i A'),
    'Address' => $address,
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote, 'paid' => $booking->is_paid])

<p style="margin:24px 0 0 0;">If anything here looks off, just reply to this email and {{ $booking->provider->name }} will sort it out.</p>
@endsection
