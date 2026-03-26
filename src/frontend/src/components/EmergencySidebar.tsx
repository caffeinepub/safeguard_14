import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  MessageCircle,
  Phone,
  Save,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PersonalContact } from "../App";

const EMERGENCY_NUMBERS = [
  {
    icon: "🚔",
    name: "Police",
    number: "100",
    borderColor: "border-blue-500/40 hover:border-blue-400",
  },
  {
    icon: "🚑",
    name: "Ambulance",
    number: "108",
    borderColor: "border-red-500/40 hover:border-red-400",
  },
  {
    icon: "🚒",
    name: "Fire Brigade",
    number: "101",
    borderColor: "border-orange-500/40 hover:border-orange-400",
  },
  {
    icon: "👩‍⚕️",
    name: "Women Helpline",
    number: "1091",
    borderColor: "border-pink-500/40 hover:border-pink-400",
  },
  {
    icon: "🔒",
    name: "Cyber Security",
    number: "1930",
    borderColor: "border-purple-500/40 hover:border-purple-400",
  },
];

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Friend",
  "Guardian",
  "Other",
];

interface Props {
  contacts: PersonalContact[];
  isLoggedIn: boolean;
  onLogin: () => void;
  onAddContact: (c: Omit<PersonalContact, "id">) => Promise<void>;
  onRemoveContact: (id: string) => Promise<void>;
  onUpdateContact: (
    id: string,
    c: Omit<PersonalContact, "id">,
  ) => Promise<void>;
}

export function EmergencySidebar({
  contacts,
  isLoggedIn,
  onLogin,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [relationship, setRelationship] = useState("Mother");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<PersonalContact, "id">>({
    name: "",
    phone: "",
    relationship: "",
    whatsappPhone: "",
  });

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setIsAdding(true);
    try {
      await onAddContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        whatsappPhone: whatsappPhone.trim(),
      });
      toast.success(`${name.trim()} added`);
      setName("");
      setPhone("");
      setWhatsappPhone("");
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (c: PersonalContact) => {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      whatsappPhone: c.whatsappPhone,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await onUpdateContact(editingId, editForm);
      toast.success("Contact updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Emergency Numbers */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🆘</span>
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Emergency Numbers
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Tap to call immediately on mobile
          </p>
          <div className="flex flex-col gap-2">
            {EMERGENCY_NUMBERS.map((e, i) => (
              <a
                key={e.number}
                href={`tel:${e.number}`}
                data-ocid={`emergency.item.${i + 1}`}
                onClick={() =>
                  toast.success(`Calling ${e.name} (${e.number})...`)
                }
                className={`flex items-center gap-3 bg-card border ${e.borderColor} rounded-xl px-3 py-2.5 transition-all cursor-pointer group hover:bg-secondary/50`}
              >
                <span className="text-lg flex-none">{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {e.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {e.number}
                  </p>
                </div>
                <Phone
                  size={12}
                  className="text-primary flex-none opacity-60 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Personal Contacts */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">👥</span>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                My Contacts
              </h2>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {contacts.length}/10
            </span>
          </div>

          {/* Login prompt */}
          {!isLoggedIn && (
            <div className="bg-secondary/30 border border-border rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                Login to save contacts permanently
              </p>
              <button
                type="button"
                onClick={onLogin}
                data-ocid="contacts.primary_button"
                className="text-[11px] font-semibold text-primary hover:text-primary/80 whitespace-nowrap"
              >
                Login →
              </button>
            </div>
          )}

          {/* Add contact form */}
          <div className="bg-secondary/30 border border-border rounded-xl p-3 mb-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Add Contact
            </p>
            <div className="flex flex-col gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Name *
                </Label>
                <Input
                  data-ocid="contacts.input"
                  placeholder="e.g. Mom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs bg-card border-border"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Phone *
                </Label>
                <Input
                  data-ocid="contacts.phone.input"
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-8 text-xs bg-card border-border"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  <MessageCircle
                    size={10}
                    className="inline mr-1 text-green-500"
                  />
                  WhatsApp Number
                </Label>
                <Input
                  data-ocid="contacts.whatsapp.input"
                  placeholder="+91 98765 43210 (if different)"
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="h-8 text-xs bg-card border-border"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Relationship
                </Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger
                    data-ocid="contacts.select"
                    className="h-8 text-xs bg-card border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-ocid="contacts.submit_button"
                onClick={handleAdd}
                disabled={isAdding}
                size="sm"
                className="w-full bg-primary text-primary-foreground h-8 text-xs"
              >
                <UserPlus size={12} className="mr-1.5" />
                {isAdding ? "Adding..." : "Add Contact"}
              </Button>
            </div>
          </div>

          {/* Contacts list */}
          {contacts.length === 0 ? (
            <div
              data-ocid="contacts.empty_state"
              className="flex flex-col items-center justify-center py-8 gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  No contacts yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add trusted people to alert in emergencies
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {contacts.map((c, i) => (
                  <motion.div
                    key={c.id}
                    data-ocid={`contacts.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {editingId === c.id ? (
                      <div className="p-3 flex flex-col gap-2">
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Name"
                          className="h-7 text-xs bg-secondary border-border"
                        />
                        <Input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Phone"
                          className="h-7 text-xs bg-secondary border-border"
                        />
                        <Input
                          value={editForm.whatsappPhone}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              whatsappPhone: e.target.value,
                            }))
                          }
                          placeholder="WhatsApp"
                          className="h-7 text-xs bg-secondary border-border"
                        />
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="flex-1 h-7 text-xs"
                          >
                            <Save size={11} className="mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2"
                          >
                            <X size={11} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-none">
                          <span className="text-xs font-bold text-primary">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.relationship} · {c.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${c.phone}`}
                            data-ocid={`contacts.button.${i + 1}`}
                            className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
                          >
                            <Phone size={11} />
                          </a>
                          <a
                            href={`https://wa.me/${(c.whatsappPhone || c.phone).replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-ocid={`contacts.secondary_button.${i + 1}`}
                            className="w-7 h-7 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center text-green-500 hover:bg-green-600/20 transition-colors"
                          >
                            <MessageCircle size={11} />
                          </a>
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            data-ocid={`contacts.edit_button.${i + 1}`}
                            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            type="button"
                            data-ocid={`contacts.delete_button.${i + 1}`}
                            onClick={async () => {
                              await onRemoveContact(c.id);
                              toast.success(`${c.name} removed`);
                            }}
                            className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
