import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pt from './locales/pt.json'
import { storage, STORAGE_KEYS } from '@/shared/lib/storage'

const savedLanguage = storage.get<string>(STORAGE_KEYS.LANGUAGE) || 'pt'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: savedLanguage,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
