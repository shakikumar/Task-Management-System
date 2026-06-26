import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Layers,
  Search,
  MessageSquare,
  Trash2,
  Plus,
  User,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Stat Card Component                                                       */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, icon, bg, text }) {
  return (
    <article className="rounded-2xl border border-purple-100/50 bg-white/85 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <div className={text}>
          {icon}
        </div>
      </div>
      <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setProjects(response.data.projects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${API_BASE_URL}/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setUsers(response.data.users);
        }

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    status: "PLANNING",
  });

  const stats = useMemo(() => ({
    total: projects.length,

    planning: projects.filter(
      p => p.status === "PLANNING"
    ).length,

    inProgress: projects.filter(
      p => p.status === "IN_PROGRESS"
    ).length,

    completed: projects.filter(
      p => p.status === "COMPLETED"
    ).length,

  }), [projects]);

  async function handleCreate() {
    if (!form.name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_BASE_URL}/api/projects`, {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
        ownerId: form.owner
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProjects([response.data.project, ...projects]);

        setForm({
          name: "",
          description: "",
          owner: "",
          status: "PLANNING",
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.response?.data?.message || "Failed to create project.");
    }
  }

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/projects/${projectId}`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? {
                ...project,
                status: newStatus
              }
            : project
        )
      );

    } catch (error) {
      console.log(error);
      alert("Failed to update status");
    }
  };

  async function handleDeleteProject(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(`${API_BASE_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProjects((prev) => prev.filter((project) => project.id !== id));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error.response?.data?.message || "Failed to delete project.");
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-slate-50 to-indigo-50/50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <style>{`
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Workspace</p>

        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-850">Projects Workspace</h1>
            <p className="text-sm text-slate-500/80 mt-1">
              Manage and track all project initiatives.
            </p>
          </div>

          {user?.role === "PROJECT_MANAGER" && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer"
            >
              <Plus size={16} />
              Create Project
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Projects"
          value={stats.total}
          bg="bg-indigo-100/50"
          text="text-indigo-600"
          icon={<Layers size={20} />}
        />

        <StatCard
          label="Planning"
          value={stats.planning}
          bg="bg-yellow-100/50"
          text="text-yellow-600"
          icon={<Briefcase size={20} />}
        />

        <StatCard
          label="In Progress"
          value={stats.inProgress}
          bg="bg-blue-100/50"
          text="text-blue-600"
          icon={<Clock size={20} />}
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          bg="bg-emerald-100/50"
          text="text-emerald-600"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/60 border border-purple-100/85 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/60 border border-purple-100/85 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className="bg-white/95 border border-purple-300 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[280px]"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="truncate">
                  <h2 className="font-bold text-slate-850 text-lg hover:text-violet-600 transition-colors truncate">
                    {project.name}
                  </h2>
                  <p className="text-xs text-slate-500/80 mt-1 line-clamp-2 h-8 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {user?.role === "PROJECT_MANAGER" ? (
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer transition-all shadow-sm ${
                      project.status === "PLANNING"
                        ? "bg-yellow-100 text-yellow-750 border border-yellow-200/50"
                        : project.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-750 border border-blue-200/50"
                        : "bg-emerald-100 text-emerald-750 border border-emerald-200/50"
                    }`}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 shadow-sm ${
                      project.status === "PLANNING"
                        ? "bg-yellow-100 text-yellow-750 border border-yellow-200/50"
                        : project.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-750 border border-blue-200/50"
                        : "bg-emerald-100 text-emerald-750 border border-emerald-200/50"
                    }`}
                  >
                    {project.status === "PLANNING" ? "Planning" : project.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-650">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-purple-400" />
                  <span className="font-semibold text-slate-500">Owner:</span>
                  <span className="text-slate-800 font-semibold">{project.createdBy?.name || "Unassigned"}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1.5 border-t border-purple-50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">Tasks:</span>
                    <span className="text-slate-700 font-bold">{project.totalTasks || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">Members:</span>
                    <span className="text-slate-700 font-bold">{project.membersCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className="font-semibold text-slate-400">Completed:</span>
                    <span className="text-emerald-600 font-bold">{project.completedTasks || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-550 mb-1">
                  <span>Progress</span>
                  <span className="text-violet-600">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-purple-50">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {user?.role === "PROJECT_MANAGER" && (
                <div className="flex justify-end items-center border-t border-purple-50/70 pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-200/60 rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {isOpen && user?.role === "PROJECT_MANAGER" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-purple-100/45 p-8 shadow-2xl relative animate-scale-up">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Create Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">Project Owner</label>
                <select
                  className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                >
                  <option value="">Select Owner</option>
                  {users
                    .filter(u => u.role === "PROJECT_MANAGER")
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">Project Name</label>
                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-purple-600/80 uppercase tracking-wider">Status</label>
                <select
                  className="w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-650 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;