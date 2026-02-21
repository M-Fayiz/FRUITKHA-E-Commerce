const CART = require("../../model/user/cart");
const USER = require("../../model/user/userModel");
const PRODUCT = require("../../model/admin/product");
const COUPON = require("../../model/admin/Coupon");
const notify = require("../../model/user/notification");
const wishList = require("../../model/user/wishList");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");
// Fetch Cart Items
const cart = async (req, res) => {
  try {
    console.log("--- log CART LOADING ---");
    const cartItems = await CART.findOne({ UserID: req.session.user }).populate(
      "Products.productId",
    );
    const coupon = await COUPON.find({ status: "Active" });
    const NOtify = await notify
      .findOne({ UserId: req.session.user })
      .sort({ createdAt: -1 });
    const cart = await CART.findOne({ UserID: req.session.user });
    let carSize;
    if (cart && cart.Products) {
      carSize = cart.Products.length;
    }
    const wishlist = await wishList.findOne({ UserId: req.session.user });
    let size;
    if (wishlist && wishlist.Products) {
      wishlist.Products.length > 0
        ? (size = wishlist.Products.length)
        : (size = null);
    }
    if (!cartItems || !cartItems.Products || cartItems.Products.length === 0) {
      return res.render("user/cart", {
        user: req.session.user,
        CURRENTpage: "Cart",
        data: { Products: [] },
        info: "Your Cart is Empty",
        coupon,
        NOtify,
        size,
        carSize,
      });
    } else {
      return res.render("user/cart", {
        user: req.session.user,
        CURRENTpage: "Cart",
        data: cartItems,
        info: "",
        coupon,
        NOtify,
        size,
        carSize,
      });
    }
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.CART_FETCH_FAILED });
  }
};

const addCart = async (req, res) => {
  console.log("* - * GET IN ADD CART * - *");
  const { productId, quantity } = req.body;
  const UserID = req.session.user;

  if (!UserID) {
    return res
      .status(httpStatusCode.BAD_REQUEST)
      .json({
        success: false,
        message: httpResponse.USER_NOT_LOGGED_IN,
        login: false,
      });
  }

  try {
    const Quantity = quantity || 1;

    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND });
    }

    const price =
      product.Offer.OfferPrice > 0
        ? product.Offer.OfferPrice
        : product.RegulerPrice;
    const minLimit = Math.min(Math.floor(product.Stock / 3), 10);

    if (Quantity > minLimit) {
      return res.status(httpStatusCode.TOO_MANY_REQUESTS).json({
        success: false,
        message: `This Product's Maximum Allowed Quantity is ${minLimit}.`,
      });
    }

    if (Quantity > product.Stock) {
      return res.status(httpStatusCode.ITEM_EXIST).json({
        success: false,
        message: `Requested quantity exceeds available stock of ${product.Stock}.`,
      });
    }

    let cart = await CART.findOne({ UserID });

    if (cart) {
      const productIndex = cart.Products.findIndex(
        (p) => p.productId.toString() === productId.toString(),
      );

      if (productIndex > -1) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: httpResponse.PRODUCT_ALREADY_IN_CART,
        });
      } else {
        cart.Products.push({
          productId,
          Name: product.Name,
          quantity: Quantity,
          Price: price,
          TOTAL: Quantity * price,
        });
      }
    } else {
      cart = new CART({
        UserID,
        Products: [
          {
            productId,
            Name: product.Name,
            quantity: Quantity,
            Price: price,
            TOTAL: Quantity * price,
          },
        ],
      });
    }

    await cart.save();

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: httpResponse.CART_UPDATED,
      subTotal: cart.subTotal, // Return updated subtotal
    });
  } catch (err) {
    console.error("Error in addCart:", err);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SOMETHING_WENT_WRONG });
  }
};

// | UPDAT CART
const updateCART = async (req, res) => {
  console.log("?-? LOG UPDATE CART ?-?..m   ");
  try {
    const { productId, QNTY } = req.body;
    const UserID = req.session.user;

    if (!UserID) {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: httpResponse.USER_NOT_LOGGED_IN });
    }

    console.log("PRODUCT ID:", productId);

    let cart = await CART.findOne({ UserID }).populate("Products.productId");
    if (!cart) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.CART_NOT_FOUND_CAP });
    }

    let productIndex = cart.Products.findIndex(
      (p) => p.productId._id.toString() === productId.toString(),
    );
    if (productIndex === -1) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.PRODUCT_NOT_FOUND_IN_CART,
        });
    }

    const product = cart.Products[productIndex].productId;
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.PRODUCT_NOT_FOUND_IN_DB,
        });
    }

    let currentQuantity = cart.Products[productIndex].quantity;
    let newQuantity = currentQuantity + QNTY;

    const minLimit = 10;

    if (newQuantity > minLimit) {
      return res.status(httpStatusCode.TOO_MANY_REQUESTS).json({
        success: false,
        message: `This Product's Maximum Allowed Quantity is ${minLimit}.`,
      });
    }

    if (newQuantity > product.totalStock) {
      return res.status(httpStatusCode.ITEM_EXIST).json({
        success: false,
        message: `Requested quantity exceeds available stock of ${product.totalStock}.`,
      });
    }

    cart.Products[productIndex].quantity = newQuantity;

    let unitPrice = cart.Products[productIndex].Price;
    let subtotal = newQuantity * unitPrice;

    cart.Products[productIndex].TOTAL = subtotal;
    console.log("Subtotal:", cart.Products[productIndex].TOTAL);

    cart.subTotal = cart.Products.reduce((sum, p) => {
      return sum + p.quantity * p.Price;
    }, 0);

    const final = cart.subTotal;

    const result = await cart.save();

    return res.status(httpStatusCode.OK).json({
      success: true,
      cart: {
        Products: result.Products.map((p) => ({
          productId: p.productId._id,
          quantity: p.quantity,
          TOTAL: p.TOTAL,
        })),
        subTotal: cart.subTotal,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const removeCart = async (req, res) => {
  console.log("log Cart  to remove");
  const { productId } = req.body;
  const UserID = req.session.user;

  if (!UserID) {
    return res
      .status(httpStatusCode.BAD_REQUEST)
      .json({ success: false, message: httpResponse.USER_NOT_LOGGED_IN });
  }

  try {
    let cart = await CART.findOne({ UserID });

    if (cart) {
      const productIndex = cart.Products.findIndex(
        (p) => p.productId.toString() === productId,
      );

      if (productIndex > -1) {
        cart.Products.splice(productIndex, 1);
        await cart.save();
        return res
          .status(httpStatusCode.OK)
          .json({
            success: true,
            message: httpResponse.PRODUCT_REMOVED_FROM_CART,
          });
      } else {
        return res
          .status(httpStatusCode.ITEM_NOT_FOUND)
          .json({
            success: false,
            message: httpResponse.PRODUCT_NOT_FOUND_IN_CART_LC,
          });
      }
    } else {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.CART_NOT_FOUND });
    }
  } catch (err) {
    console.error("Error in removeCart:", err.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SOMETHING_WENT_WRONG });
  }
};

module.exports = {
  cart,
  addCart,
  removeCart,
  updateCART,
};
