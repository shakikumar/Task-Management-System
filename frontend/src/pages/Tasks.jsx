import { useState, useEffect } from "react";
import axios from "axios";

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

  // ----------------------------
  // LOAD TASKS FROM BACKEND
  // ----------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        console.log("TASKS FROM BACKEND:", res.data);
  
        if (res.data.success) {
         setTasks(res.data.tasks);
        }
      } catch (error) {
        console.log("BACKEND ERROR:", error.response?.data || error.message);
      }
    };
  
    fetchTasks();
  }, []);

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  // ----------------------------
  // ADD TASK (LOCAL FOR NOW)
  // ----------------------------
  const addTask = async () => {
    if (!title || !assignee) return;
  
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
  };

  // ----------------------------
  // UPDATE STATUS (LOCAL FOR NOW)
  // ----------------------------
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
          <div
            key={col}
            className="bg-slate-100 p-4 rounded-xl min-h-[500px] border shadow-sm"
          >
            <h2 className="font-semibold mb-3 flex justify-between items-center">
              <span>{col}</span>

              <span className="bg-white px-2 py-1 rounded-full text-xs border">
                {getTasksByStatus(col).length}
              </span>
            </h2>

            {getTasksByStatus(col).length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-6">
                No tasks
              </div>
            ) : (
              getTasksByStatus(col).map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 mb-3 rounded-lg shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.title}</h3>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>

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

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {task.status !== "To Do" && (
                      <button
                        onClick={() =>
                          updateTaskStatus(task.id, "TODO")
                        }
                        className="text-xs px-2 py-1 bg-gray-200 rounded"
                      >
                        To Do
                      </button>
                    )}

                    {task.status !== "In Progress" && (
                      <button
                        onClick={() =>
                          updateTaskStatus(task.id, "IN_PROGRESS")
                        }
                        className="text-xs px-2 py-1 bg-blue-200 rounded"
                      >
                        In Progress
                      </button>
                    )}

                    {task.status !== "Completed" && (
                      <button
                        onClick={() =>
                          updateTaskStatus(task.id, "COMPLETED")
                        }
                        className="text-xs px-2 py-1 bg-green-200 rounded"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;