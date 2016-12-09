var express = require('express');
var app = express();
var mysql = require('mysql')

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

// Add headers
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
});

var host = 'localhost',
    user = 'root',
    password = '',
    database = 'dataphitask';

var connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
})

connection.connect();

var PORT = 3000;
app.listen(PORT, function () {
    console.log('Node server running @ http://localhost:' + PORT)
});

app.post("/entry", function (req, res) {
    var fname = req.body.fname,
        lname = req.body.lname,
        dob = req.body.dob,
        gender = req.body.gender,
        phone = req.body.phone,
        remarks = req.body.remarks;

    var resjson = {
        success: true
    }

    var alpharegx = /^[a-z ]+$/i,
        phoneregx = /^[0-9]{10}$/

    if (remarks == null) {
        resjson.success = false
        resjson.error = "Remarks is required";
    }
    if (!phoneregx.test(phone)) {
        resjson.error = "Phone numberinvalid"
        resjson.success = false
    }
    if (!(gender == "male" || gender == "female")) {
        resjson.error = "Gender invalid"
        resjson.success = false
    }
    if (!alpharegx.test(lname)) {
        resjson.error = "First Name invalid"
        resjson.success = false
    }
    if (!alpharegx.test(fname)) {
        resjson.error = "First Name invalid"
        resjson.success = false
    }

    if (resjson.success) {
        connection.query('INSERT INTO patient(fname,lname,dob,gender,phone,remarks) VALUES (?,?,?,?,?,?)', [fname, lname, dob, gender, phone, remarks],
            function (err, rows, fields) {
                if (err) {
                    resjson.success = false;
                    resjson.error = "db err";
                    throw err;
                    return;
                }

                resjson.message = "Patient record inserted"
                res.json(resjson)
            });

    } else {
        res.json(resjson)
    }
})

app.get("/details", function (req, res) {
    //console.log(req)
    connection.query('SELECT fname,lname,dob,gender,phone,remarks FROM patient ORDER BY timestamp desc', function (err, rows, fields) {
        if (err) throw err;

        res.json(rows)
    });
    //res.end(200,"asf")
})