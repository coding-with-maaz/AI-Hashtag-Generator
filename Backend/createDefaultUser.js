const { User } = require('./models');

async function createDefaultUser() {
  try {
    console.log('Creating default user...');
    
    // Check if default user already exists
    const existingUser = await User.findByPk(1);
    if (existingUser) {
      console.log('Default user already exists with ID: 1');
      return existingUser;
    }

    // Create default user with ID 1
    const defaultUser = await User.create({
      id: 1, // Explicitly set ID to 1
      username: 'default_user',
      email: 'default@example.com',
      password_hash: 'default_hash_for_testing_only',
      first_name: 'Default',
      last_name: 'User',
      is_verified: true,
      is_active: true,
      is_premium: false,
      language: 'en',
      country: 'US',
      timezone: 'UTC',
      preferences: {
        theme: 'light',
        notifications: true
      }
    });

    console.log(`Created default user with ID: ${defaultUser.id}`);
    return defaultUser;

  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;
  }
}

// Run if this script is executed directly
if (require.main === module) {
  createDefaultUser()
    .then(() => {
      console.log('✅ Default user creation completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Default user creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultUser }; 