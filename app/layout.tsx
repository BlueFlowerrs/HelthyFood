import type { Metadata } from 'next'
import { QueryProvider } from '@/providers/QueryProvider'
import { LocaleProvider } from '@/providers/LocaleProvider'
import { ToasterProvider } from '@/providers/ToasterProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HelthyFood — Premium Nutrition Food',
    template: '%s | HelthyFood',
  },
  description:
    'Thực phẩm dinh dưỡng cao cấp cho cộng đồng fitness Việt Nam. Protein, meal prep, snack healthy, và nhiều hơn nữa.',
  keywords: ['healthy food', 'nutrition', 'fitness', 'protein', 'meal prep', 'Vietnam'],
  authors: [{ name: 'HelthyFood' }],
  openGraph: {
    title: 'HelthyFood — Premium Nutrition Food',
    description: 'Thực phẩm dinh dưỡng cao cấp cho cộng đồng fitness Việt Nam',
    type: 'website',
    locale: 'vi_VN',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#DAD6D6] min-h-screen flex flex-col relative">
        <QueryProvider>
          <LocaleProvider>
            <ToasterProvider>
              {children}
            </ToasterProvider>
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
