const db = require("../db");

const getReadyCards = async(req, res)=>{
    try {
    const query = `
      SELECT 
        p.id AS "planId",
        p.name AS "planName",
        COUNT(s.id) AS "available"


      FROM stock s
      JOIN plan p ON s.plan_id = p.id
      WHERE s.state = 'ready'
      GROUP BY p.id, p.name
      ORDER BY p.id;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
  
}
module.exports = {
 
  getReadyCards,
};
