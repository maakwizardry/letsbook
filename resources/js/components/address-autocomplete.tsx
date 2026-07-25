import { MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SelectedAddress {
 displayName: string;
 lat: number;
 lon: number;
 postcode: string;
}

interface NominatimSuggestion {
 place_id: number;
 display_name: string;
 lat: string;
 lon: string;
 address?: { postcode?: string };
}

/**
 * Same address search/select UX as the public booking wizard
 * (Booking/Index.tsx), extracted so the provider's manual-booking form can
 * reuse it without touching that page. Backed by OpenStreetMap Nominatim —
 * no API key required.
 */
export function AddressAutocomplete({
 value,
 onChange,
 placeholder = "Start typing the client's address...",
}: {
 value: SelectedAddress | null;
 onChange: (address: SelectedAddress | null) => void;
 placeholder?: string;
}) {
 const [query, setQuery] = useState(value?.displayName ?? '');
 const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
 const [isSearching, setIsSearching] = useState(false);

 useEffect(() => {
 if (value && query === value.displayName) {
 setSuggestions([]);
 return;
 }
 if (query.trim().length < 3) {
 setSuggestions([]);
 return;
 }
 setIsSearching(true);
 const timeout = setTimeout(() => {
 fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`)
 .then((res) => res.json())
 .then((data) => setSuggestions(data || []))
 .catch(() => setSuggestions([]))
 .finally(() => setIsSearching(false));
 }, 600);
 return () => clearTimeout(timeout);
 }, [query, value]);

 const select = (item: NominatimSuggestion) => {
 onChange({
 displayName: item.display_name,
 lat: parseFloat(item.lat),
 lon: parseFloat(item.lon),
 postcode: item.address?.postcode ?? '',
 });
 setQuery(item.display_name);
 setSuggestions([]);
 };

 if (value) {
 return (
 <div className="rounded-md border border-border p-3">
 <div className="flex items-start gap-2">
 <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary"/>
 <span className="flex-1 text-sm text-foreground">{value.displayName}</span>
 </div>
 <button
 type="button"
 onClick={() => {
 onChange(null);
 setQuery('');
 }}
 className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
 >
 Change address
 </button>
 </div>
 );
 }

 return (
 <div className="relative">
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Search className="h-4 w-4 text-muted-foreground"/>
 </div>
 <input
 type="text"
 role="combobox"
 aria-expanded={suggestions.length > 0}
 aria-controls="address-autocomplete-suggestions"
 autoComplete="off"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder={placeholder}
 className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
 />
 </div>
 {isSearching && <p className="mt-1 px-1 text-xs text-muted-foreground">Searching...</p>}
 {suggestions.length > 0 && (
 <div id="address-autocomplete-suggestions" role="listbox" aria-label="Address suggestions" className="mt-1 divide-y divide-border overflow-hidden rounded-md border border-border bg-popover shadow-md">
 {suggestions.map((item) => (
 <button
 key={item.place_id}
 type="button"
 role="option"
 aria-selected="false"
 onClick={() => select(item)}
 className="flex w-full items-start gap-2 p-2.5 text-left text-sm hover:bg-accent cursor-pointer"
 >
 <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground"/>
 <span>{item.display_name}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 );
}
