
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionTab from './tabs/TransactionTab';
import RecordsTab from './tabs/RecordsTab';
import DebtsTab from './tabs/DebtsTab';
import AdminTab from './tabs/AdminTab';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Phone Sales Manager</h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="transaction">
            <TransactionTab />
          </TabsContent>
          <TabsContent value="records">
            <RecordsTab />
          </TabsContent>
          <TabsContent value="debts">
            <DebtsTab />
          </TabsContent>
          <TabsContent value="admin">
            <AdminTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;
