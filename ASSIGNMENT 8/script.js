let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let settings =
  JSON.parse(localStorage.getItem("settings")) || {
    name: "Priyanshu",
    currency: "USD",
    darkMode: false,
  };

const addBtn = document.querySelector(".add-btn");
const overlay = document.querySelector(".overlay");

const balanceCard = document.getElementById("balance");
const incomeCard = document.getElementById("income");
const expenseCard = document.getElementById("expense");
const transactionCard = document.getElementById("transactions");

const username = document.getElementById("username");

const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");

const darkToggle = document.getElementById("darkToggle");

const resetBtn = document.querySelector(".reset");

const tableBody = document.querySelector(".table-item");

const filterButtons = document.querySelectorAll(".filter-btn");

let activeFilter = "All";

let cashChart = null;

const currencySymbol = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

function saveSettings() {
  localStorage.setItem(
    "settings",
    JSON.stringify(settings)
  );
}

function money(value) {
  const symbol = currencySymbol[settings.currency] || "$";
  return symbol + Number(value).toFixed(2);
}

function calculateTotals() {
  let income = 0;
  let expense = 0;

  transactions.forEach((item) => {
    if (item.type === "Income") {
      income += Number(item.amount);
    } else {
      expense += Number(item.amount);
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
}

function updateCards() {
  const totals = calculateTotals();

  balanceCard.innerText = money(totals.balance);
  incomeCard.innerText = money(totals.income);
  expenseCard.innerText = money(totals.expense);
  transactionCard.innerText = transactions.length;
}

function renderChart() {
  const totals = calculateTotals();

  const ctx = document
    .getElementById("cashChart")
    .getContext("2d");

  if (cashChart) {
    cashChart.destroy();
  }

  cashChart = new Chart(ctx, {
    type: "bar",

    data: {
      labels: ["Income", "Expense"],

      datasets: [
        {
          label: "Amount",

          data: [totals.income, totals.expense],

          backgroundColor: [
            "#16a34a",
            "#dc2626",
          ],

          borderRadius: 8,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function applySettings() {
  username.innerText = settings.name;

  darkToggle.checked = settings.darkMode;

  document.body.classList.toggle(
    "dark",
    settings.darkMode
  );
}

function refreshUI() {
  updateCards();
  renderTransactions();
  renderChart();
}

addBtn.addEventListener("click", openModal);

applySettings();
refreshUI();

function openModal() {
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>Add Transaction</h2>
        <button class="close">&times;</button>
      </div>

      <form id="transactionForm">

        <div class="input-group">
          <label>Type</label>

          <select class="type">
            <option value="">Select Type</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>

        <div class="input-group">
          <label>Description</label>

          <input
            type="text"
            class="description"
            placeholder="Description"
          >
        </div>

        <div class="row">

          <div class="input-group">
            <label>Amount</label>

            <input
              type="number"
              class="amount"
            >
          </div>

          <div class="input-group">
            <label>Date</label>

            <input
              type="date"
              class="date"
            >
          </div>

        </div>

        <div class="input-group">

          <label>Category</label>

          <select class="category">

            <option value="">Select Category</option>

            <option>Food & Dining</option>

            <option>Shopping</option>

            <option>Recharge & Bills</option>

            <option>Petrol & Auto</option>

            <option>Utilities</option>

            <option>Salary</option>

            <option>Entertainment</option>

            <option>Other</option>

          </select>

        </div>

        <p class="error"></p>

        <button class="save-btn">
          Save Transaction
        </button>

      </form>

    </div>
  `;

  overlay.classList.add("active");

  document.querySelector(".date").value =
    new Date().toISOString().split("T")[0];

  document
    .querySelector(".close")
    .addEventListener("click", closeModal);

  overlay.addEventListener("click", outsideClose);

  document
    .getElementById("transactionForm")
    .addEventListener("submit", addTransaction);
}

function closeModal() {
  overlay.classList.remove("active");
  overlay.innerHTML = "";
  overlay.removeEventListener("click", outsideClose);
}

function outsideClose(e) {
  if (e.target === overlay) {
    closeModal();
  }
}

function addTransaction(e) {
  e.preventDefault();

  let type =
    document.querySelector(".type").value;

  let description =
    document.querySelector(".description").value.trim();

  let amount =
    document.querySelector(".amount").value;

  let date =
    document.querySelector(".date").value;

  let category =
    document.querySelector(".category").value;

  let error =
    document.querySelector(".error");

  if (
    !type ||
    !description ||
    !amount ||
    !date ||
    !category
  ) {
    error.innerText = "Please fill all fields.";
    return;
  }

  if (Number(amount) <= 0) {
    error.innerText =
      "Amount must be greater than zero.";
    return;
  }

  transactions.push({
    id: Date.now(),
    type,
    description,
    amount: Number(amount),
    date,
    category,
  });

  saveTransactions();

  closeModal();

  refreshUI();
}

function renderTransactions() {
  tableBody.innerHTML = "";

  let search = searchInput.value.toLowerCase();

  let filtered = transactions.filter((item) => {
    let typeMatch =
      activeFilter === "All" || item.type === activeFilter;

    let categoryMatch =
      categoryFilter.value === "All" ||
      item.category === categoryFilter.value;

    let searchMatch =
      item.description.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);

    return typeMatch && categoryMatch && searchMatch;
  });

  filtered.forEach((item) => {
    tableBody.innerHTML += `
      <tr id="${item.id}">
        <td>${item.date}</td>

        <td class="description">
          ${item.description}
        </td>

        <td>
          <span class="category">
            ${item.category}
          </span>
        </td>

        <td class="${
          item.type === "Income"
            ? "expense-active"
            : "expense"
        }">
          ${money(item.amount)}
        </td>

        <td class="actions">

          <button
            class="edit"
            data-id="${item.id}"
          >
            <i class="ri-pencil-fill"></i>
          </button>

          <button
            class="delete"
            data-id="${item.id}"
          >
            <i class="ri-delete-bin-fill"></i>
          </button>

        </td>

      </tr>
    `;
  });

  attachDeleteEvents();
  attachEditEvents();
}

function attachDeleteEvents() {
  document.querySelectorAll(".delete").forEach((btn) => {
    btn.onclick = function () {
      let id = Number(this.dataset.id);

      transactions = transactions.filter(
        (item) => item.id !== id
      );

      saveTransactions();

      refreshUI();
    };
  });
}

function attachEditEvents() {
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.onclick = function () {
      let id = Number(this.dataset.id);

      let transaction = transactions.find(
        (item) => item.id === id
      );

      transactions = transactions.filter(
        (item) => item.id !== id
      );

      saveTransactions();

      openModal();

      document.querySelector(".type").value =
        transaction.type;

      document.querySelector(".description").value =
        transaction.description;

      document.querySelector(".amount").value =
        transaction.amount;

      document.querySelector(".date").value =
        transaction.date;

      document.querySelector(".category").value =
        transaction.category;
    };
  });
}

searchInput.addEventListener("input", () => {
  renderTransactions();
});

categoryFilter.addEventListener("change", () => {
  renderTransactions();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    activeFilter = button.dataset.filter;

    renderTransactions();
  });
});


darkToggle.addEventListener("change", () => {
  settings.darkMode = darkToggle.checked;

  saveSettings();

  document.body.classList.toggle(
    "dark",
    settings.darkMode
  );

  renderChart();
});

resetBtn.addEventListener("click", () => {
  let confirmReset = confirm(
    "Are you sure you want to delete all transactions?"
  );

  if (!confirmReset) return;

  transactions = [];

  saveTransactions();

  refreshUI();
});

window.addEventListener("storage", () => {
  transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

  settings =
    JSON.parse(localStorage.getItem("settings")) || settings;

  applySettings();

  refreshUI();
});