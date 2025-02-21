import PropTypes from 'prop-types';
import { CheckCircleIcon, XCircleIcon, Edit, Trash2, UserCircle, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CustomerTable = ({ customers, onEdit, onDelete }) => {
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
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Email</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Phone</th>
            <th className="py-3 px-6 text-left font-medium text-sm uppercase tracking-wider border-b border-gray-700">Joined</th>
            <th className="py-3 px-6 text-right font-medium text-sm uppercase tracking-wider border-b border-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-800/50">
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-gray-700/50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 mr-3">
                    {customer.avatar ? (
                      <img 
                        src={customer.avatar} 
                        alt={customer.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{customer.name}</p>
                    <Badge 
                      variant={customer.status === 'active' ? 'success' : 'secondary'}
                      className={`text-xs ${customer.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {customer.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="mr-2">{customer.email}</span>
                  {customer.emailVerified ? (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" title="Email verified" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-rose-500" title="Email not verified" />
                  )}
                </div>
              </td>
              <td className="py-4 px-6 text-sm text-gray-300">{customer.phone}</td>
              <td className="py-4 px-6">
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(customer.joinedAt)}
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={() => onEdit(customer)} 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onDelete(customer.id)} 
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

CustomerTable.propTypes = {
  customers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      emailVerified: PropTypes.bool,
      phone: PropTypes.string.isRequired,
      joinedAt: PropTypes.string.isRequired,
      status: PropTypes.string,
      avatar: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default CustomerTable;