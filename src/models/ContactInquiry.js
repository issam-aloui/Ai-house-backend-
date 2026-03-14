const { query } = require('../config/database');

class ContactInquiry {
  static async create(data) {
    const { name, email, phone, subject, message, inquiry_type } = data;

    const result = await query(`
      INSERT INTO contact_inquiries (name, email, phone, subject, message, inquiry_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, email, phone, subject, message, inquiry_type]);

    return result.rows[0];
  }

  static async findAll({ status, inquiry_type, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM contact_inquiries WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (inquiry_type) {
      sql += ` AND inquiry_type = $${paramIndex++}`;
      params.push(inquiry_type);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM contact_inquiries WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async updateStatus(id, status, admin_notes, assigned_to) {
    const updates = ['status = $1'];
    const values = [status];
    let paramIndex = 2;

    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${paramIndex++}`);
      values.push(admin_notes);
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
    }

    if (status === 'resolved') {
      updates.push(`responded_at = $${paramIndex++}`);
      values.push(new Date());
    }

    values.push(id);

    const result = await query(
      `UPDATE contact_inquiries SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM contact_inquiries WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
      FROM contact_inquiries
    `);
    return result.rows[0];
  }
}

module.exports = ContactInquiry;
