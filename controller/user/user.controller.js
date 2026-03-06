const User = require("../../model/User/userModel");
const mailSender = require("../../utils/mail_sender");
const bcrypt = require("bcrypt");
const COUPON = require("../../model/ADMIN/Coupon");
const category = require("../../model/ADMIN/category");
const wishList = require("../../model/User/wishList");
const PRODUCT = require("../../model/ADMIN/product");

const CART = require("../../model/user/cart");
const notify = require("../../model/User/notification");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");
const { COUPON_STATUS } = require("../../constant/status/couponStatus");

const securePassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};

// ||| OTP SECTION - OTP SECTION - OTP SECTION  |||

const generateOTP = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    req.session.userData = { firstName, lastName, email, phone, password };
    console.log("userData", req.session.userData);

    const otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    req.session.otpDATA = { otp, email, createdAt: Date.now };

    mailSender.sendMail(email, otp);

    console.log("otp data session", req.session.otpDATA);

    console.log("OTP sended :-", otp);

    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: `OTP Sent to ${email}` });
  } catch (err) {
    console.log("error", err);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};

const resendOTP = async (req, res) => {
  console.log("- - GET IN RESEND OTP - -");
  try {
    const { otpDATA } = req.session;
    console.log("otpDATA", otpDATA);
    if (!otpDATA || !otpDATA.email) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.OTP_NOT_FOUND_SESSION });
    }

    const newOTP = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    await mailSender.sendMail(otpDATA.email, newOTP);

    req.session.otpDATA.otp = newOTP;
    req.session.otpDATA.createdAt = Date.now;

    console.log("RESENT OTP IS :-", newOTP);
    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.OTP_RESENT });
  } catch (err) {
    console.log("Error resending OTP:", err);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.OTP_RESEND_FAILED });
  }
};

// || VERIFY OTP ||  VERIFY OTP ||  VERIFY OTP

const verifyOTP = async (req, res) => {
  console.log("GET IN VERIFY OTP");

  try {
    const { otp, EMAIL } = req.body;

    if (!otp || !EMAIL) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.OTP_OR_EMAIL_NOT_FOUND });
    }

    if (!req.session.otpDATA) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.OTP_SESSION_NOT_FOUND });
    }

    const now = Date.now();
    const {
      otp: storedOTP,
      email: storedEmail,
      createdAt,
    } = req.session.otpDATA;

    if (now - createdAt > 5 * 60 * 1000) {
      req.session.otpDATA = null;
      return res
        .status(httpStatusCode.GONE)
        .json({ success: false, message: httpResponse.OTP_EXPIRED });
    }

    if (otp.toString() === storedOTP.toString() && EMAIL === storedEmail) {
      req.session.otpDATA = null;

      console.log("otp verified");

      const { firstName, lastName, email, phone, password } =
        req.session.userData;
      const checkUser = await User.findOne({ email });

      if (checkUser) {
        return res
          .status(httpStatusCode.ITEM_EXIST)
          .json({ success: false, message: httpResponse.USER_ALREADY_EXISTS });
      }

      const securepswrd = await securePassword(password);

      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password: securepswrd,
        lastLogin: new Date(),
      });

      const newResult = await newUser.save();
      req.session.user = newResult._id;

      console.log("USER SAVED");
      return res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.USER_REGISTERED });
    } else {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.INVALID_OTP_OR_EMAIL });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.INTERNAL_ERROR });
  }
};

const Login = async (req, res) => {
  console.log("GET IN LOGIN VERIFY");
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.INVALID_EMAIL_SMALL });
    }
    if (user.isGoogle === true) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.LOGIN_WITH_GOOGLE });
    }

    if (user.isActive === false) {
      return res
        .status(httpStatusCode.FORBIDDEN)
        .json({ success: false, message: httpResponse.USER_BLOCKED });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: httpResponse.PASSWORD_NOT_MATCH_USER,
        });
    }

    req.session.user = user._id;
    User.updateOne({ email }, { lastLogin: new Date() });

    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.USER_LOGIN_SUCCESS });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const logOut = (req, res) => {
  console.log("get in logOut");
  // console.log(req.params.id)
  //  console.log(req.session.user)
  req.session.user = null;
  res.redirect("/");
};

