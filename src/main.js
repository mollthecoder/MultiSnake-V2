var $6nUlG$express = require("express");
var $6nUlG$path = require("path");
var $6nUlG$http = require("http");
var $6nUlG$axios = require("axios");
var $6nUlG$nunjucks = require("nunjucks");
var $6nUlG$expresssession = require("express-session");
require("morgan");
var $6nUlG$ip = require("ip");
var $6nUlG$badwords = require("bad-words");
var $6nUlG$crypto = require("crypto");
var $6nUlG$awssdk = require("aws-sdk");
var $6nUlG$sqlite3 = require("sqlite3");
var $6nUlG$sqlite = require("sqlite");
var $6nUlG$socketio = require("socket.io");
var $6nUlG$safemarked = require("safe-marked");
var $6nUlG$xss = require("xss");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $parcel$global =
typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {};
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire8cf3"];
if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire8cf3"] = parcelRequire;
}
parcelRequire.register("e0L3I", function(module, exports) {


var $5Gf0A = parcelRequire("5Gf0A");
var $a33591b969e6e77e$require$json2array = $5Gf0A.json2array;
var $a33591b969e6e77e$require$generateAPIKey = $5Gf0A.generateAPIKey;
var $a33591b969e6e77e$require$rand = $5Gf0A.rand;
var $a33591b969e6e77e$require$guid = $5Gf0A.guid;

var $bHvIr = parcelRequire("bHvIr");
var $a33591b969e6e77e$require$manager = $bHvIr.manager;

var $a33591b969e6e77e$require$resolve = $6nUlG$path.resolve;






var $51Cy5 = parcelRequire("51Cy5");
var $a33591b969e6e77e$require$apiKeyManager = $51Cy5.apiKeyManager;
var $a33591b969e6e77e$require$dbManager = $51Cy5.dbManager;


var $a33591b969e6e77e$var$filter = new $6nUlG$badwords();
const $a33591b969e6e77e$var$app = $6nUlG$express();
const $a33591b969e6e77e$var$server = $6nUlG$http.createServer($a33591b969e6e77e$var$app);
$a33591b969e6e77e$var$app.use($6nUlG$express.json());
$a33591b969e6e77e$var$app.use($6nUlG$express.static($a33591b969e6e77e$require$resolve("./src/server/public")));
$6nUlG$nunjucks.configure($a33591b969e6e77e$require$resolve("./src/server/views"), {
    autoescape: true,
    express: $a33591b969e6e77e$var$app
});
// app.use(express.static(resolve("./MultiSnake-V2/src/server/public")));
// nunjucks.configure(resolve("./MultiSnake-V2/src/server/views"), {
//     autoescape: true,
//     express: app
// });
$a33591b969e6e77e$var$app.use($6nUlG$expresssession({
    secret: undefined,
    resave: false,
    saveUninitialized: true
}));
$a33591b969e6e77e$var$app.use($a33591b969e6e77e$var$restrict([
    "/account"
], "/login", true));
$a33591b969e6e77e$var$app.use($a33591b969e6e77e$var$restrict([
    "/login",
    "/signup"
], "/account", false));
function $a33591b969e6e77e$var$restrict(urls, redirect, loggedInToAccess) {
    return (req, res, next)=>{
        var path = req._parsedUrl.pathname;
        path = path.split("/").join("");
        urls = urls.map((u)=>{
            return u.split("/").join("");
        });
        var restricted = urls.indexOf(path) !== -1;
        if (restricted && loggedInToAccess) {
            if (req.session.user) next();
            else res.redirect(redirect);
        } else if (restricted && !loggedInToAccess) {
            if (!req.session.user) next();
            else res.redirect(redirect);
        } else next();
    };
}
function $a33591b969e6e77e$var$mustBeLoggedIn(message) {
    // equivalent of restrict() but for API endpoints
    return (req, res, next)=>{
        if (req.session.user && req.session.user.email) next();
        else res.status(405).json({
            message: message,
            color: "red",
            redirect: "/login"
        });
    };
}
function $a33591b969e6e77e$var$updateSession(log) {
    return async (req, res, next)=>{
        if (req.session && req.session.user) {
            var nuser = await $a33591b969e6e77e$require$dbManager.getUser(req.session.user.uid);
            if (nuser) {
                delete nuser.passwordHash;
                req.session.user = nuser;
            } else req.session.user = false;
        }
        next();
    };
}
$a33591b969e6e77e$var$app.get("/", (req, res)=>{
    res.render("index.njk", {
        user: req.session.user
    });
});
// GET method to render the login page
$a33591b969e6e77e$var$app.get("/login", (req, res)=>{
    res.render("login.njk");
});
$a33591b969e6e77e$var$app.get("/developers", $a33591b969e6e77e$var$updateSession(), (req, res)=>{
    res.render("developers.njk", {
        user: req.session.user
    });
});
// GET method to render the account page
$a33591b969e6e77e$var$app.get("/account", $a33591b969e6e77e$var$updateSession(), (req, res)=>{
    res.render("account.njk", {
        user: req.session.user
    });
});
$a33591b969e6e77e$var$app.get("/account/:uid", async (req, res, next)=>{
    var user = await $a33591b969e6e77e$require$dbManager.getUser(req.params.uid);
    if (user) res.render("account_view.njk", {
        user: req.session.user,
        viewing: user
    });
    else next();
});
$a33591b969e6e77e$var$app.get("/signup", (req, res)=>{
    res.render("signup.njk");
});
$a33591b969e6e77e$var$app.get("/play/:room", (req, res)=>{
    res.render("play.njk", {
        room: req.params.room,
        type: req.query.type || "standard",
        user: req.session.user
    });
});
$a33591b969e6e77e$var$app.get("/verifyEmail", async (req, res)=>{
    if (req.session.user && req.session.user.email) {
        req.session.verificationCode = $a33591b969e6e77e$require$rand(6);
        await $a33591b969e6e77e$require$dbManager.sendVerification(req.session.user.email, req.session.verificationCode);
        res.render("verify.njk", {
            user: req.session.user
        });
    } else res.redirect("/signup");
});
// Logout endpoint
$a33591b969e6e77e$var$app.get("/logout", (req, res)=>{
    // Destroy the session
    req.session.destroy();
    res.redirect("/login");
});
$a33591b969e6e77e$var$app.delete("/deleteKey", $a33591b969e6e77e$var$mustBeLoggedIn("You must be logged in to delete an API key"), async (req, res)=>{
    const { uid: uid, api_key: api_key } = req.body;
    await $a33591b969e6e77e$require$dbManager.removeAPIKey(uid, api_key);
    res.status(200).json({
        message: `${api_key} successfully deleted`,
        color: "green"
    });
});
$a33591b969e6e77e$var$app.post("/newAPIKey", $a33591b969e6e77e$var$mustBeLoggedIn("You must be logged in to create an API key"), async (req, res)=>{
    const { uid: uid } = req.body;
    var key = $a33591b969e6e77e$require$generateAPIKey();
    var botUid = $a33591b969e6e77e$require$guid();
    try {
        await $a33591b969e6e77e$require$dbManager.addAPIKey(uid, key, botUid);
        await $a33591b969e6e77e$require$apiKeyManager.createBot(uid, key, botUid);
        res.status(200).json({
            key: key,
            botUid: botUid,
            message: key + " successfully created",
            color: "green"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            color: "red"
        });
    }
});
$a33591b969e6e77e$var$app.post("/verifyEmail", async (req, res)=>{
    if (req.session.verificationCode && req.session.user) {
        const { code: code } = req.body;
        if (code == req.session.verificationCode) {
            await $a33591b969e6e77e$require$dbManager.setVerified(req.session.user.uid);
            res.status(200).json({
                message: req.session.user.email + " successfully verified",
                color: "green",
                "redirect": "/account"
            });
        } else res.status(200).json({
            message: "Incorrect code",
            color: "gold"
        });
    } else res.status(200).json({
        message: "Not logged in",
        color: "green",
        "redirect": "/login"
    });
});
$a33591b969e6e77e$var$app.post("/signup", async (req, res)=>{
    const { username: username, password: password, age: age, email: email } = req.body;
    try {
        // Create user in the database
        var userCheck = await $a33591b969e6e77e$require$dbManager.getDataByEmail(email);
        if (userCheck.Items.length == 0) {
            await $a33591b969e6e77e$require$dbManager.createUser(email, username, password, false, age);
            const user = await $a33591b969e6e77e$require$dbManager.getDataByEmail(email);
            // Return success response
            var sUser = user.Items[0];
            delete sUser.passwordHash;
            req.session.user = sUser;
            res.status(200).json({
                message: "Account created successfully",
                redirect: "/verifyEmail",
                color: "green"
            });
        } else return res.status(405).json({
            message: "Account with that email already exists",
            color: "red"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error",
            color: "red"
        });
    }
});
// Update account endpoint
$a33591b969e6e77e$var$app.put("/account", $a33591b969e6e77e$var$mustBeLoggedIn("You must be logged in to modify your account"), async (req, res)=>{
    const { uid: uid, newUsername: newUsername, newPassword: newPassword } = req.body;
    try {
        // Update username in the database
        if (newUsername) await $a33591b969e6e77e$require$dbManager.updateUsername(uid, $a33591b969e6e77e$var$filter.clean(newUsername));
        if (newPassword) await $a33591b969e6e77e$require$dbManager.updatePassword(uid, newPassword);
        // Return success response
        return res.status(200).json({
            message: "Account updated successfully",
            color: "green"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error",
            color: "red"
        });
    }
});
// Delete account endpoint
$a33591b969e6e77e$var$app.delete("/account", $a33591b969e6e77e$var$mustBeLoggedIn("You must bel logged in to delete your account"), async (req, res)=>{
    const { uid: uid } = req.body;
    try {
        // Delete user from the database
        await $a33591b969e6e77e$require$dbManager.deleteUser(uid);
        // Return success response
        return res.status(200).json({
            message: "Account deleted successfully",
            redirect: "/login"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error",
            color: "red"
        });
    }
});
// Login endpoint
$a33591b969e6e77e$var$app.post("/login", async (req, res)=>{
    const { email: email, password: password } = req.body;
    try {
        // Retrieve user data by email
        const userData = await $a33591b969e6e77e$require$dbManager.getDataByEmail(email);
        if (userData.Items.length === 0) return res.status(400).json({
            message: "Invalid email or password",
            color: "red"
        });
        const user = userData.Items[0];
        // Verify password (replace with your own password verification logic)
        if (user.passwordHash !== password) return res.status(400).json({
            message: "Invalid email or password",
            color: "red"
        });
        // Set session data
        delete user.passwordHash;
        req.session.user = user;
        // Return success response
        return res.status(200).json({
            message: "Login successful",
            color: "green",
            redirect: "/account"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
            color: "red"
        });
    }
});
$a33591b969e6e77e$var$app.post("/verify-recaptcha", async (req, res)=>{
    const ipAddress = $6nUlG$ip.address();
    const { token: token } = req.body;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${undefined}&response=${token}&remoteip=${ipAddress}`;
    try {
        const response = await $6nUlG$axios.post(verifyUrl);
        const data = response.data;
        if (data) {
            var possibleKeys = [];
            if (req.session && req.session.user) possibleKeys = await $a33591b969e6e77e$require$apiKeyManager.getAPIKeysForUid(req.session.user.uid);
            // Generate and assign a key to the client
            const key = possibleKeys[0] ? possibleKeys[0].api_key : $a33591b969e6e77e$require$generateAPIKey();
            const expiredAt = new Date().getTime() + 3600000;
            const uid = req.session && req.session.user ? req.session.user.uid || null : null;
            await $a33591b969e6e77e$require$apiKeyManager.addKey(key, expiredAt, uid);
            // Send the key via websockets or any other method you're using
            res.status(200).json({
                success: true,
                key: key
            });
        } else res.status(400).json({
            success: false,
            message: "reCAPTCHA verification failed."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error verifying reCAPTCHA."
        });
    }
});
$a33591b969e6e77e$var$app.get("/api/v1/rooms", (req, res)=>{
    var reems = $a33591b969e6e77e$require$json2array($a33591b969e6e77e$require$manager.rooms);
    reems = reems.map((reem)=>{
        var snakesArray = $a33591b969e6e77e$require$json2array(reem.snakes);
        var reemSnakes = snakesArray.filter((snake)=>{
            if (snake !== "dead_snake") return true;
            else return false;
        });
        return {
            "room_key": reem.key,
            "type": reem.type,
            "alive_snakes": reemSnakes,
            "snake_quantity": reemSnakes.length,
            "apple_pos": reem.apple,
            "current_obstacles": reem.obs,
            "room_size": reem.by
        };
    });
    res.json(reems);
});
$a33591b969e6e77e$var$app.use((req, res)=>{
    res.render("404.njk");
});
$a33591b969e6e77e$var$server.listen(3001, ()=>{
    console.log("Server Live");
});
module.exports = {
    server: $a33591b969e6e77e$var$server,
    app: $a33591b969e6e77e$var$app
};

});
parcelRequire.register("5Gf0A", function(module, exports) {

var $422c845c72f67a43$require$randomUUID = $6nUlG$crypto.randomUUID;
function $422c845c72f67a43$var$generateName() {
    var start = [
        "flying",
        "blue",
        "pink",
        "jumping",
        "invisible",
        "red",
        "dancing",
        "running",
        "yellow"
    ];
    var end = [
        "Tangerine",
        "Orange",
        "Helicopter",
        "Snake",
        "Toad",
        "Ninja",
        "Goose",
        "Banana",
        "Duck"
    ];
    var ending = start[Math.floor(Math.random() * start.length)] + end[Math.floor(Math.random() * end.length)] + Math.round(Math.random() * 100);
    return ending;
}
function $422c845c72f67a43$var$pickColor() {
    var colors = [
        "red",
        "orange",
        "green",
        "blue",
        "purple",
        "white",
        "lightgreen",
        "yellow",
        "pink",
        "coral",
        "lightblue",
        "deepskyblue",
        "greenyellow",
        "darkorange"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
function $422c845c72f67a43$var$oddsOf(percent) {
    let odd = percent / 100;
    return Math.random() < odd;
}
function $422c845c72f67a43$var$json2array(json) {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key) {
        var endJSON = json[key];
        endJSON.key = key;
        result.push(endJSON);
    });
    return result;
}
function $422c845c72f67a43$var$sumArrays(...arrays) {
    const n = arrays.reduce((max, xs)=>Math.max(max, xs.length), 0);
    const result = Array.from({
        length: n
    });
    return result.map((_, i)=>arrays.map((xs)=>xs[i] || 0).reduce((sum, x)=>sum + x, 0));
}
function $422c845c72f67a43$var$guid() {
    return $422c845c72f67a43$require$randomUUID();
}
function $422c845c72f67a43$var$manhattanDistance(point1, point2) {
    return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}
function $422c845c72f67a43$var$directionVector(direction) {
    switch(direction){
        case "up":
            return [
                0,
                -1
            ];
        case "down":
            return [
                0,
                1
            ];
        case "left":
            return [
                -1,
                0
            ];
        case "right":
            return [
                1,
                0
            ];
        default:
            throw new Error(`Invalid direction: ${direction}`);
    }
}
function $422c845c72f67a43$var$generateAPIKey() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let apiKey = "";
    for(let i = 0; i < 32; i++){
        const randomIndex = Math.floor(Math.random() * characters.length);
        apiKey += characters.charAt(randomIndex);
    }
    return apiKey;
}
function $422c845c72f67a43$var$rand(digits) {
    return Math.floor(Math.random() * parseInt("8" + "9".repeat(digits - 1)) + parseInt("1" + "0".repeat(digits - 1)));
}
function $422c845c72f67a43$var$isEmptyObject(obj) {
    for(var key in obj){
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}
module.exports = {
    isEmptyObject: $422c845c72f67a43$var$isEmptyObject,
    generateName: $422c845c72f67a43$var$generateName,
    oddsOf: $422c845c72f67a43$var$oddsOf,
    json2array: $422c845c72f67a43$var$json2array,
    sumArrays: $422c845c72f67a43$var$sumArrays,
    guid: $422c845c72f67a43$var$guid,
    pickColor: $422c845c72f67a43$var$pickColor,
    manhattanDistance: $422c845c72f67a43$var$manhattanDistance,
    directionVector: $422c845c72f67a43$var$directionVector,
    generateAPIKey: $422c845c72f67a43$var$generateAPIKey,
    rand: $422c845c72f67a43$var$rand
};

});

parcelRequire.register("bHvIr", function(module, exports) {

$parcel$export(module.exports, "manager", () => $884c4ff327d2d05c$export$a6385bddcc8e6b77, (v) => $884c4ff327d2d05c$export$a6385bddcc8e6b77 = v);
var $884c4ff327d2d05c$export$a6385bddcc8e6b77;

var $5Gf0A = parcelRequire("5Gf0A");
var $884c4ff327d2d05c$require$json2array = $5Gf0A.json2array;
class $884c4ff327d2d05c$var$Manager {
    constructor(){
        this.rooms = {};
        this.snakes = {};
        this.ticking = false;
    }
    kill(uid) {
        if (this.snakes[uid]) {
            var room = this.snakes[uid].room;
            if (this.rooms[room]) {
                this.rooms[room].killSnake(uid);
                delete this.snakes[uid];
            }
        }
    }
    addSnake(snake) {
        this.snakes[snake.uid] = snake;
    }
    getSnake(uid) {
        return this.snakes[uid];
    }
    createRoom(room) {
        if (!this.ticking) this.ticking = true;
        this.rooms[room.uid] = room;
    }
    getRoom(id) {
        return this.rooms[id];
    }
    resetRoom(id) {
        if (this.rooms[id]) this.rooms[id].reset();
    }
    deleteRoom(id) {
        delete this.rooms[id];
    }
    online() {
        var online = 0;
        online += $884c4ff327d2d05c$require$json2array(this.snakes).length;
    }
}
var $884c4ff327d2d05c$var$server1 = new $884c4ff327d2d05c$var$Manager();
$884c4ff327d2d05c$export$a6385bddcc8e6b77 = $884c4ff327d2d05c$var$server1;

});

parcelRequire.register("51Cy5", function(module, exports) {


var $5Gf0A = parcelRequire("5Gf0A");
var $3a8af2b6dee31e47$require$guid = $5Gf0A.guid;
$6nUlG$awssdk.config.update({
    region: "us-west-2",
    accessKeyId: undefined,
    secretAccessKey: undefined
});


var $3a8af2b6dee31e47$require$open = $6nUlG$sqlite.open;
class $3a8af2b6dee31e47$var$ApiKeyManager {
    constructor(databasePath){
        this.databasePath = databasePath;
        this.db = null;
        this.onready = ()=>{};
        this.ready = false;
        this.initializeDatabase().then((db)=>{
            this.db = db;
            this.onready(this.db);
            this.scheduleExpiredKeysDeletion();
        }).catch((err)=>{
            console.log(err);
        });
    }
    async initializeDatabase() {
        try {
            const db = await $3a8af2b6dee31e47$require$open({
                filename: this.databasePath,
                driver: $6nUlG$sqlite3.Database
            });
            await db.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
          api_key TEXT PRIMARY KEY,
          expiredAt INTEGER,
          uid TEXT,
          isBot BOOLEAN,
          linkedAccount TEXT NULL
        )
      `);
            console.log("Database initialized successfully.");
            return db;
        } catch (err) {
            console.error("Error initializing database:", err);
        }
    }
    async addKey(apiKey, expiredAt, uid) {
        try {
            await this.db.run(`
        INSERT INTO api_keys (api_key, expiredAt, uid, isBot, linkedAccount)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(api_key) DO UPDATE SET expiredAt = excluded.expiredAt, uid = excluded.uid
        `, [
                apiKey,
                expiredAt,
                uid,
                0,
                null
            ]);
        } catch (err) {
            console.error("Error adding API key:", err);
        }
    }
    async createBot(linkedAccount, key, uid) {
        try {
            await this.db.run(`
      INSERT INTO api_keys (api_key, expiredAt, uid, isBot, linkedAccount)
      VALUES (?, ?, ?, ?, ?)
      `, [
                key,
                0,
                uid,
                1,
                linkedAccount
            ]);
        } catch (err) {
            console.error(err);
        }
    }
    async updateUid(apiKey, uid) {
        try {
            await this.db.run(`UPDATE api_keys SET uid = ? WHERE api_key = ?`, [
                uid,
                apiKey
            ]);
        } catch (err) {
            console.error("Error updating UID:", err);
        }
    }
    async deleteKey(apiKey) {
        try {
            await this.db.run(`DELETE FROM api_keys WHERE api_key = ?`, [
                apiKey
            ]);
            console.log("API key deleted successfully.");
        } catch (err) {
            console.error("Error deleting API key:", err);
        }
    }
    async isKeyExpired(apiKey) {
        try {
            const row = await this.db.get(`SELECT expiredAt FROM api_keys WHERE api_key = ?`, [
                apiKey
            ]);
            const currentTime = new Date().getTime();
            const expiredAt = row && row.expiredAt ? row.expiredAt : 0;
            return expiredAt > 0 && expiredAt < currentTime;
        } catch (err) {
            console.error("Error checking expiration status:", err);
        }
    }
    async getAPIKeysForUid(uid) {
        try {
            const rows = await this.db.all(`SELECT api_key FROM api_keys WHERE uid = ?`, [
                uid
            ]);
            return rows;
        } catch (err) {
            console.error(err);
        }
    }
    async getAPIKey(apiKey) {
        try {
            const row = await this.db.get(`SELECT expiredAt, uid FROM api_keys WHERE api_key = ?`, [
                apiKey
            ]);
            if (!row) return false;
            else {
                const expiredAt = row.expiredAt || 0;
                const uid = row.uid || null;
                return {
                    expiredAt: expiredAt,
                    uid: uid
                };
            }
        } catch (err) {
            console.error("Error retrieving API key:", err);
        }
    }
    async deleteExpiredKeys() {
        try {
            await this.db.run("DELETE FROM api_keys WHERE expiredAt < ? AND isBot = ?", [
                Date.now(),
                0
            ]);
            console.log("Expired API keys deleted successfully.");
        } catch (err) {
            console.error("Error deleting expired API keys:", err);
        }
    }
    scheduleExpiredKeysDeletion() {
        this.deleteExpiredKeys();
        setInterval(()=>{
            if (this.ready) this.deleteExpiredKeys();
        }, 3600000); // Run every hour (in milliseconds)
    }
}
const $3a8af2b6dee31e47$var$apiKeyManager = new $3a8af2b6dee31e47$var$ApiKeyManager("api_keys.db");
$3a8af2b6dee31e47$var$apiKeyManager.onready = async (db)=>{
    $3a8af2b6dee31e47$var$apiKeyManager.ready = true;
};
class $3a8af2b6dee31e47$var$DBManager {
    constructor(){
        this.TABLE_NAME = "multisnake";
        const DynamoDB = new $6nUlG$awssdk.DynamoDB();
        this.dynamoClient = new $6nUlG$awssdk.DynamoDB.DocumentClient();
        this.schema = {
            "uid": "string",
            "username": "string",
            "email": "string",
            "gamesPlayed": "Integer",
            "gamesWon": "Integer",
            "passwordHash": "string",
            "verified": "boolean",
            "yearBorn": "Integer",
            "api_keys": "String[]"
        };
    }
    async winGame(uid, timeToWin) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET gamesWon = gamesWon + :incr",
            ExpressionAttributeValues: {
                ":incr": 1
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async playGame(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET gamesPlayed = gamesPlayed + :incr",
            ExpressionAttributeValues: {
                ":incr": 1
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async createUser(email, username, passwordHash, verified, age) {
        const params = {
            TableName: this.TABLE_NAME,
            Item: {
                uid: $3a8af2b6dee31e47$require$guid(),
                username: username,
                email: email,
                gamesPlayed: 0,
                gamesWon: 0,
                fastestTimeToWin: Number.MAX_SAFE_INTEGER,
                passwordHash: passwordHash,
                verified: verified,
                yearBorn: age,
                timestamp: new Date().getTime()
            }
        };
        try {
            const data = await this.dynamoClient.put(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async setVerified(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET #v = :val",
            ExpressionAttributeNames: {
                "#v": "verified"
            },
            ExpressionAttributeValues: {
                ":val": true
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async updateUsername(uid, newUsername) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET #un = :username",
            ExpressionAttributeNames: {
                "#un": "username"
            },
            ExpressionAttributeValues: {
                ":username": newUsername
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async deleteUser(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            }
        };
        try {
            const data = await this.dynamoClient.delete(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async isOldEnough(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            ProjectionExpression: "yearBorn"
        };
        try {
            const data = await this.dynamoClient.get(params).promise();
            const userAge = data.Item.yearBorn;
            return new Date().getFullYear() - userAge > 13;
        } catch (err) {
            console.log(err);
        }
    }
    async isVerified(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            ProjectionExpression: "verified"
        };
        try {
            const data = await this.dynamoClient.get(params).promise();
            const isVerified = data.Item.verified;
            return isVerified === true;
        } catch (err) {
            console.log(err);
        }
    }
    async updatePassword(uid, newPasswordHash) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET #pw = :password",
            ExpressionAttributeNames: {
                "#pw": "passwordHash"
            },
            ExpressionAttributeValues: {
                ":password": newPasswordHash
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async getDataByEmail(email) {
        const params = {
            TableName: this.TABLE_NAME,
            IndexName: "email-index",
            ExpressionAttributeValues: {
                ":e": email
            },
            KeyConditionExpression: "email = :e"
        };
        try {
            const data = await this.dynamoClient.query(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async getUser(uid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            }
        };
        try {
            const data = await this.dynamoClient.get(params).promise();
            return data.Item;
        } catch (err) {
            console.log(err);
        }
    }
    async addAPIKey(uid, apiKey, botUid) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            },
            UpdateExpression: "SET #ak = list_append(if_not_exists(#ak, :empty_list), :apiKey)",
            ExpressionAttributeNames: {
                "#ak": "api_keys"
            },
            ExpressionAttributeValues: {
                ":empty_list": [],
                ":apiKey": [
                    {
                        apiKey: apiKey,
                        botUid: botUid
                    }
                ]
            }
        };
        try {
            const data = await this.dynamoClient.update(params).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async removeAPIKey(uid, apiKey) {
        const getParams = {
            TableName: this.TABLE_NAME,
            Key: {
                uid: uid
            }
        };
        try {
            let data = await this.dynamoClient.get(getParams).promise();
            const apiKeys = data.Item.api_keys || [];
            // Remove the apiKey from the list
            const updatedKeys = apiKeys.filter((key)=>key.apiKey !== apiKey);
            const updateParams = {
                TableName: this.TABLE_NAME,
                Key: {
                    uid: uid
                },
                UpdateExpression: "SET #ak = :updatedKeys",
                ExpressionAttributeNames: {
                    "#ak": "api_keys"
                },
                ExpressionAttributeValues: {
                    ":updatedKeys": updatedKeys
                },
                ReturnValues: "UPDATED_NEW"
            };
            // Update the item with the modified list
            data = await this.dynamoClient.update(updateParams).promise();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
    async sendVerification(email, code) {
        const params = {
            Destination: {
                ToAddresses: [
                    email
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: "<h1>Hello " + email + "</h1><p>Your Multisnake V2 verification code is " + code + "</p>"
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "Hello " + email + "\n. Your Multisnake V2 verification code is" + code
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "[Multisnake V2] Verification Code"
                }
            },
            Source: "sojscoder@gmail.com",
            ReplyToAddresses: [
                "sojscoder@gmail.com"
            ]
        };
        var sendPromise = new $6nUlG$awssdk.SES({
            apiVersion: "2010-12-01"
        }).sendEmail(params).promise();
        sendPromise.then(function(data) {}).catch(function(err) {
            console.error(err, err.stack);
        });
    }
}
const $3a8af2b6dee31e47$var$dbManager = new $3a8af2b6dee31e47$var$DBManager();
module.exports = {
    apiKeyManager: $3a8af2b6dee31e47$var$apiKeyManager,
    dbManager: $3a8af2b6dee31e47$var$dbManager
};

});


parcelRequire.register("lVFlB", function(module, exports) {

var $e0L3I = parcelRequire("e0L3I");
var $ff6efe8f67c4b1ce$require$server = $e0L3I.server;

var $ff6efe8f67c4b1ce$require$Server = $6nUlG$socketio.Server;
const $ff6efe8f67c4b1ce$var$io = new $ff6efe8f67c4b1ce$require$Server($ff6efe8f67c4b1ce$require$server);
module.exports = {
    io: $ff6efe8f67c4b1ce$var$io
};

});

parcelRequire.register("edsSP", function(module, exports) {

var $bHvIr = parcelRequire("bHvIr");
var $a598af36208ec5f9$require$manager = $bHvIr.manager;

var $5cxvq = parcelRequire("5cxvq");
var $a598af36208ec5f9$require$Snake = $5cxvq.Snake;

var $5Gf0A = parcelRequire("5Gf0A");
var $a598af36208ec5f9$require$guid = $5Gf0A.guid;
var $a598af36208ec5f9$require$generateName = $5Gf0A.generateName;
var $a598af36208ec5f9$require$json2array = $5Gf0A.json2array;
var $a598af36208ec5f9$require$pickColor = $5Gf0A.pickColor;
var $a598af36208ec5f9$require$isEmptyObject = $5Gf0A.isEmptyObject;

var $iS9t1 = parcelRequire("iS9t1");
var $a598af36208ec5f9$require$hashMap = $iS9t1.hashMap;

var $lVFlB = parcelRequire("lVFlB");
var $a598af36208ec5f9$require$io = $lVFlB.io;

var $a598af36208ec5f9$require$createMarkdown = $6nUlG$safemarked.createMarkdown;
const $a598af36208ec5f9$var$markdown = $a598af36208ec5f9$require$createMarkdown();

var $gsfPi = parcelRequire("gsfPi");
var $a598af36208ec5f9$require$Bot = $gsfPi.Bot;

var $51Cy5 = parcelRequire("51Cy5");
var $a598af36208ec5f9$require$apiKeyManager = $51Cy5.apiKeyManager;

var $a598af36208ec5f9$var$filter = new $6nUlG$badwords();

var $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER = {};
/*

id: SocketID{
  willSpawnBot: Boolean
  api_key: String,
  uid
}
*/ $a598af36208ec5f9$require$io.on("connection", (socket)=>{
    socket.on("request_optimal_spawn", (data)=>{
        var room = data.room;
        var roomRef = $a598af36208ec5f9$require$manager.getRoom(room);
        if (roomRef) socket.emit("optimal_spawn", {
            optimal_spawn: roomRef.optimalNextSpawn()
        });
    });
    socket.on("spawn_request", (data)=>{
        if ($a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id]) $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot = data.bot;
        else $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id] = {
            willSpawnBot: data.bot,
            uid: data.uid ? data.uid || $a598af36208ec5f9$require$guid() : $a598af36208ec5f9$require$guid(),
            api_key: data.api_key
        };
        var username = data.username ? data.username : $a598af36208ec5f9$require$generateName();
        var spawn = data.spawn;
        var roomString = data.room;
        var roomType = roomString.split("-")[0] || "standard";
        var room = roomString;
        var roomToJoin = $a598af36208ec5f9$require$manager.getRoom(room);
        if (roomToJoin) {
            var id = $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].uid || $a598af36208ec5f9$require$guid();
            var snakeToCreate = new $a598af36208ec5f9$require$Snake(id, username, $a598af36208ec5f9$require$pickColor(), room, spawn, $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot);
            if ($a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].loggedIn) snakeToCreate.login();
            roomToJoin.addSnake(snakeToCreate);
            $a598af36208ec5f9$require$manager.addSnake(snakeToCreate);
        } else {
            var id = $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].uid || $a598af36208ec5f9$require$guid();
            var roomToCreate = new $a598af36208ec5f9$require$hashMap[roomType](room, room);
            $a598af36208ec5f9$require$manager.createRoom(roomToCreate);
            var room = $a598af36208ec5f9$require$manager.getRoom(roomToCreate.uid);
            var snakeToCreate = new $a598af36208ec5f9$require$Snake(id, username, $a598af36208ec5f9$require$pickColor(), roomToCreate.uid, spawn, $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot);
            id = snakeToCreate.uid;
            if ($a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id].loggedIn) snakeToCreate.login();
            room.addSnake(snakeToCreate);
            $a598af36208ec5f9$require$manager.addSnake(snakeToCreate);
            socket.join(room.uid);
        }
    });
    socket.on("join_request", async (data)=>{
        var room = data.room;
        var api_key = data.api_key;
        var uidPlease = data.uidPlease;
        var key_data = await $a598af36208ec5f9$require$apiKeyManager.getAPIKey(api_key);
        var roomString = data.room;
        var roomType = roomString.split("-")[0] || "standard";
        var room = roomString;
        var roomToJoin = $a598af36208ec5f9$require$manager.getRoom(room);
        var id = uidPlease ? uidPlease : $a598af36208ec5f9$require$guid();
        var loggedIn = uidPlease ? true : false;
        var room_key = null;
        if (roomToJoin) {
            socket.join(roomToJoin.uid);
            room_key = roomToJoin.uid;
        } else {
            var roomToCreate = new $a598af36208ec5f9$require$hashMap[roomType](room, room);
            $a598af36208ec5f9$require$manager.createRoom(roomToCreate);
            var room = $a598af36208ec5f9$require$manager.getRoom(roomToCreate.uid);
            roomToJoin = room;
            var room_key = room.uid;
        }
        if (key_data) {
            if (key_data.isBot == 1 || key_data.expiredAt > new Date().getTime()) {
                if (!$a598af36208ec5f9$require$manager.getSnake(key_data.uid)) {
                    await $a598af36208ec5f9$require$apiKeyManager.updateUid(api_key, id);
                    $a598af36208ec5f9$var$SPAWN_REQUEST_TRACKER[socket.id] = {
                        uid: id,
                        api_key: api_key,
                        loggedIn: loggedIn,
                        willSpawnBot: data.bot ? true : false
                    };
                    socket.join(room_key);
                    socket.emit("join_request_respond", {
                        uid: id,
                        room: roomToJoin
                    });
                } else socket.emit("error", {
                    code: 100,
                    message: "A player already exists with this API key.",
                    otherPlayer: $a598af36208ec5f9$require$manager.getSnake(key_data.uid)
                });
            } else socket.emit("error", {
                code: 101,
                message: "Your API key is expired - if you're running this game in the browser, try refreshing the page."
            });
        } else socket.emit("error", {
            code: 102,
            message: "API key does not exist"
        });
    });
    socket.on("ping", (data)=>{
        socket.emit("pong", data);
    });
    socket.on("change_direction", async (data)=>{
        var api_key = data.api_key;
        var snake = $a598af36208ec5f9$require$manager.getSnake(data.uid);
        var key_data = await $a598af36208ec5f9$require$apiKeyManager.getAPIKey(api_key);
        if (!key_data) socket.emit("error", {
            code: 102,
            message: "API key does not exist"
        });
        else if (key_data.uid == data.uid) {
            if (key_data.isBot == 1 || key_data.expiredAt > new Date().getTime()) {
                var snake = $a598af36208ec5f9$require$manager.getSnake(data.uid);
                if (snake && !$a598af36208ec5f9$require$isEmptyObject(snake)) snake.changeDirection(data.direction);
            } else socket.emit("error", {
                code: 101,
                message: "API key expired"
            });
        } else {
            socket.emit("error", {
                code: 103,
                message: "API key and UID mismatch"
            });
            var snake = $a598af36208ec5f9$require$manager.getSnake(data.uid);
            if (snake && !$a598af36208ec5f9$require$isEmptyObject(snake)) $a598af36208ec5f9$require$io.to(snake.getRoom().uid).emit("chat", {
                from: "System",
                message: `Someone seems to be trying to hack ${snake.name}. Watch out!`
            });
        }
    });
    socket.on("chat", async (data)=>{
        try {
            var api_key = data.api_key;
            var snake = $a598af36208ec5f9$require$manager.getSnake(data.uid);
            var key_data = await $a598af36208ec5f9$require$apiKeyManager.getAPIKey(api_key);
            if (!key_data) socket.emit("error", {
                code: 102,
                message: "API key does not exist"
            });
            else if (key_data.uid == data.uid) {
                if (key_data.isBot == 1 || key_data.expiredAt > new Date().getTime()) {
                    var from = data.from || "No one";
                    from = $6nUlG$xss(from);
                    from = $a598af36208ec5f9$var$filter.clean(from);
                    var message = data.message;
                    message = message.split("\n");
                    message = message.map((phrase)=>{
                        phrase = phrase || "<delete>";
                        return $a598af36208ec5f9$var$filter.clean(phrase);
                    }).filter((phrase)=>phrase !== "<delete>");
                    message = message.join("\n");
                    message = $a598af36208ec5f9$var$markdown(message);
                    var room = data.room;
                    $a598af36208ec5f9$require$io.to(room).emit("chat", {
                        from: from,
                        message: message
                    });
                } else socket.emit("error", {
                    code: 101,
                    message: "API key expired"
                });
            } else {
                socket.emit("error", {
                    code: 103,
                    message: "API key and UID mismatch"
                });
                var snake = $a598af36208ec5f9$require$manager.getSnake(data.uid);
                if (snake && !$a598af36208ec5f9$require$isEmptyObject(snake)) $a598af36208ec5f9$require$io.to(snake.getRoom().uid).emit("chat", {
                    from: "System",
                    message: `Someone seems to be trying to hack ${snake.name}. Watch out!`
                });
            }
        } catch (err) {
            $a598af36208ec5f9$require$io.emit("error", {
                code: 200,
                message: "Failed to send message",
                error: err
            });
        }
    });
});
module.exports = {};

});
parcelRequire.register("5cxvq", function(module, exports) {

var $bHvIr = parcelRequire("bHvIr");
var $3c981052bbbe72d6$require$manager = $bHvIr.manager;

var $5Gf0A = parcelRequire("5Gf0A");
var $3c981052bbbe72d6$require$sumArrays = $5Gf0A.sumArrays;

var $51Cy5 = parcelRequire("51Cy5");
var $3c981052bbbe72d6$require$dbManager = $51Cy5.dbManager;
class $3c981052bbbe72d6$var$Snake {
    constructor(uid, name, color, room, spawn, isBot = false){
        this.uid = uid;
        this.name = name;
        this.color = color;
        this.bot = isBot;
        this.loggedIn = false;
        this.directionMap = {
            "up": [
                0,
                1
            ],
            "down": [
                0,
                -1
            ],
            "left": [
                -1,
                0
            ],
            "right": [
                1,
                0
            ]
        };
        if (spawn) {
            if (spawn.point) this.body = [
                spawn.point
            ];
            else this.body = [
                [
                    Math.floor(Math.random() * ($3c981052bbbe72d6$require$manager.getRoom(room).size * 0.75)),
                    Math.floor(Math.random() * ($3c981052bbbe72d6$require$manager.getRoom(room).size * 0.75))
                ]
            ];
            if (spawn.direction) this.direction = spawn.direction;
            else this.direction = Object.keys(this.directionMap)[Math.floor(Math.random() * Object.keys(this.directionMap).length)];
        } else {
            this.direction = Object.keys(this.directionMap)[Math.floor(Math.random() * Object.keys(this.directionMap).length)];
            this.body = [
                [
                    Math.floor(Math.random() * ($3c981052bbbe72d6$require$manager.getRoom(room).size * 0.75)),
                    Math.floor(Math.random() * ($3c981052bbbe72d6$require$manager.getRoom(room).size * 0.75))
                ]
            ];
        }
        this.score = this.body.length;
        this.speed = 0;
        this.room = room;
        this.eating = false;
        this.creationTime = new Date().getTime();
    }
    login() {
        this.loggedIn = true;
    }
    getRoom() {
        return $3c981052bbbe72d6$require$manager.getRoom(this.room);
    }
    kill() {
        $3c981052bbbe72d6$require$manager.kill(this.uid);
        delete this;
    }
    changeDirection(direction) {
        this.direction = direction;
    }
    move() {
        var head = this.body[0];
        var newBlock = $3c981052bbbe72d6$require$sumArrays(head, this.directionMap[this.direction]);
        if (!this.eating) this.body.pop();
        else this.eating = false;
        this.body.unshift(newBlock);
    }
    checkAction() {
        var head = this.body[0];
        if (head[0] < 0 || head[0] >= this.getRoom().size || head[1] < 0 || head[1] >= this.getRoom().size) {
            this.kill();
            return;
        }
        if (this.getRoom().apple[0] == head[0] && this.getRoom().apple[1] == head[1]) {
            this.eating = true;
            this.getRoom().newApplePos();
        }
        for(var i = 1; i < this.body.length; i++)if (head[0] == this.body[i][0] && head[1] == this.body[i][1]) {
            this.kill();
            return;
        }
        this.getRoom().walls.forEach((wall)=>{
            if (head[0] == wall[0] && head[1] == wall[1]) {
                this.kill();
                return;
            }
        });
        for(var i = 0; i < this.getRoom().snakes.length; i++){
            if (this.getRoom().snakes[i].uid == this.uid) continue;
            this.getRoom().snakes[i].body.forEach((part, j)=>{
                if (part[0] == head[0] && part[1] == head[1]) {
                    if (j == 0) {
                        var enemySnakeScore = this.getRoom().snakes[i].body.length;
                        var ourScore = this.body.length;
                        if (enemySnakeScore > ourScore) {
                            this.kill();
                            return;
                        } else if (enemySnakeScore < ourScore) this.getRoom().snakes[i].kill();
                        else if (enemySnakeScore == ourScore) {
                            this.getRoom().snakes[i].kill();
                            this.kill();
                            return;
                        }
                    } else {
                        this.kill();
                        return;
                    }
                }
            });
        }
        var time2 = performance.now();
    }
}
module.exports = {
    Snake: $3c981052bbbe72d6$var$Snake
};

});

parcelRequire.register("iS9t1", function(module, exports) {

var $5Gf0A = parcelRequire("5Gf0A");
var $dbd49d1b9f2794ba$require$oddsOf = $5Gf0A.oddsOf;
var $dbd49d1b9f2794ba$require$manhattanDistance = $5Gf0A.manhattanDistance;
var $dbd49d1b9f2794ba$require$directionVector = $5Gf0A.directionVector;

var $5cxvq = parcelRequire("5cxvq");
var $dbd49d1b9f2794ba$require$Snake = $5cxvq.Snake;

var $eVZKR = parcelRequire("eVZKR");
var $dbd49d1b9f2794ba$require$emitDeath = $eVZKR.emitDeath;
var $dbd49d1b9f2794ba$require$emitWin = $eVZKR.emitWin;

var $51Cy5 = parcelRequire("51Cy5");
var $dbd49d1b9f2794ba$require$dbManager = $51Cy5.dbManager;
class $dbd49d1b9f2794ba$var$Room {
    constructor(uid, size, friendly, winCondition){
        this.name = friendly;
        this.uid = uid;
        this.size = size;
        this.snakes = [];
        this.walls = [];
        this.lastTouched = new Date().getTime();
        var randomX = Math.floor(Math.random() * this.size);
        var randomY = Math.floor(Math.random() * this.size);
        this.apple = [
            randomX,
            randomY
        ];
        this.needsToBeDeleted = false;
        this.winCondition = winCondition;
        this.creationTime = new Date().getTime();
        this.winAnnounced = false;
    }
    async tick() {
        if (this.walls.length > this.size * this.size * 1 / 4) this.reset();
        if ((new Date().getTime() - this.lastTouched) / 1000 / 60 > 1) {
            this.reset();
            this.needsToBeDeleted = true;
        } else for (var snake of this.snakes){
            if (!snake.isBot) this.lastTouched = new Date().getTime();
            if (snake.body.length >= this.winCondition && !this.winAnnounced) {
                this.winAnnounced = true;
                $dbd49d1b9f2794ba$require$emitWin(this.uid, snake.uid);
                if (snake.loggedIn) {
                    await $dbd49d1b9f2794ba$require$dbManager.playGame(snake.uid);
                    await $dbd49d1b9f2794ba$require$dbManager.winGame(snake.uid, new Date().getTime() - snake.creationTime);
                }
                this.reset();
                break;
            }
            snake.move();
            snake.checkAction();
        }
    }
    async killSnake(uid) {
        var pickedSnake = {};
        this.snakes = this.snakes.filter((snake)=>{
            if (snake.uid == uid) {
                pickedSnake = snake;
                return false;
            } else return true;
        });
        $dbd49d1b9f2794ba$require$emitDeath(this.uid, pickedSnake.uid);
        if (pickedSnake.loggedIn) await $dbd49d1b9f2794ba$require$dbManager.playGame(pickedSnake.uid);
    }
    reset() {
        this.snakes = [];
        this.walls = [];
        this.apple = this.newApplePos();
        this.creationTime = new Date().getTime();
    }
    addSnake(snake) {
        if (!snake.isBot) this.lastTouched = new Date().getTime();
        this.snakes.push(snake);
    }
    optimalNextSpawn() {
        var matrix = this.generateMatrix();
        var gradientMap = this.gradient(matrix, 4);
        var lowest = 1;
        var bestPoint = [];
        for(var y = 0; y < gradientMap.length; y++){
            for(var x = 0; x < gradientMap[y].length; x++)if (gradientMap[y][x] < lowest) {
                lowest = gradientMap[y][x];
                bestPoint = [
                    x,
                    y
                ];
            }
        }
        var directions = [
            "up",
            "down",
            "left",
            "right"
        ];
        var bestDirection = null;
        var lowestSum = Infinity;
        for(var i = 0; i < directions.length; i++){
            var sum = 0;
            var dx = 0;
            var dy = 0;
            switch(directions[i]){
                case "up":
                    dy = -1;
                    break;
                case "down":
                    dy = 1;
                    break;
                case "left":
                    dx = -1;
                    break;
                case "right":
                    dx = 1;
                    break;
            }
            for(var j = 1; j <= 10; j++){
                var ny = bestPoint[0] + j * dy;
                var nx = bestPoint[1] + j * dx;
                if (ny >= 0 && ny < gradientMap.length && nx >= 0 && nx < gradientMap[0].length) sum += gradientMap[ny][nx];
            }
            if (sum < lowestSum) {
                lowestSum = sum;
                bestDirection = directions[i];
            }
        }
        return {
            point: bestPoint,
            direction: bestDirection,
            gradientMap: gradientMap
        };
    }
    newApplePos() {
        var newAppleX = Math.round(Math.random() * (this.size - 2 - 1) + 1);
        var newAppleY = Math.round(Math.random() * (this.size - 2 - 1) + 1);
        if (this.is_block_occupied([
            newAppleX,
            newAppleY
        ])) return this.newApplePos();
        else {
            this.apple = [
                newAppleX,
                newAppleY
            ];
            return [
                newAppleX,
                newAppleY
            ];
        }
    }
    getApplePos() {
        return this.apple;
    }
    dump() {
        return {
            uid: this.uid,
            snakes: this.snakes,
            walls: this.walls,
            type: this.type,
            apple: this.apple,
            name: this.name,
            size: this.size
        };
    }
    is_block_occupied(target) {
        var foundblocks = this.walls.some((wall)=>{
            return target[0] == wall[0] && target[1] == wall[1];
        });
        var snakeFoundBlocks = this.snakes.some((snake)=>{
            return snake.body.some((part)=>{
                return target[0] == part[0] && target[1] == part[1];
            });
        });
        var appleOccupies = target[0] == this.apple[0] && target[1] == this.apple[1];
        if (appleOccupies) return "apple";
        else if (foundblocks) return "wall";
        else if (snakeFoundBlocks) return "snake";
        else return false;
    }
    generateMatrix() {
        var [snakes, walls, size] = [
            this.snakes,
            this.walls,
            this.size
        ];
        const matrix = new Array(size).fill(null).map(()=>new Array(size).fill(0));
        // assign a 1 value to each body part coordinate of each snake
        for (const snake of snakes)for(var i = 0; i < snake.body.length; i++){
            const x = snake.body[i][0];
            const y = snake.body[i][1];
            matrix[y][x] = (snake.body.length - i) / snake.body.length;
        }
        // assign a 1 value to each wall coordinate
        for (const wall of walls){
            const x = wall[0];
            const y = wall[1];
            matrix[y][x] = 1;
        }
        // assign a 1 value to every border point on the matrix
        for(let i = 0; i < size; i++){
            matrix[0][i] = 1;
            matrix[size - 1][i] = 1;
            matrix[i][0] = 1;
            matrix[i][size - 1] = 1;
        }
        return matrix;
    }
    gradient(mat, x) {
        const temp = JSON.parse(JSON.stringify(mat)); // create a temporary matrix as a copy of mat
        const size = mat.length;
        for(let i = 0; i < x; i++){
            for(let y = 0; y < size; y++){
                for(let x = 0; x < size; x++)if (mat[y][x] === 0) {
                    let sum = 0;
                    let count = 0;
                    for(let yOffset = -1; yOffset <= 1; yOffset++)for(let xOffset = -1; xOffset <= 1; xOffset++){
                        const xCoord = x + xOffset;
                        const yCoord = y + yOffset;
                        if (xCoord >= 0 && xCoord < size && yCoord >= 0 && yCoord < size && mat[yCoord][xCoord] !== 0) {
                            sum += mat[yCoord][xCoord];
                            count++;
                        }
                    }
                    if (count > 0) temp[y][x] = sum / 8;
                }
            }
            mat = JSON.parse(JSON.stringify(temp)); // update mat to the updated temporary matrix
        }
        return mat;
    }
    scale2board(number) {
        return Math.min(Math.max(0, number), this.size - 2);
    }
}
class $dbd49d1b9f2794ba$var$Classic extends $dbd49d1b9f2794ba$var$Room {
    constructor(uid, friendly){
        super(uid, 25, friendly, 10);
    }
}
class $dbd49d1b9f2794ba$var$Standard extends $dbd49d1b9f2794ba$var$Room {
    constructor(uid, friendly){
        super(uid, 25, friendly, 10);
        this.eatenUntilNextWall = 5;
        this.baseEatenUntilNextWall = this.eatenUntilNextWall;
    }
    // This function generates a new position for an apple in a two-dimensional grid.
    newApplePos() {
        // Generate a random X coordinate between 1 and the size of the grid minus 2
        var newAppleX = Math.round(Math.random() * (this.size - 2 - 1) + 1);
        // Generate a random Y coordinate between 1 and the size of the grid minus 2
        var newAppleY = Math.round(Math.random() * (this.size - 2 - 1) + 1);
        // Check if the new apple position is already occupied by a block
        if (this.is_block_occupied([
            newAppleX,
            newAppleY
        ])) // If the new position is occupied, call the function recursively to find a new position
        return this.newApplePos();
        else {
            // If the new position is not occupied, set the position of the apple object to the new position
            this.apple = [
                newAppleX,
                newAppleY
            ];
            // Check if it is time to spawn a new wall
            if (--this.eatenUntilNextWall <= 0) {
                // If the number of apples eaten since the last wall spawn is equal to or less than zero, call the spawnWall() function to create a new wall
                this.spawnWall();
                this.eatenUntilNextWall = this.baseEatenUntilNextWall;
            }
            // Return an array of the new apple's X and Y coordinates
            return [
                newAppleX,
                newAppleY
            ];
        }
    }
    spawnWall() {
        if (this) {
            if ($dbd49d1b9f2794ba$require$oddsOf(75)) {
                // spawn block in a random location
                if (!this.walls[0]) {
                    var blockX = Math.round(Math.random() * (this.size - 2 - 1) + 1);
                    var blockY = Math.round(Math.random() * (this.size - 2 - 1) + 1);
                    if (!this.is_block_occupied([
                        blockX,
                        blockY
                    ])) this.walls.push([
                        blockX,
                        blockY
                    ]);
                    else // block already exists. try again.
                    this.spawnWall();
                } else {
                    // spawn a block next to an existing block.
                    var side = Math.round(Math.random() * 3);
                    var pickedblock = this.walls[Math.floor(Math.random() * this.walls.length)];
                    var newblock = [];
                    switch(side){
                        case 0:
                            newblock[0] = pickedblock[0];
                            newblock[1] = this.scale2board(pickedblock[1] - 1);
                            if (!this.is_block_occupied([
                                newblock[0],
                                newblock[1]
                            ])) this.walls.push([
                                newblock[0],
                                newblock[1]
                            ]);
                            else this.spawnWall();
                            break;
                        case 1:
                            newblock[0] = pickedblock[0];
                            newblock[1] = this.scale2board(pickedblock[0] - 1);
                            if (!this.is_block_occupied([
                                newblock[0],
                                newblock[1]
                            ])) this.walls.push([
                                newblock[0],
                                newblock[1]
                            ]);
                            else this.spawnWall();
                            break;
                        case 2:
                            newblock[0] = pickedblock[0];
                            newblock[1] = this.scale2board(pickedblock[1] + 1);
                            if (!this.is_block_occupied([
                                newblock[0],
                                newblock[1]
                            ])) this.walls.push([
                                newblock[0],
                                newblock[1]
                            ]);
                            else this.spawnWall();
                            break;
                        case 3:
                            newblock[0] = pickedblock[0];
                            newblock[1] = this.scale2board(pickedblock[0] + 1);
                            if (!this.is_block_occupied([
                                newblock[0],
                                newblock[1]
                            ])) this.walls.push([
                                newblock[0],
                                newblock[1]
                            ]);
                            else this.spawnWall();
                            break;
                    }
                }
            } else {
                // no walls exist yet... spawn one in a random location
                var blockX = Math.round(Math.random() * (this.size - 2 - 1) + 1);
                var blockY = Math.round(Math.random() * (this.size - 2 - 1) + 1);
                if (this.is_block_occupied[blockX, blockY], this) this.walls.push([
                    blockX,
                    blockY
                ]);
                else this.spawnWall();
            }
        }
    }
}
class $dbd49d1b9f2794ba$var$Small extends $dbd49d1b9f2794ba$var$Room {
    constructor(uid, friendly){
        super(uid, 15, friendly, 5);
    }
}
module.exports = {
    Room: $dbd49d1b9f2794ba$var$Standard,
    Classic: $dbd49d1b9f2794ba$var$Classic,
    Small: $dbd49d1b9f2794ba$var$Small,
    hashMap: {
        "standard": $dbd49d1b9f2794ba$var$Standard,
        "small": $dbd49d1b9f2794ba$var$Small,
        "classic": $dbd49d1b9f2794ba$var$Classic
    }
};

});
parcelRequire.register("eVZKR", function(module, exports) {

var $lVFlB = parcelRequire("lVFlB");
var $adf64ac3d8402a9a$require$io = $lVFlB.io;
function $adf64ac3d8402a9a$var$emitBoard(room, tick_speed) {
    $adf64ac3d8402a9a$require$io.to(room.uid).emit("board_request_respond", {
        ...room.dump(),
        tick: tick_speed
    });
}
function $adf64ac3d8402a9a$var$emitDeath(roomID, snakeID) {
    $adf64ac3d8402a9a$require$io.to(roomID).emit("snake_death", {
        uid: snakeID
    });
}
function $adf64ac3d8402a9a$var$emitWin(roomID, snakeID) {
    $adf64ac3d8402a9a$require$io.to(roomID).emit("win", {
        uid: snakeID
    });
}
module.exports = {
    emitDeath: $adf64ac3d8402a9a$var$emitDeath,
    emitBoard: $adf64ac3d8402a9a$var$emitBoard,
    emitWin: $adf64ac3d8402a9a$var$emitWin
};

});


parcelRequire.register("gsfPi", function(module, exports) {

var $5Gf0A = parcelRequire("5Gf0A");
var $bfab89a20b536f77$require$generateName = $5Gf0A.generateName;
var $bfab89a20b536f77$require$sumArrays = $5Gf0A.sumArrays;
var $bfab89a20b536f77$require$oddsOf = $5Gf0A.oddsOf;
var $bfab89a20b536f77$require$pickColor = $5Gf0A.pickColor;

var $5cxvq = parcelRequire("5cxvq");
var $bfab89a20b536f77$require$Snake = $5cxvq.Snake;

var $bHvIr = parcelRequire("bHvIr");
var $bfab89a20b536f77$require$manager = $bHvIr.manager;
class $bfab89a20b536f77$var$Bot extends $bfab89a20b536f77$require$Snake {
    constructor(uid, room, type){
        super(uid, $bfab89a20b536f77$require$generateName(), $bfab89a20b536f77$require$pickColor(), room, [
            Math.floor(Math.random() * ($bfab89a20b536f77$require$manager.getRoom(room).size * 0.75)),
            Math.floor(Math.random() * ($bfab89a20b536f77$require$manager.getRoom(room).size * 0.75))
        ]);
        this.minMistakesPerTickPercent = 0.8;
        this.isBot = true;
        this.bot = true;
        this.type = type;
        //this.pref01 = Math.round(Math.random());
        this.oddsOfMistakePerTick = 1 - (Math.random() * (1 - this.minMistakesPerTickPercent) + this.minMistakesPerTickPercent);
        this.inverseMap = {
            "up": "down",
            "down": "up",
            "left": "right",
            "right": "left"
        };
        this.shiftInverseMap = {
            "up": [
                "right",
                "left"
            ],
            "down": [
                "right",
                "left"
            ],
            "left": [
                "up",
                "down"
            ],
            "right": [
                "up",
                "down"
            ]
        };
    }
    move() {
        this.getMove();
        var head = this.body[0];
        var newBlock = $bfab89a20b536f77$require$sumArrays(head, this.directionMap[this.direction]);
        if (!this.eating) this.body.pop();
        else this.eating = false;
        this.body.unshift(newBlock);
    }
    getMove() {
        var head = this.body[0];
        var apple = this.getRoom().apple;
        var walls = this.getRoom().walls;
        var dirToGo = this.direction;
        if (head[0] > apple[0]) dirToGo = "left";
        else if (head[0] < apple[0]) dirToGo = "right";
        else if (head[1] > apple[1]) dirToGo = "down";
        else if (head[1] < apple[1]) dirToGo = "up";
        if (this.direction == this.inverseMap[dirToGo]) this.direction = this.shiftInverseMap[dirToGo][Math.round(Math.random())];
        else this.direction = dirToGo;
        this.direction = this.checkPathsAwayFrom(this.direction, 0);
        var mistake = $bfab89a20b536f77$require$oddsOf(this.oddsOfMistakePerTick * 100);
        if (mistake) {
            this.direction = Object.keys(this.inverseMap)[Math.floor(Math.random() * Object.keys(this.inverseMap).length)];
            if (this.direction == this.inverseMap[this.direction]) this.direction = this.shiftInverseMap[this.direction][Math.round(Math.random())];
        }
    }
    checkPathsAwayFrom(direction, tries) {
        if (tries < 4) {
            var head = this.body[0];
            var forward = $bfab89a20b536f77$require$sumArrays(this.directionMap[direction], head);
            if (this.getRoom().is_block_occupied(forward) == "wall" || this.getRoom().is_block_occupied(forward) == "snake") return this.checkPathsAwayFrom(this.shiftInverseMap[direction][Math.round(Math.random())], tries + 1);
            else return direction;
        } else return direction;
    }
}
module.exports = {
    Bot: $bfab89a20b536f77$var$Bot
};

});


parcelRequire.register("8pzyB", function(module, exports) {

module.export = {
    ...(parcelRequire("1c2cL"))
};

module.export = {
    ...(parcelRequire("bHvIr"))
};

});
parcelRequire.register("1c2cL", function(module, exports) {

var $5Gf0A = parcelRequire("5Gf0A");
var $0de89f4b34af4855$require$json2array = $5Gf0A.json2array;
var $0de89f4b34af4855$require$guid = $5Gf0A.guid;

var $eVZKR = parcelRequire("eVZKR");
var $0de89f4b34af4855$require$emitBoard = $eVZKR.emitBoard;

var $bHvIr = parcelRequire("bHvIr");
var $0de89f4b34af4855$require$manager = $bHvIr.manager;

var $gsfPi = parcelRequire("gsfPi");
var $0de89f4b34af4855$require$Bot = $gsfPi.Bot;
class $0de89f4b34af4855$var$GameManager {
    constructor(m, t = 200){
        this.roomManager = m;
        this.tick = t;
        this.workers = []; // Store the worker instances
    }
    async __init__() {
        if (this.roomManager.ticking) {
            var roomarray = $0de89f4b34af4855$require$json2array(this.roomManager.rooms);
            for(var i = 0; i < roomarray.length; i++){
                var room = roomarray[i];
                if (room.needsToBeDeleted) $0de89f4b34af4855$require$manager.deleteRoom(room.uid);
                else {
                    if (room.snakes.length < 3) {
                        var bot = new $0de89f4b34af4855$require$Bot($0de89f4b34af4855$require$guid(), room.uid, "standard");
                        room.addSnake(bot, true);
                        $0de89f4b34af4855$require$manager.addSnake(bot, true);
                    }
                    room.tick();
                    $0de89f4b34af4855$require$emitBoard(room, this.tick);
                }
            }
        }
        setTimeout(()=>{
            this.__init__();
        }, this.tick);
    }
}
const $0de89f4b34af4855$var$server1GM = new $0de89f4b34af4855$var$GameManager($0de89f4b34af4855$require$manager);
$0de89f4b34af4855$var$server1GM.__init__();
module.exports = {
    gameManager: $0de89f4b34af4855$var$server1GM
};

});


var $72643042fbe1366c$exports = {};

$72643042fbe1366c$exports = {
    ...(parcelRequire("e0L3I"))
};

$72643042fbe1366c$exports = {
    ...(parcelRequire("lVFlB"))
};

$72643042fbe1366c$exports = {
    ...(parcelRequire("edsSP"))
};


parcelRequire("8pzyB");


//# sourceMappingURL=main.js.map
