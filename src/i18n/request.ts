import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  // Read locale from the cookie; fallback to 'en' if not set
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')
  const locale = localeCookie?.value || 'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
