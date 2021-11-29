const express=require("express");
const fs=require("fs");

const multer=require("multer");

const session=require("express-session");

const checkAuth=require("./middlewres/checkAuth");

const upload =multer({dest:"uploads"});

const app=express();
const port=3000

app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("root");
})

app.route("/logIn")
.get(function(req,res){
    res.render("login",{err:""});
})
.post(function(req,res){

    let {userName,password}=req.body;

    if(userName===""||password==="")
    {
        res.render("login",{err:"pleas enter write detailss"});
          return;
    }

    fs.readFile("./db.txt","utf-8",function(err,data)
    {
        if(err)
        {
            res.render("login",{err:err});
            return;
        }
        
        let users=[];
        
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
        users=JSON.parse(data);
        else
        {
            res.render("signup",{err:"no user sign-upd , first sign-up"});
            return;
        }

        for( let i = 0; i< users.length; i++ )
          {
              let user = users[i];
              
              if(user.userName === userName&&user.password===password)
              {
                req.session.is_logged_in = true;
                req.session.userName = userName;
    
                res.redirect("/home");
                  return;
              }
          }
          
          res.render("signup",{err:"NO user find with same crudential."});
          return;
          
    });

})

app.route("/signUp")
.get(function(req,res){
    res.render("signup",{err:""});
})
.post(function(req,res){
  let {name,userName,gmail,phoneNo,password}=req.body;

    if(name===""||userName===""||gmail===""||phoneNo===""||password==="")
    {
        res.render("signup",{err:"pleas enter write detailss"});
          return;
    }

  fs.readFile("./db.txt","utf-8",function(err,data)
  {
      if(err)
      {
          res.render("signup",{err:err});
          return;
      }
      
      let users=[];
      
      if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
      users=JSON.parse(data);

      for( let i = 0; i< users.length; i++ )
		{
			let user = users[i];

			if(user.userName === userName)
			{
				res.render("signup",{ err: "User already exisits" })
				return
			}
		}

		let user = {
			name: name,
			userName: userName,
			password : password,
			gamil: gmail,
			phoneNo : phoneNo
		}

		users.push(user);

        fs.writeFile("./db.txt", JSON.stringify(users), function(err)
		{
			if(err)
			{
				res.render("signup", { err: "something went wrong" })
				return
			}

			req.session.is_logged_in = true;
			req.session.userName = userName;

			res.redirect("/home");
		})
  });
})

/*app.route("/productPage")
.get(function(req,res){
res.render("productPage");
})
.post(function(req,res){

})
*/
app.route("/addProduct")
.get(function(req,res){
    res.render("addProduct");
})
.post(upload.single("pImage"),function(req,res){
   
    let {pName,pPrice,description}=req.body;
    let product={pName,pPrice,description};
    product.pImage=req.file.filename;
    
     fs.readFile("./product.txt","utf-8",function(err,data)
  {
    let products=[];
      
    if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
      products=JSON.parse(data);

    products.push(product);
    fs.writeFile("product.txt",JSON.stringify(products),function(){
        res.redirect("/addProduct")
      })
  });


})

app.get("/home", checkAuth ,function(req, res)
{
    fs.readFile("./product.txt","utf-8",function(err,data)
    {
        let products="";
      
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
          products=JSON.parse(data);
        if(products.length>5)
          m=5;
        else
          m=products.length;
        res.render("home", { user: req.session.userName,isDiv:products, m:m});

    })
	
})

app.post("/loadmore",function(req,res){
    const {value}=req.body;
    
    
    fs.readFile("./product.txt","utf-8",function(err,data)
    {
        let products="";
      
        if(data.length>0&&data[0]==="["&&data[data.length-1]==="]")
          products=JSON.parse(data);
       
          m=JSON.parse(value)+5;
        res.render("home", { user: req.session.userName,isDiv:products, m:m});

    })
})


app.get("/logout", function(req, res)
{
	req.session.destroy();
	res.redirect("/")
})

app.get("*",function(req,res){
    res.send(404);
})

app.listen(port,function(){
    console.log("running on 3000")
})