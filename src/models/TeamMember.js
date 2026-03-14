const { query } = require('../config/database');

class TeamMember {
  static async create(data) {
    const {
      full_name, title, role, bio, email,
      image_url, linkedin_url, research_interests, display_order
    } = data;

    const result = await query(`
      INSERT INTO team_members (full_name, title, role, bio, email, image_url, linkedin_url, research_interests, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [full_name, title, role, bio, email, image_url, linkedin_url, research_interests, display_order]);

    return result.rows[0];
  }

  static async findAll({ is_active = true } = {}) {
    const result = await query(
      'SELECT * FROM team_members WHERE is_active = $1 ORDER BY display_order ASC, id ASC',
      [is_active]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM team_members WHERE id = $1', [id]);
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

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE team_members SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = TeamMember;
