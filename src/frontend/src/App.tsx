import { Toaster } from "@/components/ui/sonner";
import { MessageCircle, Phone, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmergencySidebar } from "./components/EmergencySidebar";
import { LanguageSelector } from "./components/LanguageSelector";
import type { Language } from "./components/LanguageSelector";
import { MapView } from "./components/MapView";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddContact,
  useGetContacts,
  useRemoveContact,
  useUpdateContact,
} from "./hooks/useQueries";

export interface PersonalContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  whatsappPhone: string;
}

function getDefaultLanguage(): Language {
  try {
    const saved = localStorage.getItem("app_language");
    if (saved) {
      const parsed = JSON.parse(saved) as Language;
      if (parsed.code && parsed.name && parsed.nativeName) return parsed;
    }
  } catch {}
  return { code: "en", name: "English", nativeName: "English" };
}

export default function App() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: backendContacts = [] } = useGetContacts();
  const addContactMutation = useAddContact();
  const removeContactMutation = useRemoveContact();
  const updateContactMutation = useUpdateContact();

  const [localContacts, setLocalContacts] = useState<PersonalContact[]>([]);
  const [safetyMode, setSafetyMode] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [quickConfirmOpen, setQuickConfirmOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(getDefaultLanguage);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem("app_language", JSON.stringify(lang));
    } catch {}
  }, []);

  const contacts: PersonalContact[] = isLoggedIn
    ? backendContacts.map((c) => ({
        id: c.name,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,
        whatsappPhone: c.whatsappPhone,
      }))
    : localContacts;

  const addContact = useCallback(
    async (contact: Omit<PersonalContact, "id">) => {
      if (isLoggedIn) {
        await addContactMutation.mutateAsync({
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          whatsappPhone: contact.whatsappPhone,
        });
      } else {
        setLocalContacts((prev) => [
          ...prev,
          { ...contact, id: Date.now().toString() },
        ]);
      }
    },
    [isLoggedIn, addContactMutation],
  );

  const removeContact = useCallback(
    async (id: string) => {
      if (isLoggedIn) {
        await removeContactMutation.mutateAsync(id);
      } else {
        setLocalContacts((prev) => prev.filter((c) => c.id !== id));
      }
    },
    [isLoggedIn, removeContactMutation],
  );

  const updateContact = useCallback(
    async (id: string, contact: Omit<PersonalContact, "id">) => {
      if (isLoggedIn) {
        await updateContactMutation.mutateAsync({
          name: id,
          contact: {
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            whatsappPhone: contact.whatsappPhone,
          },
        });
      } else {
        setLocalContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...contact, id } : c)),
        );
      }
    },
    [isLoggedIn, updateContactMutation],
  );

  const lastSosTap = useRef<number>(0);

  const langLine =
    selectedLanguage.code !== "en"
      ? `\n\u{1F310} Preferred language: ${selectedLanguage.nativeName} (${selectedLanguage.name})`
      : "";

  const buildMsg = useCallback(
    (loc: string) =>
      `\u{1F6A8} EMERGENCY ALERT \u{1F6A8}\nI am feeling unsafe and may be in DANGER!\n\u{1F4CD} My location: ${loc || "unknown"}\nPlease keep an eye on my location and contact me immediately!${langLine}`,
    [langLine],
  );

  const buildContactMsg = useCallback(
    (contactName: string, loc: string) =>
      `\u{1F6A8} EMERGENCY ALERT \u{1F6A8}\n${contactName}, I am feeling unsafe and may be in DANGER!\n\u{1F4CD} My location: ${loc || "unknown"}\nPlease keep an eye on my location and contact me immediately!${langLine}`,
    [langLine],
  );

  const sendWhatsAppAlerts = useCallback(
    (includeEmergency = false) => {
      contacts.forEach((c, i) => {
        const waNum = (c.whatsappPhone || c.phone).replace(/\D/g, "");
        const waMsg = encodeURIComponent(buildContactMsg(c.name, locationName));
        setTimeout(
          () => window.open(`https://wa.me/${waNum}?text=${waMsg}`, "_blank"),
          i * 300,
        );
      });
      if (includeEmergency) {
        const encoded = encodeURIComponent(buildMsg(locationName));
        setTimeout(
          () => window.open(`https://wa.me/1091?text=${encoded}`, "_blank"),
          contacts.length * 300,
        );
        setTimeout(
          () => window.open(`https://wa.me/100?text=${encoded}`, "_blank"),
          contacts.length * 300 + 400,
        );
      }
      if (contacts.length > 0) {
        setTimeout(
          () => {
            toast.success("🚨 WhatsApp alerts sent to all contacts!");
          },
          contacts.length * 300 + 200,
        );
      }
    },
    [contacts, locationName, buildMsg, buildContactMsg],
  );

  const triggerPhoneCall = useCallback(() => {
    contacts.forEach((c, i) => {
      setTimeout(() => {
        window.location.href = `tel:${c.phone}`;
      }, i * 3000);
    });
  }, [contacts]);

  const handleSOSClick = () => {
    const now = Date.now();
    const isDouble = now - lastSosTap.current < 500;
    lastSosTap.current = now;
    if (isDouble) {
      const encoded = encodeURIComponent(buildMsg(locationName));
      window.open(`https://wa.me/1091?text=${encoded}`, "_blank");
      setTimeout(
        () => window.open(`https://wa.me/100?text=${encoded}`, "_blank"),
        400,
      );
      setSafetyMode(true);
      setSosModalOpen(true);
      return;
    }
    const usedBefore = localStorage.getItem("sos_used_before");
    if (usedBefore) {
      setQuickConfirmOpen(true);
    } else {
      setSafetyMode(true);
      sendWhatsAppAlerts(false);
      triggerPhoneCall();
      setSosModalOpen(true);
      localStorage.setItem("sos_used_before", "1");
    }
  };

  const handleQuickConfirm = () => {
    setQuickConfirmOpen(false);
    setSafetyMode(true);
    sendWhatsAppAlerts(false);
    triggerPhoneCall();
    setSosModalOpen(true);
  };

  const sosMessage = buildMsg(locationName);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex-none flex items-center justify-between px-4 py-2.5 bg-card border-b border-border z-50 gap-3">
        <div className="flex items-center gap-2 flex-none">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield size={16} className="text-primary" />
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">
            SafeGuard
          </span>
        </div>
        <div className="flex items-center gap-2">
          {safetyMode && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 bg-primary/20 border border-primary/40 rounded-full px-3 py-1"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold text-primary">
                ALERT ACTIVE
              </span>
            </motion.div>
          )}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
          {isLoggedIn ? (
            <button
              type="button"
              onClick={clear}
              data-ocid="header.secondary_button"
              className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 rounded-full px-3 py-1 hover:bg-accent/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[11px] font-semibold text-accent">
                Logged In
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              data-ocid="header.primary_button"
              className="flex items-center gap-1.5 bg-secondary border border-border rounded-full px-3 py-1 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-[11px] font-medium text-muted-foreground">
                Login
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <MapView
            safetyMode={safetyMode}
            onSOSClick={handleSOSClick}
            onLocation={setUserLocation}
            onLocationName={setLocationName}
            userLocation={userLocation}
          />
        </div>
        <aside className="w-72 flex-none border-l border-border bg-card/90 backdrop-blur overflow-y-auto">
          <EmergencySidebar
            contacts={contacts}
            isLoggedIn={isLoggedIn}
            onLogin={login}
            onAddContact={addContact}
            onRemoveContact={removeContact}
            onUpdateContact={updateContact}
          />
        </aside>
      </main>

      <AnimatePresence>
        {quickConfirmOpen && (
          <motion.div
            key="quick-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            data-ocid="sos.modal"
          >
            <motion.div
              initial={{ scale: 0.88, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="w-full max-w-xs rounded-2xl overflow-hidden border-2 border-red-500 shadow-2xl"
              style={{
                background: "#140808",
                boxShadow: "0 0 32px rgba(220,38,38,0.45)",
              }}
            >
              <div className="px-6 py-5 flex flex-col items-center gap-3">
                <span className="text-5xl animate-pulse">&#x1F6A8;</span>
                <p className="text-white font-black text-lg tracking-wide text-center">
                  Send SOS Alert?
                </p>
                <div className="bg-red-900/50 border border-red-600/50 rounded-xl px-4 py-2 w-full text-center">
                  <p className="text-red-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    &#x1F4CD; Your Location
                  </p>
                  <p className="text-white text-sm font-semibold leading-snug">
                    {locationName || "Detecting location..."}
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-1">
                  <button
                    type="button"
                    data-ocid="sos.confirm_button"
                    onClick={handleQuickConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
                  >
                    Yes, Send Alert
                  </button>
                  <button
                    type="button"
                    data-ocid="sos.cancel_button"
                    onClick={() => setQuickConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-red-600/60 text-red-300 text-sm font-semibold hover:bg-red-900/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sosModalOpen && (
          <motion.div
            key="sos-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)" }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              transition={{ type: "spring", damping: 22 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-red-500 shadow-2xl"
              style={{
                background: "#140808",
                boxShadow: "0 0 40px rgba(220,38,38,0.4)",
              }}
            >
              <div className="bg-red-700 px-5 py-3 flex items-center justify-center gap-2">
                <span className="text-3xl animate-pulse">&#x1F6A8;</span>
                <span className="text-xl font-black text-white tracking-widest">
                  EMERGENCY ALERT
                </span>
                <span className="text-3xl animate-pulse">&#x1F6A8;</span>
              </div>
              <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-red-900/50 border border-red-600/50 rounded-xl p-3 mb-3 text-center">
                  <p className="text-red-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                    &#x1F4CD; Current Location
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {locationName || "Detecting location..."}
                  </p>
                </div>

                {/* Personal Contacts -- Call & WhatsApp section (prominent, at top) */}
                {contacts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-red-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                      📞 Call Your Contacts
                    </p>
                    <div className="flex flex-col gap-2">
                      {contacts.map((c, i) => {
                        const waNum = (c.whatsappPhone || c.phone).replace(
                          /\D/g,
                          "",
                        );
                        const waMsg = encodeURIComponent(
                          buildContactMsg(c.name, locationName),
                        );
                        return (
                          <div
                            key={c.id}
                            data-ocid={`sos.item.${i + 1}`}
                            className="bg-red-900/40 border border-red-700/50 rounded-xl px-3 py-3"
                          >
                            <div className="mb-2">
                              <p className="text-white font-bold text-sm">
                                {c.name}
                              </p>
                              <p className="text-red-400 text-[11px]">
                                {c.relationship} &middot; {c.phone}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`tel:${c.phone}`}
                                data-ocid={`sos.button.${i + 1}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 rounded-xl py-2.5 text-white text-sm font-bold transition-colors"
                              >
                                <Phone size={14} />📞 Call {c.name}
                              </a>
                              <a
                                href={`https://wa.me/${waNum}?text=${waMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-ocid={`sos.secondary_button.${i + 1}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 rounded-xl py-2.5 text-white text-sm font-bold transition-colors"
                              >
                                <MessageCircle size={14} />
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {contacts.length === 0 && (
                  <div
                    data-ocid="sos.empty_state"
                    className="text-center py-3 mb-3"
                  >
                    <p className="text-red-300 text-sm">
                      No personal contacts saved.
                    </p>
                    <p className="text-red-400/70 text-xs mt-1">
                      Add contacts in the sidebar &rarr;
                    </p>
                  </div>
                )}

                {/* Message preview */}
                <div className="bg-red-900/60 border-2 border-red-500/60 rounded-xl p-3 mb-4">
                  <p className="text-red-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Alert Message
                  </p>
                  <p className="text-red-100 text-xs font-medium leading-relaxed whitespace-pre-line">
                    {sosMessage}
                  </p>
                </div>

                <p className="text-red-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Emergency Services
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { name: "Police", num: "100", wa: "100" },
                    { name: "Ambulance", num: "108", wa: "108" },
                    { name: "Fire Brigade", num: "101", wa: "101" },
                    { name: "Women Helpline", num: "1091", wa: "1091" },
                  ].map((s, i) => (
                    <div key={s.num} className="flex flex-col gap-1.5">
                      <p className="text-red-200 text-[11px] font-semibold text-center">
                        {s.name}
                      </p>
                      <div className="flex gap-1">
                        <a
                          href={`tel:${s.num}`}
                          data-ocid={`sos.service_button.${i + 1}`}
                          className="flex-1 flex items-center justify-center bg-red-700/70 hover:bg-red-600 rounded-lg py-1.5 text-white text-[11px] font-bold transition-colors"
                        >
                          <Phone size={10} className="mr-1" />
                          {s.num}
                        </a>
                        <a
                          href={`https://wa.me/${s.wa}?text=${encodeURIComponent(sosMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid={`sos.service_wa_button.${i + 1}`}
                          className="w-8 flex items-center justify-center bg-green-700/70 hover:bg-green-600 rounded-lg py-1.5 text-white transition-colors"
                        >
                          <MessageCircle size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  data-ocid="sos.close_button"
                  onClick={() => setSosModalOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-red-600/60 text-red-300 text-sm font-semibold hover:bg-red-900/40 transition-colors"
                >
                  Dismiss Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="flex-none border-t border-border bg-card px-4 py-1.5 text-center">
        <p className="text-[10px] text-muted-foreground">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with &#10084; using caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster position="top-center" theme="dark" />
    </div>
  );
}
