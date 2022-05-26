//REQUIRES-----------------------
const dotenv = require('dotenv');
dotenv.config({path: __dirname + '.env'});
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
//const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const databaseTalk = require('./databaseTalk');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
//const helmet = require('helmet');

//ADD "REQUIRED" TO THE END OF FORM TAGS IN THE HTML (EJS TEMPLATE IN THIS CASE)

//--SET VIEW ENGINE FOR EJS TEMPLATE--
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

//HELMET
//app.use(helmet());

//CORS?
app.use(cors({
	origin: [process.env.ORIGINIP],
    method: ["GET", "POST"],
    credentials: true
}));

//app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.use(session({
    key: "userID",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.get('/', function (req, res) {
    if (typeof req.session.user === 'undefined') {
        res.redirect('/login-page');
    } else {
        res.render('index', {
            user: req.session.user
        });
    }
});

app.get('/login-page', function (req, res) {
    res.render('login', {
        message: "HOT_PINK_THING"
    });
});

app.get('/register-page', function (req, res) {
    res.render('register', {
        message: "hot_pink_thing"
    });
});

app.get('/local-mode', function (req, res) {
    res.render('localmode');
});

app.post('/login-page', async function (req, res) {
    try {
        const db = databaseTalk.getDatabaseInstance();
        const userName = req.body.login_user;
        const userPass = req.body.login_pass;
        const check = await db.checkUser(userName);
        if (check.length === 0) {
            res.redirect('/register-page');
        } else {
            const check2 = await db.checkLogin(userName);
            const check3 = check2[0].HASH.toString('utf8');
            const validOrNot = await bcryptjs.compare(userPass, check3);
            if (validOrNot) {
                req.session.user = userName;
                const tmpID = await db.findID(userName);
                req.session.userID = tmpID[0].user_id;
                res.redirect('/');
            } else {
                res.redirect('/login-page');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('LOGIN-PAGE POSTAGE REQUIRED');
    }
});
//POST PATH FOR REGISTRATION PAGE
app.post('/register-page', async function (req, res) {
    try {
        const db = databaseTalk.getDatabaseInstance();
        const userName = req.body.register_user;
        const userPass = req.body.register_pass;
        const check = await db.checkUser(userName);
        if (check.length != 0) {
            res.render('register', {
                message: "USER EXISTS"
            });
        } else {
            bcryptjs.genSalt(14, function (err, salt) {
                bcryptjs.hash(userPass, salt, function (err, hash) {
                    if (err) {
                        throw err;
                    }
                    db.createUser(userName, hash);
                })
                if (err) {
                    throw err;
                }
            })
            req.session.user = userName;
            console.log(req.session.user);
            res.redirect('/login-page');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('REGISTER-PAGE POSTAGE REQUIRED');
    }
});
//PATH FOR THE SEARCH BUTTON - NOT IMPLEMENTED BECAUSE THERES NOTHING TO REALLY SEARCH, NOT A USEFUL FUNCTION
app.get('/search', function (req, res) {
    res.render('no');
});
//CREATING STUFF
app.post("/insert", (req, res) => {
    const {
        nTitle
    } = req.body;
    const {
        nBody
    } = req.body;

    console.log(`New Title is: ${nTitle} and New Body is: ${nBody}`);	
    const db = databaseTalk.getDatabaseInstance();

    const result = db.insertNewArticle(nTitle, nBody);
    result.then(data => db.linkArticle(req.session.userID, data));
    res.redirect('/');
});
//READING STUFF
app.get("/getAll", (req, res) => {
    const db = databaseTalk.getDatabaseInstance();

    const userPull = req.session.user;

    const result = db.getAllData(userPull);
    result.then(data => res.json({
            data: data
        }))
        .catch(err => console.log(err));
});
//DELETE STUFF (single)
app.delete("/deleteArticle", async (req, res) => {
    const {
        currTitle
    } = req.body;
    const {
        currBody
    } = req.body;

    const db = databaseTalk.getDatabaseInstance();

    const result = await db.findArticleID(currTitle, currBody);
    if (result.length <= 0) {
        res.render('index', {
            user: req.session.user
        });
    } else {
        const result2 = await db.delinkArticle(req.session.userID, result[0].article_id).then(db.deleteArticle(result[0].article_id));
        res.redirect('/');
    }
});
//NODE SERVER
//PORT---------------------------
const PORT = process.env.PORT || 80;
//PORT---------------------------

//EXPRESS-JS---------------------
app.set('trust proxy');


//PROXY ATTEMPT------------------
//app.use(function(req, res, next){
//	if(process.env.TYPE_ENV != "development" && !req.secure){
//		return res.redirect("https://" + req.headers.host + req.url);
//	}
//	next();
//}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//EXPRESS-JS---------------------
