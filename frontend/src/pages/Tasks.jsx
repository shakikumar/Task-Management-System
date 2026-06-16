import { useState, useEffect } from "react";
import axios from "axios";



function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const isCollaborator =
    currentUser?.role === "COLLABORATOR";


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

        if (res.data.success) {
          setTasks(res.data.tasks);
        }
      } catch (error) {
        
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/projects",
          getAuthHeader()
        );

        if (res.data.success) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/users",
          getAuthHeader()
        );

        if (res.data.success) {
          console.log(users);
          setUsers(res.data.users);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch =
      task.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      task.status === statusFilter;

    const matchesPriority =
      !priorityFilter ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  const getTasksByStatus = (status) =>
    filteredTasks.filter(
      (task) => task.status === status
    );

  // ----------------------------
  // ADD TASK (LOCAL FOR NOW)
  // ----------------------------
  const addTask = async () => {
    if (!title || !selectedProject || !selectedUser) {
      alert("Please select project and user");
      return;
    }

    try {
      const res = await axios.post(
        API_URL,
        {
          title,
          projectId: selectedProject,
          assignedUserId: selectedUser,
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
      console.log("FULL ERROR:", error.response?.data);
    }
  };

  // ----------------------------
  // UPDATE STATUS (LOCAL FOR NOW)
  // ----------------------------
  const updateTaskStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `${API_URL}/${id}`,
        {
          status: newStatus
        },
        getAuthHeader()
      );

      if (res.data.success) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id
              ? res.data.task
              : task
          )
        );
      }

    } catch (error) {
      
    }
  };

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${API_URL}/${id}`,
        getAuthHeader()
      );

      if (res.data.success) {
        setTasks((prev) =>
          prev.filter((task) => task.id !== id)
        );
      }

    } catch (error) {
      
    }
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
      {!isCollaborator && (
        <div className="mb-6 bg-white p-4 rounded shadow-sm border">
          <h2 className="font-semibold mb-3">Add New Task</h2>

          <div className="flex gap-2 flex-wrap">
            <input
              className="border p-2 rounded"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select User</option>

              {users
                .filter(user => user.role === "COLLABORATOR")
                .map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name}
                  </option>
                ))}
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Project</option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>

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
      )}

      <div className="flex gap-3 mb-6 flex-wrap">

        <input
          type="text"
          placeholder="Search task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

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
                    👤 {task.assignedUser?.name}
                  </p>

                  <p className="text-xs text-blue-600">
                    📁 {task.project?.name}
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
                    {!isCollaborator && (
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
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