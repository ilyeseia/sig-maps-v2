import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if layers already exist
  const layerCount = await prisma.layer.count();
  if (layerCount > 0) {
    console.log(`✅ Database already seeded with ${layerCount} layers`);
    return;
  }

  // Create sample layers
  const layers = await Promise.all([
    prisma.layer.create({
      data: {
        name_ar: 'أنابيب المياه',
        name_fr: 'Conduites d\'eau',
        geometry_type: 'LINE',
        is_visible: true,
        z_index: 1,
        style: {
          color: '#3B82F6',
          opacity: 0.8,
          line_width: 3,
        },
        creator: {
          create: {
            data: {
              email: 'admin@example.com',
              passwordHash: '$2b$12$placeholderHash',
              name: 'Admin',
              language: 'ar',
            },
          },
        },
      },
    }),
    prisma.layer.create({
      data: {
        name_ar: 'محطات الضخم',
        name_fr: 'Stations de pompage',
        geometry_type: 'POINT',
        is_visible: true,
        z_index: 2,
        style: {
          color: '#EF4444',
          marker_size: 12,
        },
        creator: {
          create: {
            data: {
              email: 'admin@example.com',
              passwordHash: '$2b$12$placeholderHash',
              name: 'Admin',
              language: 'ar',
            },
          },
        },
      },
    }),
    prisma.layer.create({
      data: {
        name_ar: 'مناطق سكنية',
        name_fr: 'Zones résidentielles',
        geometry_type: 'POLYGON',
        is_visible: false,
        z_index: 0,
        style: {
          color: '#22C55E',
          fill_color: '#22C55E',
          fill_opacity: 0.3,
          line_width: 2,
        },
        creator: {
          create: {
            data: {
              email: 'admin@example.com',
              passwordHash: '$2b$12$placeholderHash',
              name: 'Admin',
              language: 'ar',
            },
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${layers.length} sample layers`);
  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
