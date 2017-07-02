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

    books: function(req, res, next) {
        console.log(db);
        console.log(req.params);
        console.log(req.body);
        db.query('Select * from books', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {

                res.json({ status: true, message: result });
            }
        });
    },

    getBooksByCategory: function(req, res, next) {
        console.log(req.params);
        db.query('Select * from categories where category_id = "' + req.params.id + '"', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {

                res.json({ status: true, message: result });
            }
        });
    },

    booksInEachCategory: function(req, res, next) {
        console.log(req.params);
        db.query('Select * from categories where category_name = "' + req.params.name + '"', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {

                res.json({ status: true, message: result });
            }
        });
    },

    addBooks: function(req, res, next) {
        console.log(req.headers);
        db.query('insert into books (title, author, publisher, category_id, total_books, total_available) values ("' + req.body.title + '", "' + req.body.author + '", "' + req.body.publisher + '", "' + req.body.category_id + '", "' + req.body.total_books + '", "' + req.body.total_available + '")', function(err, result) {
            if (err) {
                res.json({ status: true, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    editBooks: function(req, res, next) {
        console.log(req.headers);
        db.query(' update books set title = "' + req.body.title + '", author = "' + req.body.author + '" where category_id = "' + req.params.id + '")', function(err, result) {
            if (err) {
                res.json({ status: true, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    issuedBooks: function(req, res, next) {
        console.log(req.headers);
        db.query(' Select * from issued_books', function(err, result) {
            if (err) {
                res.json({ status: true, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    issueABook: function(req, res, next) {
        var self = this;
        console.log(req.headers);
        db.query('Select * from books where book_id = "' + req.body.book_id + '" and total_available > 0', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {
                if (result.length > 0) {
                    self.alreadyIssueCheck(req.body.user_id, req.body.book_id, function(issueStatus, result) {
                        if (issueStatus) {
                            if (result == "") {
                                db.query('insert into issued_books (book_id, user_id, issued_date, expiry_date) values ("' + req.body.book_id + '", "' + req.body.user_id + '", "' + req.body.issued_date + '", "' + req.body.expiry_date + '"))', function(err, result) {
                                    if (err) {
                                        res.json({ status: true, message: err });
                                    } else {
                                        db.query(' update books set total_available = total_available - 1 where book_id = "' + req.body.book_id + '")', function(err, result) {
                                            if (err) {
                                                res.json({ status: true, message: err });
                                            } else {
                                                res.json({ status: true, message: "Book issues successfully" });
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.json({ status: true, message: 'Book Alreday issued' });
                                return;
                            }
                        }
                    });
                } else {
                    res.json({ status: true, message: 'Book is not available' });
                    return;
                }
            }
        });
    },

    returnBook: function(req, res, next) {
        console.log(req.headers);
        db.query('Select * from books where book_id = "' + req.body.book_id + '"', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {
                if (result.length > 0) {
                    db.query('update issued_books set return_date = "' + req.body.return_date + '" where book_id = "' + req.body.book_id + '" and user_id = "' + req.body.user_id + '")', function(err, result) {
                        if (err) {
                            res.json({ status: true, message: err });
                        } else {
                            db.query('update books set total_available = total_available + 1 where book_id = "' + req.body.book_id + '")', function(err, result) {
                                if (err) {
                                    res.json({ status: true, message: err });
                                } else {
                                    res.json({ status: true, message: "Book returned successfully" });
                                }

                            });
                        }
                    });
                } else {
                    res.json({ status: true, message: "Book is not available" });
                }
            }
        });
    },

    booksIssuedToStudent: function(req, res, next) {
        console.log(req.params);
        db.query('Select * from issued_books where user_id = "' + req.params.id + '"', function(err, result) {
            if (err) {
                res.json({ status: false, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    bookSearch: function(req, res, next) {
        db.query('Select * from books where title = "' + req.params.title + '")', function(err, result) {
            if (err) {
                res.json({ status: true, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    bookRequest: function(req, res, next) {
        db.query('insert into request_book (user_id, book_title, author) values ("' + req.body.user_id + '", "' + req.body.book_title + '", "' + req.body.author + '")', function(err, result) {
            if (err) {
                res.json({ status: true, message: err });
            } else {
                res.json({ status: true, message: result });
            }
        });
    },

    alreadyIssueCheck: function(user_id, book_id, callback) {
        db.query('Select * from issued_books where user_id = "' + user_id + '" and book_id = "' + book_id + '" and return_date is null ', function(err, result) {
            if (err) {
                callback(false, err);
            } else {
                if (result.length > 0) {
                    callback(true, result[0].book_id);
                } else {
                    callback(true, '');
                }
            }
        });
    }
}
