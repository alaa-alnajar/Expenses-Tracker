
const API_URL = "http://localhost:3000/api/expenses";

const tbody = document.getElementById("expensesTable");
const categoryFilter = document.getElementById("categoryFilter");
const spinner = document.getElementById("spinner");
const alertContainer = document.getElementById("alertContainer");
const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const editId = document.getElementById("editId");
const editTitleInput = document.getElementById("editTitle");
const editAmountInput = document.getElementById("editAmount");
const editCategoryInput = document.getElementById("editCategory");
const editDateInput = document.getElementById("editDate");
const saveEditBtn = document.getElementById("saveEditBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        darkModeBtn.textContent="☀️";
        localStorage.setItem("darkMode", "true");

    }
    else {
        darkModeBtn.textContent = "🌙";
        localStorage.setItem("darkMode", "false");

    }
    if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️";

}

});







let expenses = [];

// -------------------------
// Alerts

function showAlert(message, type = "danger") {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show"
             role="alert">
            ${message}
            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>
        </div>
    `;
}

// -------------------------
// Spinner

 function showSpinner() {
    spinner.classList.remove("d-none");
}

function hideSpinner() {
    spinner.classList.add("d-none");
}

// -------------------------
// Today's date

function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// -------------------------
// Validation functions

function validateTitle(input) {
    if (input.value.trim() === "") {
        input.classList.add("is-invalid");
        return false;
    }

    input.classList.remove("is-invalid");
    return true;
}

function validateAmount(input) {
    if (
        input.value.trim() === "" ||
        !Number.isFinite(Number(input.value)) ||
        Number(input.value) <= 0
    ) {
        input.classList.add("is-invalid");
        return false;
    }

    input.classList.remove("is-invalid");
    return true;
}

function validateCategory(input) {
    if (input.value === "") {
        input.classList.add("is-invalid");
        return false;
    }

    input.classList.remove("is-invalid");
    return true;
}

function validateDate(input) {
    if (
        input.value === "" ||
        input.value > getToday()
    ) {
        input.classList.add("is-invalid");
        return false;
    }

    input.classList.remove("is-invalid");
    return true;
}

// -------------------------
// Immediate validation

  titleInput.addEventListener("input", function () {
    validateTitle(titleInput);
});

 amountInput.addEventListener("input", function () {
    validateAmount(amountInput);
});

     categoryInput.addEventListener("change", function () {
    validateCategory(categoryInput);
});

dateInput.addEventListener("change", function () {
    validateDate(dateInput);
});

editTitleInput.addEventListener("input", function () {
    validateTitle(editTitleInput);
  });

editAmountInput.addEventListener("input", function () {
    validateAmount(editAmountInput);
   });

editCategoryInput.addEventListener("change", function () {
    validateCategory(editCategoryInput);
     });

 editDateInput.addEventListener("change", function () {
    validateDate(editDateInput);
});

// -------------------------
// Summary cards

function updateSummary() {
     const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    const count = expenses.length;

    const highest = expenses.reduce(function (max, expense) {
        return Math.max(max, Number(expense.amount));
    }, 0);

     document.getElementById("totalExpenses").textContent =
        total.toFixed(2);

    document.getElementById("expenseCount").textContent =
        count;

    document.getElementById("highestExpense").textContent =
        highest.toFixed(2);
}

// -------------------------
// Render table

function renderExpencses(expensesToShow) {
    tbody.innerHTML = "";

    expensesToShow.forEach(function (expense) {
        const row = `
            <tr>
                <td>${expense.title}</td>
                <td>${Number(expense.amount).toFixed(2)}</td>
                <td><span class="category-badge ${expense.category.toLowerCase()}">
                     ${expense.category}</span> </td>
                <td>${expense.date}</td>
                <td>
                    <button
                        class="btn btn-sm btn-primary edit-btn"
                        data-id="${expense.id}">
                        Edit
                    </button>

                    <button
                        class="btn btn-sm btn-danger delete-btn"
                        data-id="${expense.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

        tbody.innerHTML += row;
    });
}

// -------------------------
// Filter
// -------------------------

