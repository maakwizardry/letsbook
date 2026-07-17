<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Customer;
use App\Models\Provider;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class GenerateDemoBookings extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'demo:generate-bookings
        {--provider=demo-cleaning-service : Provider ID or slug to generate bookings for}
        {--count=150 : Number of bookings to generate}
        {--fresh : Delete this provider\'s existing bookings before generating new ones (destructive — requires --force)}
        {--force : Required alongside --fresh to confirm the destructive delete}';

    /**
     * The console command description.
     */
    protected $description = 'Fill the bookings table with realistic demo data for a cleaning services provider dashboard';

    public function handle(): int
    {
        $provider = $this->resolveProvider();

        if (! $provider) {
            $this->error('No provider found. Create one first (e.g. via the registration flow or database seeder).');

            return self::FAILURE;
        }

        if ($provider->homeTypes()->count() === 0 || $provider->serviceItems()->count() === 0) {
            $this->info("Provider \"{$provider->name}\" has no catalog yet — seeding a default one.");
            $provider->seedDefaultCatalog();
        }

        if ($this->option('fresh')) {
            if (! $this->option('force')) {
                $this->error('--fresh deletes existing bookings permanently. Re-run with --force to confirm.');

                return self::FAILURE;
            }

            $existingIds = Booking::where('provider_id', $provider->id)->pluck('id');
            $deleted = $existingIds->count();
            BookingItem::whereIn('booking_id', $existingIds)->delete();
            Booking::where('provider_id', $provider->id)->delete();
            $this->info("Removed {$deleted} existing booking(s) for \"{$provider->name}\".");
        }

        $count = max(1, (int) $this->option('count'));

        $homeTypes = $provider->homeTypes()->with(['serviceItems' => function ($query) {
            $query->where('category', '!=', 'Add-ons');
        }])->get();

        $addOns = $provider->serviceItems()->where('category', 'Add-ons')->get();

        if ($homeTypes->isEmpty()) {
            $this->error('Provider has no home types to attach bookings to.');

            return self::FAILURE;
        }

        $customers = $this->makeCustomerPool();

        $this->withProgressBar(range(1, $count), function () use ($provider, $homeTypes, $addOns, $customers) {
            $this->generateBooking($provider, $homeTypes, $addOns, $customers);
        });

        $this->newLine(2);
        $this->info("Generated {$count} demo bookings for \"{$provider->name}\".");

        return self::SUCCESS;
    }

    private function resolveProvider(): ?Provider
    {
        $identifier = $this->option('provider');

        if ($identifier) {
            return Provider::where('id', $identifier)->orWhere('slug', $identifier)->first();
        }

        return Provider::first();
    }

    /**
     * Build a reusable pool of demo customers (some will book more than once,
     * like real repeat clients).
     */
    private function makeCustomerPool(int $size = 45): \Illuminate\Support\Collection
    {
        $existing = Customer::inRandomOrder()->take((int) ($size / 2))->get();

        $needed = $size - $existing->count();

        $streetSuffixes = ['St', 'Ave', 'Blvd', 'Dr', 'Rd', 'Crescent', 'Court'];

        $new = collect(range(1, max(0, $needed)))->map(function () use ($streetSuffixes) {
            $name = fake()->name();

            return Customer::create([
                'name' => $name,
                'phone' => fake()->numerify('(###) ###-####'),
                'email' => Str::of($name)->slug('.')->append('@', fake()->safeEmailDomain())->toString(),
                'address' => fake()->buildingNumber().' '.fake()->lastName().' '.fake()->randomElement($streetSuffixes),
                'unit_number' => fake()->boolean(30) ? (string) fake()->numberBetween(1, 40) : null,
                'postal_code' => strtoupper(fake()->bothify('?#? #?#')),
            ]);
        });

        return $existing->concat($new)->values();
    }

    private function generateBooking(Provider $provider, \Illuminate\Support\Collection $homeTypes, \Illuminate\Support\Collection $addOns, \Illuminate\Support\Collection $customers): void
    {
        $createdAt = $this->weightedRecentDate();

        $homeType = $homeTypes->random();
        $services = $homeType->serviceItems;

        if ($services->isEmpty()) {
            $services = $provider->serviceItems()->where('home_type_id', $homeType->id)->get();
        }

        $lineItems = $services->isNotEmpty()
            ? collect([$services->random()])
            : collect();

        if ($addOns->isNotEmpty() && fake()->boolean(35)) {
            $lineItems->push($addOns->random());
        }

        if ($addOns->isNotEmpty() && fake()->boolean(10)) {
            $lineItems->push($addOns->random());
        }

        $lineItems = $lineItems->unique('id')->values();
        $totalQuote = $lineItems->sum('price') ?: fake()->randomFloat(2, 80, 300);

        $leadDays = fake()->numberBetween(0, 12);
        $scheduledAt = $createdAt->copy()
            ->addDays($leadDays)
            ->setTime(fake()->numberBetween(8, 17), fake()->randomElement([0, 15, 30, 45]));

        $now = Carbon::now();
        [$status, $isPaid] = $this->pickStatusAndPayment($scheduledAt, $now);

        $paidAt = null;
        if ($isPaid) {
            $paidAtCandidate = $status === Booking::STATUS_COMPLETED
                ? $scheduledAt->copy()->addHours(fake()->numberBetween(0, 6))
                : $createdAt->copy()->addHours(fake()->numberBetween(1, 24));

            $paidAt = $paidAtCandidate->greaterThan($now) ? $now->copy() : $paidAtCandidate;
        }

        $booking = new Booking([
            'provider_id' => $provider->id,
            'customer_id' => $customers->random()->id,
            'home_type_id' => $homeType->id,
            'reference_id' => 'BKG-'.strtoupper(Str::random(6)),
            'total_quote' => $totalQuote,
            'payment_method' => fake()->randomElement(['cash', 'cash', 'etransfer', 'etransfer', 'etransfer']),
            'status' => $status,
            'is_paid' => $isPaid,
            'paid_at' => $paidAt,
            'notes' => fake()->boolean(25) ? fake()->sentence(fake()->numberBetween(6, 14)) : null,
            'scheduled_at' => $scheduledAt,
        ]);
        // created_at/updated_at aren't mass-assignable on Booking, and Eloquent
        // would otherwise stamp them with "now" on insert.
        $booking->timestamps = false;
        $booking->created_at = $createdAt;
        $booking->updated_at = $createdAt;
        $booking->save();

        foreach ($lineItems as $item) {
            $bookingItem = new BookingItem([
                'booking_id' => $booking->id,
                'service_item_id' => $item->id,
                'price_at_booking' => $item->price,
            ]);
            $bookingItem->timestamps = false;
            $bookingItem->created_at = $createdAt;
            $bookingItem->updated_at = $createdAt;
            $bookingItem->save();
        }
    }

    /**
     * Weighted towards recent dates so the business "looks alive": most
     * bookings land in the last couple of months, with a long tail of
     * older history for revenue trends.
     */
    private function weightedRecentDate(): Carbon
    {
        $daysAgo = (int) (270 * (1 - sqrt(fake()->randomFloat(6, 0, 1))));

        return Carbon::now()->subDays($daysAgo)->setTime(
            fake()->numberBetween(7, 20),
            fake()->randomElement([0, 15, 30, 45])
        );
    }

    /**
     * Decide status/payment based on where the scheduled date sits relative
     * to now, so upcoming jobs are pending/in-progress and past jobs are
     * mostly completed (with a realistic dose of cancellations).
     *
     * @return array{0: string, 1: bool}
     */
    private function pickStatusAndPayment(Carbon $scheduledAt, Carbon $now): array
    {
        $hoursUntil = $now->diffInHours($scheduledAt, false);

        if ($hoursUntil > 24) {
            // Upcoming job, more than a day out.
            $status = fake()->boolean(85) ? Booking::STATUS_PENDING : Booking::STATUS_IN_PROGRESS;
            $isPaid = fake()->boolean(15);

            return [$status, $isPaid];
        }

        if ($hoursUntil >= -24) {
            // Happening today / around now.
            $status = fake()->boolean(65) ? Booking::STATUS_IN_PROGRESS : Booking::STATUS_PENDING;
            $isPaid = fake()->boolean(30);

            return [$status, $isPaid];
        }

        // Job's scheduled time has passed.
        $roll = fake()->numberBetween(1, 100);

        if ($roll <= 78) {
            return [Booking::STATUS_COMPLETED, fake()->boolean(88)];
        }

        if ($roll <= 92) {
            return [Booking::STATUS_CANCELLED, false];
        }

        return [Booking::STATUS_IN_PROGRESS, fake()->boolean(20)];
    }
}
