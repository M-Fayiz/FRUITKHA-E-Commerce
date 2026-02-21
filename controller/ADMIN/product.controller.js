const adminModel = require("../../model/admin/adminModel");
const USER = require("../../model/user/userModel");

const category = require("../../model/admin/category");

const PRODUCT = require("../../model/admin/product");
const categoryModel = require("../../model/admin/category");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      regularPrice,
      expiryDate,
      quantity,
      category,
      subCategories,
    } = req.body;

    const batch_id = `batch_${new Date().getTime()}`;

    const test = await PRODUCT.findOne({
      productTitle: { $regex: new RegExp("^" + title + "$", "i") },
    });
    if (test) {
      return res
        .status(httpStatusCode.ITEM_EXIST)
        .json({ success: false, message: httpResponse.PRODUCT_EXISTS });
    }

    if (test) {
      return res
        .status(httpStatusCode.ITEM_EXIST)
        .json({ success: false, message: httpResponse.PRODUCT_ALREADY_EXISTS });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.PRODUCT_IMAGE_REQUIRED }); // Added return statement
    }

    const image = req.files
      ? Array.isArray(req.files)
        ? req.files.map((file) => file.filename)
        : [req.files.filename]
      : [];

    const primaryImage = image[0];
    const additionalImage = image.slice(1);

    const DATA = new PRODUCT({
      productTitle: title,
      description: description,
      RegulerPrice: regularPrice,
      // ExpirAt: expiry,
      Stock: [{ batchId: batch_id, quantity, expiryDate }],
      Category: category,
      primaryImage: primaryImage,
      additonalImage: additionalImage,
      subCategory: subCategories,
    });
    const totalStock = DATA.Stock.reduce(
      (acc, batch) => acc + batch.quantity,
      0,
    );
    DATA.totalStock = totalStock;

    await DATA.save();

    res
      .status(httpStatusCode.CREATED)
      .json({ success: true, message: httpResponse.PRODUCT_ADDED });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const productForm = async (req, res) => {
  try {
    const data = await categoryModel.find({});
    res.render("admin/product-form", { data, CURRENTpage: "productForm" });
  } catch (error) {}
};

const prductList = async (req, res) => {
  try {
    const CTGRY = await categoryModel.find({});
    const Category = req.query.category;
    const List = req.query.List;
    const Offer = req.query.Offer;
    const stock = Number(req.query.stock);
    let query = {};

    if (Category) {
      query.Category = Category;
    }

    if (List) {
      query.isList = List;
    }

    if (Offer) {
      query.OfferPrice = { $ne: 0 };
    }

    // Add stock filter
    if (stock === 11) {
      query.Stock = { $gt: 10, $lt: 1000 };
    } else if (stock === 10) {
      query.Stock = { $gt: 0, $lte: 10 };
    } else if (stock === 0) {
      query.Stock = { $lte: 0 };
    }

    // Pagination logic
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 6; // Products per page
    const skip = (page - 1) * limit;

    const products = await PRODUCT.find(query).skip(skip).limit(limit);

    const totalProducts = await PRODUCT.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    if (skip >= totalProducts && totalProducts > 0) {
      return res.redirect("/admin/productList?page=" + totalPages);
    }

    // Render view
    res.render("admin/productList", {
      products,
      CTGRY,
      currentPage: page,
      totalPages,
      totalProducts,
      CURRENTpage: "productList",
    });
  } catch (error) {
    console.log(error.message, "error");
  }
};

const getProductDetails = async (req, res) => {
  const productId = req.params.id;

  try {
    const category = await categoryModel.find({});

    const result = await PRODUCT.findById(productId);
    let offer = null;

    if (result.OfferPrice && result.OfferPrice < result.RegulerPrice) {
      offer =
        ((result.RegulerPrice - result.OfferPrice) / result.RegulerPrice) * 100;
    } else {
      offer = null;
    }

    res.render("admin/adminProductDetails", {
      result,
      category,
      CURRENTpage: "singleProduct",
      offer: offer,
    });
  } catch (error) {
    console.log(error.message, "errrr");
  }
};

const editProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      regularPrice,
      offerPrice,
      category,
      stock,
      productId,
    } = req.body;

    let OFFER;

    if (offerPrice) {
      OFFER = Number((regularPrice * (1 - offerPrice / 100)).toFixed(2));
    }

    const test = await PRODUCT.findOne({
      productTitle: { $regex: new RegExp("^" + title + "$", "i") },
      _id: { $ne: productId },
    });
    if (test) {
      return res
        .status(httpStatusCode.ITEM_EXIST)
        .json({ success: false, message: httpResponse.PRODUCT_EXISTS });
    }

    const product = await PRODUCT.findById(productId);
    if (!product) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND });
    }

    const updateData = {
      productTitle: title,
      description: description,
      RegulerPrice: regularPrice,
      OfferPrice: OFFER,
      totalStock: stock,
      Category: category,
    };

    if (req.files.primaryImage && req.files.primaryImage[0]) {
      updateData.primaryImage = req.files.primaryImage[0].filename;
    }

    let updatedAdditionalImages = [...(product.additonalImage || [])];

    Object.keys(req.files).forEach((key) => {
      const match = key.match(/additionalImage(\d+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        if (req.files[key][0] && req.files[key][0].filename) {
          updatedAdditionalImages[index] = req.files[key][0].filename;
        }
      }
    });

    updateData.additonalImage = [...new Set(updatedAdditionalImages)];

    const result = await PRODUCT.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
    if (!result) {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ success: false, message: httpResponse.PRODUCT_UPDATE_FAILED });
    }

    res
      .status(httpStatusCode.OK)
      .json({
        success: true,
        message: httpResponse.PRODUCT_UPDATED,
        product: result,
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const productList = async (req, res) => {
  try {
    const { itemId, condition } = req.body;

    const result = await PRODUCT.findByIdAndUpdate(itemId, {
      isList: condition,
    });
    if (!result) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.RESULT_NOT_RECEIVED });
    }
    res
      .status(httpStatusCode.OK)
      .json({
        success: true,
        message: httpResponse.UPDATED_SUCCESSFULLY("Product", "updated"),
      });
  } catch (error) {
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  prductList,
  addProduct,
  productForm,
  getProductDetails,
  editProduct,
  productList,
};
