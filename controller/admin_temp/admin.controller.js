const adminModel = require("../../model/admin/adminModel");
const bcrypt = require("bcrypt");
const USER = require("../../model/user/userModel");

const category = require("../../model/admin/category");
const ORDER = require("../../model/admin/order-schema");

const PRODUCT = require("../../model/admin/product");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

const securePassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.INVALID_EMAIL });
    }

    const verify = await bcrypt.compare(password, admin.password);

    if (!verify) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.PASSWORD_NOT_MATCH });
    }
    req.session.admin = true;
    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.LOGIN_SUCCESS });
  } catch (error) {
    res
      .status(httpStatusCode.BAD_REQUEST)
      .json({ success: false, message: httpResponse.VERIFY_FAILED });
  }
};

const toogleUserStatus = async (req, res) => {
  try {
    const { userId, condition } = req.body;

    USER.findByIdAndUpdate(userId, { isActive: condition }).then((response) => {
      console.log(response);
      res
        .status(httpStatusCode.OK)
        .json({
          success: true,
          message: httpResponse.UPDATED_SUCCESS,
          response: response,
        });
    });
  } catch (error) {
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { title, discription } = req.body;
    const image = req.file;
    const test = await category.findOne({
      category: { $regex: new RegExp("^" + title + "$", "i") },
    });

    if (test) {
      return res
        .status(httpStatusCode.ITEM_EXIST)
        .json({ success: false, message: httpResponse.CATEGORY_EXISTS });
    }

    if (!image || !title) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: httpResponse.MISSING_IMAGE_AND_TITLE,
        });
    }

    const saveCategory = new category({
      category: title,
      image: image.path,
      description: discription,
    });

    const response = await saveCategory.save();

    if (response) {
      res
        .status(httpStatusCode.CREATED)
        .json({
          success: true,
          response: response,
          message: httpResponse.CATEGORY_ADDED,
        });
    }
  } catch (error) {
    console.error("Error adding category:", error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const categoryStatus = async (req, res) => {
  try {
    const { itemId, condition } = req.body;
    let status;
    condition == true ? (status = "Listed") : (status = "Un Listed");
    const result = await category.findByIdAndUpdate(itemId, {
      isList: condition,
    });

    res
      .status(httpStatusCode.OK)
      .json({
        success: true,
        message: httpResponse.LIST_STATUS_UPDATED(status),
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const EditCategory = async (req, res) => {
  try {
    const { modalTitle, modalDescription, productId } = req.body;

    // Only check for duplicate name when a new title is actually provided
    if (modalTitle) {
      const test = await category.findOne({
        category: { $regex: new RegExp("^" + modalTitle + "$", "i") },
        _id: { $ne: productId }, // exclude current category from the check
      });
      if (test) {
        return res
          .status(httpStatusCode.ITEM_EXIST)
          .json({ success: false, message: httpResponse.CATEGORY_EXISTS });
      }
    }

    const updates = {};

    if (modalTitle)       updates.category    = modalTitle;
    if (modalDescription) updates.description = modalDescription;
    if (req.file)         updates.image       = req.file.path;

    const response = await category.findByIdAndUpdate(productId, updates, {
      new: true,
    });

    res
      .status(httpStatusCode.OK)
      .json({
        success: true,
        response: response,
        message: httpResponse.CATEGORY_UPDATED,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const clearOffer = async (req, res) => {
  const { categoryID } = req.body;

  try {
    const result = await category.updateMany(
      { category: categoryID },
      {
        $set: {
          Offer: null,
        },
      },
    );
    if (result) {
      const updated = await PRODUCT.updateMany(
        { Category: categoryID },
        {
          $set: {
            OfferPrice: 0,
          },
        },
      );
      if (!updated) {
        return res
          .status(httpStatusCode.BAD_REQUEST)
          .json({ success: false, message: httpResponse.UPDATE_FAILED });
      }
    }

    res
      .status(httpStatusCode.OK)
      .json({ success: true, message: httpResponse.REMOVED_SUCCESS });
  } catch (error) {
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const LoadLogin = (req, res) => {
  try {
    res.render("admin/page-account-login");
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.INTERNAL_ERROR });
  }
};

const LoadHome = async (req, res) => {
  try {
    const orders = await ORDER.find({}).populate("UserID").limit(8);

    const dash = await ORDER.aggregate([
      // {
      //   $match: {
      //     orderStatus: { $nin: ["Cancelled", "Returned"] }
      //   }
      // },

      {
        $group: {
          _id: null,
          revenue: { $sum: "$Final_Amount" },
          totalOrder: { $sum: 1 },
          discount: { $sum: "$Coupon.discountValue" },
        },
      },
    ]);
    const data = dash[0];
    //   const  data={
    //         metrics: report[0] || {
    //             totalOrders: 0,
    //             totalOrderAmount: 0,
    //             totalDiscounts: 0,
    //         },
    //     }

    res.render("admin/index", { CURRENTpage: "home", orders, data });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.INTERNAL_ERROR });
  }
};

const LoadCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const totalProducts = await category.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    if (skip >= totalProducts && totalProducts > 0) {
      return res.redirect("/admin/productList?page=" + totalPages);
    }

    const data = await category
      .find({})
      .populate("Offer")
      .skip(skip)
      .limit(limit);
    res.render("admin/page-categories", {
      data,
      CURRENTpage: "category",
      totalPages,
      totalProducts,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const Load_User = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const Block = req.query.Block;

    let query = {};
    if (Block) {
      query.isActive = Block;
    }
    const user = await USER.find(query).skip(skip).limit(limit);

    const totalUser = await USER.countDocuments(query);
    const totalPages = Math.ceil(totalUser / limit);

    if (skip >= totalUser && totalUser > 0) {
      return res.redirect("/admin/userList?page=" + totalPages);
    }

    res.render("admin/user-manage", {
      user,
      CURRENTpage: "userList",
      currentPage: page,
      totalPages,
      totalUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  verifyLogin,
  LoadLogin,
  LoadHome,
  Load_User,
  toogleUserStatus,
  addCategory,
  LoadCategory,
  clearOffer,
  categoryStatus,
  EditCategory,
};
