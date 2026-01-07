'use client';

import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';
import { useLoyaltyTransactions } from '@/hooks/useLoyalty';

export default function PointsHistory() {
  const { getTransactions, loading } = useLoyaltyTransactions();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [page]);

  const loadTransactions = async () => {
    try {
      const result = await getTransactions(page, 10);
      setTransactions(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No transaction history yet</p>
        <p className="text-gray-400 text-sm mt-2">Start earning points by placing orders!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Points History</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'EARNED'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'EARNED' ? (
                  <ArrowUpCircle size={20} className="text-green-600" />
                ) : (
                  <ArrowDownCircle size={20} className="text-red-600" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${
                transaction.type === 'EARNED'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points}
              </p>
              <p className="text-xs text-gray-500">
                Balance: {transaction.balanceAfter}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
