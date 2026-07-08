const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const taskCategory = document.getElementById("taskCategory");
const warning = document.getElementById("warning");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;
const template = document.getElementById("taskTemplate");

let id = 1;

updateUI();

taskForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        warning.style.display = "block";
        return;
    }

    warning.style.display = "none";

    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".task-card");

    card.dataset.id = id++;
    card.dataset.status = "pending";
    card.dataset.category = taskCategory.value;

    clone.querySelector(".task-card__title").textContent = text;

    clone.querySelector(".attr-id-value").textContent =
        card.dataset.id;

    clone.querySelector(".attr-status-value").textContent =
        "pending";

    clone.querySelector(".attr-category-value").textContent =
        taskCategory.value;

    const checkBtn = clone.querySelector(".task-card__check");

    const editBtn = clone.querySelector('[data-action="edit"]');

    const deleteBtn = clone.querySelector('[data-action="delete"]');

    const saveBtn = clone.querySelector('[data-action="save"]');

    const cancelBtn = clone.querySelector('[data-action="cancel"]');

    const title = clone.querySelector(".task-card__title");

    const editInput = clone.querySelector(".task-card__edit-input");

    checkBtn.addEventListener("click", function () {

        if (card.dataset.status === "pending") {

            card.dataset.status = "completed";

            clone.querySelector(".attr-status-value").textContent =
                "completed";

        } else {

            card.dataset.status = "pending";

            clone.querySelector(".attr-status-value").textContent =
                "pending";
        }

    });

    editBtn.addEventListener("click", function () {

        card.classList.add("is-editing");

        editInput.value = title.textContent;

        editInput.focus();

    });

    saveBtn.addEventListener("click", function () {

        const value = editInput.value.trim();

        if (value === "") return;

        title.textContent = value;

        card.classList.remove("is-editing");

    });

    cancelBtn.addEventListener("click", function () {

        card.classList.remove("is-editing");

    });

    deleteBtn.addEventListener("click", function () {

        card.remove();

        updateUI();

    });

    taskList.appendChild(clone);

    taskInput.value = "";

    updateUI();

});

function updateUI() {

    const totalTasks = taskList.querySelectorAll(".task-card").length;

    taskCount.textContent =
        `${totalTasks} ${totalTasks === 1 ? "node" : "nodes"}`;

    if (totalTasks === 0) {
        emptyState.classList.add("is-visible");
    } else {
        emptyState.classList.remove("is-visible");
    }

}

// Theme Toggle
themeToggle.addEventListener("click", function () {

    if (html.dataset.theme === "dark") {

        html.dataset.theme = "light";
        themeToggle.setAttribute("aria-pressed", "true");

    } else {

        html.dataset.theme = "dark";
        themeToggle.setAttribute("aria-pressed", "false");

    }

});