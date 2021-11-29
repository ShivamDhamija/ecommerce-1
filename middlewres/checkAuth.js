function checkAuth(req,res,next){
    if(req.session.is_logged_in)
    {
        next();
        return ;
    }
    res.redirect("/logIn");
}
module.exports=checkAuth;