import { seedDatabase } from '../lib/seed';

async function main() {
  console.log('🌱 Starting Billora database seeding...');
  try {
    const result = await seedDatabase(true);
    console.log('✅ Seeding complete!', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();

