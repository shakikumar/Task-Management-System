import { useState } from "react";

const INITIAL_TASKS = [
  {
    id: 1,
    title: "Setup project structure",
    status: "To Do",
    priority: "High",
    assignee: "Sarah Chen",
  },
  {
    id: 2,
    title: "Design login page UI",
    status: "In Progress",
    priority: "Medium",
    assignee: "Marcus Webb",
  },
  {
    id: 3,
    title: "Fix sidebar layout bug",
    status: "Completed",
    priority: "Low",
    assignee: "Elena Rodriguez",
  },
];

function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Medium");

  const columns = ["To Do", "In Progress", "Completed"];

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  // ✅ Add Task
  const addTask = () => {
    if (!title || !assignee) return;

    const newTask = {
      id: Date.now(),
      title,
      assignee,
      priority,
      status: "To Do",
    };

    setTasks((prev) => [newTask, ...prev]);

    setTitle("");
    setAssignee("");
    setPriority("Medium");
  };

  // ✅ Move Task (NOW USED IN UI)
  const updateTaskStatus = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tasks Board</h1>

      {/* Add Task Form */}
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col} className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">{col}</h2>

            {getTasksByStatus(col).map((task) => (
              <div
                key={task.id}
                className="bg-white p-3 mb-3 rounded shadow-sm border"
              >
                <h3 className="font-medium">{task.title}</h3>

                <p className="text-xs text-gray-500">{task.assignee}</p>

                <span className="text-xs text-blue-600">
                  {task.priority}
                </span>

                {/* ✅ MOVE BUTTONS (THIS FIXES YOUR WARNING) */}
                <div className="flex gap-2 mt-3 flex-wrap">
  {task.status !== "To Do" && (
    <button
      onClick={() => updateTaskStatus(task.id, "To Do")}
      className="text-xs px-2 py-1 bg-gray-200 rounded"
    >
      To Do
    </button>
  )}

  {task.status !== "In Progress" && (
    <button
      onClick={() => updateTaskStatus(task.id, "In Progress")}
      className="text-xs px-2 py-1 bg-blue-200 rounded"
    >
      In Progress
    </button>
  )}

  {task.status !== "Completed" && (
    <button
      onClick={() => updateTaskStatus(task.id, "Completed")}
      className="text-xs px-2 py-1 bg-green-200 rounded"
    >
      Done
    </button>
  )}
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