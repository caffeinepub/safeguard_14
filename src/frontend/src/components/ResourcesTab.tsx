import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Flame,
  MapPin,
  Navigation,
  Phone,
  Search,
  Shield,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Resource {
  id: number;
  category: "police" | "hospital" | "fire" | "emergency";
  name: string;
  address: string;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
}

const RESOURCES: Resource[] = [
  {
    id: 1,
    category: "police",
    name: "Central Police Department",
    address: "123 Main St",
    distance: "0.3 mi",
    phone: "911",
    lat: 40.7148,
    lng: -74.004,
  },
  {
    id: 2,
    category: "police",
    name: "Downtown Precinct 5",
    address: "456 Park Ave",
    distance: "0.7 mi",
    phone: "(212) 555-0100",
    lat: 40.7168,
    lng: -74.002,
  },
  {
    id: 3,
    category: "hospital",
    name: "St. Mary's Medical Center",
    address: "789 Health Blvd",
    distance: "0.8 mi",
    phone: "(212) 555-0200",
    lat: 40.711,
    lng: -74.008,
  },
  {
    id: 4,
    category: "hospital",
    name: "City General Hospital",
    address: "321 Care Lane",
    distance: "1.4 mi",
    phone: "(212) 555-0201",
    lat: 40.709,
    lng: -74.012,
  },
  {
    id: 5,
    category: "fire",
    name: "Fire Station #12",
    address: "654 Rescue Rd",
    distance: "1.2 mi",
    phone: "(212) 555-0300",
    lat: 40.715,
    lng: -74.01,
  },
  {
    id: 6,
    category: "emergency",
    name: "Emergency Crisis Center",
    address: "987 Safe St",
    distance: "1.6 mi",
    phone: "(212) 555-0400",
    lat: 40.707,
    lng: -74.015,
  },
  {
    id: 7,
    category: "police",
    name: "Metro Transit Police",
    address: "100 Transit Pl",
    distance: "1.9 mi",
    phone: "(212) 555-0101",
    lat: 40.718,
    lng: -73.998,
  },
  {
    id: 8,
    category: "hospital",
    name: "Urgent Care Plus",
    address: "200 Wellness Way",
    distance: "2.1 mi",
    phone: "(212) 555-0202",
    lat: 40.706,
    lng: -74.02,
  },
];

const CATEGORY_CONFIG = {
  police: {
    icon: <Shield size={18} />,
    label: "Police",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  hospital: {
    icon: <Stethoscope size={18} />,
    label: "Hospital",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  fire: {
    icon: <Flame size={18} />,
    label: "Fire",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  emergency: {
    icon: <Phone size={18} />,
    label: "Emergency",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
};

const FILTERS = ["All", "Police", "Hospital", "Fire", "Emergency"] as const;
type FilterType = (typeof FILTERS)[number];

interface Props {
  userLocation: { lat: number; lng: number } | null;
}

export function ResourcesTab({ userLocation }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered = RESOURCES.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || CATEGORY_CONFIG[r.category].label === filter;
    return matchesSearch && matchesFilter;
  });

  const openNav = (r: Resource) => {
    const base = userLocation
      ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${r.lat},${r.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`;
    window.open(base, "_blank");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          data-ocid="resources.search_input"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`resources.${f.toLowerCase()}.tab`}
            onClick={() => setFilter(f)}
            className={`flex-none text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 pb-4">
        {filtered.length === 0 ? (
          <div data-ocid="resources.empty_state" className="text-center py-12">
            <MapPin size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No resources found</p>
          </div>
        ) : (
          filtered.map((r, i) => {
            const config = CATEGORY_CONFIG[r.category];
            return (
              <motion.div
                key={r.id}
                data-ocid={`resources.item.${i + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center flex-none`}
                  >
                    <span className={config.color}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.address}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex-none text-[10px] border-border text-muted-foreground"
                      >
                        {r.distance}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={`tel:${r.phone}`}
                        data-ocid={`resources.${i + 1}.button`}
                        className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5 hover:bg-accent/20 transition-colors"
                      >
                        <Phone size={12} />
                        Call
                      </a>
                      <button
                        type="button"
                        onClick={() => openNav(r)}
                        data-ocid={`resources.${i + 1}.secondary_button`}
                        className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                      >
                        <Navigation size={12} />
                        Navigate
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
