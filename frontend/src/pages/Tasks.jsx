import { useState, useEffect } from "react";
import axios from "axios";
import TaskDetailsModal from "../components/TaskDetailsModal";




function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);


  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
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
    dueDate
  },
  getAuthHeader()
);

      setTasks((prev) => [res.data.task, ...prev]);

      setTitle("");
      setAssignee("");
      setPriority("Medium");
      setDueDate("");
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] to-[#EEF2FF] text-slate-800 p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      <style>{`
        .clay-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 28px;
          box-shadow: 
            20px 20px 40px rgba(124, 58, 237, 0.04),
            inset -6px -6px 12px rgba(124, 58, 237, 0.03),
            inset 6px 6px 12px rgba(255, 255, 255, 0.9),
            0px 10px 30px -5px rgba(124, 58, 237, 0.05);
        }
        .clay-task-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(124, 58, 237, 0.22);
          border-radius: 22px;
          box-shadow: 
            8px 8px 20px rgba(124, 58, 237, 0.02),
            inset -4px -4px 8px rgba(124, 58, 237, 0.01),
            inset 4px 4px 8px rgba(255, 255, 255, 0.9);
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .clay-task-card:hover {
          border-color: rgba(124, 58, 237, 0.5);
          box-shadow: 
            8px 12px 24px rgba(124, 58, 237, 0.06),
            inset -4px -4px 8px rgba(124, 58, 237, 0.01),
            inset 4px 4px 8px rgba(255, 255, 255, 0.9);
        }
        .clay-input {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(124, 58, 237, 0.15);
          border-radius: 16px;
          box-shadow: 
            inset 2px 2px 5px rgba(124, 58, 237, 0.04),
            inset -2px -2px 5px rgba(255, 255, 255, 0.8);
        }
        .clay-button-green {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0px 6px 16px rgba(16, 185, 129, 0.2),
            inset -3px -3px 6px rgba(0, 0, 0, 0.1),
            inset 3px 3px 6px rgba(255, 255, 255, 0.3);
        }
        .shadow-soft-lg {
          box-shadow: 
            25px 25px 50px rgba(124, 58, 237, 0.06),
            inset -8px -8px 16px rgba(124, 58, 237, 0.04),
            inset 8px 8px 16px rgba(255, 255, 255, 0.9);
        }
      `}</style>

      {/* Decorative Glow Blobs */}
      <div className="w-[30rem] h-[30rem] bg-gradient-to-tr from-purple-200/20 to-violet-300/20 rounded-full blur-[100px] absolute -top-40 -right-40 pointer-events-none" />
      <div className="w-[30rem] h-[30rem] bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-[100px] absolute -bottom-40 -left-40 pointer-events-none" />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Tasks Board</h1>
        <p className="text-sm text-slate-500/80 mt-1">Manage project pipelines, monitor status cards, and collaborate on comments.</p>
      </header>

      {/* Add Task Form */}
      {currentUser?.role === "PROJECT_MANAGER" && (
        <div className="clay-card p-6 border border-purple-100/40 shadow-soft-lg mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 pointer-events-none" />
          <h2 className="font-bold text-slate-850 text-base mb-4 relative z-10">Add New Task</h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
            <input
              className="clay-input px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer"
            >
              <option value="">Select Assignee</option>
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
              className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer"
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
              className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer"
              min={new Date().toISOString().split("T")[0]}
            />          

            <button
              onClick={addTask}
              className="clay-button-green hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0 text-white font-bold rounded-2xl px-4 py-2.5 text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex gap-4 mb-8 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="clay-input px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all w-full sm:w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="clay-input px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer min-w-[140px]"
        >
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {columns.map((col) => (
          <div
            key={col}
            className="clay-card p-5 border border-purple-100/30 flex flex-col space-y-4 min-h-[550px]"
          >
            <h2 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase flex justify-between items-center mb-1">
              <span>{col === "TODO" ? "To Do" : col === "IN_PROGRESS" ? "In Progress" : "Completed"}</span>

              <span className="bg-white/95 border border-purple-100 px-2.5 py-0.5 rounded-full text-xs font-bold text-purple-600 shadow-sm">
                {getTasksByStatus(col).length}
              </span>
            </h2>

            <div className="flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[700px] pr-1">
              {getTasksByStatus(col).length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400/80 text-xs mt-12 py-10 border border-dashed border-purple-200/30 rounded-2xl bg-white/20 select-none">
                  <span>📭</span>
                  <span className="mt-1 font-medium">No tasks in this stage</span>
                </div>
              ) : (
                getTasksByStatus(col).map((task) => (
                  <div
                    key={task.id}
                    className="clay-task-card p-4 hover:bg-white hover:border-purple-200/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex flex-col space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">
                        {task.title}
                      </h3>
                      {currentUser?.role === "ADMINISTRATOR" ? (
                        <span
                          className={`
                            text-[10px] px-2 py-0.5 rounded-full font-bold border
                            ${task.status === "TODO"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : task.status === "IN_PROGRESS"
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }
                          `}
                        >
                          {task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                        </span>
                      ) : (
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatus(
                              task.id,
                              e.target.value
                            )
                          }
                          className={`
                            text-[10px] px-2 py-0.5 rounded-full font-bold border border-transparent cursor-pointer focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all
                            ${task.status === "TODO"
                              ? "bg-slate-100 text-slate-700 border-slate-200/60"
                              : task.status === "IN_PROGRESS"
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200/60"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200/60"
                            }
                          `}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-purple-100/30 pt-2.5">
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="text-purple-400">👤</span> {task.assignedUser?.name || "Unassigned"}
                      </p>

                      <p className="text-[11px] text-indigo-500/90 font-medium flex items-center gap-1.5">
                        <span className="text-indigo-400">📁</span> {task.project?.name || "General"}
                      </p>

                      {task.dueDate && (
                        <p className="text-[11px] text-amber-600/90 font-medium flex items-center gap-1.5">
                          <span className="text-amber-500">📅</span> Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-purple-100/30 pt-2.5 flex-wrap">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <div className="flex gap-1.5 items-center">
                        {currentUser?.role !== "ADMINISTRATOR" && (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-[10px] px-2.5 py-1 font-semibold text-indigo-700 bg-indigo-100/70 border border-indigo-200/30 hover:bg-indigo-200/70 rounded-xl transition-all duration-200"
                          >
                            💬 Comments
                          </button>
                        )}
                        {currentUser?.role === "PROJECT_MANAGER" && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-[10px] px-2.5 py-1 font-semibold text-red-700 bg-red-100/70 border border-red-200/30 hover:bg-red-200/70 rounded-xl transition-all duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default Tasks;