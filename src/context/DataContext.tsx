
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  phoneName: string;
  serviceType: string;
  amount: number;
  isPaid: boolean;
  description: string;
  date: string;
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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransactionStatus: (id: string, isPaid: boolean) => void;
  addPhoneModel: (name: string) => void;
  updatePhoneModel: (id: string, name: string) => void;
  deletePhoneModel: (id: string) => void;
  addServiceType: (name: string) => void;
  updateServiceType: (id: string, name: string) => void;
  deleteServiceType: (id: string) => void;
}

const defaultPhoneModels: PhoneModel[] = [
  { id: '1', name: 'iPhone 13' },
  { id: '2', name: 'Samsung Galaxy S21' },
  { id: '3', name: 'Google Pixel 6' },
];

const defaultServiceTypes: ServiceType[] = [
  { id: '1', name: 'New Purchase' },
  { id: '2', name: 'Screen Repair' },
  { id: '3', name: 'Battery Replacement' },
];

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    phoneName: 'iPhone 13',
    serviceType: 'New Purchase',
    amount: 999,
    isPaid: true,
    description: 'New phone purchase',
    date: new Date().toISOString()
  },
  {
    id: '2',
    phoneName: 'Samsung Galaxy S21',
    serviceType: 'Screen Repair',
    amount: 250,
    isPaid: false,
    description: 'Cracked screen repair',
    date: new Date().toISOString()
  }
];

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    // Load data from localStorage or use defaults
    const storedTransactions = localStorage.getItem('phone_sales_transactions');
    const storedPhoneModels = localStorage.getItem('phone_sales_phone_models');
    const storedServiceTypes = localStorage.getItem('phone_sales_service_types');

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions(defaultTransactions);
      localStorage.setItem('phone_sales_transactions', JSON.stringify(defaultTransactions));
    }

    if (storedPhoneModels) {
      setPhoneModels(JSON.parse(storedPhoneModels));
    } else {
      setPhoneModels(defaultPhoneModels);
      localStorage.setItem('phone_sales_phone_models', JSON.stringify(defaultPhoneModels));
    }

    if (storedServiceTypes) {
      setServiceTypes(JSON.parse(storedServiceTypes));
    } else {
      setServiceTypes(defaultServiceTypes);
      localStorage.setItem('phone_sales_service_types', JSON.stringify(defaultServiceTypes));
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('phone_sales_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (phoneModels.length > 0) {
      localStorage.setItem('phone_sales_phone_models', JSON.stringify(phoneModels));
    }
  }, [phoneModels]);

  useEffect(() => {
    if (serviceTypes.length > 0) {
      localStorage.setItem('phone_sales_service_types', JSON.stringify(serviceTypes));
    }
  }, [serviceTypes]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date().toISOString()
    };
    
    setTransactions([...transactions, newTransaction]);
    toast.success('Transaction added successfully');
  };

  const updateTransactionStatus = (id: string, isPaid: boolean) => {
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === id ? { ...transaction, isPaid } : transaction
    );
    setTransactions(updatedTransactions);
    toast.success('Transaction status updated');
  };

  const addPhoneModel = (name: string) => {
    const newPhoneModel: PhoneModel = {
      id: uuidv4(),
      name
    };
    setPhoneModels([...phoneModels, newPhoneModel]);
    toast.success('Phone model added');
  };

  const updatePhoneModel = (id: string, name: string) => {
    const updatedPhoneModels = phoneModels.map(model => 
      model.id === id ? { ...model, name } : model
    );
    setPhoneModels(updatedPhoneModels);
    toast.success('Phone model updated');
  };

  const deletePhoneModel = (id: string) => {
    setPhoneModels(phoneModels.filter(model => model.id !== id));
    toast.success('Phone model deleted');
  };

  const addServiceType = (name: string) => {
    const newServiceType: ServiceType = {
      id: uuidv4(),
      name
    };
    setServiceTypes([...serviceTypes, newServiceType]);
    toast.success('Service type added');
  };

  const updateServiceType = (id: string, name: string) => {
    const updatedServiceTypes = serviceTypes.map(type => 
      type.id === id ? { ...type, name } : type
    );
    setServiceTypes(updatedServiceTypes);
    toast.success('Service type updated');
  };

  const deleteServiceType = (id: string) => {
    setServiceTypes(serviceTypes.filter(type => type.id !== id));
    toast.success('Service type deleted');
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
