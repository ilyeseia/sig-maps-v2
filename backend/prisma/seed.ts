import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if features already exist
  const featureCount = await prisma.feature.count();
  if (featureCount > 0) {
    console.log(`✅ Database already seeded with ${featureCount} features`);
    return;
  }

  // Create admin user if not exists
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5a.0', // bcrypt
        name: 'Admin',
        language: 'ar',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin user');
  }

  // Get or create layers
  let waterPipesLayer = await prisma.layer.findFirst({
    where: { geometry_type: 'LINE' },
  });

  if (!waterPipesLayer) {
    waterPipesLayer = await prisma.layer.create({
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
        created_by: adminUser.id,
      },
    });
    console.log('✅ Created water pipes layer');
  }

  let pumpingStationsLayer = await prisma.layer.findFirst({
    where: { geometry_type: 'POINT' },
  });

  if (!pumpingStationsLayer) {
    pumpingStationsLayer = await prisma.layer.create({
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
        created_by: adminUser.id,
      },
    });
    console.log('✅ Created pumping stations layer');
  }

  let residentialZonesLayer = await prisma.layer.findFirst({
    where: { geometry_type: 'POLYGON' },
  });

  if (!residentialZonesLayer) {
    residentialZonesLayer = await prisma.layer.create({
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
        created_by: adminUser.id,
      },
    });
    console.log('✅ Created residential zones layer');
  }

  // Create sample features
  const features = await Promise.all([
    // Water pipe lines (near Algiers)
    prisma.feature.create({
      data: {
        layerId: waterPipesLayer.id,
        geometry: {
          type: 'LineString',
          coordinates: [
            [3.04, 36.76],
            [3.05, 36.77],
            [3.06, 36.78],
            [3.07, 36.79],
          ],
        },
        attributes: {
          name: 'خط مياه رئيسي',
          diameter: '200mm',
          material: 'PVC',
          installed_date: '2020-01-15',
        },
        created_by: adminUser.id,
      },
    }),

    prisma.feature.create({
      data: {
        layerId: waterPipesLayer.id,
        geometry: {
          type: 'LineString',
          coordinates: [
            [3.0588, 36.7538],
            [3.0688, 36.7538],
            [3.0788, 36.7638],
            [3.0888, 36.7738],
          ],
        },
        attributes: {
          name: 'فرع ثانوي',
          diameter: '150mm',
          material: 'PVC',
          installed_date: '2021-05-20',
        },
        created_by: adminUser.id,
      },
    }),

    // Pumping stations (points)
    prisma.feature.create({
      data: {
        layerId: pumpingStationsLayer.id,
        geometry: {
          type: 'Point',
          coordinates: [3.06, 36.77],
        },
        attributes: {
          name: 'محطة الضخم - حيدرة',
          pump_type: 'Electric',
          capacity: '500 m³/h',
          status: 'active',
        },
        created_by: adminUser.id,
      },
    }),

    prisma.feature.create({
      data: {
        layerId: pumpingStationsLayer.id,
        geometry: {
          type: 'Point',
          coordinates: [3.0588, 36.7538],
        },
        attributes: {
          name: 'محطة الضخم - المركز',
          pump_type: 'Diesel',
          capacity: '800 m³/h',
          status: 'active',
        },
        created_by: adminUser.id,
      },
    }),

    prisma.feature.create({
      data: {
        layerId: pumpingStationsLayer.id,
        geometry: {
          type: 'Point',
          coordinates: [3.04, 36.76],
        },
        attributes: {
          name: 'محطة الضخم - الشمال',
          pump_type: 'Electric',
          capacity: '300 m³/h',
          status: 'active',
        },
        created_by: adminUser.id,
      },
    }),

    // Residential zones (polygons)
    prisma.feature.create({
      data: {
        layerId: residentialZonesLayer.id,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [3.05, 36.76],
              [3.07, 36.76],
              [3.07, 36.78],
              [3.05, 36.78],
              [3.05, 36.76],
            ],
          ],
        },
        attributes: {
          name: 'حي الهضرة',
          population: '5000',
          type: 'residential',
        },
        created_by: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${features.length} sample features`);
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
