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
    }
});

// Person - add person
app.post("/person", (req, res) => {
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
        })
    });
});

app.listen(3000, () => console.log(`Employee_Management_back-end: http://localhost:3000`));