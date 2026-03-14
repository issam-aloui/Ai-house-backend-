const { query } = require('../config/database');

class Testimonial {
  static async create(data) {
    const {
      author_name, author_title, author_organization,
      content, event_id, rating, image_url, is_featured
    } = data;

    const result = await query(`
      INSERT INTO testimonials (author_name, author_title, author_organization, content, event_id, rating, image_url, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [author_name, author_title, author_organization, content, event_id, rating, image_url, is_featured]);

    return result.rows[0];
  }

  static async findAll({ is_approved = true, is_featured, limit = 50 } = {}) {
    let sql = 'SELECT * FROM testimonials WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (is_approved !== undefined) {
      sql += ` AND is_approved = $${paramIndex++}`;
      params.push(is_approved);
    }

    if (is_featured !== undefined) {
      sql += ` AND is_featured = $${paramIndex++}`;
      params.push(is_featured);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM testimonials WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

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
    values.push(id);

    const result = await query(
      `UPDATE testimonials SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Testimonial;
