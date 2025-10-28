
const db = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");



const getClientInvoices = async (req, res) => {
  const clientId = req.params.id;

  try {
    const query = `
  SELECT 
    i.id,
    i.price,
    i.plan_name,
    i.code,
    i.created_at,
    i.client_id
  FROM invoice i
  WHERE i.client_id = $1
  ORDER BY i.created_at DESC
  LIMIT 50;
`;


    const result = await db.query(query, [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No invoices found for this client." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
getClientInvoices
};
