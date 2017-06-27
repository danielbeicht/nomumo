var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');
var validator = require('validator');

app.use(bodyParser.json());
app.use('/assets', express.static(path.join(process.cwd(), '..', 'assets')));
app.use('/assets', function (req, res, next) {
    res.sendStatus(404);
});
app.use('/app', express.static(path.join(process.cwd(), '..', 'app')));
app.use('/api', express.static(path.join(process.cwd(), '..', 'api')));
app.use('/api', function (req, res, next) {
    res.sendStatus(404);
});


// API
function randomString(length, chars) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}

function randomAsciiString(length) {
    return randomString(length,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtp://');







connection.connect();



app.post('/changeUserPoll', function (req, res) {
    console.log(req.body);

    var userID = req.body.user.userID;
    console.log(userID);

    connection.beginTransaction(function (err) {

        async.each(req.body.user.userPollDates, performQueryUpdateUserPollDate, function (err) {

            if (err) {
                connection.rollback();
                console.log(err);
                return;
            }
        });

        function performQueryUpdateUserPollDate(lineitem, callback) {
            //connection.query("UPDATE userpolldates SET result = " + lineitem.result + " WHERE userPollDateID = " + lineitem.userPollDateID, function (err, result) {
            connection.query("UPDATE userpolldates SET result = ? WHERE userPollDateID = ?", [lineitem.result, lineitem.userPollDateID], function (err, result) {

            });
        }


        async.each(req.body.user.userPollTimes, performQueryUpdateUserPollTime, function (err) {

            if (err) {
                connection.rollback();
                console.log(err);
                return;
            }
        });

        function performQueryUpdateUserPollTime(lineitem, callback) {
            connection.query("UPDATE userpolltimes SET result = ? WHERE userPollTimeID = ?", [lineitem.result, lineitem.userPollTimeID], function (err, result) {

            });
        }

        connection.commit(function (err) {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            console.log('Transaction completed!');


        });

        console.log(req.body.user.email);
        connection.query("UPDATE users SET name = ?, email = ? WHERE userID = ?", [req.body.user.name, req.body.user.email, req.body.user.userID], function (err, result) {
            if (err){
                console.log(err);
            }
        });
    });
});


app.post('/saveComment', function (req, res) {
    console.log (req.body);

    var post = {
        name: req.body.name,
        pollID: req.body.pollID,
        comment: req.body.comment,
        date: new Date()
    };

    connection.query("INSERT INTO comments SET ?", post, function (err, result) {
        if (err){
            res.send("Error");
        } else {
            res.send("OK");
        }
    });


    connection.query("SELECT email, name, userHash FROM users WHERE pollID = ?", [req.body.pollID], function (err, result) {
        for (var i=0; i<result.length; i++){
            var mailOptions = {
                from: '"Nomumo 👥" <nomumo@mz-host.de>', // sender address
                to: result[i].email, // list of receivers
                subject: 'nomumo - Neuer Kommentar', // Subject line
                html: '<b>Hallo ' + result[i].name + ',</b><br><br> es wurde ein neuer Kommentar von ' + req.body.name + ' veröffentlicht. <br><br><div><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://nomumo.de/poll/' + req.body.pollID + '" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="10%" stroke="f" fillcolor="#d62828"><w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Umfrage</center></v:roundrect><![endif]--><![if !mso]><table cellspacing="0" cellpadding="0"> <tr> <td align="center" width="300" height="40" bgcolor="#d62828" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;"><a href="http://nomumo.de/poll/' + req.body.pollID + '" style="font-size:16px; font-weight: bold; font-family:sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block"><span style="color: #ffffff;">Umfrage</span></a></td> </tr> </table> <![endif]></div> <br><br><br><br>Zum abbestellen klicken Sie bitte <a href="http://nomumo.de/unsubscribe?userHash=' + result[i].userHash +'&pollID=' + req.body.pollID + '">hier</a>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            });
        }
    });

});

app.post('/deleteComment', function (req, res) {
    var post = {
        commentID: req.body.commentID
    };

    connection.query("DELETE FROM comments WHERE ?", post, function (err, result) {
        if (err){
            res.send("Error");
        } else {
            res.send("OK");
        }
    });
});

app.post('/changeComment', function (req, res) {
    connection.query("UPDATE comments SET name = ?, comment = ? WHERE commentID = ?", [req.body.name, req.body.comment, req.body.commentID], function (err, result) {
        if (err){
            res.send("Error");
        } else {
            res.send("OK!");
        }
    });
});

app.get('/getComments', function (req, res) {
    var pollID = req.query.pollID;

    connection.query("SELECT comment, name, date, commentID FROM comments WHERE pollID=? ORDER BY date DESC", [pollID], function (err, result) {
        if (!err){
            res.send(result);
        }
    });
});


app.post('/deleteUserPoll', function (req, res) {
    var userID = req.body.userID;

    connection.beginTransaction(function (err) {
        connection.query("DELETE FROM userpolltimes WHERE userID = ?", [userID],  function (err, result) {
            connection.query("DELETE FROM userpolldates WHERE userID = ?", [userID],  function (err, result) {
                connection.query("DELETE FROM users WHERE userID = ?", [userID],  function (err, result) {
            // Commit Transaction
            connection.commit(function (err) {
                if (err) {
                    return connection.rollback(function () {
                        throw err;
                    });
                }
                console.log('Transaction completed!');
            });
                });
            });
        });
    });
    res.send("OK");
});


app.post('/unsubscribe', function (req, res) {
    var responseObject = new Object();

    connection.query("UPDATE users SET email = NULL WHERE userHash = ? AND pollID = ?", [req.body.userHash, req.body.pollID], function (err, result) {
        if (err){
            responseObject.statusCode = 1;
            res.send(responseObject);
        } else {
            responseObject.statusCode = 0;
            res.send(responseObject);
        }
    });
});


app.post('/addUserPoll', function (req, res) {
    var content = req.body.content;
    connection.beginTransaction(function (err) {

        // Generate UserHash
        var userHash = 0;
        while (userHash == 0) {
            userHash = randomAsciiString(8);
            var sql = "SELECT * FROM users WHERE userHash='" + userHash + "'";
            connection.query(sql, function (err, results) {
                if (results.length != 0) {
                    userHash = 0;
                }
            });
        }

        var post = {};
        if (!req.body.informEmail){
            post = {
                name: req.body.name,
                pollID: req.body.pollID,
                userHash: userHash
            };
        } else if (req.body.informEmail && validator.isEmail(req.body.informEmail)){
            post = {
                name: req.body.name,
                pollID: req.body.pollID,
                email: req.body.informEmail,
                userHash: userHash
            };
        }

        // Does username already exists for poll?
        connection.query("SELECT * FROM users WHERE name = ? AND pollID = ?", [req.body.name, req.body.pollID], function (err, result) {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            // If username doesn't exists
            if (result.length == 0) {
                // Insert username in DB
                connection.query('INSERT INTO users SET ?', post, function (err, result) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err;
                        });
                    }
                    // Get userID (need for userpolldate)
                    connection.query("SELECT userID, userHash FROM users WHERE name = ? AND pollID = ?", [req.body.name, req.body.pollID],function (err, result) {
                        var userID = result[0].userID;
                        var userHash = result[0].userHash;

                        // Insert userpolldate/userpolltime in DB
                        async.each(content, performQueryInsertPollDateTime, function (err) {

                            if (err) {
                                connection.rollback();
                                console.log(err);
                                return;
                            }
                        });

                        function performQueryInsertPollDateTime(lineitem, callback) {
                            // Insert userpolldate-process
                            if (lineitem.time == null) {
                                var dateVar = lineitem.date;
                                // Get PollDateID (need for userpolldates
                                connection.query("SELECT pollDateID FROM polldates WHERE pollID = ? AND date= ?", [req.body.pollID, dateVar], function (err, result) {
                                    if (err) return callback(err);

                                    // Insert userpolldate
                                    var post = {
                                        userID: userID,
                                        result: lineitem.checked,
                                        pollDateID: result[0].pollDateID
                                    };
                                    connection.query("INSERT INTO userpolldates SET ?", post, function (err, rows) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        callback();
                                    });
                                });

                            } else {    // Insert userpolltime-process
                                var dateVar = lineitem.date;

                                connection.query("SELECT pollDateID FROM polldates WHERE pollID = ? AND date = ?", [req.body.pollID, dateVar], function (err, result) {
                                    if (err) return callback(err);


                                    connection.query("SELECT pollDateTimesID FROM polldateTimes WHERE pollDateID = ? AND time = ?", [result[0].pollDateID, lineitem.time], function (err, result) {
                                        if (err) return callback(err);


                                        var post = {
                                            userID: userID,
                                            result: lineitem.checked,
                                            pollDateTimeID: result[0].pollDateTimesID
                                        };


                                        connection.query("INSERT INTO userpolltimes SET ?", post, function (err, rows) {
                                            if (err) {
                                                return callback(err);
                                            }
                                            callback();
                                        });
                                    });
                                });

                            }
                        }

                        connection.query("SELECT name, email FROM polls WHERE pollID = ?", [req.body.pollID], function (err, result) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }

                            var mailOptions = {
                                from: '"Nomumo 👥" <nomumo@mz-host.de>', // sender address
                                to: result[0].email, // list of receivers
                                subject: 'nomumo - Neuer Teilnehmer', // Subject line
                                html: '<b>Hallo ' + result[0].name + ',</b><br><br> '+ req.body.name +' hat an Ihrer Umfrage teilgenommen. <br><br><div><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://nomumo.de/poll/' + req.body.pollID + '" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="10%" stroke="f" fillcolor="#d62828"><w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Umfrage</center></v:roundrect><![endif]--><![if !mso]><table cellspacing="0" cellpadding="0"> <tr> <td align="center" width="300" height="40" bgcolor="#d62828" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;"><a href="http://nomumo.de/poll/' + req.body.pollID + '" style="font-size:16px; font-weight: bold; font-family:sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block"><span style="color: #ffffff;">Umfrage</span></a></td> </tr> </table> <![endif]></div>' // html body
                            };

                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    return console.log(error);
                                }
                                console.log('Message sent: ' + info.response);
                            });


                        // Commit Transaction
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('Transaction completed!');
                        });


                        var obj = new Object();
                        obj.code = 0;
                        res.send(JSON.stringify(obj));
                    });
                    });
                });


            } else {
                var obj = new Object();
                obj.code = 1;
                res.send(JSON.stringify(obj));
            }

        });
    });


});


