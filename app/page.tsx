import { Hero } from '@/features/landing/Hero'
import { FeaturedProducts } from '@/features/landing/FeaturedProducts'
import { Categories } from '@/features/landing/Categories'
import { Benefits } from '@/features/landing/Benefits'
import { MacroShowcase } from '@/features/landing/MacroShowcase'
import { Lifestyle } from '@/features/landing/Lifestyle'
import { Testimonials } from '@/features/landing/Testimonials'
import { CTABanner } from '@/features/landing/CTABanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <MacroShowcase />
      <Benefits />
      <Lifestyle />
      <Testimonials />
      <CTABanner />
    </>
  )
}
