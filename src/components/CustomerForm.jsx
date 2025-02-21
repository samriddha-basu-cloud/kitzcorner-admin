import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CustomerForm = ({ onSubmit, customer, onCancel }) => {
  const [formData, setFormData] = useState({
    customerId: customer?.customerId || uuidv4(),
    email: customer?.email || '',
    emailVerified: customer?.emailVerified || false,
    joinedAt: customer?.joinedAt || new Date().toISOString(),
    name: customer?.name || '',
    phone: customer?.phone || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSubmit(formData, !!customer);
      setLoading(false);
    }, 500);
  };

  return (
    <Card className="max-w-3xl mx-auto bg-gray-900 shadow-xl rounded-xl relative border-gray-800">
      <Button 
        onClick={onCancel} 
        size="icon" 
        className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 p-1 rounded-full z-10"
        aria-label="Close form"
      >
        <X className="h-5 w-5 text-red-600" />
      </Button>
      
      <CardHeader className="pb-2 pt-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          {customer ? 'Edit Customer' : 'Create New Customer'}
        </h2>
        <p className="text-gray-400 text-sm">Manage customer information</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {customer && (
              <div>
                <Label htmlFor="customerId" className="text-gray-300 font-medium">Customer ID</Label>
                <Input 
                  id="customerId" 
                  value={formData.customerId} 
                  disabled
                  className="mt-1 text-gray-500 bg-gray-800/50 border-gray-700 cursor-not-allowed" 
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="name" className="text-gray-300 font-medium">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="customer@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-gray-300 font-medium">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                required 
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="emailVerified"
                checked={formData.emailVerified}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, emailVerified: checked })
                }
              />
              <Label htmlFor="emailVerified" className="text-gray-300 font-medium">
                Email Verified
              </Label>
            </div>
            
            {customer && (
              <div>
                <Label htmlFor="joinedAt" className="text-gray-300 font-medium">Joined Date</Label>
                <Input 
                  id="joinedAt" 
                  type="datetime-local"
                  value={formData.joinedAt ? new Date(formData.joinedAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    joinedAt: e.target.value ? new Date(e.target.value).toISOString() : null 
                  })}
                  className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            )}
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button 
              type="button"
              onClick={onCancel}
              variant="outline" 
              className="flex-1 py-6 border-gray-700 bg-slate-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {customer ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                customer ? 'Update Customer' : 'Create Customer'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

CustomerForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  customer: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default CustomerForm;