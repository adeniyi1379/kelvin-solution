import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

const RecordsTab = () => {
  const { transactions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.phoneName.toLowerCase().includes(searchLower) ||
      transaction.serviceType.toLowerCase().includes(searchLower) ||
      (transaction.clientName && transaction.clientName.toLowerCase().includes(searchLower)) ||
      transaction.description.toLowerCase().includes(searchLower)
    );
  });

  // Sort transactions by date descending (latest first) - fixed type issue
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / PAGE_SIZE);
  const paginatedTransactions = sortedTransactions.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  // Reset to first page when search changes
  React.useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Records</CardTitle>
        <CardDescription>View all transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Phone Model</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.clientName || 'N/A'}</TableCell>
                    <TableCell>{transaction.phoneName}</TableCell>
                    <TableCell>{transaction.serviceType}</TableCell>
                    <TableCell>#{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    {searchTerm ? 'No transactions match your search' : 'No transactions recorded yet'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={page === 0}
          >
            &larr; Previous
          </button>
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={page >= totalPages - 1}
          >
            Next &rarr;
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordsTab;
