import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial products into PostgreSQL Database...');

  // 1. Create Dummy Vendor User
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor.seed@digitalmarket.com' },
    update: {},
    create: {
      name: 'Verified Vendor',
      email: 'vendor.seed@digitalmarket.com',
      password: '$2a$10$eImiTXuWVxfM37uY4JANjO2Zst5T31x/.mJ.T651O.r3K7.6i.R6q', // dummy hash
      role: 'VENDOR',
    },
  });

  // 2. Initial 4 Store Products Data
  const sampleProducts = [
    {
      title: 'SaaS Dashboard UI Kit',
      category: 'UI/UX Templates',
      price: 29.0,
      description: 'Clean and modern Figma UI kit for modern SaaS applications and dashboards.',
      fileUrl: 'https://example.com/files/saas-dashboard-ui-kit.zip',
      status: 'APPROVED',
      vendorId: vendor.id,
    },
    {
      title: 'Full-Stack E-Commerce Starter',
      category: 'Code Scripts',
      price: 49.0,
      description: 'Next.js, Express.js, and Prisma full-stack e-commerce project template.',
      fileUrl: 'https://example.com/files/ecommerce-starter.zip',
      status: 'APPROVED',
      vendorId: vendor.id,
    },
    {
      title: 'Modern Portfolio Next.js Theme',
      category: 'UI/UX Templates',
      price: 19.0,
      description: 'Sleek, fast, and responsive portfolio theme for developers and designers.',
      fileUrl: 'https://example.com/files/portfolio-theme.zip',
      status: 'APPROVED',
      vendorId: vendor.id,
    },
    {
      title: 'React Native Mobile App UI Kit',
      category: 'Code Scripts',
      price: 39.0,
      description: 'Cross-platform mobile application starter pack with over 30+ pre-built screens.',
      fileUrl: 'https://example.com/files/react-native-ui.zip',
      status: 'APPROVED',
      vendorId: vendor.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Successfully seeded 4 products into PostgreSQL Database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });