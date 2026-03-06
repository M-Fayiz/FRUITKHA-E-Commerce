const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    orderNumber: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

walletSchema.pre("save", async function () {
  let credit = 0;
  let debit = 0;

  this.transactions.forEach((trn) => {
    if (trn.type === "credit") {
      credit += trn.amount;
    } else if (trn.type === "debit") {
      debit += trn.amount;
    }
  });

  this.balance = Math.floor(credit - debit);
 
});

module.exports =   mongoose.models.Wallet ||mongoose.model("Wallet", walletSchema);
