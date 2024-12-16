const PRODUCT = require('../../model/ADMIN/product');
const USER = require('../../model/User/userModel');
const WISHLIST = require('../../model/User/wishList');

const wishList = async (req, res) => {
    try {
        const wish = await WISHLIST.findOne({ UserId: req.session.user }).populate('Products.product');
        
        // Check if 'wish' exists before accessing 'Products'
        if (!wish) {
            return res.render('user/wishList', {
                CURRENTpage: 'wishList',
                user: req.session.user,
                wish: { Products: [] }, // Pass an empty array to avoid errors
                info: 'No Items In Your Wish List',
            });
        }

        // Safely access Products
        const wSize = wish.Products.length;

        res.render('user/wishList', {
            CURRENTpage: 'wishList',
            user: req.session.user,
            wish,
            info: '',
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};




const toggleWishList = async (req, res) => {
    try {
        const { val } = req.body;
        const User = req.session.user;

        if (!User) {
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }

        const product = await PRODUCT.findOne({ _id: val });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product Not Found' });
        }

        let wishlist = await WISHLIST.findOne({ UserId: User });

        if (!wishlist) {
            wishlist = new WISHLIST({
                UserId: User,
                Products: [{ product: val }],
            });

            product.isWishList = true;
            await product.save();

            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Product successfully added to wishlist' });
        }

        const productIndex = wishlist.Products.findIndex(p => p.product.toString() === val);
        if (productIndex > -1) {
            wishlist.Products.splice(productIndex, 1);

            product.isWishList = false;
            await product.save();

            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Product successfully removed from wishlist' });
        } else {
            
            wishlist.Products.push({ product: val });

           
            product.isWishList = true;
            await product.save();

            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Product successfully added to wishlist' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

///      
const remove_wishList = async (req, res) => {
    console.log("Get In Remove Wish");

    const { productId, item } = req.body;
    try {
        const UserId = req.session.user;

        if (!UserId) {
            return res.status(401).json({ success: false, message: "User is Not Logged In" });
        }

        const result = await WISHLIST.updateOne(
            { UserId },
            { $pull: { Products: { _id: item } } } 
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ success: true, message: "Product removed from wishlist" });
        } else {
            return res.status(404).json({ success: false, message: "Product Not Found in Wishlist" });
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    wishList,
    toggleWishList,
    remove_wishList
};
