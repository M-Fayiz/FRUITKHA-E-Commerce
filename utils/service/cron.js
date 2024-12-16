const cron = require("node-cron");
const Coupon = require("../../model/ADMIN/Coupon"); 
const PRODUCT = require("../../model/ADMIN/product");
const Offer=require('../../model/ADMIN/Offer')
const startExpired = () => {
    cron.schedule("0 * * * *", async () => {
        console.log("Running coupon expiration check...");
        try {
            const currentDate = new Date();

            const result = await Coupon.updateMany(
                { endDate: { $lt: currentDate }, status: { $ne: "Expired" } },
                { status: "Expired" }
            );

            console.log(`${result.modifiedCount} coupons marked as expired.`);
        } catch (error) {
            console.error("Error updating expired coupons:", error);
        }
    });
};

const StockExpire = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log("Running Cron Job to Check Expired Batches");

        try {
            const now = new Date();
            const products = await PRODUCT.find();

            for (const product of products) {
                let updated = false;
                let totalExpiredQuantity = 0;

                for (const batch of product.Stock) {
                    if (!batch.isExpired && batch.expiryDate < now) {
                        batch.isExpired = true;
                        totalExpiredQuantity += batch.quantity;
                        updated = true;
                    }
                }

                if (updated) {
                    product.totalStock -= totalExpiredQuantity;
                    await product.save();
                    console.log(`Updated product: ${product.productTitle}, expired quantity: ${totalExpiredQuantity}`);
                }
            }

            console.log("Cron Job Completed: Expired Batches Updated");
        } catch (error) {
            console.error("Error in Cron Job:", error.message);
        }
    });
};

const manageExpiration = () => {
   
    cron.schedule('0 0 * * *', async () => {
      console.log('Running cron job for offer and product expiration management');
  
      try {
        const now = new Date();
  
        const expiredOffers = await Offer.find({ expiredAt: { $lt: now } });
        for (const expiredOffer of expiredOffers) {
          const offerId = expiredOffer._id;
  
          if (expiredOffer.categoryId) {
            await PRODUCT.updateMany(
              { Category: expiredOffer.categoryId, 'Offer.OfferId': offerId },
              { $unset: { 'Offer.OfferPrice': '', 'Offer.OfferId': '' } }
            );
            console.log(`Removed category-based offer from category: ${expiredOffer.categoryId}`);
          } else {
            await PRODUCT.updateMany(
              { 'Offer.OfferId': offerId },
              { $unset: { 'Offer.OfferPrice': '', 'Offer.OfferId': '' } }
            );
            console.log(`Removed product-specific offer for offerId: ${offerId}`);
          }
  
          await expiredOffer.remove();
          console.log(`Expired offer removed: ${offerId}`);
        }

        console.log('Cron job completed: Offers and product expiration handled');
      } catch (error) {
        console.error('Error during cron job execution:', error.message);
      }
    });
  };
  
  // Start the cron job
  

module.exports = { startExpired, StockExpire ,manageExpiration};
