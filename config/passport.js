const passport=require('passport')
const GoogleStrategy=require('passport-google-oauth20').Strategy

const User=require('../model/User/userModel')
// const env=require('dotenv').config()
const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET}=require('../utils/env')
passport.use(new GoogleStrategy({
    clientID:GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {  // Ensure done is passed as an argument
    try {
        let user = await User.findOne({ googleId: profile.id });

        
        
        if (user) {
            return done(null, user);
        } else {
            user = new User({
                firstName: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                lastLogin:new Date(),
                isGoogle:true
            });
            await user.save();
            
            return done(null, user);
        }
    } catch (error) {
        return done(error, null);  // Ensure done is used here as well
    }
}));


passport.serializeUser((user,done)=>{
    done(null,user.id)
})

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{
        done(null,user)
    })
    .catch(err=>{
        done(err,null)
    })
})

module.exports=passport