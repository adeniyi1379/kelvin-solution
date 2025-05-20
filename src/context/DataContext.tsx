
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Transaction {
  id: number;
  phoneName: string;
  serviceType: string;
  amount: number;
  isPaid: boolean;
  description: string;
  date: string;
  user_id?: string; // Changed from number to string
}

interface DataContextType {
  transactions: Transaction[];
  phones: { id: number; name: string; price: number | null; description: string | null }[];
  services: { id: number; name: string; price: number | null; description: string | null }[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<boolean>;
  updateTransactionStatus: (id: number, isPaid: boolean) => Promise<boolean>;
  getPhones: () => Promise<void>;
  getServices: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [phones, setPhones] = useState<{ id: number; name: string; price: number | null; description: string | null }[]>([]);
  const [services, setServices] = useState<{ id: number; name: string; price: number | null; description: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchTransactions();
      getPhones();
      getServices();
    }
  }, [isAuthenticated, currentUser]);

  const fetchTransactions = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        setError(error.message);
        toast.error('Failed to fetch transactions');
        return;
      }
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          phoneName: item.phoneName,
          serviceType: item.serviceType,
          amount: Number(item.amount),
          // Convert to boolean
          isPaid: typeof item.isPaid === 'string' ? item.isPaid === 'true' : Boolean(item.isPaid),
          description: item.description,
          date: item.date,
          user_id: currentUser?.id
        }));
        
        setTransactions(formattedData);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getPhones = async () => {
    try {
      const { data, error } = await supabase
        .from('phones_597p9_models')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching phones:', error);
        return;
      }
      
      if (data) {
        setPhones(data);
      }
    } catch (err) {
      console.error('Error fetching phones:', err);
    }
  };

  const getServices = async () => {
    try {
      const { data, error } = await supabase
        .from('phones_597p9_services')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching services:', error);
        return;
      }
      
      if (data) {
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<boolean> => {
    if (!currentUser) return false;
    
    setLoading(true);
    
    try {
      const newTransaction = {
        phoneName: transaction.phoneName,
        serviceType: transaction.serviceType,
        amount: transaction.amount,
        isPaid: transaction.isPaid, // Boolean value
        description: transaction.description,
        date: new Date().toISOString(),
        user_id: currentUser.id
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select();
        
      if (error) {
        toast.error('Failed to add transaction');
        return false;
      }
      
      if (data && data.length > 0) {
        // Map the returned data to our Transaction interface
        const newTrans: Transaction = {
          id: data[0].id,
          phoneName: data[0].phoneName,
          serviceType: data[0].serviceType,
          amount: Number(data[0].amount),
          isPaid: typeof data[0].isPaid === 'string' ? data[0].isPaid === 'true' : Boolean(data[0].isPaid),
          description: data[0].description,
          date: data[0].date,
          user_id: currentUser.id
        };
        
        setTransactions([newTrans, ...transactions]);
        toast.success('Transaction added successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('An error occurred while adding the transaction');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (id: number, isPaid: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ isPaid }) // Boolean value
        .eq('id', id);

      if (error) {
        toast.error('Failed to update transaction status');
        return false;
      }

      // Update local state
      setTransactions(
        transactions.map(t => 
          t.id === id ? { ...t, isPaid } : t
        )
      );
      
      toast.success('Transaction status updated');
      return true;
    } catch (err) {
      console.error('Error updating transaction status:', err);
      toast.error('An error occurred while updating the transaction');
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        phones,
        services,
        addTransaction,
        updateTransactionStatus,
        getPhones,
        getServices,
        loading,
        error
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
