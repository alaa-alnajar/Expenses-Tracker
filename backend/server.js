require("dotenv").config();

const express = require("express");
const cors= require("cors");
const { Pool } = require("pg");

const { types } = require("pg");

types.setTypeParser(1082, function (value) {
    return value;
});

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

function convertDateToDatabase(date) {

    const parts = date.split("-");

    if (parts.length !== 3) {
        return null;
    }

    // YYYY-MM-DD
    if (parts[0].length === 4) {
        return date;
    }

    // DD-MM-YYYY
    const [day, month, year] = parts;

    return `${year}-${month}-${day}`;
}

//date format from DB to res 
function formatDateForResponse(date) {
    const d = new Date(date);

    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();

    return `${day}-${month}-${year}`;
}

//conect to DB
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

///////////////////////////////////////////
//phase 0  query all   studant 
app.get("/api/students", async function (req, res) {
    try {
        const result = await pool.query("SELECT * FROM students");

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});
///////////////////////////////////
// phase 0 qurty specific studant
app.get("/api/students/:id", async function (req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "ID must be a number"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});


app.get("/api/expenses", async function (req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM expenses ORDER BY id"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.get("/api/expenses/:id", async function (req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "ID must be a number"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM expenses WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

  const expense = result.rows[0];

expense.date = formatDateForResponse(expense.date);

res.json(expense);

       
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.post("/api/expenses", async function (req, res) {

    const { title, amount, category, date } = req.body;

let databaseDate = null;

if (date) {
    databaseDate = convertDateToDatabase(date);
}

if (
    typeof title !== "string" ||
    title.trim() === "" ||
    amount === undefined ||
    amount === null ||
    !category ||
    !date
) {
    return res.status(400).json({
        message: "All fields are required"
    });
}

const validCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
];

if (!validCategories.includes(category)) {
    return res.status(400).json({
        message: "Invalid category"
    });
}

if (
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
) {
    return res.status(400).json({
        message: "Amount must be greater than 0"
    });
}

if (!databaseDate) {
    return res.status(400).json({
        message: "Invalid date"
    });
}
    try {

        const result = await pool.query(
            `INSERT INTO expenses (title, amount, category, date)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [title, amount, category, databaseDate]
        );

        res.status(201).json({
            message: "Expense added successfully",
            id: result.rows[0].id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});
app.put("/api/expenses/:id", async function (req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "ID must be a number"
        });
    }

    const { title, amount, category, date } = req.body;

    let databaseDate = null;

    if (date) {
        databaseDate = convertDateToDatabase(date);
    }

    if (
        typeof title !== "string" ||
        title.trim() === "" ||
        amount === undefined ||
        amount === null ||
        !category ||
        !date
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const validCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!validCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    if (
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
    }

    if (!databaseDate) {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    try {

        const result = await pool.query(
            `UPDATE expenses
             SET title = $1,
                 amount = $2,
                 category = $3,
                 date = $4
             WHERE id = $5
             RETURNING *`,
            [
                title.trim(),
                Number(amount),
                category,
                databaseDate,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense updated successfully",
            expense: result.rows[0]
        });

    } catch (error) {

        console.error("PUT ERROR:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.delete("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM expenses WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        res.json({
            message: "Expense deleted successfully."
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        res.status(500).json({
            message: "Server error while deleting expense."
        });
    }
});


app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});

