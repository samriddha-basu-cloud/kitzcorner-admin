import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Package,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  ShoppingBag
} from 'lucide-react';
import PropTypes from 'prop-types';

const OrdersCard = ({ order, onEdit }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const getStatusStyles = (status) => {
    const baseStyles = "relative";
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseStyles} bg-orange-500/10 text-orange-500 after:content-[''] after:absolute after:w-full after:h-full after:animate-ping after:bg-orange-500/40 after:rounded-full after:-z-10`;
      case 'received':
        return `${baseStyles} bg-blue-200/10 text-blue-200`;
      case 'dispatched':
        return `${baseStyles} bg-yellow-500/10 text-yellow-500`;
      case 'delivered':
        return `${baseStyles} bg-green-500/10 text-green-500`;
      case 'cancelled':
        return `${baseStyles} bg-red-500/10 text-red-500 animate-pulse`;
      default:
        return `${baseStyles} bg-gray-500/10 text-gray-500`;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'make payment':
        return 'bg-orange-500/10 text-orange-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'bg-purple-500/10 text-purple-500';
      case 'complete':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4 shadow-xl rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {order.customerName}
            </h2>
          </div>
          <Button
            onClick={() => onEdit(order)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Delivery Status:</span>
            <Badge variant="outline" className={order.orderDelivered ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
              {order.orderDelivered ?
                <CheckCircle className="h-4 w-4 mr-1" /> :
                <XCircle className="h-4 w-4 mr-1" />
              }
              {order.orderDelivered ? 'Delivered' : 'Not Delivered'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Placed At:</span>
            <span className="text-gray-300">{formatTimestamp(order.orderPlacedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Order Status:</span>
            <Badge variant="outline" className={getStatusStyles(order.orderStatus)}>
              {order.orderStatus}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Payment Status:</span>
            <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          </div>

          {order.refund && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">Refund Status:</span>
              <Badge variant="outline" className={getRefundStatusColor(order.refund)}>
                {order.refund}
              </Badge>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Product Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.productDetails.map((product, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4 shadow-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-gray-200 font-medium mb-2">{product.name}</h4>
                <div className="space-y-1">
                  <p className="text-gray-400 flex justify-between">
                    <span>Price:</span>
                    <span className="text-gray-200">₹{product.price}</span>
                  </p>
                  <p className="text-gray-400 flex justify-between">
                    <span>Quantity:</span>
                    <span className="text-gray-200">{product.quantity}</span>
                  </p>
                  <p className="text-gray-400 flex justify-between">
                    <span>Discount:</span>
                    <span className="text-gray-200">{product.discount}%</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="bg-gray-700/50 rounded-lg px-6 py-3">
            <p className="text-gray-200 text-lg font-semibold flex items-center gap-2">
              Total Amount:
              <span className="text-blue-400">₹{order.totalAmount}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

OrdersCard.propTypes = {
  order: PropTypes.shape({
    customerName: PropTypes.string.isRequired,
    orderDelivered: PropTypes.bool.isRequired,
    orderPlacedAt: PropTypes.shape({
      seconds: PropTypes.number.isRequired,
    }).isRequired,
    orderStatus: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string.isRequired,
    refund: PropTypes.oneOf(['requested', 'complete']),
    productDetails: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
        discount: PropTypes.number.isRequired,
      })
    ).isRequired,
    totalAmount: PropTypes.number.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default OrdersCard;
