import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ko from "./locales/ko.json";

// 브라우저 언어 감지
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split("-")[0];
  return browserLang === "ko" ? "ko" : "en";
};

// 저장된 언어 가져오기
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem("language");
  return saved || getBrowserLanguage();
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

// 언어 변경 함수
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem("language", lang);
};
