const multer=require('multer')
const path=require('path')
console.log(__dirname)
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
       cb(null,"IMAGES")
    },
    filename:(req,file,cb)=>{
      cb(null,Date.now()+ path.extname(file.originalname))
       
    }
})
const upload=multer({storage:storage})

module.exports=upload