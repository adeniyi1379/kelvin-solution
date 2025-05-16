
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/context/AuthContext';

const AdminTab = () => {
  return (
    <Tabs defaultValue="phoneModels">
      <TabsList className="mb-6">
        <TabsTrigger value="phoneModels">Phone Models</TabsTrigger>
        <TabsTrigger value="serviceTypes">Service Types</TabsTrigger>
        <TabsTrigger value="userManagement">User Management</TabsTrigger>
      </TabsList>
      
      <TabsContent value="phoneModels">
        <PhoneModelsSection />
      </TabsContent>
      
      <TabsContent value="serviceTypes">
        <ServiceTypesSection />
      </TabsContent>
      
      <TabsContent value="userManagement">
        <UserManagementSection />
      </TabsContent>
    </Tabs>
  );
};

const PhoneModelsSection = () => {
  const { phoneModels, addPhoneModel, updatePhoneModel, deletePhoneModel } = useData();
  const [newPhoneModel, setNewPhoneModel] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddPhoneModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhoneModel.trim()) {
      addPhoneModel(newPhoneModel.trim());
      setNewPhoneModel('');
    }
  };

  const handleEditStart = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editId && editName.trim()) {
      updatePhoneModel(editId, editName.trim());
      setIsEditDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Models Management</CardTitle>
        <CardDescription>Add, edit or remove phone models</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddPhoneModel} className="flex space-x-2 mb-6">
          <Input
            placeholder="Enter phone model name"
            value={newPhoneModel}
            onChange={(e) => setNewPhoneModel(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Add Phone Model</Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Model</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phoneModels.length > 0 ? (
                phoneModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditStart(model.id, model.name)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deletePhoneModel(model.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                    No phone models available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Phone Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone-model">Phone Model Name</Label>
                <Input
                  id="edit-phone-model"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <Button onClick={handleEditSave} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const ServiceTypesSection = () => {
  const { serviceTypes, addServiceType, updateServiceType, deleteServiceType } = useData();
  const [newServiceType, setNewServiceType] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddServiceType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceType.trim()) {
      addServiceType(newServiceType.trim());
      setNewServiceType('');
    }
  };

  const handleEditStart = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editId && editName.trim()) {
      updateServiceType(editId, editName.trim());
      setIsEditDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Types Management</CardTitle>
        <CardDescription>Add, edit or remove service types</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddServiceType} className="flex space-x-2 mb-6">
          <Input
            placeholder="Enter service type name"
            value={newServiceType}
            onChange={(e) => setNewServiceType(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Add Service Type</Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.length > 0 ? (
                serviceTypes.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditStart(service.id, service.name)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteServiceType(service.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                    No service types available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-type">Service Type Name</Label>
                <Input
                  id="edit-service-type"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <Button onClick={handleEditSave} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const UserManagementSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  
  // Load users from localStorage
  React.useEffect(() => {
    const storedUsers = localStorage.getItem('phone_sales_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      const newUser: User = {
        id: Date.now().toString(),
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('phone_sales_users', JSON.stringify(updatedUsers));
      
      // Clear form
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
    }
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('phone_sales_users', JSON.stringify(updatedUsers));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Add or remove system users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddUser} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Add User</Button>
            </div>
          </div>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                    No users available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTab;
