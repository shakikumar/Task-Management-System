import { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // Ensure axios is imported

/* -------------------------------------------------------------------------- */
/*  Sample Projects      no need                                                    */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */

function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/projects', {
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
          'http://localhost:5001/api/users',
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    status: "PLANNING",
  });

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === "ACTIVE").length,

    inProgress: projects.filter(
      p => p.status === "IN_PROGRESS"
    ).length,

    planning: projects.filter(
      p => p.status === "PLANNING"
    ).length,
  }), [projects]);

  // REPLACE YOUR ENTIRE OLD handleCreate FUNCTION WITH THIS ONE:
  async function handleCreate() {
    if (!form.name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // HTTP POST request to store project permanently in Supabase
      const response = await axios.post('http://localhost:5001/api/projects', {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
        ownerId: form.owner
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Append the newly saved database project to frontend state
        setProjects([response.data.project, ...projects]);

        // Reset form controls
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
const handleStatusChange = async (
  projectId,
  newStatus
) => {
  try {
    const token =
      localStorage.getItem("token");

    await axios.put(
      `http://localhost:5001/api/projects/${projectId}`,
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
   
   
  
  // REPLACE YOUR OLD handleDeleteProject FUNCTION WITH THIS ONE:
  async function handleDeleteProject(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');

      // HTTP DELETE request to remove project rows from database
      const response = await axios.delete(`http://localhost:5001/api/projects/${id}`, {
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
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects Workspace</h1>
          <p className="text-gray-500">Manage and track all project initiatives</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="p-4 border rounded-lg bg-white">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">{stats.active}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <p className="text-sm text-gray-500">Planning</p>
          <p className="text-xl font-bold text-yellow-600">{stats.planning}</p>
        </div>

      </div>
      <div className="flex gap-3 mb-6">

        <input
          type="text"
          placeholder="Search project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>

      </div>

      {/* Projects */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {filteredProjects.map(project => (
          <div
  key={project.id}
  className="border rounded-lg p-4 bg-white h-[280px] flex flex-col justify-between"
>
            <div className="flex justify-between items-start">
  <div>
    <h2 className="font-semibold text-lg">
      {project.name}
    </h2>

    <p className="text-sm text-gray-500">
      {project.description}
    </p>
  </div>

  <select
  value={project.status}
  onChange={(e) =>
    handleStatusChange(
      project.id,
      e.target.value
    )
  }
  className={`
    text-xs font-medium rounded px-2 py-1 border-0 outline-none cursor-pointer

    ${project.status === "PLANNING"
      ? "bg-yellow-100 text-yellow-700"
      : project.status === "IN_PROGRESS"
      ? "bg-blue-100 text-blue-700"
      : project.status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : "bg-emerald-100 text-emerald-700"
    }
  `}
>
  <option value="PLANNING">
    Planning
  </option>

  <option value="IN_PROGRESS">
    In Progress
  </option>

  <option value="ACTIVE">
    Active
  </option>

  <option value="COMPLETED">
    Completed
  </option>
</select>
</div>
<div className="mt-4 space-y-2 text-sm">

  <p>
    <span className="font-semibold">Owner:</span> {project.createdBy?.name}
  </p>

  <div className="grid grid-cols-2 gap-y-1 text-gray-700">
    <p>Tasks: {project.totalTasks}</p>
   <p>
    Members: {project.membersCount}
  </p>

    <p>Completed: {project.completedTasks}</p>
  </div>

  <div className="mt-3">
    <div className="flex justify-between text-xs mb-1">
      <span>Progress</span>
      <span>{project.progress}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full"
        style={{ width: `${project.progress}%` }}
      />
    </div>
  </div>

</div>
<div className="mt-4 flex justify-between border-t pt-3">

  

  <button
    className="text-purple-600 text-sm"
  >
    💬 Comments
  </button>

  <button
    onClick={() => handleDeleteProject(project.id)}
    className="text-red-600 text-sm"
  >
    🗑 Delete
  </button>

</div>
            
          </div>
        ))}

      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-lg font-bold mb-4">Create Project</h2>

            <select
              className="w-full border p-2 mb-2 rounded"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            >
              <option value="">Select Owner</option>
              {users
                .filter(user => user.role === "PROJECT_MANAGER")
                .map(user => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Project Name"
              className="w-full border p-2 mb-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border p-2 mb-2 rounded"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />



            <select
              className="w-full border p-2 mb-4 rounded"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
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