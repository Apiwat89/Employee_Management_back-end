const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const db = new sqlite3.Database("./Database/DB.sqlite", (err) => {
    if (err) console.error("Error opening database: ", err.message);
    else {
        console.log("Connect to SQLite database.");

        db.run(`
            CREATE TABLE IF NOT EXISTS Person (
                ID_Person INTEGER PRIMARY KEY AUTOINCREMENT,
                Username TEXT NOT NULL,
                Password TEXT NOT NULL,
                Email TEXT NOT NULL,
                Date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, 
            (err) => {
                if (err) console.error("Error creating table Person:", err.message);
                else console.log("Table 'Person' is ready.");
            }
        );

        db.run(`
            CREATE TABLE IF NOT EXISTS Employee (
                ID_Employee INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Person INTEGER NOT NULL,
                FirstnameTHAI TEXT NOT NULL,
                LastnameTHAI TEXT NOT NULL,
                FirstnameENG TEXT NOT NULL,
                LastnameENG TEXT NOT NULL,
                Birthday TEXT NOT NULL,
                Address TEXT NOT NULL,
                Email TEXT NOT NULL,
                Number TEXT NOT NULL,
                Position TEXT NOT NULL,
                Status TEXT NOT NULL,
                Date DATETIME DEFAULT CURRENT_TIMESTAMP 
            )`, 
            (err) => {
                if (err) console.error("Error creating table Employee:", err.message);
                else console.log("Table 'Employee' is ready.");
            }
        );
    }
});

/* Person */
// Create person
app.post("/create_person", (req, res) => {
    const {username, password, email} = req.body;

    if (!username || !password || !email) {
        return res.json({error: "Please provide username, password, and email"});
    }

    db.get(`SELECT * FROM Person WHERE Username = ?`, [username], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        if (row) return res.json({error: "Username already exists"}); // username already exists
        
        db.run(`INSERT INTO Person (Username, Password, Email) VALUES (?,?,?)`, [username, password, email], (err) => {
            if (err) res.status(500).json({error: err.message});
            else res.json({success: "Register success!"}) // add person success
        });
    });
});

// Check person
app.post("/check_person", (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.json({error: "Please provide username and password"});
    }

    db.get(`SELECT ID_Person, Username FROM Person WHERE Username = ? AND Password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        if (!row) return res.json({error: "Invalid username or password"}); // Invalid username
        return res.json({success: "Login success!", ID: row.ID_Person}); // send id when username is available
    });
});

/* Employee */
// Check employee
app.post("/check_employee", (req, res) => {
    const {id_person} = req.body;

    if (!id_person) return res.json({error: "Error ID"});

    db.get(`SELECT ID_Employee FROM Employee WHERE ID_Person = ?`, [id_person], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        if (!row) return res.json({error: "ID_Employee not found"}); // id not found
        return res.json({success: "Found ID_Employee!"}); // found id
    });
});

// Create employee
app.post("/create_employee", (req, res) => {
    const {id_person, firstnameThai, lastnameThai, firstnameEng, lastnameEng, 
        birthday, address, email, number, position, status} = req.body;

    if (!id_person || !firstnameThai || !lastnameThai || !firstnameEng || !lastnameEng || !birthday || !address || !email || !number || !position) {
        return res.json({error: "Please fill out the information completely."});
    }

    db.run(`
        INSERT INTO Employee (ID_Person, FirstnameTHAI, LastnameTHAI, FirstnameENG, LastnameENG, 
            Birthday, Address, Email, Number, Position, Status) VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `, [id_person, firstnameThai, lastnameThai, firstnameEng, lastnameEng, birthday, address, email, number, position, status], (err) => {
        if (err) res.status(500).json({error: err.message});
        else res.json({success: "Employee success!", notsuccess: "not active"}) // add employee success and status 0
    });
});

// Check status employee
app.post("/check_status_employee", (req, res) => {
    const {id_person} = req.body;

    if (!id_person) return res.json({error: "Error ID"});

    db.get(`SELECT Status FROM Employee WHERE ID_Person = ?`, [id_person], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        if (!row) return res.json({error: "ID_Employee not found"}); // id not found

        if (row.Status === 1) return res.json({success: "active!"}); // status 1 
        else return res.json({notsuccess: "not active"}); // status 0
    });
});

app.listen(3000, () => console.log(`Employee_Management_back-end: http://localhost:3000`));