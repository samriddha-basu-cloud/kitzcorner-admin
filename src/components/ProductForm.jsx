import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, XCircle, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CLOUDINARY_UPLOAD_PRESET = 'kitzcorner';
const CLOUDINARY_CLOUD_NAME = 'dqjck7okp';

const ProductForm = ({ onSubmit, product, onCancel }) => {
  const [formData, setFormData] = useState({
    id: product?.id || uuidv4(),
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    discount: product?.discount || "",
    category: product?.category || "",
    dimension: product?.dimension || "",
    medium: product?.medium || "",
    images: product?.images || [],
    createdAt: product?.createdAt || new Date().toISOString(),
  });

  const [uploading, setUploading] = useState(false);

  const categories = ["Paintings", "Sculptures", "Digital Art", "Photography"];
  const mediums = [
    "Oil",
    "Acrylic",
    "Watercolor",
    "Mixed Media",
    "Digital",
    "Bronze",
    "Marble",
    "Wood",
    "Other",
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        return data.secure_url;
      })
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedImages],
    }));
    setUploading(false);
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, !!product);
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
          {product ? "Edit Product" : "Create New Product"}
        </h2>
        <p className="text-gray-400 text-sm">
          Fill in the details to {product ? "update" : "create"} your art
          product
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300 font-medium">
                Product Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-gray-300 font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500 min-h-24"
                placeholder="Describe your product"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-gray-300 font-medium">
                  Price (₹)
                </Label>
                <Input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="discount" className="text-gray-300 font-medium">
                  Discount (%)
                </Label>
                <Input
                  type="number"
                  id="discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="dimension"
                  className="text-gray-300 font-medium"
                >
                  Dimensions
                </Label>
                <Input
                  id="dimension"
                  value={formData.dimension}
                  onChange={(e) =>
                    setFormData({ ...formData, dimension: e.target.value })
                  }
                  required
                  className="mt-1 text-white bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 24 x 36 inches"
                />
              </div>
              <div>
                <Label htmlFor="medium" className="text-gray-300 font-medium">
                  Medium
                </Label>
                <Select
                  value={formData.medium}
                  onValueChange={(value) =>
                    setFormData({ ...formData, medium: value })
                  }
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
                    {mediums.map((medium) => (
                      <SelectItem key={medium} value={medium}>
                        {medium}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-300 font-medium">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300 font-medium">
                Product Images
              </Label>
              <div className="flex items-center">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition">
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-400">
                      Drop files here or click to upload
                    </span>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-400 text-sm">
                    Uploading images...
                  </span>
                </div>
              )}

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt="Product preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={uploading}
            >
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

ProductForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default ProductForm;