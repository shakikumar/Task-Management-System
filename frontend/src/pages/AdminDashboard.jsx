
/* -------------------------------------------------------------------------- */
/*  Placeholder data — replace with API responses in production               */
/* -------------------------------------------------------------------------- */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";





/* -------------------------------------------------------------------------- */
/*  Shared UI helpers                                                         */
/* -------------------------------------------------------------------------- */

function StatIcon({ type, className }) {
  const icons = {
    users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    projects: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l.12-.7a1.125 1.125 0 011.3-.98l3.036.52a1.125 1.125 0 011.065 1.328l-.332 1.933M15 12.75H9m6 0a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 9.75v.75a2.25 2.25 0 002.25 2.25h6z",
    progress: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    completed: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type]} />
    </svg>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
    "In Review": "bg-violet-50 text-violet-700 ring-violet-600/20",
    PLANNING:
      "bg-slate-100 text-slate-700",

    ACTIVE:
      "bg-green-100 text-green-700",

    IN_PROGRESS:
      "bg-blue-100 text-blue-700",

    COMPLETED:
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] ?? styles.Planning}`}>
      {status}
    </span>
  );
}

function OnlineIndicator({ status }) {
  const colors = {
    online: "bg-emerald-500",
    away: "bg-amber-400",
    offline: "bg-slate-300",
  };

  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${colors[status]}`}
      aria-label={status}
    />
  );
}

