const { query } = require('../config/database');

class Statistic {
  static async create(data) {
    const {
      label, current_value, target_value, unit,
      description, icon, display_order, updated_by
    } = data;

    const result = await query(`
      INSERT INTO statistics (label, current_value, target_value, unit, description, icon, display_order, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [label, current_value, target_value, unit, description, icon, display_order, updated_by]);

    return result.rows[0];
  }

  static async findAll({ is_active = true } = {}) {
    const result = await query(
      'SELECT * FROM statistics WHERE is_active = $1 ORDER BY display_order ASC, id ASC',
      [is_active]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM statistics WHERE id = $1', [id]);
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
      `UPDATE statistics SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM statistics WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Update current value
  static async updateValue(id, current_value, updated_by) {
    const result = await query(
      'UPDATE statistics SET current_value = $1, updated_by = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [current_value, updated_by, id]
    );
    return result.rows[0];
  }
}

module.exports = Statistic;
