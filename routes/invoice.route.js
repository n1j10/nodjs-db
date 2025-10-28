
const express = require("express");
const router = express.Router();
const { getClientInvoices } = require("../controllers/invoiceController");

router.get("/client/:id", getClientInvoices);



module.exports = router;