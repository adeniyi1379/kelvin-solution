
import React from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const DebtsTab = () => {
  const { transactions, updateTransactionStatus } = useData();
  
  const unpaidTransactions = transactions.filter(
    (transaction) => !transaction.isPaid
  );
  
  const totalDebt = unpaidTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const handleMarkAsPaid = (id: string) => {
    updateTransactionStatus(id, true);
  };

  return (
    <>
      <div className="mb-6">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Total Outstanding Debt</h3>
          <p className="text-3xl font-bold text-red-600">${totalDebt.toFixed(2)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unpaid Transactions</CardTitle>
          <CardDescription>Review and manage unpaid transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Phone Model</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidTransactions.length > 0 ? (
                  unpaidTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{transaction.phoneName}</TableCell>
                      <TableCell>{transaction.serviceType}</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={transaction.description}>
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(transaction.id)}
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Mark as Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No unpaid transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DebtsTab;
