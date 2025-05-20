
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
  user_id?: string; // Changed to string to match Supabase UUID format
}

interface Phone {
  id: number;
  name: string;
  price: number | null;
  description: string | null;
}

interface Service {
  id: number;
  name: string;
  price: number | null;
  description: string | null;
}

interface DataContextType {
  transactions: Transaction[];
  phones: Phone[];
  services: Service[];
  // Added these missing properties for AdminTab.tsx
  phoneModels: { id: number; name: string }[];
  serviceTypes: { id: number; name: string }[];
  addPhoneModel: (name: string) => Promise<boolean>;
  updatePhoneModel: (id: number, name: string) => Promise<boolean>;
  deletePhoneModel: (id: number) => Promise<boolean>;
  addServiceType: (name: string) => Promise<boolean>;
  updateServiceType: (id: number, name: string) => Promise<boolean>;
  deleteServiceType: (id: number) => Promise<boolean>;
  // Original properties
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
  const [phones, setPhones] = useState<Phone[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [phoneModels, setPhoneModels] = useState<{ id: number; name: string }[]>([]);
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchTransactions();
      getPhones();
      getServices();
      fetchPhoneModels();
      fetchServiceTypes();
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

  // Fetch phone models for admin tab
  const fetchPhoneModels = async () => {
    try {
      const { data, error } = await supabase
        .from('phones_597p9_models')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching phone models:', error);
        return;
      }
      
      if (data) {
        setPhoneModels(data);
      }
    } catch (err) {
      console.error('Error fetching phone models:', err);
    }
  };

  // Fetch service types for admin tab
  const fetchServiceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('phones_597p9_services')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching service types:', error);
        return;
      }
      
      if (data) {
        setServiceTypes(data);
      }
    } catch (err) {
      console.error('Error fetching service types:', err);
    }
  };

  // Admin functions for phone models
  const addPhoneModel = async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_models')
        .insert({ name });
        
      if (error) {
        toast.error('Failed to add phone model');
        return false;
      }
      
      fetchPhoneModels(); // Refresh the list
      toast.success('Phone model added successfully');
      return true;
    } catch (err) {
      console.error('Error adding phone model:', err);
      toast.error('An error occurred while adding the phone model');
      return false;
    }
  };

  const updatePhoneModel = async (id: number, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_models')
        .update({ name })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update phone model');
        return false;
      }

      fetchPhoneModels(); // Refresh the list
      toast.success('Phone model updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating phone model:', err);
      toast.error('An error occurred while updating the phone model');
      return false;
    }
  };

  const deletePhoneModel = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_models')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete phone model');
        return false;
      }

      fetchPhoneModels(); // Refresh the list
      toast.success('Phone model deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting phone model:', err);
      toast.error('An error occurred while deleting the phone model');
      return false;
    }
  };

  // Admin functions for service types
  const addServiceType = async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_services')
        .insert({ name });
        
      if (error) {
        toast.error('Failed to add service type');
        return false;
      }
      
      fetchServiceTypes(); // Refresh the list
      toast.success('Service type added successfully');
      return true;
    } catch (err) {
      console.error('Error adding service type:', err);
      toast.error('An error occurred while adding the service type');
      return false;
    }
  };

  const updateServiceType = async (id: number, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_services')
        .update({ name })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update service type');
        return false;
      }

      fetchServiceTypes(); // Refresh the list
      toast.success('Service type updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating service type:', err);
      toast.error('An error occurred while updating the service type');
      return false;
    }
  };

  const deleteServiceType = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('phones_597p9_services')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete service type');
        return false;
      }

      fetchServiceTypes(); // Refresh the list
      toast.success('Service type deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting service type:', err);
      toast.error('An error occurred while deleting the service type');
      return false;
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
        phoneModels,
        serviceTypes,
        addPhoneModel,
        updatePhoneModel,
        deletePhoneModel,
        addServiceType,
        updateServiceType,
        deleteServiceType,
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
