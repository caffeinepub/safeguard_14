import { MapPin, Navigation, Search, X } from "lucide-react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

interface NominatimReverseResult {
  display_name: string;
  address?: NominatimAddress;
}

/**
 * Build a precise human-readable address string from Nominatim address parts.
 * Example output: "2245/1, Sector 22-B, Chandigarh, Punjab"
 */
function buildPreciseAddress(addr: NominatimAddress): string {
  const parts: string[] = [];

  if (addr.house_number && addr.road) {
    parts.push(`${addr.house_number}, ${addr.road}`);
  } else if (addr.house_number) {
    parts.push(addr.house_number);
  } else if (addr.road) {
    parts.push(addr.road);
  }

  const subLocality = addr.neighbourhood || addr.suburb;
  if (subLocality) parts.push(subLocality);

  const city = addr.city || addr.town || addr.village || addr.county;
  if (city) parts.push(city);

  if (addr.state) parts.push(addr.state);

  return parts.join(", ");
}

function truncateName(displayName: string): string {
  const parts = displayName.split(", ");
  return parts.slice(0, 4).join(", ");
}

interface Props {
  safetyMode: boolean;
  onSOSClick: () => void;
  onLocation: (loc: { lat: number; lng: number }) => void;
  onLocationName: (name: string) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function MapView({
  safetyMode,
  onSOSClick,
  onLocation,
  onLocationName,
  userLocation,
}: Props) {
  const [locationError, setLocationError] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Map iframe center
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  }>({
    lat: 28.6139,
    lng: 77.209,
    zoom: 13,
  });
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchRef = useRef<number | null>(null);

  const handleGeo = useCallback(
    async (pos: GeolocationPosition) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onLocation(loc);
      setAccuracy(pos.coords.accuracy);
      setLocationError(false);

      if (!isSearchActive) {
        setMapCenter({ lat: loc.lat, lng: loc.lng, zoom: 17 });
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&zoom=18&addressdetails=1`,
        );
        const data: NominatimReverseResult = await res.json();
        let name = "";
        if (data.address) {
          name = buildPreciseAddress(data.address);
        }
        if (!name) name = truncateName(data.display_name);
        setPlaceName(name);
        onLocationName(name);
      } catch {
        // silent
      }
    },
    [onLocation, onLocationName, isSearchActive],
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      handleGeo,
      () => setLocationError(true),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    return () => {
      if (watchRef.current !== null)
        navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [handleGeo]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=7`,
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelectResult = (result: NominatimResult) => {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    setMapCenter({ lat, lng, zoom: 18 });
    setIsSearchActive(true);
    setSearchQuery(result.display_name);
    setShowDropdown(false);
    setSearchResults([]);
    let name = "";
    if (result.address) {
      name = buildPreciseAddress(result.address);
    }
    if (!name) name = truncateName(result.display_name);
    setPlaceName(name);
    onLocationName(name);
  };

  const handleUseGPS = () => {
    setIsSearchActive(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    if (userLocation) {
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng, zoom: 17 });
      if (placeName) onLocationName(placeName);
    }
  };

  // Build OSM embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.007},${mapCenter.lng + 0.01},${mapCenter.lat + 0.007}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden">
        {/* Map iframe */}
        <iframe
          key={`${mapCenter.lat}-${mapCenter.lng}-${mapCenter.zoom}`}
          src={mapUrl}
          title="Map"
          className="w-full h-full border-0"
          style={{
            filter:
              "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)",
          }}
          loading="lazy"
        />

        {/* Search bar overlay */}
        <div
          ref={searchRef}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] w-[calc(100%-4rem)] max-w-md"
          data-ocid="map.search_input"
        >
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search city, street, area, house number..."
              className="w-full bg-card/95 backdrop-blur-md border border-border rounded-xl pl-8 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 shadow-lg"
            />
            {(searchQuery || isSearching) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDropdown(false);
                  if (isSearchActive) {
                    setIsSearchActive(false);
                    handleUseGPS();
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {isSearching ? (
                  <div className="w-3 h-3 border border-muted-foreground border-t-foreground rounded-full animate-spin" />
                ) : (
                  <X size={13} />
                )}
              </button>
            )}
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="mt-1 bg-card/98 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.lat}-${result.lon}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    data-ocid={`map.item.${idx + 1}`}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent/10 border-b border-border/40 last:border-0 flex items-start gap-2 transition-colors"
                  >
                    <MapPin
                      size={11}
                      className="text-primary mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-foreground leading-relaxed line-clamp-2">
                      {result.display_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSearchActive && userLocation && (
            <button
              type="button"
              onClick={handleUseGPS}
              data-ocid="map.toggle"
              className="mt-1.5 flex items-center gap-1.5 bg-card/95 backdrop-blur-md border border-border rounded-full px-2.5 py-1 text-[10px] text-primary hover:bg-primary/10 transition-colors shadow-md"
            >
              <Navigation size={9} />
              Back to GPS
            </button>
          )}
        </div>

        {/* Location info */}
        {(userLocation || locationError) && (
          <div className="absolute bottom-3 left-3 z-[400] bg-card/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 max-w-[220px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              {isSearchActive ? "Selected" : "Your Location"}
            </p>
            {locationError ? (
              <p className="text-xs text-muted-foreground">
                ⚠ Location unavailable
              </p>
            ) : placeName ? (
              <p className="text-xs text-foreground leading-snug">
                📍 {placeName}
              </p>
            ) : userLocation ? (
              <p className="text-xs font-mono text-foreground">
                {userLocation.lat.toFixed(5)}°, {userLocation.lng.toFixed(5)}°
              </p>
            ) : null}
            {!isSearchActive && accuracy !== null && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ±{Math.round(accuracy)}m
              </p>
            )}
          </div>
        )}

        {/* Zone legend */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[11px] text-foreground font-medium">
              Safe
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[11px] text-foreground font-medium">
              Risk
            </span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-none px-3 py-2 bg-card border-t border-border">
        {safetyMode ? (
          <div
            data-ocid="map.error_state"
            className="flex items-center justify-center gap-2 bg-primary/15 border border-primary/40 rounded-full py-1.5"
          >
            <ShieldAlert size={13} className="text-primary" />
            <span className="text-xs font-semibold text-primary">
              ⚠ Safety Mode Active
            </span>
          </div>
        ) : (
          <div
            data-ocid="map.success_state"
            className="flex items-center justify-center gap-2 bg-accent/10 border border-accent/30 rounded-full py-1.5"
          >
            <ShieldCheck size={13} className="text-accent" />
            <span className="text-xs font-semibold text-accent">
              You are in a Safe Zone
            </span>
          </div>
        )}
      </div>

      {/* SOS Button */}
      <div className="flex-none flex flex-col items-center justify-center py-4 bg-card border-t border-border gap-2">
        <button
          type="button"
          data-ocid="map.primary_button"
          onClick={onSOSClick}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center",
            "font-black text-white text-2xl tracking-widest select-none",
            "bg-primary border-4 border-primary/40 transition-all active:scale-95",
            safetyMode ? "sos-btn-active" : "sos-btn",
          )}
        >
          SOS
        </button>
        <p className="text-[11px] text-muted-foreground text-center px-4">
          Tap for emergency · Double-tap sends alert to Police &amp; Women
          Helpline
        </p>
      </div>
    </div>
  );
}
