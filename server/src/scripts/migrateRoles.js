/**
 * Role Migration Script
 * 
 * This script migrates users from the old 7-role system to the new 3-role system:
 * - Doctor, Nurse, LabTechnician, Pharmacist → Staff
 * - Patient → Patient (unchanged)
 * - Admin → Admin (unchanged)
 * 
 * Usage: node src/scripts/migrateRoles.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const deprecatedRoles = ['Doctor', 'Nurse', 'LabTechnician', 'Pharmacist'];
const newStaffRole = 'Staff';

async function migrateRoles() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with deprecated roles
    console.log('\n📊 Finding users with deprecated roles...');
    const usersToMigrate = await User.find({ role: { $in: deprecatedRoles } });
    
    console.log(`Found ${usersToMigrate.length} users to migrate:`);
    usersToMigrate.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    if (usersToMigrate.length === 0) {
      console.log('\n✅ No users need migration. All users are already using the new role system.');
      await mongoose.connection.close();
      return;
    }

    // Ask for confirmation (in production, you might want to add a CLI prompt)
    console.log(`\n⚠️  About to migrate ${usersToMigrate.length} users to '${newStaffRole}' role...`);
    
    // Perform the migration
    console.log('\n🔄 Migrating users...');
    const result = await User.updateMany(
      { role: { $in: deprecatedRoles } },
      { $set: { role: newStaffRole } }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Modified: ${result.modifiedCount} users`);

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const remainingDeprecatedUsers = await User.find({ role: { $in: deprecatedRoles } });
    
    if (remainingDeprecatedUsers.length === 0) {
      console.log('✅ Verification passed: No users with deprecated roles found.');
    } else {
      console.log(`⚠️  Warning: ${remainingDeprecatedUsers.length} users still have deprecated roles.`);
    }

    // Show role distribution after migration
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📈 Current role distribution:');
    roleDistribution.forEach(({ _id, count }) => {
      console.log(`   - ${_id}: ${count} users`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Migration script completed. Database connection closed.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
migrateRoles();
