
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const TransactionTab = () => {
  const { phones, services, addTransaction } = useData();
  
  const [phoneName, setPhoneName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTransaction({
      phoneName,
      serviceType,
      amount: parseFloat(amount),
      isPaid,
      description
    });
    
    // Clear form
    setPhoneName('');
    setServiceType('');
    setAmount('');
    setIsPaid(false);
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
        <CardDescription>Record a new phone sale or service transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phoneName">Phone Model</Label>
              <Select 
                value={phoneName} 
                onValueChange={setPhoneName}
                required
              >
                <SelectTrigger id="phoneName">
                  <SelectValue placeholder="Select a phone model" />
                </SelectTrigger>
                <SelectContent>
                  {phones.map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select 
                value={serviceType} 
                onValueChange={setServiceType}
                required
              >
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-4 pt-8">
              <Switch
                id="paid-status"
                checked={isPaid}
                onCheckedChange={setIsPaid}
              />
              <Label htmlFor="paid-status">
                Payment Status: <span className={isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">Save Transaction</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionTab;
