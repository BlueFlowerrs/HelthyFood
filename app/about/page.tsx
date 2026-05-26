import { CTABanner } from '@/features/landing/CTABanner'

export default function AboutPage() {
  return (
    <>
      <div className="bg-brand-green-dark text-white py-20">
        <div className="container-main">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Giới Thiệu HelthyFood</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Hành trình xây dựng thực phẩm dinh dưỡng cao cấp cho cộng đồng fitness Việt Nam
          </p>
        </div>
      </div>

      <section className="py-20 bg-bg-main">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title mb-6">Sứ Mệnh Của Chúng Tôi</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                HelthyFood ra đời từ niềm đam mê với lối sống lành mạnh và tình yêu với ẩm thực dinh dưỡng. 
                Chúng tôi tin rằng mọi người đều xứng đáng được tiếp cận những thực phẩm chất lượng cao, 
                tiện lợi và ngon miệng.
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                Từ những bữa ăn prep protein cao cấp đến các snack healthy, mỗi sản phẩm đều được 
                nghiên cứu kỹ lưỡng về giá trị dinh dưỡng, đảm bảo bạn luôn đạt được mục tiêu fitness của mình.
              </p>
              <p className="text-text-muted leading-relaxed">
                Được thành lập bởi những người yêu gym và fitness, HelthyFood không chỉ là một cửa hàng 
                — đây là cộng đồng cho những ai theo đuổi lối sống mạnh mẽ.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '24+', label: 'Sản phẩm cao cấp' },
                { value: '10K+', label: 'Khách hàng tin tưởng' },
                { value: '4.9★', label: 'Đánh giá trung bình' },
                { value: '50+', label: 'Năm kinh nghiệm' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <p className="text-3xl font-bold font-serif text-wine">{stat.value}</p>
                  <p className="text-sm text-text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-main">
          <h2 className="section-title text-center mb-12">Giá Trị Cốt Lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🌿',
                title: 'Chất Lượng',
                desc: 'Nguyên liệu được tuyển chọn kỹ lưỡng từ các nhà cung cấp uy tín, đạt chuẩn organic.',
              },
              {
                emoji: '🔬',
                title: 'Khoa Học',
                desc: 'Mỗi sản phẩm được phân tích chi tiết macros — protein, carbs, fat, calories — để bạn dễ dàng theo dõi.',
              },
              {
                emoji: '💚',
                title: 'Cộng Đồng',
                desc: 'HelthyFood đồng hành cùng cộng đồng fitness Việt Nam, từ beginner đến pro.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-8">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="font-serif font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  )
}
