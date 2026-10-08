const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const PORT = 3000;

app.get("/api/hello", function (req, res) {
    res.json({
        message: "Hello from Express!"
    });
});

app.get("/api/expenses", function (req, res) {
    res.json([
        {
            id: 1,
            title: "Food",
            amount: 10
        },
        {
            id: 2,
            title: "Transport",
            amount: 6
        }
    ]);
});

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});