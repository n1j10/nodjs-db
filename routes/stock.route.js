const express = require("express");
const router = express.Router();

const {  getReadyCards } = require("../controllers/stockController");



router.get("/stock/available", getReadyCards);



module.exports = router;