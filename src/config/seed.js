const { query } = require('./database');

// Seed database with sample data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Statistics
    const stats = [
      { label: 'Students Trained', current_value: 342, target_value: 500, unit: 'per year', description: 'Students trained in AI fundamentals', icon: 'users', display_order: 1 },
      { label: 'International Workshops', current_value: 2, target_value: 3, unit: 'annually', description: 'International AI workshops hosted', icon: 'globe', display_order: 2 },
      { label: 'Research Papers', current_value: 15, target_value: 25, unit: 'published', description: 'AI research papers published', icon: 'file-text', display_order: 3 },
      { label: 'Industry Partners', current_value: 8, target_value: 15, unit: 'active', description: 'Active industry collaborations', icon: 'handshake', display_order: 4 }
    ];

    for (const stat of stats) {
      await query(`
        INSERT INTO statistics (label, current_value, target_value, unit, description, icon, display_order, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
        ON CONFLICT DO NOTHING
      `, [stat.label, stat.current_value, stat.target_value, stat.unit, stat.description, stat.icon, stat.display_order]);
    }
    console.log('✅ Statistics seeded');

    // 2. Seed Team Members
    const teamMembers = [
      { full_name: 'Pr. LAGHA Mohand', title: 'Director', role: 'Head of AI House', bio: 'Professor specializing in Artificial Intelligence and Machine Learning research.', email: 'm.lagha@univ-blida.dz', display_order: 1 },
      { full_name: 'Dr. Boumahdi Fatima', title: 'Vice Director', role: 'Research Coordinator', bio: 'Expert in deep learning applications and neural networks.', email: 'f.boumahdi@univ-blida.dz', display_order: 2 },
      { full_name: 'Pr. Fareh Messaouda', title: 'Senior Researcher', role: 'Education Lead', bio: 'Focuses on AI in education and smart pedagogy.', email: 'm.fareh@univ-blida.dz', display_order: 3 },
      { full_name: 'Dr. Mezzi Meyara', title: 'Researcher', role: 'Industry Relations', bio: 'Bridging academia and industry for AI innovation.', email: 'm.mezzi@univ-blida.dz', display_order: 4 },
      { full_name: 'Dr. Ykhlef Hadjer', title: 'Researcher', role: 'Student Programs', bio: 'Coordinates student training and workshop programs.', email: 'h.ykhlef@univ-blida.dz', display_order: 5 }
    ];

    for (const member of teamMembers) {
      await query(`
        INSERT INTO team_members (full_name, title, role, bio, email, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT DO NOTHING
      `, [member.full_name, member.title, member.role, member.bio, member.email, member.display_order]);
    }
    console.log('✅ Team members seeded');

    // 3. Seed Sample Events
    const events = [
      {
        title: 'Smart Pedagogy DATATHON 2026',
        description: 'A 3-day datathon focused on AI applications in education and smart pedagogy.',
        event_type: 'datathon',
        start_date: new Date('2026-04-15T09:00:00'),
        end_date: new Date('2026-04-17T18:00:00'),
        location: 'AI House, Aeronautics Pavilion 20, Blida 1 University',
        max_participants: 100,
        is_featured: true,
        status: 'upcoming',
        created_by: 1
      },
      {
        title: 'PyStep2: Advanced Python for AI',
        description: 'Advanced Python programming workshop for AI and machine learning applications.',
        event_type: 'training',
        start_date: new Date('2026-05-10T09:00:00'),
        end_date: new Date('2026-05-14T17:00:00'),
        location: 'Computer Science Department, Blida 1 University',
        max_participants: 50,
        is_featured: true,
        status: 'upcoming',
        created_by: 1
      },
      {
        title: 'Literature Review Seminar',
        description: 'Monthly seminar discussing latest AI research papers and literature.',
        event_type: 'seminar',
        start_date: new Date('2026-03-20T14:00:00'),
        end_date: null,
        location: 'AI House Conference Room',
        max_participants: 30,
        is_featured: false,
        status: 'completed',
        created_by: 1
      },
      {
        title: 'Smart Irrigation Workshop',
        description: 'Workshop on AI applications in agriculture and smart irrigation systems.',
        event_type: 'workshop',
        start_date: new Date('2026-06-05T10:00:00'),
        end_date: new Date('2026-06-06T16:00:00'),
        location: 'Agricultural Engineering Department',
        max_participants: 40,
        is_featured: true,
        status: 'upcoming',
        created_by: 1
      }
    ];

    for (const event of events) {
      await query(`
        INSERT INTO events (title, description, event_type, start_date, end_date, location, max_participants, is_featured, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [event.title, event.description, event.event_type, event.start_date, event.end_date, event.location, event.max_participants, event.is_featured, event.status, event.created_by]);
    }
    console.log('✅ Events seeded');

    // 4. Seed Testimonials
    const testimonials = [
      {
        author_name: 'Ahmed Benali',
        author_title: 'Computer Science Student',
        author_organization: 'Blida 1 University',
        content: 'The PyStep1 training completely changed my perspective on AI. The hands-on approach and expert guidance helped me build my first neural network!',
        rating: 5,
        is_approved: true,
        is_featured: true
      },
      {
        author_name: 'Sarah Khouani',
        author_title: 'PhD Researcher',
        author_organization: 'CDE/CATI',
        content: 'The AI House provides excellent resources for researchers. The datathons are well-organized and foster great collaboration.',
        rating: 5,
        is_approved: true,
        is_featured: true
      },
      {
        author_name: 'Dr. Karim Fellah',
        author_title: 'Assistant Professor',
        author_organization: 'Faculty of Sciences',
        content: 'As a new teacher, the workshops on integrating AI tools into teaching have been invaluable. Highly recommended!',
        rating: 4,
        is_approved: true,
        is_featured: false
      }
    ];

    for (const testimonial of testimonials) {
      await query(`
        INSERT INTO testimonials (author_name, author_title, author_organization, content, rating, is_approved, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [testimonial.author_name, testimonial.author_title, testimonial.author_organization, testimonial.content, testimonial.rating, testimonial.is_approved, testimonial.is_featured]);
    }
    console.log('✅ Testimonials seeded');

    // 5. Seed Sample Contact Inquiries
    const inquiries = [
      {
        name: 'Ali Merabet',
        email: 'ali.merabet@example.com',
        subject: 'Partnership Opportunity',
        message: 'Our startup would like to explore collaboration opportunities with the AI House for student internships.',
        inquiry_type: 'partnership',
        status: 'new'
      },
      {
        name: 'Lina Boudraa',
        email: 'lina.boudraa@example.com',
        subject: 'Registration for Smart Pedagogy DATATHON',
        message: 'I would like to register for the upcoming datathon. Could you provide more information about the registration process?',
        inquiry_type: 'event',
        status: 'in_progress'
      }
    ];

    for (const inquiry of inquiries) {
      await query(`
        INSERT INTO contact_inquiries (name, email, subject, message, inquiry_type, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [inquiry.name, inquiry.email, inquiry.subject, inquiry.message, inquiry.inquiry_type, inquiry.status]);
    }
    console.log('✅ Contact inquiries seeded');

    console.log('✨ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
