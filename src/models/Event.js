const { query, transaction } = require('../config/database');

class Event {
  // Create a new event
  static async create(eventData) {
    const {
      title, description, event_type, start_date, end_date,
      location, registration_link, max_participants, image_url,
      is_featured, status, created_by
    } = eventData;

    const result = await query(`
      INSERT INTO events (
        title, description, event_type, start_date, end_date,
        location, registration_link, max_participants, image_url,
        is_featured, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [title, description, event_type, start_date, end_date,
        location, registration_link, max_participants, image_url,
        is_featured, status, created_by]);

    return result.rows[0];
  }

  // Get all events with optional filters
  static async findAll({ status, event_type, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (event_type) {
      sql += ` AND event_type = $${paramIndex++}`;
      params.push(event_type);
    }

    sql += ` ORDER BY start_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  // Get event by ID with media
  static async findById(id) {
    const eventResult = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) return null;

    const event = eventResult.rows[0];
    
    // Get associated media
    const mediaResult = await query(
      'SELECT * FROM media WHERE event_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    event.media = mediaResult.rows;
    return event;
  }

  // Get featured events
  static async findFeatured(limit = 3) {
    const result = await query(
      'SELECT * FROM events WHERE is_featured = true AND status = $1 ORDER BY start_date ASC LIMIT $2',
      ['upcoming', limit]
    );
    return result.rows;
  }

  // Get upcoming events
  static async findUpcoming(limit = 10) {
    const result = await query(
      `SELECT * FROM events 
       WHERE status = 'upcoming' AND start_date > NOW()
       ORDER BY start_date ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Update event
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete event
  static async delete(id) {
    const result = await query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Increment participant count
  static async incrementParticipants(id) {
    const result = await query(
      'UPDATE events SET current_participants = current_participants + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Event;
