const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categoriesToSeed = [
  { slug: 'protein-bars', name_vi: 'Protein Bar', name_en: 'Protein Bars', description_vi: 'Thanh protein dinh dưỡng cao cấp', description_en: 'Premium nutrition protein bars', sort_order: 1, active: true },
  { slug: 'meal-prep', name_vi: 'Meal Prep', name_en: 'Meal Prep', description_vi: 'Bữa ăn prep sẵn, tiện lợi', description_en: 'Ready-made meal prep, convenient', sort_order: 2, active: true },
  { slug: 'snacks', name_vi: 'Snacks Healthy', name_en: 'Healthy Snacks', description_vi: 'Snack healthy, ít đường, giàu protein', description_en: 'Healthy snacks, low sugar, high protein', sort_order: 3, active: true },
  { slug: 'protein-powder', name_vi: 'Protein Bột', name_en: 'Protein Powder', description_vi: 'Whey protein và plant protein chất lượng cao', description_en: 'High quality whey and plant protein', sort_order: 4, active: true },
  { slug: 'supplements', name_vi: 'Supplements', name_en: 'Supplements', description_vi: 'Bổ sung dinh dưỡng, vitamin, khoáng chất', description_en: 'Nutritional supplements, vitamins, minerals', sort_order: 5, active: true },
  { slug: 'accessories', name_vi: 'Phụ Kiện', name_en: 'Accessories', description_vi: 'Dụng cụ gym, shaker bottle, túi meal prep', description_en: 'Gym accessories, shaker bottles, meal prep bags', sort_order: 6, active: true }
];

