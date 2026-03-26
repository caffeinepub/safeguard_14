import { Check, Globe, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "hne", name: "Haryanvi", nativeName: "हरियाणवी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr", name: "Serbian", nativeName: "Srpski" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "uz", name: "Uzbek", nativeName: "O'zbek" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmen" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ພາສາລາວ" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho" },
  { code: "sn", name: "Shona", nativeName: "chiShona" },
  { code: "ny", name: "Chichewa", nativeName: "Chichewa" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "eu", name: "Basque", nativeName: "Euskara" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
];

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const truncated =
    selectedLanguage.nativeName.length > 10
      ? `${selectedLanguage.nativeName.slice(0, 10)}…`
      : selectedLanguage.nativeName;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        data-ocid="language.toggle"
        onClick={() => {
          setOpen((v) => !v);
          setSearch("");
        }}
        className="flex items-center gap-1.5 bg-secondary border border-border rounded-full px-3 py-1 hover:bg-secondary/80 transition-colors"
      >
        <Globe size={11} className="text-muted-foreground flex-none" />
        <span className="text-[11px] font-medium text-muted-foreground max-w-[80px] truncate">
          {truncated}
        </span>
      </button>

      {open && (
        <div
          data-ocid="language.dropdown_menu"
          className="absolute top-full mt-1 right-0 w-64 rounded-xl border border-border bg-card shadow-2xl z-[9999] overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 bg-background rounded-lg px-2 py-1.5">
              <Search size={12} className="text-muted-foreground flex-none" />
              <input
                ref={searchRef}
                data-ocid="language.search_input"
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-4">
                No results
              </p>
            )}
            {filtered.map((lang) => (
              <button
                key={lang.code}
                type="button"
                data-ocid="language.select.button"
                onClick={() => {
                  onLanguageChange(lang);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/10 transition-colors text-left"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">
                    {lang.nativeName}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {lang.name}
                  </span>
                </span>
                {lang.code === selectedLanguage.code && (
                  <Check size={13} className="text-primary flex-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
