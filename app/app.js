let tasks = [];

function renderTasks() {
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  const tbody = document.getElementById("task-list");
  tbody.innerHTML = "";
  tasks.forEach((t, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${t.subject}</td>
        <td>${t.desc}</td>
        <td>${t.due}</td>
        <td>${t.priority}</td>
        <td class="${t.done ? 'status-done' : 'status-pending'}">
          ${t.done ? "✅ Done" : "❌ Pending"}
        </td>
        <td class="row">
          <a onclick="markDone(${i})" class="mark-done">
            <i class="bi bi-check-square-fill"></i>
          </a>
          <a onclick="deleteTask(${i})" class="delete">
            <i class="bi bi-trash3-fill"></i>
          </a>
        </td>
      </tr>
    `;
  });
}

function addTask() {
  const subject = document.getElementById("subject").value;
  const desc = document.getElementById("desc").value;
  const due = document.getElementById("due").value;
  const priority = document.getElementById("priority").value;

  // Alert if user didn’t select a subject or due date
  if (!subject || !due) return alert("Please select a subject and set a due date!");

  tasks.push({ subject, desc, due, priority, done: false });
  saveTasks();
  renderTasks();

  // Clear description and date input after adding
  document.getElementById("desc").value = "";
  document.getElementById("due").value = "";
  document.getElementById("subject").selectedIndex = 0; // reset dropdown
}

function markDone(index) {
  tasks[index].done = true;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("homeworkTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("homeworkTasks");
  if (saved) tasks = JSON.parse(saved);
}

function notifyDueTasks() {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  tasks.forEach(task => {
    const taskDate = new Date(task.due);
    if (!task.done &&
      taskDate.getFullYear() === tomorrow.getFullYear() &&
      taskDate.getMonth() === tomorrow.getMonth() &&
      taskDate.getDate() === tomorrow.getDate()) {
      if (window.require) { // Electron
        require('electron').remote.getGlobal('notify')(
          'Homework Reminder',
          `${task.subject}: ${task.desc} is due tomorrow!`
        );
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Homework Reminder", {
          body: `${task.subject}: ${task.desc} is due tomorrow!`
        });
      }
    }
  });
}

// Check every hour
setInterval(notifyDueTasks, 60 * 60 * 1000);
notifyDueTasks();
loadTasks();
renderTasks();