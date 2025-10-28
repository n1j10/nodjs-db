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



// need to be fix it +++++++++++++++++++++++++++++
const fundsClientWallet = async (req, res) => {
    const clientId = req.params.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
// [clientId]
  try {
    const client = await db.query(`SELECT balance FROM client WHERE id = ${clientId} `, );
    if (client.rowCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const oldBalance = parseFloat(client.rows[0].balance);
    const newBalance = oldBalance + parseFloat(amount);

    await db.query("UPDATE client SET balance = $1 WHERE id = $2", [newBalance, clientId]);

    res.json({ id: clientId, oldBalance, newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });

  }
}









module.exports = {
  register,
  login,
  getClinetBalance,fundsClientWallet
};
