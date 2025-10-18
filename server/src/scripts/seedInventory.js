/**
 * Inventory Seed Script
 *
 * Creates or updates inventory (drugs) records in the database.
 * The script is idempotent and can be re-run safely.
 *
 * Usage: node src/scripts/seedInventory.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from '../models/Inventory.js';

dotenv.config();

const seedItems = [
  {
    drugName: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    quantity: 200,
    unit: 'capsules',
    reorderLevel: 50,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    batchNumber: 'AMX-2025-01',
    supplier: 'Acme Pharmaceuticals',
    costPerUnit: 0.12,
    alternatives: [ { drugName: 'Augmentin', genericName: 'Amoxicillin/Clavulanate' } ]
  },
  {
    drugName: 'Lisinopril',
    genericName: 'Lisinopril',
    category: 'Antihypertensive',
    quantity: 120,
    unit: 'tablets',
    reorderLevel: 30,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
    batchNumber: 'LSP-2024-07',
    supplier: 'HealthSource Ltd',
    costPerUnit: 0.18,
    alternatives: []
  },
  {
    drugName: 'Metformin',
    genericName: 'Metformin HCl',
    category: 'Antidiabetic',
    quantity: 300,
    unit: 'tablets',
    reorderLevel: 60,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    batchNumber: 'MTF-2024-11',
    supplier: 'Global Meds',
    costPerUnit: 0.08,
    alternatives: []
  },
  {
    drugName: 'Ibuprofen',
    genericName: 'Ibuprofen',
    category: 'Analgesic',
    quantity: 500,
    unit: 'tablets',
    reorderLevel: 100,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
    batchNumber: 'IBU-2025-02',
    supplier: 'PainAway Inc',
    costPerUnit: 0.05,
    alternatives: [ { drugName: 'Naproxen', genericName: 'Naproxen' } ]
  },
  {
    drugName: 'Atorvastatin',
    genericName: 'Atorvastatin',
    category: 'Lipid-lowering agent',
    quantity: 90,
    unit: 'tablets',
    reorderLevel: 20,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    batchNumber: 'ATV-2023-09',
    supplier: 'CardioPharm',
    costPerUnit: 0.45,
    alternatives: []
  }
];

async function seedInventory() {
  try {
    console.log('🌱 Inventory Seed - Starting');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const item of seedItems) {
      const existing = await Inventory.findOne({ drugName: item.drugName });

      if (existing) {
        // Update fields sensibly while preserving certain metadata
        existing.genericName = item.genericName || existing.genericName;
        existing.category = item.category || existing.category;
        existing.unit = item.unit || existing.unit;
        existing.reorderLevel = item.reorderLevel ?? existing.reorderLevel;
        existing.batchNumber = item.batchNumber || existing.batchNumber;
        existing.supplier = item.supplier || existing.supplier;
        existing.costPerUnit = item.costPerUnit ?? existing.costPerUnit;
        existing.alternatives = item.alternatives || existing.alternatives;

        // For quantity and expiry, allow seeding to top-up but don't reduce existing stock unintentionally
        if (item.quantity > 0) existing.quantity = Math.max(existing.quantity, item.quantity);
        if (item.expiryDate) existing.expiryDate = item.expiryDate;
        existing.lastRestocked = new Date();

        await existing.save();
        updated++;
        console.log(`🔁 Updated: ${item.drugName}`);
      } else {
        await Inventory.create(item);
        created++;
        console.log(`✅ Created: ${item.drugName}`);
      }
    }

    console.log('\n📊 Inventory Seed Results');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);

    // Show quick summary of inventory items inserted
    const total = await Inventory.countDocuments();
    console.log(`   Total inventory records: ${total}`);

    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    console.log('✅ Inventory seeding complete');
  } catch (err) {
    console.error('❌ Inventory seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seedInventory();
