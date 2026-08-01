# LetsBook

Online booking platform built on Laravel 12 + Inertia.js/React. Providers get
a branded booking page, a scheduling calendar, and a customer-management
dashboard; customers book services through a mobile-first public wizard with
no account required.

## Stack

- **Backend**: Laravel 12 (PHP 8.3), MySQL
- **Frontend**: Inertia.js + React 19 + TypeScript, Tailwind v4, Vite
- **SSR**: Inertia server-side rendering for the public-facing pages
- **Auth**: Laravel session auth for the provider dashboard, Sanctum tokens
  for the API surface used by external/future clients

## Supported business types

LetsBook started as a home-cleaning-only booking engine. It now supports
appointment-style businesses (barbers, dentists, and similar) as **one app**,
not a fork — behavior is driven entirely by two flags on `Provider`:

- **`business_type`**: `cleaning` (default) or `appointment`. Controls
  *where the work happens*. `cleaning` collects a home address in the public
  wizard, since the provider travels to the customer. `appointment` skips
  the address step entirely, since the customer visits the provider.
- **`uses_staff_scheduling`**: boolean, `false` by default. Controls
  *whether there's more than one interchangeable person doing the work*.
  When on, a provider can add staff members, give each one their own hours
  and holidays, and customers get a "Who would you like?" picker in the
  wizard. Double-booking checks are scoped per staff member instead of the
  whole business. When off, there's a single shared calendar for the whole
  business, and none of the staff UI is reachable.

These two flags combine into four supported business shapes:

| `business_type` | `uses_staff_scheduling` | Shape | Example |
|---|---|---|---|
| `cleaning` | off | Single calendar, address required | A solo home-cleaning provider (today's default for every real customer) |
| `cleaning` | on | Multiple staff, address required | A cleaning company with several cleaners, each with their own calendar, still visiting customers' homes |
| `appointment` | off | Single calendar, no address | A solo appointment-based provider — one-person barber, dentist, etc. |
| `appointment` | on | Multiple staff, no address | A small shop with several staff to choose from — barbershop, small dental practice |

### Current status

- Both flags default to the values that match every existing customer's
  behavior today, are excluded from mass assignment (`$fillable`), and can
  only be turned on via `forceFill()` — there's no self-serve or admin-UI
  way to enable them yet. This is intentional: it keeps the three real
  cleaning customers on this platform completely unaffected while the
  other three shapes are piloted by hand.
- Wizard and dashboard copy is still cleaning-flavored regardless of
  `business_type` (e.g. "Select your home type") — a terminology pass is
  planned as its own separate release before pitching the `appointment`
  shapes to a real prospect.
- No self-serve onboarding flow exists yet for the three non-default
  shapes — enabling them for a new provider is a manual, hand-held step.

See `appointment.md` in the repo root (untracked, local working notes) for
the detailed build history and open items on this effort.
