import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import PaymentTable from './PaymentTable';
import { Button } from "@/components/ui/button";
import { Plus, Search, X, CreditCard, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentForm from './PaymentForm'; // You'll need to create this component

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Predefined payment status tabs
  const statusTabs = [
    { id: 'all', label: 'All Payments' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' }
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on search query and selected tab
  useEffect(() => {
    let result = [...payments];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        payment =>
          payment.customerName?.toLowerCase().includes(query) ||
          payment.transactionId?.toLowerCase().includes(query) ||
          payment.amount?.toString().includes(query)
      );
    }

    // Filter by status tab
    if (activeTab !== 'all') {
      result = result.filter(payment => payment.status === activeTab);
    }

    setFilteredPayments(result);
  }, [payments, searchQuery, activeTab]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'payments'));
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'payments', paymentToDelete));
      fetchPayments();
      setIsDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const openDeleteDialog = (paymentId) => {
    setPaymentToDelete(paymentId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData, isEdit) => {
  try {
    if (isEdit && selectedPayment) {
      // Update existing payment
      await updateDoc(doc(db, 'payments', selectedPayment.id), formData);
    } else {
      // Create new payment
      await addDoc(collection(db, 'payments'), formData);
    }
    fetchPayments();
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedPayment(null);
  } catch (error) {
    console.error('Error saving payment:', error);
  }
};

  const handleCancel = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedPayment(null);
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
            <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Payment Management</h1>
            <p className="text-gray-400 mt-1">Manage your payment transactions and information</p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Payment
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
              placeholder="Search by customer name, transaction ID or amount..."
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

            {/* Payment Table Content */}
            {statusTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderPaymentContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Create Payment Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <PaymentForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>

        {/* Edit Payment Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <PaymentForm onSubmit={handleSubmit} payment={selectedPayment} onCancel={handleCancel} />
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
                Are you sure you want to delete this payment? This action cannot be undone.
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
                Delete Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  // Helper function to render payment content
  function renderPaymentContent() {
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

    if (filteredPayments.length === 0) {
      return (
        <Card className="bg-gray-800 border-gray-700 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No matching payments found</h3>
                <p className="text-gray-400 max-w-md mb-6">
                  No payments match your search for &quot;{searchQuery}&quot; in the {activeTab !== 'all' ? statusTabs.find(t => t.id === activeTab)?.label : 'selected'} category.
                </p>
                <Button onClick={clearSearch} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <CreditCard className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  {activeTab !== 'all'
                    ? `No ${statusTabs.find(t => t.id === activeTab)?.label} Payments`
                    : 'No Payments Yet'}
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  {activeTab !== 'all'
                    ? `You don't have any payments in the ${statusTabs.find(t => t.id === activeTab)?.label} category yet.`
                    : 'Start managing your payments by adding your first transaction.'}
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Payment
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
          <PaymentTable
            payments={filteredPayments}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
          />
        </div>
      </div>
    );
  }
};

export default PaymentManagement;
