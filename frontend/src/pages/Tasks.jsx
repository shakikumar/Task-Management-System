import { useState, useEffect } from "react";
import axios from "axios";
import TaskEditModal from "../components/TaskEditModal";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [editingTask, setEditingTask] = useState(null);

  const API_URL = "http://localhost:5001/api/tasks";

  const role = (localStorage.getItem("role") || "").toUpperCase();

  const canEdit = () =>
    role === "ADMIN" || role === "PROJECT_MANAGER";

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API_URL, getAuthHeader());
    if (res.data.success) setTasks(res.data.tasks);
  };

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://localhost:5001/api/users",
      getAuthHeader()
    );
    setUsers(res.data.users);
  };

  const addTask = async () => {
    if (!title || !assignee) return;

    const res = await axios.post(
      API_URL,
      {
        title,
        assignedUserId: assignee,
        priority,
        status: "TODO",
        projectId: "p4444444-4444-4444-4444-444444444444",
      },
      getAuthHeader()
    );

    setTasks([res.data.task, ...tasks]);

    setTitle("");
    setAssignee("");
    setPriority("MEDIUM");
  };

  const updateTask = async (id, data) => {
    const res = await axios.put(
      `${API_URL}/${id}`,
      data,
      getAuthHeader()
    );

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? res.data.task : t))
    );

    setEditingTask(null);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `${API_URL}/${id}`,
      { status },
      getAuthHeader()
    );

    setTasks((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status } : t
      )
    );
  };

  const filteredTasks = (status) =>
    tasks.filter(
      (t) =>
        t.status === status &&
        t.title.toLowerCase().includes(search.toLowerCase())
    );

  const columns = ["TODO", "IN_PROGRESS", "COMPLETED"];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Task Board</h1>

      {/* SEARCH */}
      <input
        className="border p-2 w-full mb-4"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ADD TASK */}
      <div className="mb-6 p-4 border">
        <h2 className="font-bold mb-2">Add Task</h2>

        <input
          className="border p-2 mr-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* ASSIGNEE DROPDOWN */}
        <select
          className="border p-2 mr-2"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 mr-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <button
          disabled={!canEdit()}
          onClick={addTask}
          className="bg-green-600 text-white px-3 py-1"
        >
          Add Task
        </button>
      </div>

      {/* BOARD */}
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col} className="border p-3">
            <h2 className="font-bold mb-2">{col}</h2>

            {filteredTasks(col).map((task) => (
              <div key={task._id} className="border p-2 mb-2">
                <h3>{task.title}</h3>

                <p className="text-sm text-gray-500">
                  {task.assignedUser?.name || "Unassigned"}
                </p>

                {/* STATUS */}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => updateStatus(task._id, "TODO")}>T</button>
                  <button onClick={() => updateStatus(task._id, "IN_PROGRESS")}>P</button>
                  <button onClick={() => updateStatus(task._id, "COMPLETED")}>D</button>
                </div>

                {/* EDIT */}
                {canEdit() && (
                  <button
                    className="mt-2 text-blue-600"
                    onClick={() => setEditingTask(task)}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          users={users}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
        />
      )}
    </div>
  );
}

export default Tasks;