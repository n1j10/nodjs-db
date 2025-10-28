const express = require("express");
const router = express.Router();

const {  getReadyCards, getSoldCards,InsertCardCode } = require("../controllers/stockController");



router.get("/available", getReadyCards);

router.get("/sold", getSoldCards);

router.post("/batch", InsertCardCode);

module.exports = router;