app.post('/createPoll', function (req, res) {
    // Generate PollID
    var pollID = 0;
    while (pollID == 0) {
        pollID = randomAsciiString(8);
        var sql = "SELECT * FROM polls WHERE pollID='" + pollID + "'";
        connection.query(sql, function (err, results) {
            if (results.length != 0) {
                pollID = 0;
            }
        });
    }
    // Insert Poll in DB
    var urlID = pollID;
    var post = {
        pollID: pollID,
        title: req.body.title,
        location: req.body.location,
        description: req.body.description,
        name: req.body.name,
        email: req.body.email,
        maybe: req.body.maybe
    };
    var query = connection.query('INSERT INTO polls SET ?', post, function (err, result) {

    });

    // Transaction
    // For all dates
    var dates = req.body.dates;
    for (var i = 0; i < dates.length; i++) {
        // Insert polldate into DB
        (function () {
            var ki = i;
            var post = {date: dates[ki].date, pollID: urlID};
            connection.beginTransaction(function (err) {
                if (err) {
                    throw err;
                }
                connection.query('INSERT INTO polldates SET ?', post, function (err, result) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err;
                        });
                    }
                    // Get pollDateID (we need pollDateID to insert pollDateTimes
                    connection.query("SELECT pollDateID FROM pollDates WHERE pollID = ? AND date = ?", [urlID, post.date], function (err, result) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }

                        // Insert pollDateTimes in DB
                        var counter = 0;
                        async.each(dates[ki].time, performQueryInsertPollDateTime, function (err) {

                            if (err) {
                                connection.rollback();
                                console.log(err);
                                return;
                            }
                        });

                        function performQueryInsertPollDateTime(lineitem, callback) {
                            ++counter;
                            var post = {time: lineitem, pollDateID: result[0].pollDateID, timeCountOnDay: counter};

                            connection.query("INSERT INTO polldatetimes SET ?", post, function (err, rows) {
                                if (err) return callback(err);
                                callback();
                            });
                        }

                        // Commit Transaction
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                        });
                    });
                });
            });
        }());
    }
    var mailOptions = {
        from: '"Nomumo 👥" <nomumo@mz-host.de>', // sender address
        to: req.body.email, // list of receivers
        subject: 'nomumo - ' + req.body.title, // Subject line
        html: '<b>Hallo ' + req.body.name + ',</b><br><br>Ihre Umfrage wurde erstellt und ist unter folgendem Link erreichbar: <br><br><div><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http:/http://nomumo.de/poll/' + urlID + '" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="10%" stroke="f" fillcolor="#d62828"><w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Button Text Here!</center></v:roundrect><![endif]--><![if !mso]><table cellspacing="0" cellpadding="0"> <tr> <td align="center" width="300" height="40" bgcolor="#d62828" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;"><a href="http://nomumo.de/poll/' + urlID + '" style="font-size:16px; font-weight: bold; font-family:sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block"><span style="color: #ffffff;">Umfrage</span></a></td> </tr> </table> <![endif]></div>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    res.send({pollID: urlID});
});


