
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardAnalytics from './tabs/DashboardAnalytics';
import TransactionTab from './tabs/TransactionTab';
import RecordsTab from './tabs/RecordsTab';
import DebtsTab from './tabs/DebtsTab';
import AdminTab from './tabs/AdminTab';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';

const Layout: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="IMG_5261.PNG" alt="Logo" className="h-40 w-auto" />
        
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold" style={{ color: '#FF5733' }}>Kelvin's Place Gadget</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2">{currentUser?.username}</span>
            <ThemeToggle />
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => logout()}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className={`grid w-full mb-8 ${isAdmin ? 'grid-cols-5' : 'grid-cols-1'}`}>
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="records">Records</TabsTrigger>
                <TabsTrigger value="debts">Debts</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="transaction">
            <TransactionTab />
          </TabsContent>
          {isAdmin && (
            <>
              <TabsContent value="records">
                <RecordsTab />
              </TabsContent>
              <TabsContent value="debts">
                <DebtsTab />
              </TabsContent>
              <TabsContent value="dashboard">
                <DashboardAnalytics />
              </TabsContent>
              <TabsContent value="admin">
                <AdminTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;
