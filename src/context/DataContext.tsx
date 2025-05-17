import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  phoneName: string;
  serviceType: string;
  amount: number;
  isPaid: boolean;
  description: string;
  date: string;
  user_id?: string;
}

export interface PhoneModel {
  id: string;
  name: string;
}

export interface ServiceType {
  id: string;
  name: string;
}

interface DataContextType {
  transactions: Transaction[];
  phoneModels: PhoneModel[];
  serviceTypes: ServiceType[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'user_id'>) => void;
  updateTransactionStatus: (id: string, isPaid: boolean) => void;
  addPhoneModel: (name: string) => void;
  updatePhoneModel: (id: string, name: string) => void;
  deletePhoneModel: (id: string) => void;
  addServiceType: (name: string) => void;
  updateServiceType: (id: string, name: string) => void;
  deleteServiceType: (id: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const { currentUser, isAuthenticated } = useAuth();

  // Load data when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const fetchData = async () => {
      try {
        // Fetch transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*');

        if (transactionError) {
          toast.error(`Error loading transactions: ${transactionError.message}`);
        } else if (transactionData) {
          // Convert the data to match our Transaction interface
          const formattedTransactions: Transaction[] = transactionData.map((item: any) => ({
            id: item.id.toString(),
            phoneName: item.phoneName,
            serviceType: item.serviceType,
            amount: Number(item.amount),
            isPaid: item.isPaid === 'true' || item.isPaid === true,
            description: item.description,
            date: item.date,
            user_id: item.user_id || currentUser.id
          }));
          setTransactions(formattedTransactions);
        }

        // Fetch phone models
        const { data: phoneData, error: phoneError } = await supabase
          .from('phone_models')
          .select('*');

        if (phoneError) {
          toast.error(`Error loading phone models: ${phoneError.message}`);
        } else if (phoneData) {
          // Convert the data to match our PhoneModel interface
          const formattedPhoneModels: PhoneModel[] = phoneData.map((item: any) => ({
            id: item.id.toString(),
            name: item.name
          }));
          setPhoneModels(formattedPhoneModels);
        }

        // Fetch service types
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_types')
          .select('*');

        if (serviceError) {
          toast.error(`Error loading service types: ${serviceError.message}`);
        } else if (serviceData) {
          // Convert the data to match our ServiceType interface
          const formattedServiceTypes: ServiceType[] = serviceData.map((item: any) => ({
            id: item.id.toString(),
            name: item.name
          }));
          setServiceTypes(formattedServiceTypes);
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'user_id'>) => {
    if (!currentUser) return;

    const newTransaction = {
      ...transaction,
      isPaid: String(transaction.isPaid), // Convert boolean to string for the database
      date: new Date().toISOString(),
      user_id: currentUser.id
    };
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select();

      if (error) {
        toast.error(`Failed to add transaction: ${error.message}`);
        return;
      }
      
      if (data && data[0]) {
        const formattedTransaction: Transaction = {
          id: data[0].id.toString(),
          phoneName: data[0].phoneName,
          serviceType: data[0].serviceType,
          amount: Number(data[0].amount),
          isPaid: data[0].isPaid === 'true' || data[0].isPaid === true,
          description: data[0].description,
          date: data[0].date,
          user_id: data[0].user_id || currentUser.id
        };
        setTransactions([...transactions, formattedTransaction]);
        toast.success('Transaction added successfully');
      }
    } catch (error) {
      toast.error('Failed to add transaction');
      console.error(error);
    }
  };

  const updateTransactionStatus = async (id: string, isPaid: boolean) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ isPaid: String(isPaid) }) // Convert boolean to string
        .eq('id', id);

      if (error) {
        toast.error(`Failed to update transaction: ${error.message}`);
        return;
      }
      
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === id ? { ...transaction, isPaid } : transaction
      );
      setTransactions(updatedTransactions);
      toast.success('Transaction status updated');
    } catch (error) {
      toast.error('Failed to update transaction status');
      console.error(error);
    }
  };

  const addPhoneModel = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('phone_models')
        .insert({ name })
        .select();

      if (error) {
        toast.error(`Failed to add phone model: ${error.message}`);
        return;
      }
      
      if (data && data[0]) {
        const newPhoneModel: PhoneModel = {
          id: data[0].id.toString(),
          name: data[0].name
        };
        setPhoneModels([...phoneModels, newPhoneModel]);
        toast.success('Phone model added');
      }
    } catch (error) {
      toast.error('Failed to add phone model');
      console.error(error);
    }
  };

  const updatePhoneModel = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('phone_models')
        .update({ name })
        .eq('id', id);

      if (error) {
        toast.error(`Failed to update phone model: ${error.message}`);
        return;
      }
      
      const updatedPhoneModels = phoneModels.map(model => 
        model.id === id ? { ...model, name } : model
      );
      setPhoneModels(updatedPhoneModels);
      toast.success('Phone model updated');
    } catch (error) {
      toast.error('Failed to update phone model');
      console.error(error);
    }
  };

  const deletePhoneModel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('phone_models')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Failed to delete phone model: ${error.message}`);
        return;
      }
      
      setPhoneModels(phoneModels.filter(model => model.id !== id));
      toast.success('Phone model deleted');
    } catch (error) {
      toast.error('Failed to delete phone model');
      console.error(error);
    }
  };

  const addServiceType = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .insert({ name })
        .select();

      if (error) {
        toast.error(`Failed to add service type: ${error.message}`);
        return;
      }
      
      if (data && data[0]) {
        const newServiceType: ServiceType = {
          id: data[0].id.toString(),
          name: data[0].name
        };
        setServiceTypes([...serviceTypes, newServiceType]);
        toast.success('Service type added');
      }
    } catch (error) {
      toast.error('Failed to add service type');
      console.error(error);
    }
  };

  const updateServiceType = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('service_types')
        .update({ name })
        .eq('id', id);

      if (error) {
        toast.error(`Failed to update service type: ${error.message}`);
        return;
      }
      
      const updatedServiceTypes = serviceTypes.map(type => 
        type.id === id ? { ...type, name } : type
      );
      setServiceTypes(updatedServiceTypes);
      toast.success('Service type updated');
    } catch (error) {
      toast.error('Failed to update service type');
      console.error(error);
    }
  };

  const deleteServiceType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Failed to delete service type: ${error.message}`);
        return;
      }
      
      setServiceTypes(serviceTypes.filter(type => type.id !== id));
      toast.success('Service type deleted');
    } catch (error) {
      toast.error('Failed to delete service type');
      console.error(error);
    }
  };

  const value = {
    transactions,
    phoneModels,
    serviceTypes,
    addTransaction,
    updateTransactionStatus,
    addPhoneModel,
    updatePhoneModel,
    deletePhoneModel,
    addServiceType,
    updateServiceType,
    deleteServiceType
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
