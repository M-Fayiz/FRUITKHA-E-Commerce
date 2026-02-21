const WALLET = require("../model/user/wallet");
const httpResponse = require("../constant/httpResponse");
const { WALLET_TRANSACTION_TYPE } = require("../constant/status/walletStatus");

const refundWallet = async (userId, amount) => {
  try {
    let wallet = await WALLET.findOne({ userId });

    if (wallet) {
      wallet.transactions.push({
        type: WALLET_TRANSACTION_TYPE.CREDIT,
        amount,
      });
      await wallet.save();
      return { success: true };
    }

    wallet = new WALLET({
      userId,
      transactions: [{ type: WALLET_TRANSACTION_TYPE.CREDIT, amount }],
    });
    await wallet.save();
    return { success: true };
  } catch (error) {
    return { success: false, message: httpResponse.WALLET_UPDATE_FAILED };
  }
};

module.exports = {
  refundWallet,
};