app.get('/getpoll', function (req, res) {
    console.log("GetPoll called");
    var pollID = req.query.pollid;
    var poll = new Object();

    connection.beginTransaction(function (err) {
        connection.query("SELECT * FROM polls WHERE pollID = ?", [pollID], function (err, result) {
            poll.pollID = pollID;
            poll.location = result[0].location;
            poll.description = result[0].description;
            poll.name = result[0].name;
            poll.title = result[0].title;
            poll.maybe = result[0].maybe;


            connection.query("SELECT * FROM pollDates WHERE pollID = ?", [pollID], function (err, result) {
                poll.dates = result;

                async.each(poll.dates, performQueryGetTimes, function (err) {

                    if (err) {
                        connection.rollback();
                        console.log(err);
                        return;
                    }
                });

                function performQueryGetTimes(lineitem, callback) {
                    connection.query("SELECT * FROM polldatetimes WHERE pollDateID = ?", [lineitem.pollDateID], function (err, result) {
                        lineitem.time = result;
                        if (err) return callback(err);
                        callback();
                    });
                }


                // Get users
                connection.query("SELECT userID, name, pollID FROM users WHERE pollID = ?", [pollID], function (err, result) {
                    poll.users = result;


                    // Get User Dates
                    async.each(poll.users, performQueryGetUserPollDates, function (err) {
                        if (err) {
                            connection.rollback();
                            console.log(err);
                            return;
                        }
                    });

                    function performQueryGetUserPollDates(lineitem, callback) {
                        connection.query("SELECT * FROM userpolldates WHERE userID = ?", [lineitem.userID], function (err, result) {
                            lineitem.userPollDates = result;
                            if (err) return callback(err);
                            callback();
                        });
                    }



                    // Get User Times
                    async.each(poll.users, performQueryGetUserPollTimes, function (err) {
                        if (err) {
                            connection.rollback();
                            console.log(err);
                            return;
                        }
                    });


                    function performQueryGetUserPollTimes(lineitem, callback) {
                        connection.query("SELECT * FROM userpolltimes WHERE userID = ?", [lineitem.userID], function (err, result) {
                            lineitem.userPollTimes = result;
                            if (err) return callback(err);
                            callback();
                        });
                    }

                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err;
                        });
                    }

                    for (var i = 0; i < poll.dates.length; i++) {
                        var date = new Date(poll.dates[i].date);
                        date = date.toLocaleDateString()
                        poll.dates[i].date = date;

                    }
                    console.log(poll);
                    res.send(JSON.stringify(poll));
                    console.log('Transaction completed!');
                });
            });
            });
        });
    });
});


app.get('/*', function (req, res) {
    res.status(200).sendFile(path.join(process.cwd(), '..', 'index.html'));
});


var server = app.listen(81, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server is running on Port", port);
});
