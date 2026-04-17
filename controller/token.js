const db = require("../db");

async function storeSessionToken(sessionToken, id) {
    try {
      const [result] = await db.query(
      'UPDATE students SET token = ? WHERE id = ?',
      [id, sessionToken]
    );
    console.log(result);
    
    return result;
    } catch (error) {
      console.error('Error storing session token:', error);
      throw error;
    }
  }

module.exports = { storeSessionToken };