const { query } = require('./database');

// Initialize database tables
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Create tables in order (respecting foreign key dependencies)
    
    // 1. Admins table (for CMS authentication)
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) CHECK (event_type IN ('workshop', 'seminar', 'datathon', 'training', 'conference', 'other')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location VARCHAR(200),
        registration_link VARCHAR(500),
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        image_url VARCHAR(500),
        is_featured BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
        created_by INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Team members table
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        title VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        bio TEXT,
        email VARCHAR(100),
        image_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        research_interests TEXT[],
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Testimonials table
    await query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(100) NOT NULL,
        author_title VARCHAR(100),
        author_organization VARCHAR(100),
        content TEXT NOT NULL,
        event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        image_url VARCHAR(500),
        is_featured BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Statistics table (for measurable outcomes)
    await query(`
      CREATE TABLE IF NOT EXISTS statistics (
        id SERIAL PRIMARY KEY,
        label VARCHAR(100) NOT NULL,
        current_value INTEGER NOT NULL DEFAULT 0,
        target_value INTEGER,
        unit VARCHAR(50),
        description TEXT,
        icon VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        updated_by INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Contact inquiries table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'partnership', 'event', 'research', 'other')),
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
        admin_notes TEXT,
        assigned_to INTEGER REFERENCES admins(id),
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Media gallery table (for event photos/videos)
    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
        title VARCHAR(200),
        url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        caption TEXT,
        uploaded_by INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Announcements table
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_by INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)');
    await query('CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured)');
    await query('CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured)');
    await query('CREATE INDEX IF NOT EXISTS idx_inquiries_status ON contact_inquiries(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_statistics_active ON statistics(is_active)');

    console.log('✅ Database initialized successfully');
    
    // Create default super admin if none exists
    const bcrypt = require('bcryptjs');
    const adminExists = await query('SELECT id FROM admins WHERE role = $1 LIMIT 1', ['super_admin']);
    
    if (adminExists.rows.length === 0) {
      const defaultPassword = await bcrypt.hash('admin123', 10);
      await query(`
        INSERT INTO admins (username, email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'admin@ai-house.blida1.dz', defaultPassword, 'Administrator', 'super_admin']);
      console.log('👤 Default super admin created (username: admin, password: admin123)');
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
