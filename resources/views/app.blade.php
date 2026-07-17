<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="description" inertia content="LetsBook gives home cleaning businesses an online booking page, automated reminders, and a simple dashboard — no calls, no spreadsheets.">
        <meta name="robots" content="index, follow">
        <meta name="theme-color" content="#0284c7">
        <link rel="canonical" inertia href="{{ url()->current() }}">

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|lexend:500,600,700,800" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
