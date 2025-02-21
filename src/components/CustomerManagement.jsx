import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import CustomerTable from './CustomerTable';
import { Button } from "@/components/ui/button";
import { Plus, Search, X, Users, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerForm from './CustomerForm'; // You'll need to create this component

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Predefined customer status tabs
  const statusTabs = [
    { id: 'all', label: 'All Customers' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'verified', label: 'Verified' },
    { id: 'unverified', label: 'Unverified' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search query and selected tab
  useEffect(() => {
    let result = [...customers];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        customer => 
          customer.name?.toLowerCase().includes(query) || 
          customer.email?.toLowerCase().includes(query) ||
          customer.phone?.includes(query)
      );
    }
    
    // Filter by status tab
    if (activeTab !== 'all') {
      if (activeTab === 'verified') {
        result = result.filter(customer => customer.emailVerified);
      } else if (activeTab === 'unverified') {
        result = result.filter(customer => !customer.emailVerified);
      } else if (activeTab === 'active') {
        result = result.filter(customer => customer.status === 'active');
      } else if (activeTab === 'inactive') {
        result = result.filter(customer => customer.status === 'inactive');
      }
    }
    
    setFilteredCustomers(result);
  }, [customers, searchQuery, activeTab]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'customers'));
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'customers', customerToDelete));
      fetchCustomers();
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const openDeleteDialog = (customerId) => {
    setCustomerToDelete(customerId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      if (isEdit && selectedCustomer) {
        await updateDoc(doc(db, 'customers', selectedCustomer.id), formData);
      } else {
        // For create functionality, you'll need to implement addDoc
      }
      fetchCustomers();
      setIsCreateOpen(false);
      setIsEditOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 pt-40 md:pt-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Customer Management</h1>
            <p className="text-gray-400 mt-1">Manage your customer accounts and information</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>

        {/* Search and Status Tabs */}
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, email or phone..."
              className="pl-10 pr-10 py-2 bg-gray-800 border-gray-700 text-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-700 mb-6 overflow-x-auto">
              <TabsList className="bg-transparent h-auto p-0 space-x-2">
                {statusTabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow py-2 px-4 rounded-t-lg text-gray-400 hover:text-gray-200 transition-all border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {/* Customer Table Content */}
            {statusTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderCustomerContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Create Customer Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <CustomerForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <CustomerForm onSubmit={handleSubmit} customer={selectedCustomer} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this customer? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Customer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
  
  // Helper function to render customer content
  function renderCustomerContent() {
    if (isLoading) {
      return (
        <Card className="bg-gray-800 border-gray-700 animate-pulse p-6">
          <div className="h-6 w-3/4 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-700 rounded w-full"></div>
          </div>
        </Card>
      );
    }
    
    if (filteredCustomers.length === 0) {
      return (
        <Card className="bg-gray-800 border-gray-700 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No matching customers found</h3>
                <p className="text-gray-400 max-w-md mb-6">
                  No customers match your search for &quot;{searchQuery}&quot; in the {activeTab !== 'all' ? statusTabs.find(t => t.id === activeTab)?.label : 'selected'} category.
                </p>
                <Button onClick={clearSearch} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Users className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  {activeTab !== 'all' 
                    ? `No ${statusTabs.find(t => t.id === activeTab)?.label} Customers`
                    : 'No Customers Yet'}
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  {activeTab !== 'all'
                    ? `You don't have any customers in the ${statusTabs.find(t => t.id === activeTab)?.label} category yet.`
                    : 'Start building your customer database by adding your first customer.'}
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Customer
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg blur-md bg-blue-500/30"></div>
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-1 rounded-lg shadow-lg">
          <CustomerTable 
            customers={filteredCustomers} 
            onEdit={handleEdit} 
            onDelete={openDeleteDialog}
          />
        </div>
      </div>
    );
  }
};

export default CustomerManagement;