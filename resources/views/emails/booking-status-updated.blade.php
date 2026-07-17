@extends('emails.layout')

@php $isCompleted = $booking->status === \App\Models\Booking::STATUS_COMPLETED; @endphp

@section('subject', $isCompleted ? 'Your cleaning is complete — thank you!' : 'Your cleaning has started')

@section('content')
@if ($isCompleted)
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Your cleaning is complete — thank you!</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->customer->name }},</p>
<p style="margin:0 0 8px 0;">Your appointment with <strong>{{ $booking->provider->name }}</strong> is now complete. Here's a recap of the services performed:</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Completed' => $booking->scheduled_at->format('l, F j, Y'),
    'Address' => $address,
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote, 'paid' => $booking->is_paid])

<p style="margin:24px 0 0 0;">Thank you for choosing {{ $booking->provider->name }} — we hope to see you again soon!</p>
@else
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Your cleaning has started</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->customer->name }},</p>
<p style="margin:0 0 8px 0;">Just a heads up — <strong>{{ $booking->provider->name }}</strong> has started on your cleaning.</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Scheduled' => $booking->scheduled_at->format('l, F j, Y \a\t g:i A'),
    'Address' => $address,
]])

<p style="margin:24px 0 0 0;">We'll let you know as soon as everything's done.</p>
@endif
@endsection
