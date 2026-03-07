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

  // Create sample layers
  const layers = [
    {
      nameAr: 'المواقع السياحية',
      nameFr: 'Sites touristiques',
      geometryType: 'POINT',
      isVisible: true,
      zIndex: 1,
      style: {
        color: '#ef4444',
        opacity: 0.85,
        radius: 8,
      },
      createdBy: user.id,
    },
    {
      nameAr: 'الطرق الرئيسية',
      nameFr: 'Routes principales',
      geometryType: 'LINE',
      isVisible: true,
      zIndex: 2,
      style: {
        color: '#3b82f6',
        opacity: 0.7,
        width: 4,
      },
      createdBy: user.id,
    },
    {
      nameAr: 'المناطق السكنية',
      nameFr: 'Zones résidentielles',
      geometryType: 'POLYGON',
      isVisible: true,
      zIndex: 0,
      style: {
        color: '#10b981',
        opacity: 0.5,
        fill_color: '#d1fae5'
      },
      createdBy: user.id,
    },
  ];

  const createdLayers = await Promise.all(
    layers.map(layer => prisma.layer.create({ data: layer }))
  );

  console.log(`✅ Created ${createdLayers.length} layers`);

  // Create sample features
  const features = [
    // Tourist sites (Points)
    {
      layerId: createdLayers[0].id,
      geometry: {
        type: 'Point',
        coordinates: [3.0588, 36.7538], // Algiers coordinates
      },
      attributes: {
        name_ar: 'القصبة الجزائرية',
        name_fr: 'Casbah d\'Alger',
        description_ar: 'المدينة القديمة في الجزائر العاصمة',
        description_fr: 'La vieille ville d\'Alger',
        type: 'historical_site',
        rating: 4.8,
      },
      createdBy: user.id,
    },
    {
      layerId: createdLayers[0].id,
      geometry: {
        type: 'Point',
        coordinates: [3.2240, 36.7538], // Martyr's Memorial
      },
      attributes: {
        name_ar: 'نصب الشهيد',
        name_fr: 'Mémorial du Martyr',
        description_ar: 'نصب تذكاري commemorating استقلال الجزائر',
        description_fr: 'Mémorial commémorant l\'indépendance de l\'Algérie',
        type: 'monument',
        rating: 4.9,
      },
      createdBy: user.id,
    },
    {
      layerId: createdLayers[0].id,
      geometry: {
        type: 'Point',
        coordinates: [2.9800, 36.7900], // Jardin d'Essai
      },
      attributes: {
        name_ar: 'حديقة التجربة',
        name_fr: 'Jardin d\'Essai',
        description_ar: 'أكبر حديقة عامة في الجزائر',
        description_fr: 'Le plus grand jardin public d\'Alger',
        type: 'park',
        rating: 4.5,
      },
      createdBy: user.id,
    },
    // Roads (Lines)
    {
      layerId: createdLayers[1].id,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.0500, 36.7500],
          [3.0600, 36.7550],
          [3.0650, 36.7600],
        ],
      },
      attributes: {
        name_ar: 'شارع الاستقلال',
        name_fr: 'Rue de l\'Indépendance',
        type: 'main_road',
        length_km: 2.5,
        lanes: 2,
      },
      createdBy: user.id,
    },
    {
      layerId: createdLayers[1].id,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.0400, 36.7600],
          [3.0500, 36.7550],
          [3.0588, 36.7538],
        ],
      },
      attributes: {
        name_ar: 'طريق باب الواد',
        name_fr: 'Route de Bab El Oued',
        type: 'secondary_road',
        length_km: 3.2,
        lanes: 2,
      },
      createdBy: user.id,
    },
    // Residential areas (Polygons)
    {
      layerId: createdLayers[2].id,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.0450, 36.7400],
            [3.0550, 36.7400],
            [3.0550, 36.7500],
            [3.0450, 36.7500],
            [3.0450, 36.7400],
          ],
        ],
      },
      attributes: {
        name_ar: 'حي الجزائر الوسطى',
        name_fr: 'Quartier Centre-ville',
        type: 'residential',
        population: 15000,
        area_hectares: 8.5,
      },
      createdBy: user.id,
    },
    {
      layerId: createdLayers[2].id,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.0600, 36.7500],
            [3.0750, 36.7500],
            [3.0750, 36.7600],
            [3.0600, 36.7600],
            [3.0600, 36.7500],
          ],
        ],
      },
      attributes: {
        name_ar: 'حي باب الواد',
        name_fr: 'Quartier Bab El Oued',
        type: 'residential',
        population: 45000,
        area_hectares: 12.3,
      },
      createdBy: user.id,
    },
  ];

  const createdFeatures = await Promise.all(
    features.map(feature => prisma.feature.create({ data: feature }))
  );

  console.log(`✅ Created ${createdFeatures.length} features`);
  console.log('🌱 Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  Layers: ${createdLayers.length}`);
  console.log(`  Features: ${createdFeatures.length}`);
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
