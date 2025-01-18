const express = require("express");
const { authMiddleware } = require("../middleware");
const { account, users } = require("../db");
const { default: mongoose } = require("mongoose");
const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const data = await account.findOne({ userId: userId });
  res.json({ balance: data.balance });
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.userId;
    const { amount, to } = req.body;
    let userAccount = await account.findOne({ userId });
    if (userAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json("Insufficient balance");
    }
    const toAccount = await users.findOne({ _id: to });
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json("User doesn't exist");
    }
    await account
      .updateOne({ userId: userId }, { $inc: { balance: -amount } })
      .session(session);
    await account
      .updateOne({ userId: to }, { $inc: { balance: amount } })
      .session(session);
    await session.commitTransaction();
    userAccount = await account.findOne({ userId });
    res.json({
      message: "Transaction Successfull",
      balance: userAccount.balance,
    });
  } catch (err) {
    res.status(400).json("error");
  }
});

module.exports = accountRouter;
