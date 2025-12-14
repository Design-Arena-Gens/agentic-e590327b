import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Receipt, Wallet } from 'lucide-react'

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyChange: number
  transactionCount: number
  budgetUtilization: number
}

interface Transaction {
  id: number
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  description: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyChange: 0,
    transactionCount: 0,
    budgetUtilization: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, categoryRes, trendRes] = await Promise.all([
        axios.get('/api/dashboard/stats/'),
        axios.get('/api/transactions/?limit=5'),
        axios.get('/api/analytics/category-breakdown/'),
        axios.get('/api/analytics/monthly-trend/'),
      ])

      setStats(statsRes.data)
      setRecentTransactions(transactionsRes.data.results)
      setCategoryData(categoryRes.data)
      setTrendData(trendRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use mock data for demo
      setStats({
        totalIncome: 45000,
        totalExpenses: 32500,
        balance: 12500,
        monthlyChange: 8.5,
        transactionCount: 124,
        budgetUtilization: 72,
      })
      setRecentTransactions([
        { id: 1, amount: 85.50, category: 'Groceries', type: 'expense', date: '2024-01-15', description: 'Supermarket' },
        { id: 2, amount: 3000, category: 'Salary', type: 'income', date: '2024-01-14', description: 'Monthly Salary' },
        { id: 3, amount: 45.00, category: 'Transportation', type: 'expense', date: '2024-01-13', description: 'Gas' },
        { id: 4, amount: 120.00, category: 'Utilities', type: 'expense', date: '2024-01-12', description: 'Electricity Bill' },
        { id: 5, amount: 200.00, category: 'Entertainment', type: 'expense', date: '2024-01-11', description: 'Concert Tickets' },
      ])
      setCategoryData([
        { name: 'Groceries', value: 450 },
        { name: 'Transportation', value: 280 },
        { name: 'Utilities', value: 320 },
        { name: 'Entertainment', value: 200 },
        { name: 'Shopping', value: 380 },
        { name: 'Healthcare', value: 150 },
      ])
      setTrendData([
        { month: 'Jul', income: 4200, expenses: 3200 },
        { month: 'Aug', income: 4500, expenses: 3400 },
        { month: 'Sep', income: 4100, expenses: 3100 },
        { month: 'Oct', income: 4800, expenses: 3600 },
        { month: 'Nov', income: 4600, expenses: 3300 },
        { month: 'Dec', income: 5000, expenses: 3500 },
      ])
    }
  }

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Overview of your financial health</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                <dd className="text-2xl font-semibold text-gray-900">${stats.totalIncome.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                <dd className="text-2xl font-semibold text-gray-900">${stats.totalExpenses.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Current Balance</dt>
                <dd className="text-2xl font-semibold text-gray-900">${stats.balance.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.transactionCount}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
