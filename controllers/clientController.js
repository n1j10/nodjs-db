const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (body) => {
  const phone = body.phone;
  const password = body.password;
  const name = body.name;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(`INSERT INTO Client (name, phone, password)
                VALUES
                ('${name}', '${phone}', '${hashedPassword}');`);

  if (result.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};

const login = async (phone, password) => {
  const result = await db.query(`select * from client where phone = '${phone}'`);
  if (result.rowCount !== 1) {
    return { success: false, message: "user not found!" };
  }

  const user = result.rows[0];
  const hashedPassword = user.password;
  const isPassValid = await bcrypt.compare(password, hashedPassword);
  if (!isPassValid) {
    return { success: false, message: "لاتصير لوتي" };
  }

  const token = jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
    },
    process.env.SECRET_KEY
  );
  
  return { success: true, token: token };
};

const getClinetBalance = async (req, res) =>{
   try {
      const id = parseInt(req.params.id);
  const results= await db.query(` SELECT id, name, balance FROM client WHERE id = ${id}`);
 if ( results.rows.length==0){
    res.status(404).send({ message: "client not found" });
  }else{
    res.send(results.rows[0]);
  }
  } catch (error) {
      console.error(error);
    res.status(500).send({ message: "Server error" });
  }

}



const getSoldCards = async(req, res)=>{
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






// app.get("/client/:id/balance", async (req, res) => {
 
// });

module.exports = {
  register,
  login,
  getClinetBalance,
  getSoldCards
};
