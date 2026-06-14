
/* -------------------------------------------------------------------------- */
/*  Placeholder data — replace with API responses in production               */
/* -------------------------------------------------------------------------- */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const STATS = [
  {
    label: "Total Users",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: "users",
    accent: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    label: "Active Projects",
    value: "48",
    change: "+4 this month",
    trend: "up",
    icon: "projects",
    accent: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    label: "Tasks In Progress",
    value: "326",
    change: "−8% vs last week",
    trend: "down",
    icon: "progress",
    accent: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    label: "Completed Tasks",
    value: "1,892",
    change: "+18.2%",
    trend: "up",
    icon: "completed",
    accent: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
];

const RECENT_PROJECTS = [
  {
    id: 1,
    name: "Mobile App Redesign",
    team: "Product Design",
    status: "In Progress",
    progress: 68,
    dueDate: "Jun 15, 2026",
    priority: "High",
  },
  {
    id: 2,
    name: "API Gateway Migration",
    team: "Platform Engineering",
    status: "In Review",
    progress: 92,
    dueDate: "Jun 8, 2026",
    priority: "Critical",
  },
  {
    id: 3,
    name: "Customer Portal v2",
    team: "Frontend",
    status: "In Progress",
    progress: 45,
    dueDate: "Jul 2, 2026",
    priority: "Medium",
  },
  {
    id: 4,
    name: "Q2 Marketing Campaign",
    team: "Marketing",
    status: "Planning",
    progress: 22,
    dueDate: "Jun 30, 2026",
    priority: "Low",
  },
  {
    id: 5,
    name: "Security Audit Remediation",
    team: "DevOps",
    status: "In Progress",
    progress: 74,
    dueDate: "Jun 12, 2026",
    priority: "Critical",
  },
];

const TEAM_MEMBERS = [
  { id: 1, name: "Sarah Chen", role: "Project Manager", initials: "SC", status: "online", tasks: 12, department: "Operations" },
  { id: 2, name: "Marcus Webb", role: "Senior Developer", initials: "MW", status: "online", tasks: 8, department: "Engineering" },
  { id: 3, name: "Elena Rodriguez", role: "UX Designer", initials: "ER", status: "away", tasks: 6, department: "Design" },
  { id: 4, name: "James Okonkwo", role: "QA Lead", initials: "JO", status: "offline", tasks: 15, department: "Quality" },
  { id: 5, name: "Priya Sharma", role: "DevOps Engineer", initials: "PS", status: "online", tasks: 9, department: "Infrastructure" },
  { id: 6, name: "Alex Morgan", role: "Product Owner", initials: "AM", status: "online", tasks: 4, department: "Product" },
];


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
    <article className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg}`}>
          <StatIcon type={icon} className={`h-5 w-5 ${text}`} />
        </div>
        <span
          className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-amber-600"}`}
        >
          {change}
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <div className={`mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100`}>
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${accent} opacity-80 transition-all group-hover:w-3/4`} />
      </div>
    </article>
  );
}

function RecentProjects({ projects, navigate }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Projects</h2>
          <p className="text-sm text-slate-500">Track progress across active workspaces</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          className="mt-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:mt-0"
        >
          View all projects →
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-[75%]">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="w-[50%] px-6 py-3">
                Project
              </th>

              <th className="w-[25%] px-6 py-3 text-center">
                Status
              </th>

              <th className="w-[25%] px-6 py-3 text-center">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="w-[50%] px-6 py-4">
                  <p
                    className="font-semibold text-slate-900 cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate("/admin/projects")}
                  >
                    {project.name}
                  </p>
                </td>


                <td className="w-[25%] px-6 py-4 text-center">
                  <StatusBadge status={project.status?.replaceAll("_", " ")} />
                </td>

                <td className="w-[25%] px-6 py-4 text-center">
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

function TeamMembers({ users }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Team Members
        </h2>
        <p className="text-sm text-slate-500">
          System Users
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {users.slice(0, 6).map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="font-medium">
                {user.name}
              </p>

              <p className="text-sm text-gray-500">
                {user.role?.replaceAll("_", " ")}
              </p>
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

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const navigate = useNavigate();


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {

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

        console.log("USERS:", usersRes.data);
        console.log("PROJECTS:", projectsRes.data);
        console.log("TASKS:", tasksRes.data);

        const tasks = tasksRes.data.tasks || [];
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
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-medium text-indigo-600">Overview</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Good morning, Admin
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Here&apos;s what&apos;s happening across your task management workspace today.
        </p>
      </header>

      {/* Stats overview */}
      <section aria-label="Dashboard statistics" className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon="users"
            bg="bg-indigo-50"
            text="text-indigo-600"
            accent="from-indigo-500 to-indigo-600"
          />

          <StatCard
            label="Total Projects"
            value={stats.totalProjects}
            icon="projects"
            bg="bg-violet-50"
            text="text-violet-600"
            accent="from-violet-500 to-violet-600"
          />

          <StatCard
            label="Tasks In Progress"
            value={stats.inProgressTasks}
            icon="progress"
            bg="bg-amber-50"
            text="text-amber-600"
            accent="from-amber-500 to-orange-500"
          />

          <StatCard
            label="Completed Tasks"
            value={stats.completedTasks}
            icon="completed"
            bg="bg-emerald-50"
            text="text-emerald-600"
            accent="from-emerald-500 to-emerald-600"
          />
        </div>
      </section>

      {/* Recent projects — full width */}
      <div className="mb-6 sm:mb-8">
        <RecentProjects
          projects={projects}
          navigate={navigate}
        />
      </div>

      {/* Team + Activity — two-column on large screens */}
      <div className="grid grid-cols-1 gap-6">
        <TeamMembers users={users} />

        {/* Activity Timeline
<div className="bg-white rounded-2xl border p-6">
 ...
</div>
*/}
      </div>
    </div>
  );
}

export default AdminDashboard;
