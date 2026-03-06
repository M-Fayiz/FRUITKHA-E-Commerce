const USER = require("../../model/user/userModel");
const CART = require("../../model/user/cart");
const ADDRESS = require("../../model/user/address");
const PRODUCT = require("../../model/admin/product");
const ORDER = require("../../model/admin/order-schema");
const COUPON = require("../../model/admin/coupon");
const razorpay = require("../../utils/service/Razorpay");
const crypto = require("crypto");
const Wallet = require("../../model/user/wallet");
const notify = require("../../model/user/notification");
const path = require("path");
const ejs = require("ejs");
const PDFDocument = require("pdfkit");
const wishList = require("../../model/user/wishList");
const generateOrderNumber = require("../../utils/generateOrderNumber");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");
const { COUPON_STATUS } = require("../../constant/status/couponStatus");
const {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} = require("../../constant/status/paymentStatus");

const checkout = async (req, res) => {
  try {
    const UserID = req.session.user;

    console.log(UserID);
    const address = await ADDRESS.find({ UserID });
    const cart = await CART.findOne({ UserID: UserID }).populate(
      "Products.productId",
    );
    const coupon = await COUPON.find({ status: COUPON_STATUS.ACTIVE });
    const NOtify = await notify
      .findOne({ UserId: req.session.user })
      .sort({ createdAt: -1 });

    let carSize;
    if (cart && cart.Products) {
      carSize = cart.Products.length;
    }
    let size;
    const wishlist = await wishList.findOne({ UserId: req.session.user });

    if (wishlist && wishlist.Products) {
      wishlist.Products.length > 0
        ? (size = wishlist.Products.length)
        : (size = null);
    }
    if (!address) {
      res.render("user/checkout", {
        CURRENTpage: "checkout",
        user: req.session.user,
        address: [],
        info: "No Address Added Yet",
        NOtify,
        carSize,
        size,
      });
    } else {
      const shipping = 50;
      let TOTAL = shipping + cart.TTLPrice;
      res.render("user/checkout", {
        CURRENTpage: "checkout",
        user: req.session.user,
        address,
        cart,
        info: "",
        shipping,
        TOTAL,
        coupon,
        NOtify,
        carSize,
        size,
      });
    }
  } catch (error) {
    console.error("Error in checkout:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .send("Something went wrong. Please try again later.");
  }
};

const placeOrder = async (req, res) => {
  try {
    const {
      selectedAddress,
      paymentMethod,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const User = req.session.user;

    if (!User) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.USER_NOT_FOUND_CAP });
    }

    const address = await ADDRESS.findById(selectedAddress);
    if (!address) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: httpResponse.ITEM_NOT_FOUND("Address"),
        });
    }

    const cart = await CART.findOne({ UserID: User });
    if (!cart || cart.Products.length === 0) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.CART_EMPTY_API });
    }

    let gst = Math.round(0.12 * cart.subTotal);

    let discountValue = 0;
    let couponCode = null;
    let couponId = cart.Discount?.discountId;

    if (couponId) {
      const coupon = await COUPON.findById(couponId);
      if (coupon) {
        const now = new Date();
        if (
          coupon.status === COUPON_STATUS.ACTIVE &&
          now >= coupon.startDate &&
          now <= coupon.endDate
        ) {
          if (coupon.minCartValue && cart.subTotal >= coupon.minCartValue) {
            discountValue = cart.Discount.discount_amount;
            couponCode = coupon.code;
          }
        }
      }
    }

    let paymentStatus = PAYMENT_STATUS.PENDING;

    if (paymentMethod === PAYMENT_METHOD.RAZORPAY) {
      if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const secret = process.env.key_secret;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === razorpay_signature) {
          paymentStatus = PAYMENT_STATUS.COMPLETED;
        }
      } else {
        paymentStatus = PAYMENT_STATUS.PENDING;
      }
    } else if (paymentMethod === PAYMENT_METHOD.WALLET) {
      const wallet = await Wallet.findOne({ userId: User });

      if (!wallet || !wallet.balance) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({ success: false, message: httpResponse.WALLET_NOT_FOUND });
      }
      console.log(gst);
      const walletBalance = wallet.balance;
      const totalAmount = cart.subTotal + gst - discountValue;
      console.log(totalAmount);
      console.log(totalAmount, "total amount", walletBalance);
      if (walletBalance < totalAmount) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({
            success: false,
            message: httpResponse.INSUFFICIENT_WALLET_BALANCE,
          });
      }

      wallet.transactions.push({ type: "debit", amount: totalAmount });
      await wallet.save();
      paymentStatus = PAYMENT_STATUS.COMPLETED;
    } else if (paymentMethod === PAYMENT_METHOD.COD) {
      paymentStatus = PAYMENT_STATUS.PENDING;
    }

    const orderData = {
      orderNumber: generateOrderNumber(),
      UserID: User,
      Products: cart.Products.map((item) => ({
        product: item.productId,
        Name: item.Name,
        quantity: item.quantity,
        Price: item.Price,
      })),
      Shipping: cart.Shipping,
      Coupon: {
        couponId,
        code: couponCode,
        discountValue,
      },
      payment: paymentMethod,
      paymentStatus,
      addressId: {
        address: address.Address_name,
        Name: address.Name,
        PIN: address.PIN,
        place: address.place,
        mark: address.mark,
        District: address.District,
        State: address.State,
      },
      Datess: {
        DeliveryDate: new Date(),
      },
      RazorPay: {
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      },
    };

    const newOrder = new ORDER(orderData);
    const hh = await newOrder.save();

    for (const item of cart.Products) {
      const product = await PRODUCT.findById(item.productId);
      if (!product) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
      }
      if (product.totalStock < item.quantity) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({
            success: false,
            message: `Insufficient stock for product: ${product.Name}`,
          });
      }
      product.totalStock -= item.quantity;
      await product.save();
    }

    await CART.findOneAndDelete({ UserID: User });

    res.status(httpStatusCode.OK).json({
      success: true,
      message: httpResponse.ORDER_PLACED,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error Placing Order:", error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({
        success: false,
        message: httpResponse.SERVER_ERROR,
        error: error.message,
      });
  }
};

