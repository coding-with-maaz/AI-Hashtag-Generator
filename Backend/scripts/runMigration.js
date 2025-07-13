const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running migration to add views column...');
    
    // Add views column to keyword_searches table
    await sequelize.query(`
      ALTER TABLE keyword_searches 
      ADD COLUMN views INT NOT NULL DEFAULT 0 
      COMMENT 'Anonymous view count for this keyword search'
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Views column added to keyword_searches table');
    
    // Verify the column was added
    const [results] = await sequelize.query(`
      DESCRIBE keyword_searches
    `);
    
    const viewsColumn = results.find(col => col.Field === 'views');
    if (viewsColumn) {
      console.log('✅ Views column verified:', {
        field: viewsColumn.Field,
        type: viewsColumn.Type,
        null: viewsColumn.Null,
        default: viewsColumn.Default,
        comment: viewsColumn.Comment
      });
    } else {
      console.log('❌ Views column not found in table structure');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if column already exists
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  Views column already exists in the table');
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMigration(); 