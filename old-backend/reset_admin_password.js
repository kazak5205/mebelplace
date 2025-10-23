const bcrypt = require('bcryptjs');
const { pool } = require('/app/server/config/database');

async function resetAdminPassword() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE role = $2 RETURNING id, username, phone',
      [hashedPassword, 'admin']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('Admin user:', result.rows[0]);
      console.log('New password:', newPassword);
    } else {
      console.log('❌ No admin user found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();

