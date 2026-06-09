import { useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Sample Projects                                                          */
/* -------------------------------------------------------------------------- */
const USERS = [
  "Sarah Chen",
  "Marcus Webb",
  "Elena Rodriguez",
  "James Okonkwo",
  "Priya Sharma",
];
const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "Task Management System",
    description: "Build full-stack task management app",
    owner: "Unassigned",
    status: "Active",
    members: 5,
  },
  {
    id: 2,
    name: "Lost & Found Platform",
    description: "Campus-based item tracking system",
    owner: "Unassigned",
    status: "In Progress",
    members: 3,
  },
];

/* -------------------------------------------------------------------------- */

function Projects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    status: "Planning",
  });

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === "Active").length,
    inProgress: projects.filter(p => p.status === "In Progress").length,
    planning: projects.filter(p => p.status === "Planning").length,
  }), [projects]);

  function handleCreate() {
    const newProject = {
      id: Date.now(),
      ...form,
      members: 1,
    };

    setProjects([...projects, newProject]);

    setForm({
      name: "",
      description: "",
      owner: "",
      status: "Planning",
      members: 1,
    });
    setIsOpen(false);
  }

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

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-4 bg-white">
            <h2 className="font-semibold text-lg">{project.name}</h2>
            <p className="text-sm text-gray-500">{project.description}</p>

            <div className="mt-3 text-sm">
              <p>Owner: {project.owner}</p>
              <p>Members: {project.members}</p>
            </div>

            <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 rounded">
              {project.status}
            </span>
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
  {USERS.map((u) => (
    <option key={u} value={u}>
      {u}
    </option>
  ))}
</select>

            <textarea
              placeholder="Description"
              className="w-full border p-2 mb-2 rounded"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

<select
  className="w-full border p-2 mb-2 rounded"
  value={form.owner}
  onChange={(e) => setForm({ ...form, owner: e.target.value })}
>
  <option value="">Select Owner</option>
  <option value="Sarah Chen">Sarah Chen</option>
  <option value="Marcus Webb">Marcus Webb</option>
  <option value="Elena Rodriguez">Elena Rodriguez</option>
  <option value="Priya Sharma">Priya Sharma</option>
</select>

            <select
              className="w-full border p-2 mb-4 rounded"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Planning</option>
              <option>In Progress</option>
              <option>Active</option>
              <option>Completed</option>
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