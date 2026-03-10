// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Find or get the first user (will assign to admin)
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!user) {
    throw new Error('No admin user found. Please create an admin account first.');
  }

  console.log(`✅ Found admin user: ${user.email}`);

  // Check if layers already exist
  const existingLayers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "layers"`;
  if (existingLayers[0].count > 0) {
    console.log('⚠️  Layers already exist. Skipping layer creation.');
    const layers = await prisma.layer.findMany();
    console.log(`✅ Found ${layers.length} existing layers`);

    // Check if features exist
    const existingFeatures = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "features"`;
    if (existingFeatures[0].count > 0) {
      console.log('⚠️  Features already exist. Skipping seed.');
      return;
    }

    // Create features using raw SQL with PostGIS geometry
    console.log('Creating features...');

    // Tourist sites (Points) - Layer ID should match existing layer
    const touristLayer = layers.find(l => l.name_ar.includes('المواقع'));
    if (touristLayer) {
      await prisma.$queryRaw`
        INSERT INTO "features" (id, "layer_id", geometry, attributes, "created_at", "updated_at", "created_by")
        VALUES
          (
            gen_random_uuid(),
            ${touristLayer.id},
            ST_MakePoint(3.0588, 36.7538)::geometry(Point, 4326),
            ${JSON.stringify({
              name_ar: 'القصبة الجزائرية',
              name_fr: 'Casbah d\'Alger',
              description_ar: 'المدينة القديمة في الجزائر العاصمة',
              description_fr: 'La vieille ville d\'Alger',
              type: 'historical_site',
              rating: 4.8,
            })},
            NOW(),
            NOW(),
            ${user.id}
          ),
          (
            gen_random_uuid(),
            ${touristLayer.id},
            ST_MakePoint(3.2240, 36.7538)::geometry(Point, 4326),
            ${JSON.stringify({
              name_ar: 'نصب الشهيد',
              name_fr: 'Mémorial du Martyr',
              description_ar: 'نصب تذكاري commemorating استقلال الجزائر',
              description_fr: 'Mémorial commémorant l\'indépendance de l\'Algérie',
              type: 'monument',
              rating: 4.9,
            })},
            NOW(),
            NOW(),
            ${user.id}
          ),
          (
            gen_random_uuid(),
            ${touristLayer.id},
            ST_MakePoint(2.9800, 36.7900)::geometry(Point, 4326),
            ${JSON.stringify({
              name_ar: 'حديقة التجربة',
              name_fr: 'Jardin d\'Essai',
              description_ar: 'أكبر حديقة عامة في الجزائر',
              description_fr: 'Le plus grand jardin public d\'Alger',
              type: 'park',
              rating: 4.5,
            })},
            NOW(),
            NOW(),
            ${user.id}
          )
      `;
      console.log(`✅ Created 3 tourist site features`);
    }

    // Roads (Lines)
    const roadLayer = layers.find(l => l.name_ar.includes('الطرق'));
    if (roadLayer) {
      await prisma.$queryRaw`
        INSERT INTO "features" (id, "layer_id", geometry, attributes, "created_at", "updated_at", "created_by")
        VALUES
          (
            gen_random_uuid(),
            ${roadLayer.id},
            ST_MakeLine(ARRAY[
              ST_MakePoint(3.0500, 36.7500),
              ST_MakePoint(3.0600, 36.7550),
              ST_MakePoint(3.0650, 36.7600)
            ])::geometry(LineString, 4326),
            ${JSON.stringify({
              name_ar: 'شارع الاستقلال',
              name_fr: 'Rue de l\'Indépendance',
              type: 'main_road',
              length_km: 2.5,
              lanes: 2,
            })},
            NOW(),
            NOW(),
            ${user.id}
          ),
          (
            gen_random_uuid(),
            ${roadLayer.id},
            ST_MakeLine(ARRAY[
              ST_MakePoint(3.0400, 36.7600),
              ST_MakePoint(3.0500, 36.7550),
              ST_MakePoint(3.0588, 36.7538)
            ])::geometry(LineString, 4326),
            ${JSON.stringify({
              name_ar: 'طريق باب الواد',
              name_fr: 'Route de Bab El Oued',
              type: 'secondary_road',
              length_km: 3.2,
              lanes: 2,
            })},
            NOW(),
            NOW(),
            ${user.id}
          )
      `;
      console.log(`✅ Created 2 road features`);
    }

    // Residential areas (Polygons)
    const residentialLayer = layers.find(l => l.name_ar.includes('المناطق'));
    if (residentialLayer) {
      await prisma.$queryRaw`
        INSERT INTO "features" (id, "layer_id", geometry, attributes, "created_at", "updated_at", "created_by")
        VALUES
          (
            gen_random_uuid(),
            ${residentialLayer.id},
            ST_MakePolygon(ST_MakeLine(ARRAY[
              ST_MakePoint(3.0450, 36.7400),
              ST_MakePoint(3.0550, 36.7400),
              ST_MakePoint(3.0550, 36.7500),
              ST_MakePoint(3.0450, 36.7500),
              ST_MakePoint(3.0450, 36.7400)
            ]))::geometry(Polygon, 4326),
            ${JSON.stringify({
              name_ar: 'حي الجزائر الوسطى',
              name_fr: 'Quartier Centre-ville',
              type: 'residential',
              population: 15000,
              area_hectares: 8.5,
            })},
            NOW(),
            NOW(),
            ${user.id}
          ),
          (
            gen_random_uuid(),
            ${residentialLayer.id},
            ST_MakePolygon(ST_MakeLine(ARRAY[
              ST_MakePoint(3.0600, 36.7500),
              ST_MakePoint(3.0750, 36.7500),
              ST_MakePoint(3.0750, 36.7600),
              ST_MakePoint(3.0600, 36.7600),
              ST_MakePoint(3.0600, 36.7500)
            ]))::geometry(Polygon, 4326),
            ${JSON.stringify({
              name_ar: 'حي باب الواد',
              name_fr: 'Quartier Bab El Oued',
              type: 'residential',
              population: 45000,
              area_hectares: 12.3,
            })},
            NOW(),
            NOW(),
            ${user.id}
          )
      `;
      console.log(`✅ Created 2 residential area features`);
    }

    const featureCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "features"`;
    console.log(`✅ Created ${featureCount[0].count} features in total`);
  } else {
    console.log('No existing layers found. Please create layers first.');
  }

  console.log('🌱 Seed completed successfully!');
  console.log('');
  console.log('Sample data is now available on the map!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
