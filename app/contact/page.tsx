'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from 'sonner'
import { createContactMessageAction } from '@/app/actions/contact'

function SubmitButton({ locale }: { locale: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} className="w-full gap-2">
      <Send className="w-4 h-4" />
      {locale === 'vi' ? 'Gửi tin nhắn' : 'Send Message'}
    </Button>
  )
}

export default function ContactPage() {
  const { locale } = useLocale()
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
      <div className="bg-brand-green-dark text-white py-20">
        <div className="container-main">
          <h1 className="text-4xl font-serif font-bold">{t('contact.title', locale)}</h1>
          <p className="text-white/60 mt-2">{t('contact.subtitle', locale)}</p>
        </div>
      </div>

      <section className="py-20 bg-bg-main">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact info */}
            <div>
              <h2 className="section-title mb-8">
                {locale === 'vi' ? 'Liên Hệ Với Chúng Tôi' : 'Contact Us'}
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    label: locale === 'vi' ? 'Địa chỉ' : 'Address',
                    value: locale === 'vi'
                      ? '123 Nguyễn Trãi, Quận 1, TP.HCM'
                      : '123 Nguyen Trai, District 1, HCMC',
                  },
                  {
                    icon: Phone,
                    label: locale === 'vi' ? 'Điện thoại' : 'Phone',
                    value: '0901 234 567',
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'contact@helthyfood.vn',
                  },
                  {
                    icon: Clock,
                    label: locale === 'vi' ? 'Giờ làm việc' : 'Working Hours',
                    value: locale === 'vi'
                      ? 'Thứ 2 - Thứ 7: 8:00 - 20:00'
                      : 'Mon - Sat: 8:00 AM - 8:00 PM',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-wine/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-wine" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map - OpenStreetMap embed */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 h-64">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.6920%2C10.7630%2C106.6980%2C10.7700&layer=mapnik&marker=10.7665%2C106.6950"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HelthyFood Location"
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                {locale === 'vi'
                  ? 'Địa chỉ minh họa phục vụ demo đồ án. Liên hệ để được cung cấp địa chỉ thực.'
                  : 'Demo address for project demonstration. Contact us for the actual address.'}
              </p>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="font-serif font-semibold text-xl mb-6">
                {locale === 'vi' ? 'Gửi Tin Nhắn' : 'Send a Message'}
              </h2>
              <form action={handleSubmit} className="space-y-4">
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
                <div className="grid sm:grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
