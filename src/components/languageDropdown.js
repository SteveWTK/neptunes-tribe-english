import { useState } from "react";

const languageOptions = {
  en: { label: "English", flag: "/flags/en.svg" },
  pt: { label: "Português", flag: "/flags/pt.svg" },
  th: { label: "ไทย", flag: "/flags/th.svg" },
};

export default function LanguageDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow"
      >
        <img src={languageOptions[lang].flag} alt="" className="w-5 h-5" />
        {languageOptions[lang].label}
      </button>

      {open && (
        <ul className="absolute z-10 mt-2 bg-white border rounded shadow w-full">
          {Object.entries(languageOptions).map(([code, { label, flag }]) => (
            <li key={code}>
              <button
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
              >
                <img src={flag} alt="" className="w-5 h-5" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