const productsToSeed = [
  // 1. Protein Bars
  {
    slug: 'double-chocolate-protein-bar',
    name_vi: 'Thanh Protein Socola Kép',
    name_en: 'Double Chocolate Protein Bar',
    description_vi: 'Thanh protein vị socola kép đậm đà, cung cấp năng lượng tức thì và hỗ trợ phát triển cơ bắp hiệu quả sau mỗi buổi tập.',
    description_en: 'Rich double chocolate protein bar, providing instant energy and supporting effective muscle development after every workout.',
    short_description_vi: '20g Protein, ít đường, vị socola đặc biệt thơm ngon.',
    short_description_en: '20g Protein, low sugar, delicious double chocolate taste.',
    price: 65000,
    sale_price: 59000,
    stock: 120,
    calories: 220,
    protein: 20.0,
    carbs: 15.0,
    fat: 7.0,
    nutrition_tags: ['High Protein', 'Low Sugar', 'Post-Workout'],
    category_slug: 'protein-bars',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'peanut-butter-crunch-bar',
    name_vi: 'Thanh Protein Bơ Đậu Phộng Giòn',
    name_en: 'Peanut Butter Crunch Protein Bar',
    description_vi: 'Sự kết hợp hoàn hảo giữa vị bơ đậu phộng béo ngậy và hạt giòn tan, bổ sung năng lượng sạch cho ngày dài năng động.',
    description_en: 'The perfect combination of creamy peanut butter and crunchy nuts, supplementing clean energy for an active day.',
    short_description_vi: '18g Protein thực vật, giàu chất xơ, vị bơ đậu phộng.',
    short_description_en: '18g Plant protein, high fiber, peanut butter flavor.',
    price: 60000,
    sale_price: null,
    stock: 90,
    calories: 210,
    protein: 18.0,
    carbs: 18.0,
    fat: 8.0,
    nutrition_tags: ['Vegan', 'High Fiber', 'Gluten Free'],
    category_slug: 'protein-bars',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'berry-blast-oat-bar',
    name_vi: 'Thanh Yến Mạch Việt Quất & Dâu Tây',
    name_en: 'Berry Blast Oats Protein Bar',
    description_vi: 'Thanh yến mạch kết hợp dâu tây và việt quất sấy tự nhiên, chua ngọt dễ ăn, thích hợp làm bữa phụ nhẹ nhàng lành mạnh.',
    description_en: 'Oat bar combined with naturally dried strawberries and blueberries, sweet and sour, perfect for a light, healthy snack.',
    short_description_vi: '15g Protein, vị trái cây chua ngọt tự nhiên từ berries.',
    short_description_en: '15g Protein, naturally sweet and sour berry flavor.',
    price: 55000,
    sale_price: 49000,
    stock: 150,
    calories: 190,
    protein: 15.0,
    carbs: 22.0,
    fat: 5.0,
    nutrition_tags: ['Antioxidant', 'Low Fat', 'Natural Fruits'],
    category_slug: 'protein-bars',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&auto=format&fit=crop&q=80'
  },

  // 2. Meal Prep
  {
    slug: 'grilled-chicken-brown-rice',
    name_vi: 'Ức Gà Nướng Cơm Lứt & Bông Cải Xanh',
    name_en: 'Grilled Chicken Breast with Brown Rice & Broccoli',
    description_vi: 'Bữa ăn chuẩn fitness với ức gà nướng thảo mộc mềm mọng, cơm gạo lứt dẻo thơm và bông cải xanh hấp giàu chất xơ.',
    description_en: 'Fitness-standard meal with juicy herb-grilled chicken breast, soft brown rice, and fiber-rich steamed broccoli.',
    short_description_vi: 'Bữa ăn giàu protein, ít tinh bột nhanh, chuẩn eat clean.',
    short_description_en: 'High protein meal, low fast carbs, eat-clean standard.',
    price: 85000,
    sale_price: 79000,
    stock: 50,
    calories: 450,
    protein: 40.0,
    carbs: 45.0,
    fat: 8.0,
    nutrition_tags: ['High Protein', 'Clean Carbs', 'Low Fat'],
    category_slug: 'meal-prep',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'salmon-teriyaki-quinoa',
    name_vi: 'Cá Hồi Teriyaki với Hạt Quinoa & Măng Tây',
    name_en: 'Salmon Teriyaki with Quinoa & Asparagus',
    description_vi: 'Cá hồi áp chảo sốt Teriyaki thơm lừng kết hợp hạt diêm mạch Quinoa giàu dinh dưỡng và măng tây giòn ngọt.',
    description_en: 'Pan-seared salmon with Teriyaki sauce, nutritious quinoa, and crispy sweet asparagus.',
    short_description_vi: 'Giàu Omega-3 và protein chất lượng cao từ cá hồi Đại Tây Dương.',
    short_description_en: 'Rich in Omega-3 and high-quality protein from Atlantic salmon.',
    price: 120000,
    sale_price: null,
    stock: 35,
    calories: 520,
    protein: 35.0,
    carbs: 40.0,
    fat: 15.0,
    nutrition_tags: ['Healthy Fats', 'Omega-3', 'Premium Meal'],
    category_slug: 'meal-prep',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'beef-stir-fry-sweet-potato',
    name_vi: 'Thịt Bò Xào Khoai Lang Mật & Đậu Cô Ve',
    name_en: 'Beef Stir-fry with Sweet Potato & Green Beans',
    description_vi: 'Thịt bò Mỹ thăn mềm xào lăn tiêu, ăn kèm khoai lang mật nướng lò ngọt dịu và đậu cô ve xào tỏi thơm ngon.',
    description_en: 'Tender US beef stir-fry with black pepper, served with sweet baked sweet potatoes and garlic green beans.',
    short_description_vi: 'Cung cấp năng lượng bền bỉ từ khoai lang mật và sắt từ thịt bò.',
    short_description_en: 'Provides long-lasting energy from sweet potatoes and iron from beef.',
    price: 95000,
    sale_price: 89000,
    stock: 40,
    calories: 480,
    protein: 38.0,
    carbs: 42.0,
    fat: 10.0,
    nutrition_tags: ['Energy Boost', 'Rich Iron', 'Muscle Growth'],
    category_slug: 'meal-prep',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  },

  // 3. Healthy Snacks
  {
    slug: 'baked-sweet-potato-chips',
    name_vi: 'Khoai Lang Sấy Giòn Muối Biển',
    name_en: 'Baked Sweet Potato Chips (Sea Salt)',
    description_vi: 'Snack khoai lang vàng được thái lát mỏng sấy giòn không dầu, rắc thêm chút muối biển tinh khiết đậm đà ngon miệng.',
    description_en: 'Thinly sliced yellow sweet potato chips baked oil-free, sprinkled with pure sea salt for a savory taste.',
    short_description_vi: 'Sấy không dầu, không cholesterol, ít calo.',
    short_description_en: 'Oil-free baked, zero cholesterol, low calorie.',
    price: 35000,
    sale_price: 32000,
    stock: 200,
    calories: 120,
    protein: 2.0,
    carbs: 24.0,
    fat: 2.0,
    nutrition_tags: ['Zero Trans Fat', 'Low Calorie', 'Oil Free'],
    category_slug: 'snacks',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'roasted-almonds-cashews-mix',
    name_vi: 'Hạt Điều & Hạnh Nhân Sấy Mộc',
    name_en: 'Roasted Almonds & Cashews Mix (Unsalted)',
    description_vi: 'Hỗn hợp hạnh nhân Mỹ và hạt điều Bình Phước loại A sấy mộc tự nhiên, không gia vị, giữ nguyên dưỡng chất béo bùi.',
    description_en: 'Mix of premium US almonds and Binh Phuoc cashews, naturally roasted without seasonings, keeping all rich nutrients.',
    short_description_vi: 'Nguồn chất béo tốt dồi dào, tốt cho tim mạch.',
    short_description_en: 'Rich source of healthy fats, excellent for heart health.',
    price: 75000,
    sale_price: null,
    stock: 150,
    calories: 180,
    protein: 6.0,
    carbs: 8.0,
    fat: 14.0,
    nutrition_tags: ['Healthy Fats', 'Brain Food', 'No Added Salt'],
    category_slug: 'snacks',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'dried-fruits-sugar-free',
    name_vi: 'Trái Cây Sấy Dẻo Thập Cẩm Không Đường',
    name_en: 'Dried Mixed Fruits (No Sugar Added)',
    description_vi: 'Trái cây sấy dẻo gồm xoài, mít, chuối chín cây ngọt tự nhiên, không tẩm đường hóa học, cung cấp vitamin và chất xơ.',
    description_en: 'Dehydrated mango, jackfruit, and banana, naturally sweet without added sugar, rich in vitamins and fiber.',
    short_description_vi: '100% trái cây tự nhiên, không chất bảo quản.',
    short_description_en: '100% natural fruits, no preservatives.',
    price: 40000,
    sale_price: 36000,
    stock: 180,
    calories: 150,
    protein: 2.0,
    carbs: 35.0,
    fat: 1.0,
    nutrition_tags: ['100% Fruit', 'Rich Vitamin', 'Fiber Rich'],
    category_slug: 'snacks',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80'
  },

  // 4. Protein Powder
  {
    slug: 'whey-protein-isolate-vanilla',
    name_vi: 'Whey Protein Isolate Tinh Khiết (Vị Vanilla) - 1kg',
    name_en: 'Premium Whey Protein Isolate (Vanilla) - 1kg',
    description_vi: 'Bột sữa whey cô lập siêu lọc, hấp thụ cực nhanh, hỗ trợ phục hồi và phát triển cơ bắp tối ưu. Hương vanilla tự nhiên thơm dịu.',
    description_en: 'Ultra-filtered whey protein isolate, fast absorption, supports optimal muscle recovery and growth. Subtle natural vanilla flavor.',
    short_description_vi: '25g Protein mỗi serving, cực ít tinh bột và chất béo.',
    short_description_en: '25g Protein per serving, extremely low carbs and fat.',
    price: 890000,
    sale_price: 820000,
    stock: 50,
    calories: 120,
    protein: 25.0,
    carbs: 2.0,
    fat: 1.0,
    nutrition_tags: ['Ultra Fast Absorb', 'Zero Lactose', 'Muscle Building'],
    category_slug: 'protein-powder',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'organic-plant-protein-chocolate',
    name_vi: 'Đạm Thực Vật Hữu Cơ (Vị Socola) - 900g',
    name_en: 'Organic Plant Protein (Chocolate Flavour) - 900g',
    description_vi: 'Nguồn đạm sạch chiết xuất hoàn toàn từ đậu Hà Lan hữu cơ, hạt chia và gạo lứt. Thích hợp cho người ăn chay hoặc dị ứng lactose.',
    description_en: 'Clean protein source extracted entirely from organic peas, chia seeds, and brown rice. Ideal for vegans or lactose intolerant users.',
    short_description_vi: '22g Đạm thực vật hữu cơ, bổ sung BCAAs đầy đủ.',
    short_description_en: '22g Organic plant protein, complete BCAAs profile.',
    price: 950000,
    sale_price: null,
    stock: 45,
    calories: 130,
    protein: 22.0,
    carbs: 4.0,
    fat: 2.0,
    nutrition_tags: ['Organic', 'Vegan', 'Non-GMO'],
    category_slug: 'protein-powder',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=600&auto=format&fit=crop&q=80'
  },

  // 5. Supplements
  {
    slug: 'daily-multivitamin-minerals',
    name_vi: 'Vitamin & Khoáng Chất Hàng Ngày (90 Viên)',
    name_en: 'Daily Multivitamin & Minerals (90 Capsules)',
    description_vi: 'Cung cấp đầy đủ 24 loại vitamin và khoáng chất thiết yếu cho cơ thể khỏe mạnh, tăng cường sức đề kháng và giảm mệt mỏi.',
    description_en: 'Provides 24 essential vitamins and minerals for a healthy body, boosting immunity and reducing fatigue.',
    short_description_vi: 'Tăng sức đề kháng, hỗ trợ trao đổi chất hiệu quả.',
    short_description_en: 'Boosts immune system, supports efficient metabolism.',
    price: 320000,
    sale_price: 290000,
    stock: 100,
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    nutrition_tags: ['Health Support', 'Immune Boost', 'Essential Vitamins'],
    category_slug: 'supplements',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'omega3-fish-oil-premium',
    name_vi: 'Dầu Cá Omega-3 Cao Cấp (120 Viên)',
    name_en: 'Premium Omega-3 Fish Oil (120 Softgels)',
    description_vi: 'Dầu cá tự nhiên tinh khiết, giàu EPA và DHA, giúp hỗ trợ hoạt động của tim mạch, bổ mắt và cải thiện chức năng não bộ.',
    description_en: 'Pure natural fish oil, rich in EPA and DHA, supporting cardiovascular health, vision, and cognitive functions.',
    short_description_vi: 'Hàm lượng EPA/DHA cao, hỗ trợ tim mạch và trí não.',
    short_description_en: 'High EPA/DHA content, supports heart and brain.',
    price: 450000,
    sale_price: 399000,
    stock: 80,
    calories: 10,
    protein: 0.0,
    carbs: 0.0,
    fat: 1.0,
    nutrition_tags: ['Cardiovascular', 'Brain Health', 'Pure Fish Oil'],
    category_slug: 'supplements',
    featured: true,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&auto=format&fit=crop&q=80'
  },

  // 6. Accessories
  {
    slug: 'smart-shaker-bottle-700ml',
    name_vi: 'Bình Lắc Thông Minh 3 Ngăn (700ml)',
    name_en: 'Smart Shaker Bottle with Storage Compartments (700ml)',
    description_vi: 'Bình lắc gym cao cấp có màng lưới đánh tan bột, kèm 2 ngăn phụ tháo rời bên dưới để đựng bột protein và viên vitamin.',
    description_en: 'Premium gym shaker bottle with blending grid, plus 2 detachable bottom compartments for protein powder and vitamins.',
    short_description_vi: 'Nhựa BPA Free an sau, 3 ngăn tiện lợi đi tập.',
    short_description_en: 'BPA-free safe plastic, convenient 3-compartment design.',
    price: 150000,
    sale_price: 125000,
    stock: 120,
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    nutrition_tags: ['BPA Free', 'Leak Proof', 'Multi-Compartments'],
    category_slug: 'accessories',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'
  },
  {
    slug: 'gym-lifting-straps-cotton',
    name_vi: 'Dây Kéo Lưng Gym Cotton Siêu Bền (Cặp)',
    name_en: 'Heavy Duty Cotton Gym Lifting Straps (Pair)',
    description_vi: 'Dây kéo lưng tập gym bằng sợi cotton dệt mật độ cao, lót cổ tay êm ái chống chai tay và hỗ trợ tăng lực kéo khi tập tạ nặng.',
    description_en: 'High-density woven cotton gym lifting straps, padded wrist for comfort, preventing calluses and assisting heavy pull workouts.',
    short_description_vi: 'Cotton dệt siêu bền, đệm lót neoprene êm ái.',
    short_description_en: 'Ultra-durable woven cotton, soft neoprene wrist padding.',
    price: 90000,
    sale_price: null,
    stock: 100,
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    nutrition_tags: ['Heavy Duty', 'Comfort Padding', 'Grip Assist'],
    category_slug: 'accessories',
    featured: false,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
  }
];

