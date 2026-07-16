let settings =
  JSON.parse(localStorage.getItem("settings")) || {
    name: "Priyanshu",
    currency: "USD",
    darkMode: false,
  };

const userName = document.getElementById("userName");
const currency = document.getElementById("currency");
const darkMode = document.getElementById("darkMode");

const saveBtn = document.getElementById("saveSettings");
const resetBtn = document.getElementById("resetData");

loadSettings();

function loadSettings() {
  userName.value = settings.name;
  currency.value = settings.currency;
  darkMode.checked = settings.darkMode;

  document.body.classList.toggle(
    "dark",
    settings.darkMode
  );
}

saveBtn.addEventListener("click", () => {
  if (userName.value.trim() === "") {
    alert("Please enter your name.");
    return;
  }

  settings.name = userName.value.trim();
  settings.currency = currency.value;
  settings.darkMode = darkMode.checked;

  localStorage.setItem(
    "settings",
    JSON.stringify(settings)
  );

  document.body.classList.toggle(
    "dark",
    settings.darkMode
  );

  alert("Settings saved successfully.");
});

darkMode.addEventListener("change", () => {
  document.body.classList.toggle(
    "dark",
    darkMode.checked
  );
});

resetBtn.addEventListener("click", () => {
  let confirmReset = confirm(
    "Are you sure you want to delete all transactions and reset settings?"
  );

  if (!confirmReset) return;

  localStorage.removeItem("transactions");

  localStorage.removeItem("settings");

  settings = {
    name: "Priyanshu",
    currency: "USD",
    darkMode: false,
  };

  loadSettings();

  alert("All data has been reset.");
});