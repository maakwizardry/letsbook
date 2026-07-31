import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Business settings',
		href: '/settings/business',
	},
];

export default function Business({
	name,
	cover_image_url,
	notifications_enabled,
	brand_color,
}: {
	name: string;
	cover_image_url: string | null;
	notifications_enabled: boolean;
	brand_color: string | null;
}) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Business settings" />

			<SettingsLayout>
				<div className="space-y-12">
					<CoverPhotoForm coverImageUrl={cover_image_url} />
					<BusinessNameForm name={name} />
					<BrandColorForm brandColor={brand_color} />
					<NotificationsForm notificationsEnabled={notifications_enabled} />
				</div>
			</SettingsLayout>
		</AppLayout>
	);
}

function CoverPhotoForm({ coverImageUrl }: { coverImageUrl: string | null }) {
	const [preview, setPreview] = useState<string | null>(null);
	const { data, setData, post, errors, processing, recentlySuccessful } = useForm<{ photo: File | null }>({
		photo: null,
	});

	const submit: FormEventHandler = (e) => {
		e.preventDefault();

		post(route('business.photo.update'), { forceFormData: true });
	};

	return (
		<div className="space-y-6">
			<HeadingSmall title="Cover photo" description="Shown as the hero image on your booking page" />

			<form onSubmit={submit} className="space-y-4">
				<div className="flex items-center gap-4">
					{(preview ?? coverImageUrl) ? (
						<img src={preview ?? coverImageUrl ?? undefined} alt="" className="h-24 w-24 rounded-lg object-cover border border-border" />
					) : (
						<div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No photo</div>
					)}

					<Input
						type="file"
						accept="image/*"
						onChange={(e) => {
							const file = e.target.files?.[0] ?? null;
							setData('photo', file);
							setPreview(file ? URL.createObjectURL(file) : null);
						}}
					/>
				</div>

				<InputError message={errors.photo} />

				<div className="flex items-center gap-4">
					<Button disabled={processing || !data.photo}>Upload</Button>

					<Transition
						show={recentlySuccessful}
						enter="transition ease-in-out"
						enterFrom="opacity-0"
						leave="transition ease-in-out"
						leaveTo="opacity-0"
					>
						<p className="text-sm text-neutral-600">Saved</p>
					</Transition>
				</div>
			</form>
		</div>
	);
}

const BRAND_COLOR_PRESETS = [
	{ value: '#0284c7', label: 'Blue' },
	{ value: '#059669', label: 'Green' },
	{ value: '#7c3aed', label: 'Purple' },
	{ value: '#e11d48', label: 'Rose' },
	{ value: '#d97706', label: 'Amber' },
];

function BrandColorForm({ brandColor }: { brandColor: string | null }) {
	const [selected, setSelected] = useState(brandColor ?? BRAND_COLOR_PRESETS[0].value);
	const [saved, setSaved] = useState(false);

	const choose = (value: string) => {
		setSelected(value);
		setSaved(false);

		router.patch(
			route('business.brand-color.update'),
			{ brand_color: value },
			{ preserveScroll: true, onSuccess: () => setSaved(true) },
		);
	};

	return (
		<div className="space-y-6">
			<HeadingSmall title="Brand color" description="Colors your dashboard and booking page" />

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-3">
					{BRAND_COLOR_PRESETS.map((preset) => (
						<button
							key={preset.value}
							type="button"
							title={preset.label}
							onClick={() => choose(preset.value)}
							className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow"
							style={{ backgroundColor: preset.value, '--tw-ring-color': selected === preset.value ? preset.value : 'transparent' } as React.CSSProperties}
						>
							{selected === preset.value && <Check className="h-4 w-4 text-white" />}
						</button>
					))}
				</div>

				<Transition
					show={saved}
					enter="transition ease-in-out"
					enterFrom="opacity-0"
					leave="transition ease-in-out"
					leaveTo="opacity-0"
					afterEnter={() => setTimeout(() => setSaved(false), 1500)}
				>
					<p className="text-sm text-neutral-600">Saved</p>
				</Transition>
			</div>
		</div>
	);
}

function BusinessNameForm({ name }: { name: string }) {
	const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({ name });

	const submit: FormEventHandler = (e) => {
		e.preventDefault();

		patch(route('business.name.update'));
	};

	return (
		<div className="space-y-6">
			<HeadingSmall title="Business name" description="Shown to customers on your booking page" />

			<form onSubmit={submit} className="space-y-6">
				<div className="grid gap-2">
					<Label htmlFor="business-name">Business name</Label>

					<Input
						id="business-name"
						className="mt-1 block w-full"
						value={data.name}
						onChange={(e) => setData('name', e.target.value)}
						required
					/>

					<InputError className="mt-2" message={errors.name} />
				</div>

				<div className="flex items-center gap-4">
					<Button disabled={processing}>Save</Button>

					<Transition
						show={recentlySuccessful}
						enter="transition ease-in-out"
						enterFrom="opacity-0"
						leave="transition ease-in-out"
						leaveTo="opacity-0"
					>
						<p className="text-sm text-neutral-600">Saved</p>
					</Transition>
				</div>
			</form>
		</div>
	);
}

function NotificationsForm({ notificationsEnabled }: { notificationsEnabled: boolean }) {
	const [checked, setChecked] = useState(notificationsEnabled);
	const [saved, setSaved] = useState(false);

	const toggle = (value: boolean) => {
		setChecked(value);
		setSaved(false);

		router.patch(
			route('business.notifications.update'),
			{ notifications_enabled: value },
			{ preserveScroll: true, onSuccess: () => setSaved(true) },
		);
	};

	return (
		<div className="space-y-6">
			<HeadingSmall title="Customer notifications" description="Automated emails sent to your customers" />

			<div className="flex items-start gap-3">
				<Checkbox id="notifications-enabled" checked={checked} onCheckedChange={(value) => toggle(value === true)} />

				<div className="grid gap-1.5">
					<Label htmlFor="notifications-enabled">Send booking confirmation, update, and reminder emails to customers</Label>

					<Transition
						show={saved}
						enter="transition ease-in-out"
						enterFrom="opacity-0"
						leave="transition ease-in-out"
						leaveTo="opacity-0"
						afterEnter={() => setTimeout(() => setSaved(false), 1500)}
					>
						<p className="text-sm text-neutral-600">Saved</p>
					</Transition>
				</div>
			</div>
		</div>
	);
}
