const ORDER = require("../../model/admin/order-schema");
const PRODUCT = require("../../model/admin/product");
const WALLET = require("../../model/user/wallet");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");
const { ORDER_STATUS } = require("../../constant/status/orderStatus");
const {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} = require("../../constant/status/paymentStatus");

const orderList = async (req, res) => {
  const User = req.session.user;

  if (!User) {
    return res.render("user/orderList", { info: "You are not logged in" });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const orders = await ORDER.find({ UserID: User })
      .populate("Products.product")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders) {
      res.render("user/orderList", {
        info: "You have no orders yet",
        orders: [],
      });
    }

    const totalOrders = await ORDER.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    if (skip >= totalOrders && totalOrders > 0) {
      return res.redirect("/admin/order?page=" + totalPages);
    }

    res.render("user/orderList", {
      orders,
      user: req.session.user,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .send(httpResponse.SERVER_ERROR_SHORT);
  }
};

const orderDetails = async (req, res) => {
  const orderId = req.params.id;

  try {
    const Order = await ORDER.findOne({ _id: orderId })
      .populate("Products.product")
      .populate("UserID");

    res.render("user/orderDetails", { Order, user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

const CANCELallORDER = async (req, res) => {
  const { orderId } = req.body;

  try {
    const user = req.session.user;
    const order = await ORDER.findOne({ _id: orderId });

    if (!order) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.ORDER_NOT_FOUND });
    }
    order.orderStatus = ORDER_STATUS.CANCELLED;

    const refundAmount = order.Final_Amount - order.Shipping;
    if (
      order.payment === PAYMENT_METHOD.RAZORPAY ||
      order.payment === PAYMENT_METHOD.WALLET
    ) {
      const wallet = await WALLET.findOne({ userId: user });
      if (wallet) {
        wallet.transactions.push({ type: "credit", amount: refundAmount });
        await wallet.save();
      } else {
        const newWallet = new WALLET({
          userId: user,
          balance: 0,
          transactions: [{ type: "credit", amount: refundAmount }],
        });
        await newWallet.save();
      }
      order.paymentStatus = PAYMENT_STATUS.REFUND;
    }
    if (Array.isArray(order.Products)) {
      for (const p of order.Products) {
        p.status = ORDER_STATUS.CANCELLED;

        const product = await PRODUCT.findOne({ _id: p.productId });
        if (product) {
          product.Stock += p.quantity;
          await product.save();
        }
      }
    }

    order.Shipping = 0;
    order.Coupon.discountValue = 0;

    await order.save();

    return res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.ORDER_CANCELLED });
  } catch (error) {
    console.error(error.message);

    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SALES_REPORT_ERROR });
  }
};

const ReturnOrder = async (req, res) => {
  const { orderId, Reason } = req.body;
  const prodctImage = req.file;

  try {
    const order = await ORDER.findOne({ _id: orderId });
    if (!order) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.ORDER_NOT_FOUND_CAP });
    }
    const Current = new Date();
    if (order && new Date(order.Datess.expiryDate) < Current) {
      return res.status(httpStatusCode.GONE).json({
        success: false,
        message: httpResponse.RETURN_TIME_EXCEEDED_2DAYS,
      });
    }

    order.Return.req = true;
    order.Return.reason = Reason;
    order.Return.image = prodctImage.path;
    await order.save();
    return res
      .status(httpStatusCode.OK)
      .json({
        success: true,
        message: httpResponse.RETURN_REQUEST_UPDATED_SOON,
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const productReturn = async (req, res) => {
  try {
    const { productId, orderId, Reason } = req.body;
    const productImage = req.file;

    if (!productImage) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: httpResponse.PRODUCT_RETURN_IMAGE_REQUIRED,
        });
    }

    const order = await ORDER.findById(orderId);
    if (!order) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.ORDER_NOT_FOUND_DOT });
    }

    const product = order.Products.find(
      (p) => p.product.toString() === productId,
    );
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.PRODUCT_NOT_FOUND_IN_ORDER,
        });
    }

    const current = new Date();
    if (new Date(order.Datess.expiryDate) < current) {
      return res.status(httpStatusCode.GONE).json({
        success: false,
        message: httpResponse.RETURN_TIME_EXCEEDED,
      });
    }

    console.log(productImage.path, "Product image");
    product.return.req = true;
    product.return.reason = Reason;
    product.return.image = productImage.path;

    await order.save();

    return res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.RETURN_REQUEST_UPDATED });
  } catch (error) {
    console.error(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.TRY_AGAIN_ERROR });
  }
};

module.exports = {
  orderList,
  orderDetails,
  // cancelorder,
  CANCELallORDER,
  ReturnOrder,
  productReturn,
};
