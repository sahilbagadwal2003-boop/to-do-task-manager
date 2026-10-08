// ==========================================================================
// Minimalist To-Do List Application Logic
// ==========================================================================

const STORAGE_KEY = 'minimal_todo_app_tasks';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const taskCounter = document.getElementById('task-counter');
const currentDateEl = document.getElementById('current-date');

// State
let tasks = [];

// ==========================================================================
// Initialization
// ==========================================================================
function init() {
  displayCurrentDate();
  loadTasks();
  setupEventListeners();
  render();
}

// Display formatted date
function displayCurrentDate() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  currentDateEl.textContent = now.toLocaleDateString(undefined, options);
}

// Load tasks from LocalStorage
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved tasks:', e);
      tasks = [];
    }
  } else {
    // Welcoming sample tasks for first visit
    tasks = [
      { id: 'task-1', text: 'Welcome to your daily task manager ✨', completed: false },
      { id: 'task-2', text: 'Click anywhere on a task to mark it done', completed: true },
      { id: 'task-3', text: 'Type above and press the single Add button to create new tasks', completed: false }
    ];
    saveTasks();
  }
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Event Listeners
function setupEventListeners() {
  // Single button / form submit handles task input
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
  });
}

// Add a new task
function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  const newTask = {
    id: 'task-' + Date.now(),
    text: text,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  render();

  todoInput.value = '';
  todoInput.focus();
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

// Delete task with smooth animation
function deleteTask(id, itemElement) {
  if (itemElement) {
    itemElement.classList.add('fade-out');
    itemElement.addEventListener('transitionend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, { once: true });
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }
}

// Update task counter text
function updateCounter() {
  const remaining = tasks.filter(t => !t.completed).length;
  if (tasks.length === 0) {
    taskCounter.textContent = 'No tasks';
  } else if (remaining === 0) {
    taskCounter.textContent = 'All tasks completed 🎉';
  } else if (remaining === 1) {
    taskCounter.textContent = '1 task remaining';
  } else {
    taskCounter.textContent = `${remaining} tasks remaining`;
  }
}

// Escape HTML utility to prevent XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Render DOM
function render() {
  todoList.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.classList.remove('is-hidden');
  } else {
    emptyState.classList.add('is-hidden');

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="todo-item-content" role="button" tabindex="0" aria-label="Toggle task status">
          <div class="custom-checkbox" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="todo-text">${escapeHtml(task.text)}</span>
        </div>
        <button class="btn-delete" title="Delete task" aria-label="Delete task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Content click (toggle completion)
      const content = li.querySelector('.todo-item-content');
      content.addEventListener('click', () => toggleTask(task.id));
      content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTask(task.id);
        }
      });

      // Delete click
      const deleteBtn = li.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id, li);
      });

      todoList.appendChild(li);
    });
  }

  updateCounter();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