async function seed() {
  try {
    console.log('Seeding process started...');

    // 1. Check if database tables exist
    console.log('Checking database table accessibility...');
    const { data: testCats, error: testError } = await supabase.from('categories').select('id').limit(1);
    
    if (testError && testError.code === 'PGRST205') {
      console.error('\n=========================================');
      console.error('DATABASE ERROR: Tables do not exist yet!');
      console.error('=========================================');
      console.error('Please run the Supabase database migrations first.');
      console.error('You can do this by copying and running the SQL code in these files in the Supabase SQL Editor:');
      console.error('  1. supabase/migrations/0001_initial.sql');
      console.error('  2. supabase/migrations/0002_fix_rls_policies.sql');
      console.error('  3. supabase/migrations/0003_contact_newsletter.sql');
      console.error('=========================================\n');
      process.exit(1);
    }

    if (testError) {
      throw new Error(`Failed to check tables: ${testError.message}`);
    }

    // 2. Ensure Storage Bucket exists
    console.log('Ensuring Supabase storage bucket "products" exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.warn('Warning: Could not list storage buckets:', bucketsError.message);
    } else {
      const bucketExists = buckets.some(b => b.name === 'products');
      if (!bucketExists) {
        console.log('Bucket "products" not found. Attempting to create it...');
        const { data: newBucket, error: createBucketError } = await supabase.storage.createBucket('products', {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        });
        if (createBucketError) {
          console.error('Failed to create bucket "products":', createBucketError.message);
        } else {
          console.log('Successfully created public bucket "products".');
        }
      } else {
        console.log('Bucket "products" already exists.');
      }
    }

    // 3. Ensure Categories exist in DB
    console.log('Checking category records...');
    const { data: existingCategories, error: getCatsError } = await supabase.from('categories').select('*');
    if (getCatsError) throw getCatsError;

    let categoryMap = {};
    if (existingCategories.length === 0) {
      console.log('Categories table is empty. Seeding categories from schema...');
      const { data: insertedCats, error: seedCatsError } = await supabase
        .from('categories')
        .insert(categoriesToSeed)
        .select();
      
      if (seedCatsError) throw seedCatsError;
      console.log(`Seeded ${insertedCats.length} categories.`);
      insertedCats.forEach(c => {
        categoryMap[c.slug] = c.id;
      });
    } else {
      console.log(`Categories table already has ${existingCategories.length} records.`);
      existingCategories.forEach(c => {
        categoryMap[c.slug] = c.id;
      });
    }

    // 4. Download and upload images, then seed products
    console.log('Processing products and images...');
    
    // Clear existing products to prevent duplicates or slug conflicts
    console.log('Cleaning existing products (optional - deleting duplicates)...');
    const slugs = productsToSeed.map(p => p.slug);
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('slug', slugs);
    if (deleteError) {
      console.warn('Warning deleting existing products:', deleteError.message);
    }

    const insertedProducts = [];
    for (let i = 0; i < productsToSeed.length; i++) {
      const prod = productsToSeed[i];
      console.log(`\n[${i + 1}/15] Processing: ${prod.name_en} (${prod.slug})`);

      let finalImageUrl = prod.imageUrl;

      try {
        console.log(`Downloading image from Unsplash...`);
        const imgRes = await fetch(prod.imageUrl);
        if (!imgRes.ok) {
          throw new Error(`Failed to download image: ${imgRes.statusText}`);
        }
        
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = 'jpg';
        const storageFileName = `${prod.slug}.${fileExt}`;

        console.log(`Uploading to Supabase Storage: products/${storageFileName}...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(storageFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        console.log(`Upload successful. Path: ${uploadData.path}`);
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(uploadData.path);
        
        finalImageUrl = publicUrl;
        console.log(`Public URL: ${finalImageUrl}`);
      } catch (imgError) {
        console.warn(`Failed to process/upload image for ${prod.slug}:`, imgError.message);
        console.warn(`Falling back to direct Unsplash URL: ${prod.imageUrl}`);
      }

      const productToInsert = {
        slug: prod.slug,
        name_vi: prod.name_vi,
        name_en: prod.name_en,
        description_vi: prod.description_vi,
        description_en: prod.description_en,
        short_description_vi: prod.short_description_vi,
        short_description_en: prod.short_description_en,
        price: prod.price,
        sale_price: prod.sale_price,
        stock: prod.stock,
        calories: prod.calories,
        protein: prod.protein,
        carbs: prod.carbs,
        fat: prod.fat,
        nutrition_tags: prod.nutrition_tags,
        category_id: categoryMap[prod.category_slug],
        featured: prod.featured,
        active: prod.active,
        image_url: finalImageUrl
      };

      console.log(`Inserting product record into database...`);
      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(productToInsert)
        .select();

      if (insertError) {
        console.error(`Error inserting ${prod.slug}:`, insertError.message);
      } else {
        console.log(`Successfully seeded: ${inserted[0].name_en} (ID: ${inserted[0].id})`);
        insertedProducts.push(inserted[0]);
      }
    }

    console.log(`\n=========================================`);
    console.log(`SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`Seeded ${insertedProducts.length} out of 15 products.`);
    console.log(`=========================================\n`);

  } catch (error) {
    console.error('Fatal Seeding Error:', error);
  }
}

seed();
