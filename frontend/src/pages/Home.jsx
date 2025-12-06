import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const BookOpenIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowUpTrayIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Home() {
  const [stats, setStats] = useState({
    total_books: 0,
    total_members: 0,
    active_borrows: 0,
    overdue_borrows: 0,
    available_books: 0
  });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, borrowsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`),
        fetch(`${API_URL}/api/borrow?returned=false&limit=5`)
      ]);

      if (!statsRes.ok || !borrowsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsRes.json();
      const borrowsData = await borrowsRes.json();

      setStats(statsData);
      setRecentBorrows(borrowsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Books",
      value: stats.total_books,
      icon: BookOpenIcon,
      color: "bg-blue-500",
      link: "/books"
    },
    {
      title: "Active Members",
      value: stats.total_members,
      icon: UserGroupIcon,
      color: "bg-green-500",
      link: "/members"
    },
    {
      title: "Available Books",
      value: stats.available_books,
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
      link: "/books"
    },
    {
      title: "Active Borrows",
      value: stats.active_borrows,
      icon: ArrowUpTrayIcon,
      color: "bg-purple-500",
      link: "/borrow"
    },
    {
      title: "Overdue Books",
      value: stats.overdue_borrows,
      icon: ExclamationTriangleIcon,
      color: "bg-red-500",
      link: "/borrow"
    }
  ];

  const quickActions = [
    { title: "Add New Book", description: "Add a book to your library", link: "/books", color: "bg-blue-100 text-blue-700" },
    { title: "Register Member", description: "Register a new library member", link: "/register", color: "bg-green-100 text-green-700" },
    { title: "Borrow Book", description: "Process a book borrowing", link: "/borrow", color: "bg-purple-100 text-purple-700" },
    { title: "View Members", description: "Browse all library members", link: "/members", color: "bg-orange-100 text-orange-700" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
    
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">LibraTrack Dashboard</h1>
        <p className="text-gray-600">Manage your library efficiently with real-time statistics and quick access</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
      
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={index}
                  to={stat.link}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <Icon />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className={`p-5 rounded-lg border ${action.color} hover:opacity-90 transition`}
                    >
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm opacity-75">{action.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Borrows</h2>
                  <Link to="/borrow" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentBorrows.length > 0 ? (
                    recentBorrows.map((borrow) => (
                      <div key={borrow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{borrow.book?.title}</p>
                          <p className="text-sm text-gray-600">Borrowed by: {borrow.member?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Due: {new Date(borrow.due_date).toLocaleDateString()}
                          </p>
                          {new Date(borrow.due_date) < new Date() && (
                            <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-1">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent borrows</p>
                  )}
                </div>
              </div>
            </div>

          
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Database</span>
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">API Service</span>
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Running</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Books Sync</span>
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                  </div>
                </div>
              </div>

        
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Due Dates</h2>
                <div className="space-y-3">
                  {recentBorrows
                    .filter(borrow => !borrow.returned)
                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                    .slice(0, 3)
                    .map((borrow) => (
                      <div key={borrow.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <ClockIcon />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{borrow.book?.title}</p>
                          <p className="text-xs text-gray-600">
                            Due: {new Date(borrow.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}