import PropTypes from 'prop-types';
import {  Edit, Trash2, CreditCard, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PaymentTable = ({ payments, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100">
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Customer</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Transaction ID</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Amount</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Status</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Date</th>
            <th className="py-3 px-6 text-right font-medium text-sm uppercase tracking-wider border-b border-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-800/50">
          {payments.map(payment => (
            <tr key={payment.id} className="hover:bg-gray-700/50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 mr-3">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{payment.customerName}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-sm text-gray-300">{payment.transactionId}</td>
              <td className="py-4 px-6 text-sm text-gray-300">₹{payment.amount}</td>
              <td className="py-4 px-6">
                <Badge
                  variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'error'}
                  className={`text-xs ${payment.status === 'completed' ? 'bg-green-900/30 text-green-400' : payment.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}
                >
                  {payment.status || 'Unknown'}
                </Badge>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(payment.date)}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => onEdit(payment)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(payment.id)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-600 hover:border-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

PaymentTable.propTypes = {
  payments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      transactionId: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      status: PropTypes.string,
      date: PropTypes.string.isRequired
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default PaymentTable;
