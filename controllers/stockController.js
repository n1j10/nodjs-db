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






const getSoldCards = async(req, res)=>{
    try {
    const query = `
      SELECT 
        p.id AS "planId",
        p.name AS "planName",
        COUNT(s.id) AS "not available"


      FROM stock s
      JOIN plan p ON s.plan_id = p.id
      WHERE s.state = 'sold'
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

const InsertCardCode = async (req, res) => {

  const { planId, codes } = req.body;

  //check entrance
  if (!planId || !Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: "planId and codes[] are required" });
  }

  try {

    //build values to enter
    const values = codes.map(
      (code) => `('${code}', 'ready', ${planId}, NOW())`
    ).join(",");

    const query = `
      INSERT INTO stock (code, state, plan_id, created_at)
      VALUES ${values}
      RETURNING id;
    `;

    const result = await db.query(query);
    res.status(201).json({ inserted: result.rowCount });
  } catch (err) {
  console.error("❌ DB Error:", err);
  res.status(500).json({ error: err.message });
}


};











module.exports = {
 getSoldCards,
  getReadyCards,
  InsertCardCode
};
