const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
  static async create(data) {
    const { username, email, password, full_name, role } = data;
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO admins (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, role, is_active, created_at
    `, [username, email, password_hash, full_name, role || 'admin']);

    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admins WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUsername(username) {
    const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'password') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updateData[key]);
      }
    });

    if (updateData.password) {
      fields.push(`password_hash = $${paramIndex++}`);
      values.push(await bcrypt.hash(updateData.password, 10));
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, full_name, role, is_active, updated_at`,
      values
    );

    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const result = await query(
      'UPDATE admins SET last_login = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM admins WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin;
