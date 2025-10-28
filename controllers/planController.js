const db = require("../db");

const getPlans = async () => {
  const { rows } = await db.query("SELECT * FROM plan");
  return rows;
};

const getPlanById = async (palnId) => {
  const { rows } = await db.query(`SELECT * FROM plan WHERE id = ${palnId}`);
  return rows[0];
};

const purchase = async (planId, clientId) => {
  const stockResult = await db.query(
    `SELECT * FROM stock WHERE plan_id = ${planId} AND state = 'ready'`
  );
  if (stockResult.rows.length == 0) {
    return { success: false, message: "no stock" };
  }

  const clientResults = await db.query(
    `SELECT * FROM client WHERE id = ${clientId}`
  );

  if (clientResults.rows.length == 0) {
    return { success: false, message: "منيلك هاي الكلاوات" };
  }

  const planResult = await db.query(`SELECT * FROM plan WHERE id = ${planId}`);

  let user = clientResults.rows[0];
  let stock = stockResult.rows[0];
  let plan = planResult.rows[0];

  if (user.balance < parseInt(plan.price)) {
    return { success: false, message: "ماعندك فلوس، روح اشتغل وتعال" };
  }

  await db.query(`UPDATE stock SET state = 'sold' WHERE id = ${stock.id}`);
  await db.query(
    `UPDATE client SET balance = ${
      user.balance - plan.price
    } WHERE id = ${clientId}`
  );

  const result = await db.query(
    `INSERT INTO invoice (plan_id, code, client_id, price, plan_name)
    VALUES (${planId}, '${stock.code}', ${clientId}, ${plan.price}, '${plan.name}')
    RETURNING *;`
  );

  const newInvoice = result.rows[0];

  return { success: true, code: stock.code, newInvoice };
};

// const getAllPlans = async (req, res) => {
//   try {
//     const result = await db.query("SELECT * FROM plan");
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("❌ Error fetching plans:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

//check it after done +++++++++

 const getAllPlans = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image,
        p.description,
        p.created_at,
        p.updated_at,
        COUNT(s.id) AS ready_count
      FROM plan p
      LEFT JOIN stock s 
        ON s.plan_id = p.id AND s.state = 'ready'
      GROUP BY p.id
      ORDER BY p.id;
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching plans:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getPlanStockSummary = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
          p.id AS "planId",
          p.name AS "planName",
          COUNT(CASE WHEN s.state = 'ready' THEN 1 END) AS "ready",
          COUNT(CASE WHEN s.state = 'sold' THEN 1 END) AS "sold",
          COUNT(CASE WHEN s.state = 'error' THEN 1 END) AS "error"
      FROM plan p
      LEFT JOIN stock s ON p.id = s.plan_id
      WHERE p.id = $1
      GROUP BY p.id, p.name;
    `;

    const { rows } = await db.query(query, [id]);

    // إذا لم يتم العثور على الخطة
    if (rows.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching plan stock summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = {
  getPlans,
  getPlanById,
  purchase,
  getAllPlans,
  getPlanStockSummary,
  
};
