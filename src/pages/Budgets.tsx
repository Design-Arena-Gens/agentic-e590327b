import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'

interface Budget {
  id: number
  category: string
  amount: number
  spent: number
  period: 'monthly' | 'weekly'
  startDate: string
  endDate: string
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly',
    startDate: new Date().toISOString().split('T')[0],
  })

  const categories = [
    'Groceries', 'Transportation', 'Utilities', 'Entertainment',
    'Healthcare', 'Shopping', 'Education', 'Other'
  ]

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets/')
      setBudgets(response.data.results)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
      // Mock data
      setBudgets([
        { id: 1, category: 'Groceries', amount: 500, spent: 385.50, period: 'monthly', startDate: '2024-01-01', endDate: '2024-01-31' },
        { id: 2, category: 'Transportation', amount: 200, spent: 145.00, period: 'monthly', startDate: '2024-01-01', endDate: '2024-01-31' },
        { id: 3, category: 'Entertainment', amount: 300, spent: 320.00, period: 'monthly', startDate: '2024-01-01', endDate: '2024-01-31' },
        { id: 4, category: 'Utilities', amount: 150, spent: 120.00, period: 'monthly', startDate: '2024-01-01', endDate: '2024-01-31' },
      ])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/budgets/${editingId}/`, formData)
      } else {
        const newBudget = {
          ...formData,
          id: Date.now(),
          amount: parseFloat(formData.amount),
          spent: 0,
          endDate: calculateEndDate(formData.startDate, formData.period),
        }
        setBudgets([...budgets, newBudget])
      }
      setShowModal(false)
      resetForm()
      fetchBudgets()
    } catch (error) {
      console.error('Failed to save budget:', error)
    }
  }

  const calculateEndDate = (startDate: string, period: 'monthly' | 'weekly') => {
    const date = new Date(startDate)
    if (period === 'monthly') {
      date.setMonth(date.getMonth() + 1)
    } else {
      date.setDate(date.getDate() + 7)
    }
    return date.toISOString().split('T')[0]
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    try {
      await axios.delete(`/api/budgets/${id}/`)
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (error) {
      console.error('Failed to delete budget:', error)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    })
    setEditingId(null)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-2 text-sm text-gray-600">Set and track your spending limits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100
          const isOverBudget = percentage >= 100

          return (
            <div key={budget.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                  <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className={`font-semibold ${getProgressTextColor(percentage)}`}>
                    ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(0)}% used</span>
                  <span>${(budget.amount - budget.spent).toFixed(2)} left</span>
                </div>
              </div>

              {isOverBudget && (
                <div className="mt-4 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Over budget by ${(budget.spent - budget.amount).toFixed(2)}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Period</span>
                  <span>{new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new budget.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingId ? 'Edit Budget' : 'Add Budget'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
