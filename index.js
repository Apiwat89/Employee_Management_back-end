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

        db.run(`
            CREATE TABLE IF NOT EXISTS Benefit (
                ID_Benefit INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Employee INTEGER NOT NULL,
                Salary TEXT NOT NULL,
                OT TEXT NOT NULL,
                Bonus TEXT NOT NULL,
                Tax TEXT NOT NULL,
                Benefit TEXT NOT NULL,
                Date DATETIME DEFAULT CURRENT_TIMESTAMP 
            )`, 
            (err) => {
                if (err) console.error("Error creating table Benefit:", err.message);
                else console.log("Table 'Benefit' is ready.");
            }
        );

        db.run(`
            CREATE TABLE IF NOT EXISTS Department (
                ID_Department INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Employee INTEGER NOT NULL,
                Department TEXT NOT NULL,
                Date DATETIME DEFAULT CURRENT_TIMESTAMP 
            )`, 
            (err) => {
                if (err) console.error("Error creating table Benefit:", err.message);
                else console.log("Table 'Benefit' is ready.");
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

    db.get(`SELECT Status, Position FROM Employee WHERE ID_Person = ?`, [id_person], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        if (!row) return res.json({error: "ID_Employee not found"}); // id not found

        if (row.Status === "1") return res.json({success: "active!", position: row.Position}); // status 1 
        else return res.json({notsuccess: "not active"}); // status 0
    });
});

// Update status employee
app.post("/update_status_employee", (req, res) => {
    const {id_employee} = req.body;

    if (!id_employee) return res.json({error: "Error ID"});

    db.run(`UPDATE Employee SET Status = 1 WHERE ID_Employee = ?`, [id_employee], (err) => {
        if (err) return res.status(500).json({error: "Failed to update status."});
        return res.json({success: "Employee status updated to active!"});
    });
});

// Pull Birthday between 14 days
app.get("/birthday_countdown", (req, res) => {
    db.all(`
        SELECT Fullname, Birthday, Position, DayLeft FROM (
            SELECT FirstnameENG || ' ' || LastnameENG AS Fullname, Birthday, Position,
                CAST(julianday(
                    date(
                        CASE 
                            WHEN strftime('%m-%d', Birthday) >= strftime('%m-%d','now')
                            THEN strftime('%Y','now') || '-' || strftime('%m-%d', Birthday)
                            ELSE strftime('%Y','now','+1 year') || '-' || strftime('%m-%d', Birthday)
                        END
                        )
                    ) - julianday('now') AS INTEGER
                ) AS DayLeft
            FROM Employee)
        WHERE DayLeft BETWEEN 0 AND 14
        ORDER BY DayLeft ASC;
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Pull upcoming birthdays success", rows: rows});
    });
});

/* Benefit */
// Create benefit
app.post("/create_benefit", (req, res) => {
    db.run(`
        INSERT INTO Benefit (ID_Employee, Salary, OT, Bonus, Tax, Benefit) VALUES (?,?,?,?,?,?)
        `, ['1', '10000', '150', '15000', '520', 'ประกันชีวิตเมื่อเกิดอุบัติเหตุ'], (err) => {
        if (err) res.status(500).json({error: err.message});
        else res.json({success: "Benefit success!"}) // add benefit success
    });
});

// Pull the top 10 salary 
app.get("/top10_salary", (req, res) => {
    db.all(`
        SELECT e.FirstnameENG || ' ' || e.LastnameENG AS Fullname, b.Salary 
            FROM Benefit b 
            JOIN Employee e ON b.ID_Employee = e.ID_Employee
            ORDER BY CAST(b.Salary AS INTEGER) DESC LIMIT 10 
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Pull the top 10 salary success", rows: rows});
    });
});

// Pull the top 10 salary position
app.get("/top10_Sposition", (req, res) => {
    db.all(`
        SELECT e.FirstnameENG || ' ' || e.LastnameENG AS Fullname, e.Position, b.Salary
            FROM Benefit b 
            JOIN Employee e ON b.ID_Employee = e.ID_Employee
            WHERE b.Salary = (
                SELECT MAX(b2.Salary)
                    FROM Benefit b2
                    JOIN Employee e2 ON b2.ID_Employee = e2.ID_Employee
                    WHERE e2.Position = e.Position
                )
            ORDER BY b.Salary DESC LIMIT 10 
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Pull the top 10 salary position success", rows: rows});
    });
});

// Pull the top 10 Overtime
app.get("/top10_OT", (req, res) => {
    db.all(`
        SELECT e.FirstnameENG || ' ' || e.LastnameENG AS Fullname, e.Position, b.OT
            FROM Benefit b 
            JOIN Employee e ON b.ID_Employee = e.ID_Employee
            ORDER BY CAST(b.OT AS INTEGER) DESC LIMIT 10 
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Pull the top 10 Overtime success", rows: rows});
    });
});

// Pull the top 10 Bonus
app.get("/top10_Bonus", (req, res) => {
    db.all(`
        SELECT e.FirstnameENG || ' ' || e.LastnameENG AS Fullname, e.Position, b.Bonus
            FROM Benefit b 
            JOIN Employee e ON b.ID_Employee = e.ID_Employee
            ORDER BY CAST(b.Bonus AS INTEGER) DESC LIMIT 10 
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Pull the top 10 Bonus success", rows: rows});
    });
});

/* Department */
// Create department
app.post("/create_department", (req, res) => {
    db.run(`
        INSERT INTO Department (ID_Employee, Department) VALUES (?,?)
        `, ['3', 'Service'], (err) => {
        if (err) res.status(500).json({error: err.message});
        else res.json({success: "Department success!"}) // add department success
    });
});

// Pull count employee in department
app.get("/department", (req, res) => {
    db.all(`
        SELECT d.ID_Department, d.Department, COUNT(e.ID_Employee) AS EmployeeCount
            FROM Department d
            JOIN Employee e ON d.ID_Employee = e.ID_Employee
            GROUP BY d.Department
            ORDER BY EmployeeCount DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: "Department summary success", rows: rows});
    });
});

app.listen(3000, () => console.log(`Employee_Management_back-end: http://localhost:3000`));