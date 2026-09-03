const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const submitBtn = document.getElementById('submit-btn');
const taskListEl = document.getElementById('task-list');

let tasks = [];

/**
 * timeShape: "hh:mm DD/MM/YYYY"
 */
function getFormattedTimestamp() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // JS months (0-11)
    const year = now.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}

/**
 * Enable/Disable submit button (rely on Input)
 * Submit is disable when input dialog is blank
 */
function handleInputValidation() {
    const value = taskInput.value.trim();
    submitBtn.disabled = (value === "");
}
taskInput.addEventListener('input', handleInputValidation);