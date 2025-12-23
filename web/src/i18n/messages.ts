export const messages = {
  en: () => import('../../messages/en.json').then((m) => m.default),
  jp: () => import('../../messages/jp.json').then((m) => m.default),
}
