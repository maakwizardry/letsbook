@extends('emails.layout')

@section('subject', 'Welcome to LetsBook')

@section('content')
<p style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#0f172a;">Welcome to LetsBook!</p>
<p style="margin:0 0 16px 0;">Hi {{ $firstName }},</p>
<p style="margin:0 0 8px 0;">Your dashboard for <strong>{{ $provider->name }}</strong> is ready. Click the button below to set your password and get started.</p>

@include('emails.partials.button', ['href' => $resetUrl, 'label' => 'Set My Password'])

<p style="margin:24px 0 0 0;">Once you're in, you'll be able to see your bookings, manage your schedule, and share your booking page with customers.</p>
<p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">Your booking page: <a href="{{ $bookingUrl }}" style="color:#0284c7;">{{ $bookingUrl }}</a></p>
<p style="margin:24px 0 0 0;">Any questions at all, just reply to this email — happy to help.</p>
@endsection
