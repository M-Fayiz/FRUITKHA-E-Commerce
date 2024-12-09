const cron = require("node-cron");
const Coupon = require("../../model/ADMIN/Coupon"); 

const startExpired=()=>{
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
})
}
module.exports=startExpired
