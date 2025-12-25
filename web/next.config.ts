import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], 
  },
  reactStrictMode: false, // Ensure strict mode is enabled
}

export default withNextIntl(nextConfig)
