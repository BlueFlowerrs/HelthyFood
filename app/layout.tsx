import type { Metadata } from 'next'
import { QueryProvider } from '@/providers/QueryProvider'
import { LocaleProvider } from '@/providers/LocaleProvider'
import { ToasterProvider } from '@/providers/ToasterProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-bg-main min-h-screen flex flex-col">
        <QueryProvider>
          <LocaleProvider>
            <ToasterProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </ToasterProvider>
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
