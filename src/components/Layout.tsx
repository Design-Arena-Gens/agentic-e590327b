import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, Receipt, Target, TrendingUp, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'AI Insights', path: '/insights', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">SmartFinance AI</h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
