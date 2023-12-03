interface Locale {
  code: string;
  name: string;
}

interface Locales {
  [key: string]: Locale;
}

const locales: Locales = {
  en: {
    code: "en",
    name: "English",
  },
  fr: {
    code: "fr",
    name: "Français",
  },
  es: {
    code: "es",
    name: "Español",
  },
};

function getLocale() {
  const locale = localStorage.getItem("locale") || "en";
  return locales[locale];
}
function toggleLocales() {
  // const locale = getLocale();
  // const codes = Object.keys(locales);
  // const nextLocale =
  //   locales[codes[(codes.indexOf(locale.code) + 1) % codes.length]];
  // if (nextLocale) {
  //   localStorage.setItem("locale", nextLocale.code);
  // }
  return "method not implemented";
}

export { getLocale, toggleLocales, Locale };
