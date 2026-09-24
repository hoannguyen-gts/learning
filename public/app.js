// DOM Elements
const taskInput = document.getElementById('task-input');
const submitBtn = document.getElementById('submit-btn');
const taskListEl = document.getElementById('task-list');

const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const todoView = document.getElementById('todo-view');

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

const signUpUsername = document.getElementById('signup-username');
const signUpPassword = document.getElementById('signup-password');
const signUpConfirmPassword = document.getElementById('signup-confirm-password');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const todoForm = document.getElementById('todo-form');

const goToSignupBtn = document.getElementById('go-to-signup-btn');
const goToLoginBtn = document.getElementById('go-to-login-btn');
const logoutBtn = document.getElementById('logout-btn');

const usernameText = document.getElementById('username-text');

// State
let tasks = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Helpers
function getToken() {
    return localStorage.getItem('access_token');
}

function isAuthenticated() {
    return !!getToken() && !!currentUser;
}

function showView(viewName) {
    loginView.classList.add('hidden');
    signupView.classList.add('hidden');
    todoView.classList.add('hidden');
    if (viewName === 'login') {
        loginUsername.value = "";
        loginPassword.value = "";
        loginView.classList.remove('hidden');
    }
    if (viewName === 'signup') {
        signUpUsername.value = "";
        signUpPassword.value = "";
        signUpConfirmPassword.value = "";
        signupView.classList.remove('hidden');
    }
    if (viewName === 'todo') {
        todoView.classList.remove('hidden');
        usernameText.textContent = currentUser ? currentUser.username : '';
        loadTasks();
    }
}


function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * fetchWithAuth: wrapper tự động gắn Authorization header
 * Nếu 401/403 thì tự động logout!
 */
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Ensure Content-Type for JSON unless already set
    if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.method !== 'GET' && options.body) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
        // Token invalid / expired
        const data = await res.clone().json().catch(() => ({}));
        console.warn('Auth failed:', data.message);
        // Only auto logout if we were authenticated
        if (isAuthenticated()) {
            alert(data.message || 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            logout();
        }
        throw new Error(data.message || 'Unauthorized');
    }
    return res;
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    currentUser = null;
    tasks = [];
    taskListEl.innerHTML = '';
    if (taskInput) taskInput.value = '';
    handleInputValidation();
    showView('login');
}

// Validation for todo input -> enable/disable submit
function handleInputValidation() {
    const value = taskInput.value.trim();
    submitBtn.disabled = (value === "");
}
taskInput.addEventListener('input', handleInputValidation);

// Navigation
goToSignupBtn.addEventListener('click', () => showView('signup'));
goToLoginBtn.addEventListener('click', () => showView('login'));
logoutBtn.addEventListener('click', logout);

// Auth Logic
async function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!identifier || !password) {
        alert('Vui lòng nhập đầy đủ username và password');
        return;
    }

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.message || 'Đăng nhập thất bại');
            return;
        }
        // Success
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        currentUser = data.user;
        loginForm.reset();
        showView('todo');
    } catch (error) {
        console.error('Login error:', error);
        alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!username || !password || !confirmPassword) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }
    if (password.length < 3) {
        alert('Mật khẩu quá ngắn (tối thiểu 3 ký tự)');
        return;
    }

    try {
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.message || 'Đăng ký thất bại');
            return;
        }
        alert(data.message || 'Đăng ký thành công! Vui lòng đăng nhập');
        signupForm.reset();
        showView('login');
    } catch (error) {
        console.error('Signup error:', error);
        alert('Không thể kết nối đến máy chủ');
    }
}

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);

// --- Todo Logic ---
async function loadTasks() {
    try {
        const response = await fetchWithAuth('/todos');
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${response.status}`);
        }
        tasks = await response.json();
        render();
    } catch (err) {
        console.error('loadTasks error:', err);
        // if already handled by fetchWithAuth (logout), do not alert again
        if (err.message !== 'Unauthorized' && !err.message.includes('Unauthorized')) {
            // optionally show empty
            tasks = [];
            render();
        }
    }
}

/**
 * Render lại toàn bộ danh sách Task dựa trên mảng trạng thái `tasks`
 */
function render() {
    taskListEl.innerHTML = '';

    if (tasks.length === 0) {
        const emptyEl = document.createElement('li');
        emptyEl.style.textAlign = 'center';
        emptyEl.style.padding = '20px';
        emptyEl.style.color = '#64748b';
        emptyEl.textContent = 'Chưa có task nào. Hãy thêm task đầu tiên!';
        taskListEl.appendChild(emptyEl);
        handleInputValidation();
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'task-content-wrapper';

        const taskTextEl = document.createElement('span');
        taskTextEl.className = 'task-text';
        taskTextEl.textContent = `${index + 1}. ${task.title}`;

        const taskTimeEl = document.createElement('span');
        taskTimeEl.className = 'task-time';
        const present = task.created_at ? new Date(task.created_at) : new Date();
        taskTimeEl.textContent = isNaN(present) ? '' : formatDateTime(present);

        contentWrapper.appendChild(taskTextEl);
        contentWrapper.appendChild(taskTimeEl);

        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'task-actions';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = !!task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Xóa';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsWrapper.appendChild(checkbox);
        actionsWrapper.appendChild(deleteBtn);

        li.appendChild(contentWrapper);
        li.appendChild(actionsWrapper);

        taskListEl.appendChild(li);
    });

    handleInputValidation();
}

/**
 * Thêm một tác vụ mới
 */
async function addTask(event) {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (text === "") return;

    // Disable button to prevent double submit
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
        const response = await fetchWithAuth('/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: text })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Không thể tạo task');
            return;
        }

        tasks.unshift(data);
        taskInput.value = '';
        render();
    } catch (err) {
        console.error('addTask error:', err);
        if (err.message !== 'Unauthorized') {
            alert('Lỗi khi thêm task: ' + err.message);
        }
    } finally {
        submitBtn.textContent = 'Submit';
        handleInputValidation();
    }
}
todoForm.addEventListener('submit', addTask);

/**
 * Toggle completed
 */
async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;

    try {
        const response = await fetchWithAuth(`/todos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: newCompleted })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${response.status}`);
        }

        const updatedTask = await response.json();

        tasks = tasks.map(t => (t.id === id ? updatedTask : t));
        render();
    } catch (err) {
        console.error('toggleTask error:', err);
        if (err.message !== 'Unauthorized') {
            alert('Không thể cập nhật task: ' + err.message);
        }
        // revert checkbox visually by re-render
        render();
    }
}

/**
 * Xóa task
 */
async function deleteTask(id) {
    if (!confirm('Bạn có chắc muốn xóa task này?')) return;

    try {
        const response = await fetchWithAuth(`/todos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            // 404 case
            if (response.status === 404) {
                alert(err.message || 'Todo not found');
                return;
            }
            throw new Error(err.message || `HTTP ${response.status}`);
        }

        tasks = tasks.filter(t => t.id !== id);
        render();
    } catch (err) {
        console.error('deleteTask error:', err);
        if (err.message !== 'Unauthorized') {
            alert('Không thể xóa task: ' + err.message);
        }
    }
}

// Initial routing - decide which view to show on load
(function init() {
    handleInputValidation();
    if (isAuthenticated()) {
        showView('todo');
    } else {
        showView('login');
    }
})();
