import { useState, useEffect } from 'react';
import { collection, getDocs, doc as firestoreDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import OrdersCard from './OrdersCard';
import OrdersTweak from './OrdersTweak';
import { Button } from "@/components/ui/button";
import { Search, X, CreditCard } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Received', label: 'Received' },
    { id: 'Dispatched', label: 'Dispatched' },
    { id: 'Delivered', label: 'Delivered' },
    { id: 'Cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order =>
          order.customerName?.toLowerCase().includes(query) ||
          order.orderStatus?.toLowerCase().includes(query)
      );
    }

    if (activeTab !== 'all') {
      result = result.filter(order => order.orderStatus === activeTab);
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, activeTab]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const order = { id: doc.id, ...doc.data() };

        // Fetch the customer document using the customerId
        const customerDocRef = firestoreDoc(db, 'customers', order.customerId);
        const customerDoc = await getDoc(customerDocRef);

        // Check if the customer document exists
        if (customerDoc.exists()) {
          return { ...order, customerName: customerDoc.data().name };
        } else {
          console.warn(`Customer document not found for ID: ${order.customerId}`);
          return { ...order, customerName: 'Unknown Customer' };
        }
      }));
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (order) => {
  setSelectedOrder(order);
  setIsEditOpen(true);
};


  const handleSubmit = async (formData) => {
    try {
      await updateDoc(firestoreDoc(db, 'orders', selectedOrder.id), formData);
      fetchOrders();
      setIsEditOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setSelectedOrder(null);
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
            <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Orders Management</h1>
            <p className="text-gray-400 mt-1">Manage your orders and their statuses</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by customer name or order status..."
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

            {statusTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderOrdersContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <OrdersTweak onSubmit={handleSubmit} order={selectedOrder} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  function renderOrdersContent() {
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

    if (filteredOrders.length === 0) {
      return (
        <Card className="bg-gray-800 border-gray-700 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No matching orders found</h3>
                <p className="text-gray-400 max-w-md mb-6">
                  No orders match your search for &quot;{searchQuery}&quot; in the {activeTab !== 'all' ? statusTabs.find(t => t.id === activeTab)?.label : 'selected'} category.
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
                    ? `No ${statusTabs.find(t => t.id === activeTab)?.label} Orders`
                    : 'No Orders Yet'}
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  {activeTab !== 'all'
                    ? `You don't have any orders in the ${statusTabs.find(t => t.id === activeTab)?.label} category yet.`
                    : 'Start managing your orders by adding your first transaction.'}
                </p>
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
          {filteredOrders.map(order => (
            <OrdersCard key={order.id} order={order} onEdit={handleEdit} />
          ))}
        </div>
      </div>
    );
  }
};

export default OrdersManagement;