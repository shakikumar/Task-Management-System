import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  Users as UsersIcon,
  Briefcase,
  UserRound,
  Loader2
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Users Page (API-ready structure)                                          */
/* -------------------------------------------------------------------------- */



const ROLE_OPTIONS = [
  { value: "All Roles", label: "All Roles" },
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "COLLABORATOR", label: "Collaborator" },
];


/* -------------------------------------------------------------------------- */
/*  Badges                                                                   */
/* -------------------------------------------------------------------------- */

function RoleBadge({ role }) {
  const styles = {
    ADMINISTRATOR:
      "bg-violet-100 text-violet-700 border border-violet-200/50 shadow-sm",
    PROJECT_MANAGER:
      "bg-indigo-100 text-indigo-700 border border-indigo-200/50 shadow-sm",
    COLLABORATOR:
      "bg-slate-100 text-slate-700 border border-slate-200/50 shadow-sm",
  };

  const labels = {
    ADMINISTRATOR: "Administrator",
    PROJECT_MANAGER: "Project Manager",
    COLLABORATOR: "Collaborator",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}



/* -------------------------------------------------------------------------- */
/*  Stat Card                                                               */
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

/* -------------------------------------------------------------------------- */
/*  Users Page                                                              */
/* -------------------------------------------------------------------------- */

function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "COLLABORATOR",
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "All Roles" || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,

    managers: users.filter(
      u => u.role === "PROJECT_MANAGER"
    ).length,

    collaborators: users.filter(
      u => u.role === "COLLABORATOR"
    ).length,

  }), [users]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE_URL}/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsers();

    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${id}`,
        {
          role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await fetchUsers();
      }

    } catch (error) {
      console.error(error);
      alert("Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <p className="text-xs font-semibold tracking-wider text-purple-500 uppercase">Administration</p>

        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-850">User Management</h1>
            <p className="text-sm text-slate-500/80 mt-1">
              Manage users, roles, and access permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer"
          >
            Add User
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

        <StatCard
          label="Total Users"
          value={stats.total}
          bg="bg-indigo-100/50"
          text="text-indigo-600"
          icon={<UsersIcon size={22} />}
        />

        <StatCard label="Managers" value={stats.managers} bg="bg-violet-100/50" text="text-violet-600"
          icon={<Briefcase size={22} />} />

        <StatCard label="Collaborators" value={stats.collaborators} bg="bg-slate-100/80" text="text-slate-600"
          icon={<UserRound size={22} />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="bg-white/60 border border-purple-100/85 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all w-full"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/60 border border-purple-100/85 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer min-w-[160px]"
        >
          {ROLE_OPTIONS.map((role) => (
            <option
              key={role.value}
              value={role.value}
            >
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/95 border border-purple-100/50 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-purple-100/40 bg-slate-50/50 text-purple-700/85 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Projects</th>
              <th className="p-4 font-semibold">Last Active</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-purple-100/20 hover:bg-violet-50/20 transition-colors">
                <td className="p-4 text-slate-700 font-semibold">{u.name}</td>
                <td className="p-4"><RoleBadge role={u.role} /></td>
                <td className="p-4 text-slate-500 font-semibold">{u.assignedProjects}</td>
                <td className="p-4 text-slate-500 font-medium">
                  {u.lastActive
                    ? new Date(u.lastActive).toLocaleString()
                    : "-"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">

                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      disabled={isSubmitting}
                      aria-label={`Delete ${u.name}`}
                      className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SINGLE MODAL ONLY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/25 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-purple-100/45 p-8 shadow-2xl relative animate-scale-up">

            <h2 className="text-2xl font-black text-slate-800 mb-6">Add User</h2>

            <input
              className="w-full mb-4 bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Name"
              value={formData.name}
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              className="w-full mb-4 bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Email"
              value={formData.email}
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <select
              className="w-full mb-6 bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.role}
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="ADMINISTRATOR">
                Administrator
              </option>

              <option value="PROJECT_MANAGER">
                Project Manager
              </option>

              <option value="COLLABORATOR">
                Collaborator
              </option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-slate-200 text-slate-650 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting}
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const token = localStorage.getItem("token");

                    const response = await axios.post(
                      `${API_BASE_URL}/api/users`,
                      {
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (response.data.success) {
                      await fetchUsers();

                      setFormData({
                        name: "",
                        email: "",
                        role: "COLLABORATOR",
                      });

                      setIsModalOpen(false);
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Failed to create user");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-[0_6px_16px_rgba(124,58,237,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Users;