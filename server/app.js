const router = require("./routes.js");
const express = require('express');
const { resolve } = require("path");
const http = require('http');
const nunjucks = require("nunjucks");
const morgan = require("morgan")
const app = express();


const server = http.createServer(app);


//app.use(morgan("dev"));

app.use(express.static(resolve("./public")));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.use(router);


server.listen(3000, () => {
  console.log('Server Live');
});
module.exports = { server,app }