const loadSignUp = (req, res) => {
  res.render("user/signup");
};

const about = (req, res) => {
  res.render("user/about");
};

const LoadHome = async (req, res) => {
  console.log("log home");

  try {
    const NOtify = await notify.findOne({ UserId: req.session.user });

    const Data = await category.find({ isList: true });

    const coupon = await COUPON.find({ status: COUPON_STATUS.ACTIVE });

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
    res.render("user/index", {
      Data,
      user: req.session.user,
      CURRENTpage: "Home",
      Category: null,
      coupon,
      NOtify,
      carSize,
      size,
    });
  } catch (error) {
    console.log("from home error", error);
  }
};

const Loadotp = (req, res) => {
  const Email = req.session.otpDATA.email;
  console.log(Email, "/../");
  res.render("user/otp", { email: Email });
};

const getlogin = (req, res) => {
  res.render("user/login");
};

const Reset = (req, res) => {
  res.render("user/forgot");
};

const email = (req, res) => {
  res.render("user/email");
};

const shop = async (req, res) => {
  const cart = await CART.findOne({ UserID: req.session.user });
  const NOtify = await notify.findOne({ UserId: req.session.user });
  let carSize;
  if (cart && cart.Products) {
    carSize = cart.Products.length;
  }

  try {
    const Category = req.query.category || "";
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const priceRange = req.query.priceRange || "";
    const sortOrder = req.query.sortOrder || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    let message = "";

    const listedCategory = await category.find({ isList: true });
    const listedCategoryIds = listedCategory.map((cat) => cat._id);

    let query = { isList: true };

    // Category filter — use ObjectId
    if (Category) {
      query.Category = Category;
    } else {
      query.Category = { $in: listedCategoryIds };
    }

    // Search by product title only
    if (searchQuery) {
      query.productTitle = { $regex: searchQuery, $options: "i" };
    }

    // Price range filter
    if (priceRange) {
      const Price = Number(priceRange);
      if (!isNaN(Price)) query.RegulerPrice = { $lte: Price };
    }

    let sortCriteria = {};
    switch (sortOrder) {
      case "LOW": sortCriteria.RegulerPrice = 1; break;
      case "HIGH": sortCriteria.RegulerPrice = -1; break;
      case "NEWEST": sortCriteria.createdAt = -1; break;
      case "A_TO_Z": sortCriteria.productTitle = 1; break;
      case "Z_TO_A": sortCriteria.productTitle = -1; break;
      default: break;
    }

    const products = await PRODUCT.find(query).sort(sortCriteria).skip(skip).limit(limit);

    if (products.length === 0) {
      message = message || httpResponse.NO_PRODUCTS_FOUND;
    }

    const totalProducts = await PRODUCT.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages && totalProducts > 0) {
      return res.redirect(`/shop?page=${totalPages}`);
    }

    const userId = req.session.user;
    const wishlist = await wishList.findOne({ UserId: userId });
    let size;
    if (wishlist && wishlist.Products) {
      wishlist.Products.length > 0
        ? (size = wishlist.Products.length)
        : (size = null);
    }
    products.forEach((product) => {
      const isInWishlist =
        wishlist &&
        wishlist.Products.some(
          (item) => item.product.toString() === product._id.toString(),
        );
      product.isInWishlist = isInWishlist;
    });

    const data = await category.find({ isList: true });
    const coupon = await COUPON.find({ status: COUPON_STATUS.ACTIVE });

    // Resolve the selected Category object for breadcrumb/active state
    const categoru = Category ? await category.findById(Category).catch(() => null) : null;

    res.render("user/shop", {
      products,
      user: req.session.user,
      message,
      listedCategory,
      currentPage: page,
      totalPages,
      CURRENTpage: "shop",
      Category: categoru,
      data,
      coupon,
      size,
      carSize,
      NOtify,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(httpStatusCode.SERVER_ERROR).json({
      success: false,
      message: httpResponse.PRODUCTS_FETCH_ERROR,
      error: error.message,
    });
  }
};

// ** SEARCH - SEARCH - SEARCH - SEARCH
const search = async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.trim() : "";
  // selectedCategories is now a single category ObjectId from the filter panel
  const selectedCategory = req.query.category || "";
  const priceRange = req.query.priceRange || "";
  const sortOrder = req.query.sortOrder || "";
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  let message = "";

  let query = { isList: true };

  try {
    const listedCategories = await category.find({ isList: true });
    const listedCategoryIds = listedCategories.map((cat) => cat._id);

    // Search ONLY by product title
    if (searchQuery) {
      query.productTitle = { $regex: searchQuery, $options: "i" };
      // Still restrict to listed categories
      query.Category = { $in: listedCategoryIds };
    } else {
      query.Category = { $in: listedCategoryIds };
    }

    // Category filter — uses ObjectId directly
    if (selectedCategory) {
      query.Category = selectedCategory; // ObjectId string, mongoose coerces it
    }

    if (priceRange) {
      const Price = Number(priceRange);
      if (!isNaN(Price)) {
        query.RegulerPrice = { $lte: Price };
      }
    }

    let sortCriteria = {};
    switch (sortOrder) {
      case "LOW":
        sortCriteria.RegulerPrice = 1;
        break;
      case "HIGH":
        sortCriteria.RegulerPrice = -1;
        break;
      case "NEWEST":
        sortCriteria.createdAt = -1;
        break;
      case "A_TO_Z":
        sortCriteria.productTitle = 1;
        break;
      case "Z_TO_A":
        sortCriteria.productTitle = -1;
        break;
      default:
        break;
    }

    const products = await PRODUCT.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    const totalProducts = await PRODUCT.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages && totalProducts > 0) {
      return res.redirect(`/shop?page=${totalPages}`);
    }

    if (!products || products.length === 0) {
      return res
        .status(httpStatusCode.OK)
        .json({ message: httpResponse.NO_PRODUCTS_FOUND });
    }

    res.status(httpStatusCode.OK).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({
        message: httpResponse.PRODUCTS_FETCH_ERROR,
        error: error.message,
      });
  }
};

