const USER=require('../model/User/userModel')

const userAuth=(req,res,next)=>{


     if(req.session.user){
        res.redirect("/")
     }
     else{
        next()
     }
}

const blockUser=async(req,res,next)=>{
           try {
            console.log('user session',req.session.user)

            if(req.session.user){
                const user=await USER.findById(req.session.user)

                console.log(user,'midllware block user');
                
                if(user&&user.isActive==false){
                    req.session.destroy((err) => {
                        if (err) {
                          console.error('Error destroying session:', err);
                        }
                        
                        return res.redirect('/'); 
                      });
                }else{
                    return next()
                }
            }else{
                return next()
            }
            
           } catch (error) {
            console.log(error.message)
           }
}



const adminAuth=(req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        res.redirect('/admin/login')
    }
}

const sessionAuth=(req,res,next)=>{
    // console.log("Auth hello",req.session);
    
         if(!req.session.user){
            res.redirect("/login")
         }
         else{
            next()
         }
    }


module.exports={
    userAuth,
    adminAuth,
    blockUser,
    sessionAuth
    
}

