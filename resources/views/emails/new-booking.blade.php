@extends('emails.layout')

@section('subject', 'New booking received')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">New booking received</p>
<p style="margin:0 0 16px 0;">Hi {{ $booking->provider->name }},</p>
<p style="margin:0 0 8px 0;">You've got a new booking from <strong>{{ $booking->customer->name }}</strong>. Here are the details:</p>

@include('emails.partials.details-table', ['rows' => [
    'Reference ID' => $booking->reference_id,
    'Scheduled' => $booking->scheduled_at->format('l, F j, Y \a\t g:i A'),
    'Customer' => $booking->customer->name,
    'Phone' => $booking->customer->phone,
    'Address' => $address,
    'Payment Method' => ucfirst($booking->payment_method),
]])

@include('emails.partials.booking-items', ['items' => $booking->items, 'total' => $booking->total_quote])

@include('emails.partials.button', ['href' => route('orders'), 'label' => 'View in Dashboard'])

<p style="margin:24px 0 0 0;color:#64748b;font-size:13px;">You're receiving this because a customer booked through your LetsBook page.</p>
@endsection
