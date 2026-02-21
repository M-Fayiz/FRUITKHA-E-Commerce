const WALLET = require("../../model/User/wallet");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

const wallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const Wallet = await WALLET.findOne({ userId: req.session.user })
      .skip(skip)
      .limit(limit);

    const totalwallet = await WALLET.countDocuments();
    const totalPages = Math.ceil(totalwallet / limit);

    res.render("user/wallet", {
      user: req.session.user,
      CURRENTpage: "wallet",
      Wallet,
      currentPage: page,
      totalPages,
      totalwallet,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

module.exports = {
  wallet,
};
