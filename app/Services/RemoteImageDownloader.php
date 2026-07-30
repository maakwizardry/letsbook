<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class RemoteImageDownloader
{
    private const ALLOWED_CONTENT_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    private const MAX_BYTES = 8 * 1024 * 1024;

    private const TIMEOUT_SECONDS = 10;

    /**
     * Downloads an image from an arbitrary, caller-supplied URL and stores
     * it on the `public` disk under $directory, returning the relative
     * path — or null on any failure. Never throws: this is used from an
     * unauthenticated admin endpoint (provider creation), so every failure
     * mode (bad URL, blocked host, wrong content-type, too large, network
     * error) must fail closed into "no image" rather than blow up the
     * caller's flow.
     *
     * SSRF guard: rejects non-http(s) schemes and resolves the host to an
     * IP up front, refusing private/loopback/link-local/reserved ranges
     * (this also covers cloud metadata endpoints like 169.254.169.254).
     * Redirects are disabled rather than followed, so the validated IP
     * stays the one actually requested — a URL that needs a redirect just
     * fails here, which is an acceptable outcome for this feature (falls
     * back to the default cover image).
     */
    public function download(string $url, string $directory): ?string
    {
        try {
            $parts = parse_url($url);

            if (! $parts || ! in_array($parts['scheme'] ?? null, ['http', 'https'], true) || empty($parts['host'])) {
                return null;
            }

            if (! $this->isPublicHost($parts['host'])) {
                return null;
            }

            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withOptions(['allow_redirects' => false])
                ->withUserAgent('LetsBook/1.0')
                ->get($url);

            if (! $response->successful()) {
                return null;
            }

            $contentType = strtolower(explode(';', $response->header('Content-Type') ?? '')[0] ?? '');
            $extension = self::ALLOWED_CONTENT_TYPES[$contentType] ?? null;

            if (! $extension) {
                return null;
            }

            $body = $response->body();

            if (strlen($body) === 0 || strlen($body) > self::MAX_BYTES) {
                return null;
            }

            $path = trim($directory, '/').'/'.Str::random(24).'.'.$extension;

            // The local disk is configured with `throw => false`, so a
            // write failure (e.g. a permissions issue) returns false here
            // instead of throwing — must be checked explicitly, or a
            // failed write would silently report success with a
            // cover_image_path that points at a file which was never
            // actually written.
            $stored = Storage::disk('public')->put($path, $body);

            return $stored ? $path : null;
        } catch (Throwable $e) {
            Log::warning('RemoteImageDownloader failed', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
    }

    private function isPublicHost(string $host): bool
    {
        // A literal IP in the URL — validate it directly.
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
        }

        $ip = gethostbyname($host);

        // gethostbyname() returns the input unchanged when resolution fails.
        if ($ip === $host) {
            return false;
        }

        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }
}
