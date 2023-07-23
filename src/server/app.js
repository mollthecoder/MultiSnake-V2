const express = require('express');
const { json2array, generateAPIKey, rand, guid } = require("../etc/helpers.js");
const { manager } = require("../managers/roomManager.js");
const { resolve } = require("path");
const http = require('http');
const axios = require('axios');
const nunjucks = require("nunjucks");
const session = require('express-session');
const morgan = require("morgan");
const { apiKeyManager, dbManager } = require("../managers/databaseManager.js");
const IP = require('ip');
var Filter = require('bad-words'),
    filter = new Filter();


const app = express();


const server = http.createServer(app);



app.use(express.json());
app.use(express.static(resolve("./src/server/public")));
nunjucks.configure(resolve("./src/server/views"), {
    autoescape: true,
    express: app
});
// app.use(express.static(resolve("./MultiSnake-V2/src/server/public")));
// nunjucks.configure(resolve("./MultiSnake-V2/src/server/views"), {
//     autoescape: true,
//     express: app
// });
app.use(
    session({
        secret: process.env.KEY,
        resave: false,
        saveUninitialized: true
    })
);

app.use(restrict(["/account"], "/login", true));
app.use(restrict(["/login", "/signup"], "/account", false))
function restrict(urls, redirect, loggedInToAccess) {
    return (req, res, next) => {
        var path = req._parsedUrl.pathname;
        path = path.split("/").join("");
        urls = urls.map(u => {
            return u.split("/").join("");
        })
        var restricted = (urls.indexOf(path) !== -1);
        if (restricted && loggedInToAccess) {
            if (req.session.user) {
                next()
            } else {
                res.redirect(redirect);
            }
        } else if (restricted && !loggedInToAccess) {
            if (!req.session.user) {
                next();
            } else {
                res.redirect(redirect)
            }
        } else {
            next();
        }
    }
}

function mustBeLoggedIn(message) { 
    // equivalent of restrict() but for API endpoints
    return (req,res,next)=>{
        if(req.session.user && req.session.user.email){
            next();
        }else{
            res.status(405).json({
                message,
                color: "red",
                redirect: "/login"
            })
        }
    }
}
function updateSession(log) {
    return async (req, res, next) => {
        if (req.session && req.session.user) {
            var nuser = await dbManager.getUser(req.session.user.uid);
            if (nuser) {
                delete nuser.passwordHash;
                req.session.user = nuser;
            } else {
                req.session.user = false;
            }
        }
        next();
    }
}

app.get("/", (req, res) => {
    res.render("index.njk",{
        user:req.session.user
    });
});
// GET method to render the login page
app.get('/login', (req, res) => {
    res.render('login.njk');
});
app.get("/developers",updateSession(), (req, res) => {
    res.render("developers.njk", {
        user: req.session.user,
    });
});
// GET method to render the account page
app.get('/account', updateSession(), (req, res) => {
    res.render('account.njk', { user: req.session.user });
});
app.get("/account/:uid", async (req, res, next) => {
    var user = await dbManager.getUser(req.params.uid);
    if (user) {
        res.render("account_view.njk", {
            user: req.session.user,
            viewing: user
        });
    } else {
        next();
    }
})
app.get("/signup", (req, res) => {
    res.render("signup.njk");
});
app.get("/play/:room", (req, res) => {
    res.render("play.njk", {
        room: req.params.room,
        type: req.query.type || "standard",
        user: req.session.user
    });
});

app.get("/verifyEmail", async (req, res) => {
    if(req.session.user && req.session.user.email){
        req.session.verificationCode = rand(6);
        await dbManager.sendVerification(req.session.user.email, req.session.verificationCode);
        res.render("verify.njk", {
            user: req.session.user
        });
    }else{
        res.redirect("/signup")
    }
});
// Logout endpoint
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy();
    res.redirect("/login")

});