// ///// Realated product
const productId = async (req, res) => {
  const productId = req.params.id;

  console.log("^ ^ GET IN PRODUCT DETAILS ^^");
  try {
    const item = await PRODUCT.findById(productId);

    const NOtify = await notify.findOne({ UserId: req.session.user });
    const related = await PRODUCT.find({
      Category: item.Category,
      _id: {
        $ne: productId,
      },
    }).limit(4);
    const cart = await CART.findOne({ UserID: req.session.user });
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

    const cat = await category.findOne({ category: item.Category });

    const coupon = await COUPON.find({ status: COUPON_STATUS.ACTIVE });
    res.render("user/single-product", {
      item,
      user: req.session.user,
      carSize,
      size,
      related,
      CURRENTpage: "product",
      cat,
      Category: item.Category,
      coupon,
      NOtify,
    });
  } catch (error) {
    console.log(error);
  }
};

const ALL = async (req, res) => {
  console.log("Fetching products for shop page...");

  try {
    console.log("GET IN SEARCH");

    const Category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    let message = "";

    const listedCategory = await category.find({ isList: true });
    const listedCategoryNames = listedCategory.map((cat) => cat.category);

    let query = { isList: true };
    if (Category) {
      if (listedCategoryNames.includes(Category)) {
        query.Category = Category;
      }
    } else {
      query.Category = { $in: listedCategoryNames };
    }

    const products = await PRODUCT.find(query).skip(skip).limit(limit);
    const totalProducts = await PRODUCT.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    if (products.length === 0) {
      message = httpResponse.NO_PRODUCTS_FOUND;
    }

    res.status(httpStatusCode.OK).json({
      success: true,
      products,
      message: message || httpResponse.PRODUCTS_FETCHED,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      listedCategory,
      selectedCategory: Category || null,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(httpStatusCode.SERVER_ERROR).json({
      success: false,
      message: httpResponse.PRODUCTS_FETCH_ERROR,
      error: error.message,
    });
  }
};

const contact = (req, res) => {
  res.render("user/contact");
};

module.exports = {
  loadSignUp,
  // registration,
  LoadHome,
  generateOTP,
  Loadotp,
  resendOTP,
  verifyOTP,
  Login,
  getlogin,
  Reset,
  email,
  shop,
  // singleProduct,
  productId,
  logOut,
  search,
  ALL,
  about,
  contact,
};