function applyFilter() {
    const selectedCategory = categoryFilter.value;

    const filteredExpenses = expenses.filter(function (expense) {
        return (
            selectedCategory === "All" ||
            expense.category === selectedCategory
        );
    });

    renderExpencses(filteredExpenses);
}

categoryFilter.addEventListener("change", applyFilter);

// -------------------------
// GET expenses

async function getExpenses() {
    showSpinner();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load expenses.");
        }

        expenses = await response.json();

        updateSummary();
        applyFilter();

        console.log("Connected to API!");
        console.log("Number of expenses:", expenses.length);

    } catch (error) {
        console.error("GET ERROR:", error);
        showAlert("Cannot connect to the server. Please make sure the server is running.");

    } finally {
        hideSpinner();
    }
}

// -------------------------
// ADD expense

expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titleValid = validateTitle(titleInput);
    const amountValid = validateAmount(amountInput);
    const categoryValid = validateCategory(categoryInput);
    const dateValid = validateDate(dateInput);

    if (
        !titleValid ||
        !amountValid ||
        !categoryValid ||
        !dateValid
    ) {
        return;
    }

    const newExpense = {
        title: titleInput.value.trim(),
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value
    };

    try {
              showSpinner();

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newExpense)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not add expense.");
        }

        expenseForm.reset();

        [
            titleInput,
            amountInput,
            categoryInput,
            dateInput
        ].forEach(function (input) {
            input.classList.remove("is-invalid");
        });

        await getExpenses();
        showAlert("Expense added successfully!", "success");

    } catch (error) {
        console.error("POST ERROR:", error);
        showAlert("Cannot connect to the server. Please make sure the server is running.");
    }
    finally {
        hideSpinner();
    }

});

// -------------------------
// Edit and Delete buttons

tbody.addEventListener("click", async function (event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const id = button.dataset.id;

    // DELETE
    if (button.classList.contains("delete-btn")) {
        if (!confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
                showSpinner();

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not delete expense.");
            }

            await getExpenses();
            showAlert("Expense deleted successfully!", "success");

        } catch (error) {
            console.error("DELETE ERROR:", error);
            showAlert("Cannot connect to the server. Please make sure the server is running.");
        }
           finally {
        hideSpinner();
}
    }
    

    if (button.classList.contains("edit-btn")) {
        const expense = expenses.find(function (item) {
            return String(item.id) === String(id);
        });

        if (!expense) {
            showAlert("Expense not found.");
            return;
        }

        editId.value = expense.id;
        editTitleInput.value = expense.title;
        editAmountInput.value = expense.amount;
        editCategoryInput.value = expense.category;

        // Convert DD-MM-YYYY to YYYY-MM-DD if needed
        if (/^\d{4}-\d{2}-\d{2}$/.test(expense.date)) {
            editDateInput.value = expense.date;
        } else {
            const parts = expense.date.split("-");
            editDateInput.value =
                `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        [
            editTitleInput,
            editAmountInput,
            editCategoryInput,
            editDateInput
        ].forEach(function (input) {
            input.classList.remove("is-invalid");
        });

        const modal = new bootstrap.Modal(
            document.getElementById("editExpenseModal")
        );

        modal.show();
    }
});

// -------------------------
// SAVE EDIT

saveEditBtn.addEventListener("click", async function () {
    const titleValid = validateTitle(editTitleInput);
    const amountValid = validateAmount(editAmountInput);
    const categoryValid = validateCategory(editCategoryInput);
    const dateValid = validateDate(editDateInput);

    if (
        !titleValid ||
        !amountValid ||
        !categoryValid ||
        !dateValid
    ) {
        return;
    }

    const id = editId.value;

    const updatedExpense = {
        title: editTitleInput.value.trim(),
        amount: Number(editAmountInput.value),
        category: editCategoryInput.value,
        date: editDateInput.value
    };

    try {

            showSpinner();

        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedExpense)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update expense.");
        }

        await getExpenses();

        const modalElement =
            document.getElementById("editExpenseModal");

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }

        showAlert("Expense updated successfully!", "success");

    } catch (error) {
        console.error("PUT ERROR:", error);
        showAlert("Cannot connect to the server. Please make sure the server is running.");
    }
        finally {
    hideSpinner();
}
});

// -------------------------
// Initial load

getExpenses();

