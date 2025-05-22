import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionTab from './tabs/TransactionTab';
import RecordsTab from './tabs/RecordsTab';
import DebtsTab from './tabs/DebtsTab';
import AdminTab from './tabs/AdminTab';

const Layout: React.FC = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="mb-4 text-xl font-bold">Please log in to access the app.</h2>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => loginWithRedirect()}
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold" style={{ color: '#FF5733' }}>Kelvin's Place Gadget</h1>
          </div>
          <div>
            <span className="mr-4">{user?.name}</span>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
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
