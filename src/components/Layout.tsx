
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionTab from './tabs/TransactionTab';
import RecordsTab from './tabs/RecordsTab';
import DebtsTab from './tabs/DebtsTab';
import AdminTab from './tabs/AdminTab';

const Layout: React.FC = () => {
  const { logout, isAdmin, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Phone Sales Manager</h1>
            {currentUser && (
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{currentUser.username}</span>
                <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {currentUser.role}
                </span>
              </span>
            )}
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
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
          {isAdmin && (
            <TabsContent value="admin">
              <AdminTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;
