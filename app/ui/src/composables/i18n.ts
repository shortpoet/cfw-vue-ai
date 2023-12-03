import { getLocale, Locale } from "./locales";

const i18n: { [key: string]: { [key: string]: string } } = {
  en: {
    hello: "Hello",
    world: "World",
  },
  fr: {
    hello: "Bonjour",
    world: "Monde",
  },
};

function getI18n(locale: Locale["code"]) {
  return i18n[locale] || i18n.en;
}

function t(key: string) {
  return getI18n(getLocale().code)[key] || key;
}

function useI18n() {
  return { getI18n, t };
}

export { getI18n, t, useI18n };