// RAZOR PAY  |  RAZOR PAY  |
const razorPay = async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res
      .status(httpStatusCode.BAD_REQUEST)
      .json({ success: false, message: httpResponse.INVALID_AMOUNT });
  }

  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(httpStatusCode.OK).json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR, error });
  }
};

const verifyPayment = async (req, res) => {
  const crypto = require("crypto");
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    return res
      .status(httpStatusCode.UNPROCESSABLE_ENTITY)
      .json({ success: false, message: httpResponse.MISSING_REQUIRED_FIELDS });
  }

  try {
    const secret = process.env.key_secret;
    if (!secret) {
      throw new Error("Razorpay secret is missing");
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      await ORDER.findByIdAndUpdate(orderId, {
        $set: {
          paymentStatus: PAYMENT_STATUS.COMPLETED,
          "RazorPay.razorpay_payment_id": razorpay_payment_id,
          "RazorPay.razorpay_signature": razorpay_signature,
        },
      });

      return res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.PAYMENT_VERIFIED });
    } else {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: httpResponse.INVALID_PAYMENT_SIGNATURE,
        });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR, error });
  }
};

const retryPayment = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res
      .status(httpStatusCode.BAD_REQUEST)
      .json({ success: false, message: httpResponse.ORDER_ID_REQUIRED });
  }

  try {
    const order = await ORDER.findById(orderId);

    if (!order) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.ORDER_NOT_FOUND });
    }

    const options = {
      amount: order.Final_Amount * 100,
      currency: "INR",
      receipt: `retry_${orderId.slice(0, 20)}_${Date.now().toString().slice(-5)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder || !razorpayOrder.id) {
      return res
        .status(httpStatusCode.SERVER_ERROR)
        .json({
          success: false,
          message: httpResponse.RAZORPAY_ORDER_CREATE_FAILED,
        });
    }

    await ORDER.findByIdAndUpdate(orderId, {
      $set: {
        "RazorPay.razorpay_order_id": razorpayOrder.id,
        status: "retrying",
      },
    });

    return res.status(httpStatusCode.OK).json({
      success: true,
      razorpayOrder,
      razorpayKey: process.env.key_id,
    });
  } catch (error) {
    console.error("Error during retry payment:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};
const success = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await ORDER.findById(orderId);
    res.render("user/success", { order });
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    const order = await ORDER.findById(orderId)
      .populate("UserID")
      .populate("Products.product");
    if (!order) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.ORDER_NOT_FOUND });
    }

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order._id}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).fillColor("#f57c00").text("FRUITKHA", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#333")
      .text("Fresh Fruits Online", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).fillColor("#000").text(`Invoice No: INC${randomNumber}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })}`,
    );
    doc.moveDown();

    doc.fontSize(14).text("Billing Information", { underline: true });
    doc.fontSize(12).text(`Customer Name: ${order.UserID.firstName}`);
    doc.text(`Email: ${order.UserID.email}`);
    doc.text(`Phone: ${order.UserID.phone}`);
    doc.text(
      `Address: ${order.addressId.District}, ${order.addressId.State}, ${order.addressId.PIN}`,
    );
    doc.moveDown();

    doc.fontSize(14).text("Order Summary", { underline: true }).moveDown();

    const headers = ["Item Name", "Quantity", "Unit Price", "Status", "Total"];
    const tableTop = doc.y;
    const colWidths = [150, 50, 80, 80, 80];

    let x = 50;
    headers.forEach((header, i) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(header, x, tableTop, { width: colWidths[i], align: "center" });
      x += colWidths[i];
    });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(530, tableTop + 15)
      .stroke();
    let currentY = tableTop + 25;

    order.Products.forEach((item) => {
      x = 50;
      const row = [
        item.product.productTitle,
        item.quantity,
        `₹${item.Price}`,
        item.status,
        `₹${item.TOTAL}`,
      ];

      row.forEach((data, i) => {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(data, x, currentY, { width: colWidths[i], align: "center" });
        x += colWidths[i];
      });
      currentY += 20;
    });

    currentY += 10;
    doc.moveTo(50, currentY).lineTo(530, currentY).stroke();
    currentY += 5;

    const totals = [
      { label: "Subtotal", value: `₹${order.subTotal}` },
      { label: "GST ", value: `₹${order.GST}` },
      { label: "Shipping Fee", value: `₹${order.Shipping}` },
      { label: "Discount Value", value: `₹${order.Coupon.discountValue}` },
      { label: "Total Amount", value: `₹${order.Final_Amount}` },
    ];

    totals.forEach((total) => {
      doc.fontSize(12).text(total.label, 400, currentY, { align: "left" });
      doc.text(total.value, 50, currentY, { align: "right" });
      currentY += 20;
    });

    doc
      .moveDown()
      .fontSize(14)
      .text("Payment Details", { underline: true })
      .moveDown();
    doc.fontSize(12).text(`Payment Method: ${order.payment}`);
    if (order.payment === PAYMENT_METHOD.RAZORPAY) {
      doc.text(`Transaction ID: ${order.RazorPay.razorpay_payment_id}`);
    }

    doc
      .moveDown()
      .fontSize(10)
      .fillColor("#555")
      .text("For any questions, contact us at support@fruitkha.com", {
        align: "center",
      });
    doc.text("Thank you for shopping with us! 🍇", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR_SHORT });
  }
};

module.exports = {
  checkout,
  placeOrder,
  razorPay,
  verifyPayment,
  retryPayment,
  success,
  invoice,
};
