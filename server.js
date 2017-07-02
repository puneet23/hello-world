var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(function(req, res, next) {
    console.log(req.originalUrl);
    if (req.originalUrl == "/login") {
        next();
    } else {
        if (req.headers.token == undefined) {
            res.json({ status: true, message: "Token not sent" });
            return;
        } else {
            userCntrl.user_token_verification(req.headers.token, function(isValidToken, user_id, user_type) {
                if (isValidToken) {
                    req.user_id = user_id;
                    req.user_type = user_type;
                    next();
                } else {
                    res.json({ status: true, message: user_id });
                    return;
                }
            });
        }
    }
})

var userCntrl = require('./api/controllers/userController');
console.log(userCntrl);


var bookCntrl = require('./api/controllers/booksCategoryController');
console.log(bookCntrl);

app.post('/login', function(req, res, next) {
    userCntrl.login(req, res, next);
});


app.post('/register', function(req, res, next) {
    userCntrl.addUser(req, res, next);
});

app.get('/getAllBooks', function(req, res, next) {
    bookCntrl.books(req, res, next);
});

app.get('/category/:id', function(req, res, next) {
    bookCntrl.getBooksByCategory(req, res, next);
});

app.get('/booksCategory/:name', function(req, res, next) {
    bookCntrl.booksInEachCategory(req, res, next);
});

app.post('/insertBook', function(req, res, next) {
    bookCntrl.addBooks(req, res, next);
});

app.put('/updateBook/:id', function(req, res, next) {
    bookCntrl.editbooks(req, res, next);
});

app.post('/issueBook', function(req, res, next) {
    bookCntrl.issuedBooks(req, res, next);
});

app.post('/issueABook', function(req, res, next) {
    bookCntrl.issueABook(req, res, next);
});

app.get('/booksIssued', function(req, res, next) {
    bookCntrl.booksIssuedToStudent(req, res, next);
});


app.post('/requestBook', function(req, res, next) {
    bookCntrl.request_book(req, res, next);
});


app.listen(port);

console.log('user controller RESTful API server started on: ' + port);
