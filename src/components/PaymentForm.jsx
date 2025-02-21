import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PaymentForm = ({ onSubmit, payment, onCancel }) => {
  const [formData, setFormData] = useState({
    id: payment?.id || uuidv4(),
    customerName: payment?.customerName || '',
    transactionId: payment?.transactionId || '',
    amount: payment?.amount || '',
    status: payment?.status || 'pending',
    date: payment?.date || new Date().toISOString(),
  });

  const statusOptions = ['completed', 'pending', 'failed'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, !!payment);
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
          {payment ? 'Edit Payment' : 'Create New Payment'}
        </h2>
        <p className="text-gray-400 text-sm">Fill in the details to {payment ? 'update' : 'create'} your payment record</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-gray-300 font-medium">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <Label htmlFor="transactionId" className="text-gray-300 font-medium">Transaction ID</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter transaction ID"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-gray-300 font-medium">Amount (₹)</Label>
              <Input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-gray-300 font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
                  {statusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-gray-300 font-medium">Date</Label>
              <Input
                type="date"
                id="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 py-6 border-gray-700 bg-slate-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {payment ? 'Update Payment' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  payment: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default PaymentForm;
