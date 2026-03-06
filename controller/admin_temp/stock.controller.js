const PRODUCT = require("../../model/admin/product");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

const stock = async (req, res) => {
  try {
    const products = await PRODUCT.find().populate("Category");

    const inventory = products.map((product) => ({
      id: product._id,
      productName: product.productTitle,
      category: product.Category.category,
      expiredQuantity: product.expiredQuantity,
      currentQuantity: product.totalStock,
    }));

    res.render("admin/Stock", { CURRENTpage: "stock", inventory });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const addQuantity = async (req, res) => {
  try {
    const batch_id = `batch_${new Date().getTime()}`;
    const { quantity, expiryDate, productId } = req.body;
    console.log(quantity, expiryDate, productId);
    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND });
    }
    product.Stock.push({
      batchId: batch_id,
      quantity,
      expiryDate,
    });
    // for (let i = product.Stock.length - 1; i >= 0; i--) {
    //     if (product.Stock[i].isExpired) {
    //       product.Stock.splice(i, 1);
    //     }
    //   }
    product.totalStock += Number(quantity);

    await product.save();
    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.STOCK_ADDED });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

module.exports = {
  stock,
  addQuantity,
};
