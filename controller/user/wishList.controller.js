const PRODUCT = require("../../model/admin/product");
const USER = require("../../model/user/userModel");
const WISHLIST = require("../../model/user/wishList");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

const wishList = async (req, res) => {
  try {
    const wish = await WISHLIST.findOne({ UserId: req.session.user }).populate(
      "Products.product",
    );

    // Check if 'wish' exists before accessing 'Products'
    if (!wish) {
      return res.render("user/wishList", {
        CURRENTpage: "wishList",
        user: req.session.user,
        wish: { Products: [] }, // Pass an empty array to avoid errors
        info: "No Items In Your Wish List",
      });
    }

    // Safely access Products
    const wSize = wish.Products.length;

    res.render("user/wishList", {
      CURRENTpage: "wishList",
      user: req.session.user,
      wish,
      info: "",
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SOMETHING_WENT_WRONG });
  }
};

const toggleWishList = async (req, res) => {
  try {
    const { val } = req.body;
    const User = req.session.user;

    if (!User) {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: httpResponse.USER_NOT_LOGGED_IN });
    }
    let isWishList;

    const product = await PRODUCT.findOne({ _id: val });
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.ITEM_NOT_FOUND("Product"),
        });
    }

    let wishlist = await WISHLIST.findOne({ UserId: User });

    if (!wishlist) {
      wishlist = new WISHLIST({
        UserId: User,
        Products: [{ product: val }],
      });

      isWishList = true;

      await wishlist.save();
      return res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.PRODUCT_ADDED_WISHLIST });
    }

    const productIndex = wishlist.Products.findIndex(
      (p) => p.product.toString() === val,
    );
    if (productIndex > -1) {
      wishlist.Products.splice(productIndex, 1);

      isWishList = false;

      await wishlist.save();
      return res
        .status(httpStatusCode.OK)
        .json({
          success: true,
          message: httpResponse.PRODUCT_REMOVED_WISHLIST,
        });
    } else {
      wishlist.Products.push({ product: val });

      isWishList = true;

      const cc = await wishlist.save();
      let aa = cc.Products.length;

      //    console.log(cc)
      return res
        .status(httpStatusCode.OK)
        .json({
          success: true,
          message: httpResponse.PRODUCT_ADDED_WISHLIST,
          val,
          isWishList,
          aa,
        });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SOMETHING_WENT_WRONG });
  }
};

///
const remove_wishList = async (req, res) => {
  console.log("Get In Remove Wish");

  const { productId, item } = req.body;
  try {
    const UserId = req.session.user;

    if (!UserId) {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: httpResponse.USER_NOT_LOGGED_IN_CAP });
    }

    const result = await WISHLIST.updateOne(
      { UserId },
      { $pull: { Products: { _id: item } } },
    );

    if (result.modifiedCount > 0) {
      return res
        .status(httpStatusCode.OK)
        .json({
          success: true,
          message: httpResponse.PRODUCT_REMOVED_WISHLIST_ALT,
        });
    } else {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.PRODUCT_NOT_FOUND_WISHLIST,
        });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

module.exports = {
  wishList,
  toggleWishList,
  remove_wishList,
};
