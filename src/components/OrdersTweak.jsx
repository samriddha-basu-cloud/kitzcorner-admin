import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const CLOUDINARY_UPLOAD_PRESET = 'kitzcorner';
const CLOUDINARY_CLOUD_NAME = 'dqjck7okp';

const OrdersTweak = ({ order, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    orderDelivered: order?.orderDelivered ?? false,
    orderStatus: order?.orderStatus ?? '',
    paymentStatus: order?.paymentStatus ?? '',
    refund: order?.refund ?? '',
    paymentQr: order?.paymentQr ?? ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.paymentQr);

  useEffect(() => {
    if (order) {
      setFormData({
        orderDelivered: order.orderDelivered,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        refund: order.refund ?? '',
        paymentQr: order.paymentQr ?? ''
      });
      setImagePreview(order.paymentQr ?? '');
    }
  }, [order]);

  const handleSelectChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setFormData(prevData => ({
        ...prevData,
        paymentQr: data.secure_url
      }));
      setImagePreview(data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = () => {
    setFormData(prevData => ({
      ...prevData,
      paymentQr: ''
    }));
    setImagePreview('');
  };

  const handleFormSubmit = async () => {
    if (formData.paymentStatus === 'Make Payment') {
      try {
        await addDoc(collection(db, 'payments'), {
          customerId: order.customerId,
          orderId: order.id,
          totalAmount: order.totalAmount,
          paymentDate: serverTimestamp(),
          status: 'pending'
        });
      } catch (error) {
        console.error('Error adding payment document:', error);
      }
    }

    if (formData.refund || formData.paymentQr) {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          refund: formData.refund,
          paymentQr: formData.paymentQr
        });
      } catch (error) {
        console.error('Error updating order document:', error);
      }
    }

    onSubmit(formData);
  };

  if (!order) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-200">
          Edit Order #{order.id}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto px-6 py-4 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Order Delivery Status</label>
            <Select value={formData.orderDelivered ? 'Delivered' : 'Not Delivered'} onValueChange={(value) => handleSelectChange('orderDelivered', value === 'Delivered')}>
              <SelectTrigger className="w-full bg-gray-200 border-gray-700">
                <SelectValue placeholder="Select delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Not Delivered">Not Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Order Status</label>
          <Select value={formData.orderStatus} onValueChange={(value) => handleSelectChange('orderStatus', value)}>
            <SelectTrigger className="w-full bg-gray-200 border-gray-700">
              <SelectValue placeholder="Select order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cancelled" disabled>Cancelled</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Payment Status</label>
            <Select value={formData.paymentStatus} onValueChange={(value) => handleSelectChange('paymentStatus', value)}>
              <SelectTrigger className="w-full bg-gray-200 border-gray-700">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Make Payment">Make Payment</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Refund Status</label>
            <Select value={formData.refund} onValueChange={(value) => handleSelectChange('refund', value)}>
              <SelectTrigger className="w-full bg-gray-200 border-gray-700">
                <SelectValue placeholder="Select refund status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Payment QR Code</label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer disabled:opacity-50"
            />
            {isUploading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          {imagePreview && (
            <div className="mt-4 space-y-2">
              <img src={imagePreview} alt="Payment QR" className="max-w-xs rounded-lg border border-gray-700" />
              <Button 
                onClick={handleDeleteImage} 
                variant="destructive"
                size="sm"
                className="mt-2"
              >
                Delete Image
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-800">
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

OrdersTweak.propTypes = {
  order: PropTypes.shape({
    orderDelivered: PropTypes.bool,
    orderStatus: PropTypes.string,
    paymentStatus: PropTypes.string,
    refund: PropTypes.oneOf(['requested', 'complete']),
    paymentQr: PropTypes.string,
    customerId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    totalAmount: PropTypes.string.isRequired
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default OrdersTweak;