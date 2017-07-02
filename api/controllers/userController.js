var mysql = require('mysql');

var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'library'
});

db.connect();

module.exports = {

    login: function(req, res, next) {
        db.query('Select * from users where username = "' + req.body.username + '" and password = "' + req.body.password + '"', function(err, result) {
            console.log(result);
            if (err) {
                res.json({ status: true, message: err });
            } else {
                if (result.length > 0) {
                    var timeStamp = Math.floor(Date.now() / 1000) + 900000;
                    var token = timeStamp + "_" + result[0].id;

                    db.query('update users set user_token = "' + token + '", token_expiry = "' + timeStamp + '" where id = "' + result[0].id + '" ', function(err, result) {
                        if (err) {
                            res.json({ status: true, message: err });
                        } else {
                            console.log(token);
                            res.json({ status: true, token })
                        }
                    });
                } else {
                    res.json({ status: true, message: "Username or Password doesn't match" });
                }
            }
        });
    },

    addUser: function(req, res, next) {

        var userType = req.user_type;
        if (userType == "Librarian") {
            db.query('insert into users (first_name, last_name, user_type, username, password) values ("' + req.body.first_name + '", "' + req.body.last_name + '", "' + req.body.user_type + '", "' + req.body.username + '", "' + req.body.password + '")', function(err, result) {
                if (err) {
                    res.json({ status: true, message: err });
                } else {
                    res.json({ status: true, message: result });
                }
            });
        } else {
            res.json({ status: true, message: "user is not librarian"});
        }
    },

    user_token_verification: function(token, callback) {
        db.query('Select * from users where user_token = "' + token + '"', function(err, result) {
            if (err) {
                callback(false, err);
            } else {
                if (result.length > 0) {
                    console.log(result);
                    var currentTime = Math.floor(Date.now() / 1000);

                    var expiry = result[0].expiry;

                    var userId = result[0].user_id;

                    var userType = result[0].user_type;

                    if (currentTime > expiry) {
                        callback(false, "Token Expired")
                    } else {
                        callback(true, userId, userType);
                    }
                } else {
                    callback(false, 'Invalid Token');
                }
            }
        });
    }
}
