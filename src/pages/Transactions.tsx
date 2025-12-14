import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

interface Transaction {
  id: number
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  description: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const categories = [
    'Salary', 'Freelance', 'Investment', 'Other Income',
    'Groceries', 'Transportation', 'Utilities', 'Entertainment',
    'Healthcare', 'Shopping', 'Education', 'Other Expense'
  ]

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions/')
      setTransactions(response.data.results)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      // Mock data for demo
      setTransactions([
        { id: 1, amount: 3000, category: 'Salary', type: 'income', date: '2024-01-14', description: 'Monthly Salary' },
        { id: 2, amount: 85.50, category: 'Groceries', type: 'expense', date: '2024-01-15', description: 'Supermarket' },
        { id: 3, amount: 45.00, category: 'Transportation', type: 'expense', date: '2024-01-13', description: 'Gas' },
        { id: 4, amount: 120.00, category: 'Utilities', type: 'expense', date: '2024-01-12', description: 'Electricity Bill' },
        { id: 5, amount: 200.00, category: 'Entertainment', type: 'expense', date: '2024-01-11', description: 'Concert Tickets' },
        { id: 6, amount: 500.00, category: 'Freelance', type: 'income', date: '2024-01-10', description: 'Web Design Project' },
      ])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/transactions/${editingId}/`, formData)
      } else {
        const newTransaction = {
          ...formData,
          id: Date.now(),
          amount: parseFloat(formData.amount),
        }
        setTransactions([newTransaction, ...transactions])
      }
      setShowModal(false)
      resetForm()
      fetchTransactions()
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await axios.delete(`/api/transactions/${id}/`)
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormData({
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      description: '',
    })
    setEditingId(null)
  }

  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingId ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
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
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
