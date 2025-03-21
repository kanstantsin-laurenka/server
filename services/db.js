const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.saveMetadata = async (file) => {
  const [name, extension] = file.originalname.split(/\.(?=[^\.]+$)/);
  await pool.query(`
    INSERT INTO images (name, extension, size)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE size = VALUES(size), last_updated = CURRENT_TIMESTAMP
  `, [name, extension, file.size]);
};

exports.getMetadata = async (name) => {
  const [rows] = await pool.query(`SELECT * FROM images WHERE name = ?`, [name]);
  return rows[0];
};

exports.getRandomMetadata = async () => {
  const [rows] = await pool.query(`SELECT * FROM images ORDER BY RAND() LIMIT 1`);
  return rows[0];
};

exports.deleteMetadata = async (name) => {
  await pool.query(`DELETE FROM images WHERE name = ?`, [name]);
};
