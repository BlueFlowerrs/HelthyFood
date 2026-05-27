'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from 'sonner'
import { createContactMessageAction } from '@/app/actions/contact'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

function SubmitButton({ locale }: { locale: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} variant="primary" size="lg" className="w-full gap-2">
      <Send className="w-4 h-4" />
      {locale === 'vi' ? 'Gửi tin nhắn' : 'Send Message'}
    </Button>
  )
}

export default function ContactPage() {
  const { locale, t } = useLocale()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    }

    const newErrors: Record<string, string> = {}
    if (!data.name.trim()) newErrors.name = locale === 'vi' ? 'Họ và tên là bắt buộc' : 'Name is required'
    if (!data.email.trim()) newErrors.email = locale === 'vi' ? 'Email là bắt buộc' : 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = locale === 'vi' ? 'Email không hợp lệ' : 'Invalid email address'
    }
    if (!data.message.trim()) newErrors.message = locale === 'vi' ? 'Tin nhắn là bắt buộc' : 'Message is required'
    if (data.message.trim().length < 10) {
      newErrors.message = locale === 'vi' ? 'Tin nhắn phải có ít nhất 10 ký tự' : 'Message must be at least 10 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    const result = await createContactMessageAction(data)
    if (result.success) {
      toast.success(locale === 'vi' ? 'Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ lại sớm.' : 'Message sent! We will get back to you soon.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } else {
      toast.error(result.error || (locale === 'vi' ? 'Đã xảy ra lỗi. Vui lòng thử lại.' : 'An error occurred. Please try again.'))
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
            {t('nav.contact') || 'Liên hệ'}
          </span>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-tight text-[#070B06] font-medium mb-4">
            {locale === 'vi' ? 'Kết nối với chúng tôi' : 'Connect with us'}
          </h1>
          <p className="text-[#070B06]/65">
            {locale === 'vi' ? 'Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.' : 'Our team is always here to support you.'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <form
            action={handleSubmit}
            className="bg-white rounded-3xl p-8 lg:p-10 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Input
                  label={locale === 'vi' ? 'Họ và tên' : 'Full Name'}
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Input
                label={locale === 'vi' ? 'Điện thoại' : 'Phone'}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0901 234 567"
              />
            </div>
            <div>
              <Textarea
                label={locale === 'vi' ? 'Tin nhắn' : 'Message'}
                name="message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder={locale === 'vi' ? 'Viết tin nhắn của bạn...' : 'Write your message...'}
                rows={5}
                required
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            <SubmitButton locale={locale} />
          </form>

          <aside className="bg-[#223D19] text-white rounded-3xl p-8 h-fit space-y-6">
            <h3 className="font-serif text-2xl mb-2">
              {locale === 'vi' ? 'Thông tin liên hệ' : 'Contact Info'}
            </h3>
            {[
              { icon: Mail, label: 'Email', value: 'hello@helthyfood.vn' },
              { icon: Phone, label: 'Hotline', value: '1900 1234' },
              {
                icon: MapPin,
                label: locale === 'vi' ? 'Văn phòng' : 'Office',
                value: locale === 'vi' ? '23 Lê Lợi, Quận 1, TP.HCM' : '23 Le Loi, District 1, HCMC',
              },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5">
                    {c.label}
                  </p>
                  <p className="text-sm">{c.value}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}
