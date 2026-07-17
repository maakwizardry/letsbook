@extends('emails.layout')

@section('subject', 'Payment recorded')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Payment recorded</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->provider->name }},</p>
<p style="margin:0 0 8px 0;">You've marked the booking from <strong>{{ $booking->customer->name }}</strong> as paid. Here's the summary for your records:</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Customer' => $booking->customer->name,
    'Paid On' => optional($booking->paid_at)->format('l, F j, Y \a\t g:i A'),
    'Payment Method' => ucfirst($booking->payment_method),
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote, 'paid' => true])

@include('emails.partials.button', ['href' => route('orders'), 'label' => 'View in Dashboard'])
@endsection