function ActivityDot({ type }) {
  const colors = {
    complete: "bg-emerald-500",
    create: "bg-indigo-500",
    upload: "bg-violet-500",
    bug: "bg-red-500",
    deploy: "bg-blue-500",
    assign: "bg-amber-500",
  };

  return <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${colors[type] ?? "bg-slate-400"}`} />;
}

/* -------------------------------------------------------------------------- */
/*  Section components                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, change, trend, icon, accent, bg, text }) {
  return (
    <article className="group rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
          <StatIcon type={icon} className={`h-5 w-5 ${text}`} />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
        >
          {change}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wider text-purple-400 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-800 leading-none">{value}</p>
      <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full bg-purple-50`}>
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${accent} opacity-80 transition-all group-hover:w-3/4`} />
      </div>
    </article>
  );
}

function RecentProjects({ projects, navigate }) {
  return (
    <section className="rounded-2xl border border-purple-100/50 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <header className="flex items-center justify-between border-b border-purple-100/30 px-6 py-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">Recent Projects</h2>
          <p className="text-xs text-slate-500/80">Track progress across active workspaces</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          className="text-xs font-bold text-purple-650 hover:text-purple-700 transition-colors cursor-pointer hover:underline"
        >
          View all projects →
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-purple-100/30 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-purple-700/80">
              <th className="px-6 py-3 font-bold">Project</th>
              <th className="px-6 py-3 text-center font-bold">Status</th>
              <th className="px-6 py-3 text-center font-bold">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100/10">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="transition-colors hover:bg-violet-50/10"
              >
                <td className="px-6 py-4">
                  <p
                    className="font-bold text-slate-800 cursor-pointer hover:text-purple-650 transition-colors"
                    onClick={() => navigate("/admin/projects")}
                  >
                    {project.name}
                  </p>
                </td>

                <td className="px-6 py-4 text-center">
                  <StatusBadge status={project.status?.replaceAll("_", " ")} />
                </td>

                <td className="px-6 py-4 text-center text-slate-500 font-medium">
                  {new Date(project.createdAt).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TeamMembers({ users, navigate }) {
  return (
    <section className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-6">
      <header className="mb-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-slate-800">Team Members</h2>
            <p className="text-xs text-slate-500/80">System Users</p>
          </div>
          <button
            onClick={() => navigate("/admin/users")}
            className="text-xs font-bold text-purple-650 hover:text-purple-700 transition-colors cursor-pointer hover:underline"
          >
            View All Members →
          </button>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.slice(0, 6).map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3.5 rounded-xl border border-purple-100/40 bg-white/60 p-3.5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-purple-500/20">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{user.name}</p>
              <span className="inline-flex items-center mt-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-650 uppercase tracking-wider">
                {user.role?.replaceAll("_", " ")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  AdminDashboard — main page content rendered inside AdminLayout            */
/* -------------------------------------------------------------------------- */
function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  const [projects, setProjects] = useState([]);

  const [pmStats, setPmStats] = useState({
    myProjects: 0,
    myTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });

  const [collabStats, setCollabStats] = useState({
    myTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    highPriorityTasks: 0,
  });

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const isCollaborator =
    currentUser?.role === "COLLABORATOR";

  const role = currentUser?.role;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (currentUser?.role === "COLLABORATOR") {
          const tasksRes = await axios.get(
            "http://localhost:5001/api/tasks",
            getAuthHeader()
          );

          const tasks = tasksRes.data.tasks || [];

          setCollabStats({
            myTasks: tasks.length,
            pendingTasks: tasks.filter(
              (t) => t.status !== "COMPLETED"
            ).length,
            completedTasks: tasks.filter(
              (t) => t.status === "COMPLETED"
            ).length,
            highPriorityTasks: tasks.filter(
              (t) => t.priority === "HIGH"
            ).length,
          });

          return;
        }
        const [usersRes, projectsRes, tasksRes] =
          await Promise.all([
            axios.get(
              "http://localhost:5001/api/users",
              getAuthHeader()
            ),
            axios.get(
              "http://localhost:5001/api/projects",
              getAuthHeader()
            ),
            axios.get(
              "http://localhost:5001/api/tasks",
              getAuthHeader()
            ),
          ]);

        const tasks = tasksRes.data.tasks || [];

        if (currentUser?.role === "PROJECT_MANAGER") {
          const myProjects = (projectsRes.data.projects || []).filter(
            (p) => p.createdById === currentUser.id
          );

          const myProjectIds = myProjects.map(
            (project) => project.id
          );

          const myTasks = tasks.filter(
            (task) => myProjectIds.includes(task.projectId)
          );

          setPmStats({
            myProjects: myProjects.length,
            myTasks: myTasks.length,
            pendingTasks: myTasks.filter(
              (t) =>
                t.status === "TODO" ||
                t.status === "IN_PROGRESS"
            ).length,
            completedTasks: myTasks.filter(
              (t) => t.status === "COMPLETED"
            ).length,
          });
        }

        setUsers(usersRes.data.users || []);
        setStats({
          totalUsers: usersRes.data.count || 0,
          totalProjects: projectsRes.data.count || 0,
          inProgressTasks: tasks.filter(
            (t) => t.status === "IN_PROGRESS"
          ).length,
          completedTasks: tasks.filter(
            (t) => t.status === "COMPLETED"
          ).length,
        });

        setProjects(
          (projectsRes.data.projects || []).slice(0, 5)
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboardData();
  }, []);

  if (role === "PROJECT_MANAGER") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none">
        <header>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/50 text-[#7C3AED] border border-purple-200/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            Project Manager
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome Back, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500/80 mt-1">
            Manage your projects and monitor team progress.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My Projects"
              value={pmStats.myProjects}
              icon="projects"
              bg="bg-violet-100/50"
              text="text-violet-600"
              accent="from-violet-500 to-violet-600"
            />

            <StatCard
              label="My Tasks"
              value={pmStats.myTasks}
              icon="progress"
              bg="bg-indigo-100/50"
              text="text-indigo-600"
              accent="from-indigo-500 to-indigo-600"
            />

            <StatCard
              label="Pending Tasks"
              value={pmStats.pendingTasks}
              icon="progress"
              bg="bg-amber-100/50"
              text="text-amber-600"
              accent="from-amber-500 to-orange-500"
            />

            <StatCard
              label="Completed Tasks"
              value={pmStats.completedTasks}
              icon="completed"
              bg="bg-emerald-100/50"
              text="text-emerald-600"
              accent="from-emerald-500 to-emerald-600"
            />
          </div>
        </section>
      </div>
    );
  }
  
  if (role === "COLLABORATOR") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none">
        <header>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/50 text-[#7C3AED] border border-purple-200/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            Collaborator
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome Back, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500/80 mt-1">
            View and update your assigned tasks.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My Tasks"
              value={collabStats.myTasks}
              icon="projects"
              bg="bg-indigo-100/50"
              text="text-indigo-600"
              accent="from-indigo-500 to-indigo-600"
            />

            <StatCard
              label="Pending Tasks"
              value={collabStats.pendingTasks}
              icon="progress"
              bg="bg-amber-100/50"
              text="text-amber-600"
              accent="from-amber-500 to-orange-500"
            />

            <StatCard
              label="Completed Tasks"
              value={collabStats.completedTasks}
              icon="completed"
              bg="bg-emerald-100/50"
              text="text-emerald-600"
              accent="from-emerald-500 to-emerald-600"
            />

            <StatCard
              label="High Priority"
              value={collabStats.highPriorityTasks}
              icon="users"
              bg="bg-red-100/50"
              text="text-red-600"
              accent="from-red-500 to-red-600"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none">
      {/* Page header */}
      <header>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/50 text-[#7C3AED] border border-purple-200/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
          Overview
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
          Welcome Back, {currentUser?.name}
        </h1>
        <p className="text-sm text-slate-500/80 mt-1">
          Here&apos;s what&apos;s happening across your task management workspace today.
        </p>
      </header>

      {/* Stats overview */}
      <section aria-label="Dashboard statistics">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon="users"
            bg="bg-indigo-100/50"
            text="text-indigo-600"
            accent="from-indigo-500 to-indigo-600"
          />

          <StatCard
            label="Total Projects"
            value={stats.totalProjects}
            icon="projects"
            bg="bg-violet-100/50"
            text="text-violet-600"
            accent="from-violet-500 to-violet-600"
          />

          <StatCard
            label="Tasks In Progress"
            value={stats.inProgressTasks}
            icon="progress"
            bg="bg-amber-100/50"
            text="text-amber-600"
            accent="from-amber-500 to-orange-500"
          />

          <StatCard
            label="Completed Tasks"
            value={stats.completedTasks}
            icon="completed"
            bg="bg-emerald-100/50"
            text="text-emerald-600"
            accent="from-emerald-500 to-emerald-600"
          />
        </div>
      </section>

      {/* Recent projects */}
      <RecentProjects
        projects={projects}
        navigate={navigate}
      />

      {/* Team */}
      <TeamMembers
        users={users}
        navigate={navigate}
      />
    </div>
  );
}

export default AdminDashboard;
