function generateOrderNumber() {
   const random = Math.floor(100000 + Math.random() * 900000);
   const year = new Date().getFullYear();
   return `ORD-${year}-${random}`;
}

module.exports=generateOrderNumber