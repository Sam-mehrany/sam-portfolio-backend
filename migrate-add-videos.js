const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'server', 'uploads', 'cms.db');

console.log('🔧 Starting migration to add videos column...');
console.log('📁 Database path:', dbPath);

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check current schema
db.all('PRAGMA table_info(projects)', [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking table schema:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('\n📋 Current projects table columns:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

  const hasVideosColumn = columns.some(col => col.name === 'videos');

  if (hasVideosColumn) {
    console.log('\n✅ Videos column already exists!');
    db.close();
    process.exit(0);
  } else {
    console.log('\n⚠️  Videos column NOT found. Adding it now...');

    // Add the videos column
    db.run('ALTER TABLE projects ADD COLUMN videos TEXT', (err) => {
      if (err) {
        console.error('❌ Error adding videos column:', err.message);
        db.close();
        process.exit(1);
      }

      console.log('✅ Successfully added videos column!');

      // Verify it was added
      db.all('PRAGMA table_info(projects)', [], (err, newColumns) => {
        if (err) {
          console.error('❌ Error verifying:', err.message);
        } else {
          console.log('\n📋 Updated projects table columns:');
          newColumns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
        }

        db.close();
        console.log('\n✨ Migration complete!');
        process.exit(0);
      });
    });
  }
});
