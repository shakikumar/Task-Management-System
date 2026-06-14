import { useMemo, useState, useEffect } from "react";
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*  Users Page (API-ready structure)                                          */
/* -------------------------------------------------------------------------- */



const ROLE_OPTIONS = [
  { value: "All Roles", label: "All Roles" },
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "COLLABORATOR", label: "Collaborator" },
];
const USER_ROLES = [
  "ADMINISTRATOR",
  "PROJECT_MANAGER",
  "COLLABORATOR"
];

/* -------------------------------------------------------------------------- */
/*  Badges                                                                   */
/* -------------------------------------------------------------------------- */

function RoleBadge({ role }) {

  const styles = {
    ADMINISTRATOR:
      "bg-violet-50 text-violet-700 ring-violet-600/20",

    PROJECT_MANAGER:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20",

    COLLABORATOR:
      "bg-slate-100 text-slate-700 ring-slate-500/20",
  };

  const labels = {
    ADMINISTRATOR: "Administrator",
    PROJECT_MANAGER: "Project Manager",
    COLLABORATOR: "Collaborator",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
    Invited: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                               */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, icon, bg, text }) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        <svg className={`h-5 w-5 ${text}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "COLLABORATOR",
  });
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5001/api/users",
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

    active: users.filter(
      u => u.isActive === true
    ).length,

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
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5001/api/users/${id}`,
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
    }
  };

  const handleRoleChange = async (id, role) => {
    try {

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5001/api/users/${id}`,
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
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-medium text-indigo-600">Administration</p>

        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">
              Manage users, roles, and access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Add User
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.total} bg="bg-indigo-50" text="text-indigo-600"
          icon="" />

        <StatCard label="Active Users" value={stats.active} bg="bg-emerald-50" text="text-emerald-600"
          icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0" />

        <StatCard label="Managers" value={stats.managers} bg="bg-violet-50" text="text-violet-600"
          icon="M15 19.128a9.38 9.38 0 002.625.372A9.337 9.337 0 0021 12c0-4.97-4.03-9-9-9s-9 4.03-9 9a9.337 9.337 0 003.375 7.5"/>

        <StatCard label="Collaborators" value={stats.collaborators} bg="bg-slate-100" text="text-slate-600"
          icon="M18 18.72a9.094 9.094 0 003.742-.479A3 3 0 0018 15.75h-1.5"
 />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="border rounded-lg px-3 py-2 w-full"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
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
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b bg-slate-50">
            <tr>
              <th className="p-3">User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Projects</th>
              <th>Last Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{u.name}</td>
                <td><RoleBadge role={u.role} /></td>
                <td>
                  <StatusBadge
                    status={u.isActive ? "Active" : "Inactive"}
                  />
                </td>
                <td>{u.assignedProjects}</td>
                <td>
                  {u.lastActive
                    ? new Date(u.lastActive).toLocaleString()
                    : "-"}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      aria-label={`Change role for ${u.name}`}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      aria-label={`Delete ${u.name}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-bold mb-4">Add User</h2>

            <input
              className="w-full mb-3 border rounded-lg px-3 py-2"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              className="w-full mb-3 border rounded-lg px-3 py-2"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <select
              className="w-full mb-4 border rounded-lg px-3 py-2"
              value={formData.role}
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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");

                    const response = await axios.post(
                      "http://localhost:5001/api/users",
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
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Users;