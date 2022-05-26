const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
let instance = null;


//MYSQL Connection
const connection = mysql.createConnection({
    host: process.env.HOSTDB,
    user: process.env.USERDB,
    password:process.env.PASSWORDDB,
    database: process.env.DATABASEDB
});

connection.connect(function (err) {
    if (err) {
	console.log("ATTEMPTING TO CONNECT....");
        throw err;
    }
    console.log('CONNECTION TO DB ESTABLISHED...');
});

class databaseTalk {
    static getDatabaseInstance() {
        return instance ? instance : new databaseTalk();
    }
    //FUNCTION TO RETRIEVE ALL ARTICLES STORED IN DB, WILL BE FETCHED BY CLIENT JS
    async getAllData(userName) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "SELECT article_body, article_title FROM articles_table WHERE article_id IN (SELECT articles_table_article_id FROM users_table_has_articles_table WHERE users_table_user_id = (SELECT user_id FROM users_table WHERE user_name = ?))"; //  WHERE article_id IN (SELECT articles_table_article_id FROM users_table_has_articles_table WHERE users_table_user_id = 1)
                connection.query(theQuery, [userName], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err);
        }
    }
    //INPUT: aTitle, aBody
    //PROCESS: INSERTS USER PROVIDED ARTICLE WITH aTitle BEING THE ARTICLE TITLE, aBody BEING THE ARTICLE BODY
    //OUTPUT: RETURNS RAW DATA PACKET WITH 
    async insertNewArticle(aTitle, aBody) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "INSERT INTO articles_table (article_title, article_body) VALUES (?,?);";
                connection.query(theQuery, [aTitle, aBody], (err, results) => {
                    if (err) reject(new Error(err.message));
                    console.log("insert id");
                    resolve(results.insertId);
                })
            });
            return (response);
        } catch (err) {
            console.log(err);
        }
    }
    //INPUT: articleID
    //PROCESS: DELETES ARTICLE FROM DB WITH SPECIFIED article_id
    //OUTPUT: OK_PACKET
    async deleteArticle(articleID) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "DELETE FROM articles_table WHERE article_id = ?";
                connection.query(theQuery, [articleID], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err);
        }
    }
    //INPUT: userName
    //PROCESS: CHECKS TO SEE IF A USER CURRENTLY EXISTS IN DB TABLE
    //OUTPUT: RAW_DATA_PACKET (ARRAY) WITH 1/EMPTY FOR EXISTS/NON-EXIST 
    async checkUser(userName) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "SELECT 1 AS EX FROM users_table WHERE user_name = ?";
                connection.query(theQuery, [userName], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results)
                })
            });
            return (response);
        } catch (err) {
            console.log(err);
        }
    }
    //INPUT: userName && userPass
    //PROCESS: CREATES A NEW USER IN DB TABLE WITH FORM INPUT
    //OUTPUT: OK_PACKET ON SUCCESS
    async createUser(userName, userPass) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "INSERT INTO users_table (user_name, user_password) VALUES (? , ?)";
                connection.query(theQuery, [userName, userPass], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err)
        }
    }
    //INPUT: userName
    //PROCESS: RETRIEVED HASHED PASSWORD FOR COMPARISON TO AUTHENTICATE A USER
    //OUTPUT: RAW_DATA_PACKET (ARRAY) TRUE/FALSE (1/EMPTY) ON AUTHENTICATION MATCH/NO MATCH
    async checkLogin(userName) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "SELECT user_password AS HASH FROM users_table WHERE user_name = ?";
                connection.query(theQuery, [userName], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results)
                })
            });
            return (response);
        } catch (err) {
            console.log(err);
        }
    }
    //INPUT: userName
    //PROCESS: USES PASSED userName TO SEARCH TABLE FOR user_id OF SOMEONE WITH A SPECIFIC USER NAME
    //OUTPUT: PASSES RAW_DATA_PACKET (ARRAY) WHICH CONTAINS A user_id (INT) FOR A SPECIFIED USER 
    async findID(userName) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "SELECT user_id FROM users_table WHERE user_name = ?";
                connection.query(theQuery, [userName], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err)
        }
    }
    //INPUT: articleTitle && articleBody
    //PROCESS: FINDS article_id FROM articles_table SO DELETE FUNCTIONS CAN PROPERLY TARGET ARTICLE
    //OUTPUT: RETURNS RAW_DATA_PACKET (ARRAY) WHICH CONTAINS THE article_id (INT) OF SPECIFIC ARTICLE;
    async findArticleID(articleTitle, articleBody) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "SELECT article_id FROM articles_table WHERE article_title = ? AND article_body = ?";
                connection.query(theQuery, [articleTitle, articleBody], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err)
        }
    }
    //INPUT: userID && articleID 
    //PROCESS: ADDS ARTICLE TO THE LINKING TABLE FOR A SPECIFIED USER
    //OUTPUT: OK_PACKET (DIAG INFO) ON SUCCESS
    async linkArticle(userID, articleID) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "INSERT into users_table_has_articles_table (users_table_user_id, articles_table_article_id) VALUES (?,?)";
                connection.query(theQuery, [userID, articleID], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err)
        }
    }
    //INPUT: userID && articleID
    //PROCESS: REMOVES THE LINK (FOREIGN KEYS) FROM LINKING TABLE TO ALLOW DB TO DELETE ARTICLE IN FUTURE PROCESS
    //OUTPUT: OK_PACKET (DIAG INFO) ON SUCCESS
    async delinkArticle(userID, articleID) {
        try {
            const response = await new Promise((resolve, reject) => {
                const theQuery = "DELETE FROM users_table_has_articles_table WHERE users_table_user_id = ? AND articles_table_article_id = ?";
                connection.query(theQuery, [userID, articleID], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return (response);
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = databaseTalk;