app.delete("/deleteKey",mustBeLoggedIn("You must be logged in to delete an API key"),async (req,res)=>{
    const { uid, api_key } = req.body;
    await dbManager.removeAPIKey(uid,api_key);
    await apiKeyManager.deleteKey(api_key);
    res.status(200).json({
        message:`${api_key} successfully deleted`,
        color: "green"
    })
})
app.post("/newAPIKey",mustBeLoggedIn("You must be logged in to create an API key"),async (req,res)=>{
    const { uid } = req.body;
    var key = generateAPIKey();
    var botUid = guid();
    try{
        await dbManager.addAPIKey(uid,key,botUid);
        await apiKeyManager.createBot(uid,key,botUid);
        res.status(200).json({
            key,
            botUid,
            message: key + " successfully created",
            color: "green"
        });
    }catch(err){
        res.status(500).json({
            message:err.message,
            color: "red"
        })
    }

})
app.post("/verifyEmail", async (req, res) => {
    if (req.session.verificationCode && req.session.user) {
        const { code } = req.body;
        if (code == req.session.verificationCode) {
            await dbManager.setVerified(req.session.user.uid);
            res.status(200).json({ message: req.session.user.email + " successfully verified", color: "green", "redirect": "/account" })
        } else {
            res.status(200).json({ message: "Incorrect code", color: "gold" });
        }
    } else {
        res.status(200).json({ message: "Not logged in", color: "green", "redirect": "/login" });
    }
})
app.post('/signup', async (req, res) => {
    const { username, password, age, email } = req.body;

    try {


        // Create user in the database
        var userCheck = await dbManager.getDataByEmail(email);
        if (userCheck.Items.length == 0) {
            await dbManager.createUser(email, username, password, false, age)
            const user = await dbManager.getDataByEmail(email)
            // Return success response
            var sUser = user.Items[0];
            delete sUser.passwordHash;
            req.session.user = sUser;
            res.status(200).json({ message: 'Account created successfully', redirect: "/verifyEmail", color: "green" });
        } else {
            return res.status(405).json({ message: "Account with that email already exists", color: "red" })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error', color: "red" });
    }
});
// Update account endpoint
app.put('/account',mustBeLoggedIn("You must be logged in to modify your account"), async (req, res) => {
    const { uid, newUsername, newPassword } = req.body;

    try {
        // Update username in the database
        if (newUsername) {
            await dbManager.updateUsername(uid, filter.clean(newUsername));
        }
        if (newPassword) {
            await dbManager.updatePassword(uid, newPassword)
        }

        // Return success response
        return res.status(200).json({ message: 'Account updated successfully', color: "green" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', color: "red" });
    }
});

// Delete account endpoint
app.delete('/account', mustBeLoggedIn("You must bel logged in to delete your account"),async (req, res) => {
    const { uid } = req.body;

    try {
        // Delete user from the database
        await dbManager.deleteUser(uid);

        // Return success response
        return res.status(200).json({ message: 'Account deleted successfully', redirect: "/login" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', color: "red" });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Retrieve user data by email
        const userData = await dbManager.getDataByEmail(email);
        if (userData.Items.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password', color: "red" });
        }

        const user = userData.Items[0];

        // Verify password (replace with your own password verification logic)
        if (user.passwordHash !== password) {
            return res.status(400).json({ message: 'Invalid email or password', color: "red" });
        }

        // Set session data
        delete user.passwordHash;
        req.session.user = user;

        // Return success response
        return res.status(200).json({ message: 'Login successful', color: "green", redirect: "/account" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message, color: "red" });
    }
});


app.post('/verify-recaptcha', async (req, res) => {
    const ipAddress = IP.address();
    const { token } = req.body;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env["CAPTCHA_KEY"]}&response=${token}&remoteip=${ipAddress}`;

    try {
        const response = await axios.post(verifyUrl);
        const data = response.data;

        if (data) {
            var possibleKeys = [];
            if (req.session && req.session.user) {
                possibleKeys = await apiKeyManager.getAPIKeysForUid(req.session.user.uid);
            }
            // Generate and assign a key to the client
            const key = (possibleKeys[0]) ? possibleKeys[0].api_key : generateAPIKey();
            const expiredAt = new Date().getTime() + (1000 * 60 * 60);
            const uid = (req.session && req.session.user) ? req.session.user.uid || null : null;

            await apiKeyManager.addKey(key, expiredAt, uid)

            // Send the key via websockets or any other method you're using
            res.status(200).json({ success: true, key });
        } else {
            res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA.' });
    }
});
app.get('/api/v1/rooms', (req, res) => {
    var reems = json2array(manager.rooms);
    reems = reems.map((reem) => {
        var snakesArray = json2array(reem.snakes);
        var reemSnakes = snakesArray.filter((snake) => {
            if (snake !== "dead_snake") {
                return true;
            } else {
                return false;
            }
        });
        return {
            "room_key": reem.key,
            "type": reem.type,
            "alive_snakes": reemSnakes,
            "snake_quantity": reemSnakes.length,
            "apple_pos": reem.apple,
            "current_obstacles": reem.obs,
            "room_size": reem.by,
        }
    })
    res.json(reems);
});

app.use((req,res)=>{
    res.status(404).render("404.njk");
})



server.listen(3001, () => {
    console.log('Server Live');
});
module.exports = { server, app }
