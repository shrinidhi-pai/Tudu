// ==================== ANY EMAIL + ANY PASSWORD LOGIN (Multi User) ====================

let currentUser = null;
let tasks = [];
let currentFilter = 'all';

function handleLogin() {
  let email = document.getElementById('loginEmail').value.trim().toLowerCase();
  let password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  const savedUser = localStorage.getItem(`user_${email}`);
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  } else {
    currentUser = {
      email: email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      profileImage: ""
    };
    saveCurrentUser();
  }

  // 🔥 SAVE LAST USER (AUTO LOGIN FIX)
  localStorage.setItem("lastUser", email);

  // Load tasks
  const savedTasks = localStorage.getItem(`tasks_${email}`);
  tasks = savedTasks ? JSON.parse(savedTasks) : [];

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').classList.remove('d-none');

  initializeApp();
}

function initializeApp() {
  document.getElementById('welcomeUser').textContent = currentUser.name;
  updateProfileImage();
  renderTasks();
}

// Save user
function saveCurrentUser() {
  localStorage.setItem(`user_${currentUser.email}`, JSON.stringify(currentUser));
}

// Save tasks
function saveTasks() {
  if (currentUser) {
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
  }
}

// ==================== TASK FUNCTIONS ====================

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();

  if (!title) return alert("Task title is required!");

  tasks.unshift({
    id: Date.now(),
    title: title,
    description: desc,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  renderTasks();
}

function renderTasks() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';

  let filteredTasks = tasks;

  if (currentFilter === 'pending') filteredTasks = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

  if (filteredTasks.length === 0) {
    document.getElementById('emptyState').classList.remove('d-none');
    return;
  }

  document.getElementById('emptyState').classList.add('d-none');

  filteredTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `col-12 col-md-6 col-lg-4`;

    div.innerHTML = `
      <div class="task-card p-4 h-100 ${task.completed ? 'task-complete' : ''}">
        <div class="d-flex align-items-start gap-3">
          <i onclick="toggleComplete(${task.id}); event.stopImmediatePropagation()" 
             class="fas fa-2x ${task.completed ? 'fa-check-circle text-success' : 'fa-circle text-secondary'} mt-1 cursor-pointer"></i>
          
          <div class="flex-grow-1">
            <h6 class="mb-2 text-white fw-semibold">${task.title}</h6>
            ${task.description ? `<p class="text-light small mb-3">${task.description}</p>` : ''}
            <small class="text-secondary">
              <i class="fas fa-clock"></i> ${new Date(task.createdAt).toLocaleDateString()}
            </small>
          </div>

          <div class="d-flex flex-column gap-2">
            <button onclick="editTask(${task.id}); event.stopImmediatePropagation()" 
                    class="btn btn-sm btn-outline-light"><i class="fas fa-edit"></i></button>
            <button onclick="deleteTask(${task.id}); event.stopImmediatePropagation()" 
                    class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('editId').value = id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDesc').value = task.description || '';

  new bootstrap.Modal(document.getElementById('editModal')).show();
}

function saveEditedTask() {
  const id = parseInt(document.getElementById('editId').value);
  const title = document.getElementById('editTitle').value.trim();
  const desc = document.getElementById('editDesc').value.trim();

  if (!title) return alert("Title cannot be empty!");

  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = title;
    task.description = desc;
    saveTasks();
    renderTasks();
  }
  bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
}

function deleteTask(id) {
  if (confirm("Delete this task permanently?")) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll('.btn-group button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.id === `filter-${filter}`) btn.classList.add('active');
  });

  renderTasks();
}

// ==================== PROFILE ====================

function showProfileModal() {
  document.getElementById('profileName').value = currentUser.name;
  
  const modalImg = document.getElementById('modalProfileImg');
  modalImg.src = currentUser.profileImage || "https://via.placeholder.com/150?text=👤";

  new bootstrap.Modal(document.getElementById('profileModal')).show();
}

function previewProfileImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('modalProfileImg').src = e.target.result;
    currentUser.tempImage = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const newName = document.getElementById('profileName').value.trim();
  if (newName) currentUser.name = newName;

  if (currentUser.tempImage) {
    currentUser.profileImage = currentUser.tempImage;
    delete currentUser.tempImage;
  }

  saveCurrentUser();
  document.getElementById('welcomeUser').textContent = currentUser.name;
  updateProfileImage();

  bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
}

function updateProfileImage() {
  const imgElement = document.getElementById('navProfileImg');
  imgElement.src = currentUser.profileImage || "https://via.placeholder.com/150?text=👤";
}

// ==================== LOGOUT ====================

function logout() {
  currentUser = null;
  tasks = [];
  localStorage.removeItem("lastUser"); // 🔥 important
  document.getElementById('appScreen').classList.add('d-none');
  document.getElementById('loginScreen').style.display = 'flex';
}

// ==================== AUTO LOGIN ====================

window.onload = () => {
  const savedEmail = localStorage.getItem("lastUser");

  if (savedEmail) {
    const savedUser = localStorage.getItem(`user_${savedEmail}`);

    if (savedUser) {
      currentUser = JSON.parse(savedUser);

      const savedTasks = localStorage.getItem(`tasks_${savedEmail}`);
      tasks = savedTasks ? JSON.parse(savedTasks) : [];

      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('appScreen').classList.remove('d-none');

      initializeApp();
    }
  }
};