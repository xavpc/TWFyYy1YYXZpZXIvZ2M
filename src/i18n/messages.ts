export const messages = {
  en: () => import('../../messages/en.json').then((m) => m.default),
  ja: () => import('../../messages/jp.json').then((m) => m.default),
}
