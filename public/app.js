const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const submitBtn = document.getElementById('submit-btn');
const taskListEl = document.getElementById('task-list');

let tasks = [];

async function loadTasks() { 
    const response = await fetch('/todos'); 
    tasks = await response.json(); 
    render(); 
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

/**
 * Render lại toàn bộ danh sách Task dựa trên mảng trạng thái `tasks`
 */
async function render() {
    // Làm trống danh sách hiện tại trước khi vẽ lại
    taskListEl.innerHTML = '';

    // Duyệt qua mảng dữ liệu `tasks` để tạo các thành phần HTML tương ứng
    tasks.forEach((task, index) => {
        // Tạo thẻ li container
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        // Tạo phần chứa văn bản bên trái (Task Name + Time)
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'task-content-wrapper';

        const taskTextEl = document.createElement('span');
        taskTextEl.className = 'task-text';
        // Thêm số thứ tự hiển thị tự động dựa trên vị trí hiển thị (1-based index)
        taskTextEl.textContent = `${index + 1}. ${task.title}`;

        const taskTimeEl = document.createElement('span');
        taskTimeEl.className = 'task-time';
        taskTimeEl.textContent = task.created_at;

        contentWrapper.appendChild(taskTextEl);
        contentWrapper.appendChild(taskTimeEl);

        // Tạo phần chứa các nút tương tác bên phải (Checkbox + Button Xóa)
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'task-actions';

        // Checkbox hoàn thành tác vụ
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;

        // Gắn sự kiện thay đổi trạng thái (Toggle)
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Nút xóa tác vụ vĩnh viễn
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Xóa';

        // Gắn sự kiện xóa
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsWrapper.appendChild(checkbox);
        actionsWrapper.appendChild(deleteBtn);

        // Ghép các cụm vào thẻ li
        li.appendChild(contentWrapper);
        li.appendChild(actionsWrapper);

        // Đưa thẻ li vào ul trên giao diện
        taskListEl.appendChild(li);
    });

    // Sau khi render, cập nhật lại trạng thái nút Submit
    handleInputValidation();
}

/**
 * Thêm một tác vụ mới vào mảng
 * Thỏa mãn yêu cầu: "Task mới nhất phải nhảy lên đầu tiên"
 */
async function addTask(event) {
    // Ngăn chặn trình duyệt tải lại trang khi submit form
    event.preventDefault();

    const text = taskInput.value.trim();
    if (text === "") return; // Chốt bảo vệ (double-check validation)

    // Gửi task lên server 
    const response = await fetch('/todos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: text }) 
        }
    );

    // Nhận task từ server
    const newTask = await response.json();

    // Nghiệp vụ cốt lõi: Dùng 'unshift' thay vì 'push' để đưa task mới lên đầu mảng
    tasks.unshift(newTask);

    // Xóa sạch ô nhập văn bản cũ
    taskInput.value = '';

    // Cập nhật lại UI dựa trên mảng dữ liệu mới
    render();
}

// Đăng ký sự kiện submit form
todoForm.addEventListener('submit', addTask);

/**
 * Chuyển đổi trạng thái hoàn thành (Completed / Active) của task
 * Click vào checkbox => chuyển task thành completed (dùng css để gạch ngang)
 */
async function toggleTask(id) {

    const task = tasks.find(task => task.id === id);
    if (!task) { return; }

    const newCompleted = !task.completed;


    // Gửi thay đổi lên server
    const response = await fetch(`/todos/${id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ completed: newCompleted }) 
        }
    );

    if (!response.ok) {
        throw new Error(`Không thể cập nhật task #${id} (HTTP ${response.status})`);
    }

    const updatedTask = await response.json();

    // Cập nhật task trong client

    tasks = tasks.map(task => { 
        if (task.id === id) { 
            return updatedTask; 
        } 
        return task; 
    });

    // Đồng bộ thay đổi dữ liệu lên giao diện hiển thị
    render();
}

/**
 * Xóa vĩnh viễn một task khỏi mảng dữ liệu
 * Ấn xóa, remove item khỏi list
 */
async function deleteTask(id) {

    const response = await fetch(`/todos/${id}`, { 
        method: 'DELETE' 
    });

    if (!response.ok) { return; }

    // Lọc bỏ task có ID trùng khớp ra khỏi mảng dữ liệu
    tasks = tasks.filter(task => task.id !== id);

    // Đồng bộ thay đổi dữ liệu lên giao diện hiển thị
    render();
}

loadTasks();