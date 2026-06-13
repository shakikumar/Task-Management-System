import { useState, useEffect } from "react";
import axios from "axios";

function Tasks() {
const [tasks, setTasks] = useState([]);

const [title, setTitle] = useState("");
const [assignee, setAssignee] = useState("");
const [priority, setPriority] = useState("Medium");

const API_URL = "http://localhost:5001/api/tasks";

const getAuthHeader = () => ({
headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
});

const columns = ["TODO", "IN_PROGRESS", "COMPLETED"];

useEffect(() => {
const fetchTasks = async () => {
try {
const res = await axios.get(API_URL, getAuthHeader());

```
    if (res.data.success) {
      setTasks(res.data.tasks);
    }
  } catch (error) {
    console.log("BACKEND ERROR:", error.response?.data || error.message);
  }
};

fetchTasks();
```

}, []);

const getTasksByStatus = (status) => {
return tasks.filter((task) => task.status === status);
};

const addTask = async () => {
if (!title || !assignee) return;

```
try {
  const res = await axios.post(
    API_URL,
    {
      title,
      projectId: "p4444444-4444-4444-4444-444444444444",
      assignedUserId: "c3333333-3333-3333-3333-333333333333",
      priority: priority.toUpperCase(),
      status: "TODO",
    },
    getAuthHeader()
  );

  setTasks((prev) => [res.data.task, ...prev]);

  setTitle("");
  setAssignee("");
  setPriority("Medium");
} catch (error) {
  console.log("Error adding task", error);
}
```

};

const updateTaskStatus = (id, newStatus) => {
setTasks((prev) =>
prev.map((task) =>
task.id === id ? { ...task, status: newStatus } : task
)
);
};

const getStatusBadge = (status) => {
switch (status) {
case "TODO":
return "bg-gray-200 text-gray-700";
case "IN_PROGRESS":
return "bg-blue-200 text-blue-700";
case "COMPLETED":
return "bg-green-200 text-green-700";
default:
return "bg-gray-100 text-gray-600";
}
};

const getPriorityBadge = (priority) => {
switch (priority) {
case "HIGH":
return "bg-red-200 text-red-700";
case "MEDIUM":
return "bg-yellow-200 text-yellow-700";
case "LOW":
return "bg-green-200 text-green-700";
default:
return "bg-gray-200 text-gray-700";
}
};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-6">Tasks Board</h1>

```
  <div className="mb-6 bg-white p-4 rounded shadow-sm border">
    <h2 className="font-semibold mb-3">Add New Task</h2>

    <div className="flex gap-2 flex-wrap">
      <input
        className="border p-2 rounded"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Assignee"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      />

      <select
        className="border p-2 rounded"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      <button
        onClick={addTask}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Add Task
      </button>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {columns.map((col) => (
      <div
        key={col}
        className="bg-slate-100 p-4 rounded-xl min-h-[500px] border shadow-sm"
      >
        <h2 className="font-semibold mb-3">
          {col}
        </h2>

        {getTasksByStatus(col).map((task) => (
          <div
            key={task.id}
            className="bg-white p-3 mb-3 rounded-lg shadow-sm border"
          >
            <h3 className="font-medium">{task.title}</h3>

            <p className="text-xs text-gray-500 mt-2">
              {task.assignedUser?.name}
            </p>

            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => updateTaskStatus(task.id, "TODO")}
                className="text-xs px-2 py-1 bg-gray-200 rounded"
              >
                To Do
              </button>

              <button
                onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                className="text-xs px-2 py-1 bg-blue-200 rounded"
              >
                In Progress
              </button>

              <button
                onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                className="text-xs px-2 py-1 bg-green-200 rounded"
              >
                Done
              </button>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
</div>


);
}

export default Tasks;
