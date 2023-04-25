const router = require("./routes.js");
const express = require("express");
const nunjucks = require("nunjucks")
const app = express();

app.use(express.static("/public"));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.use(router);

app.listen(3000,()=>{
  console.log("Server live")
})