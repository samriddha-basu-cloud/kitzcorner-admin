import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, Tag, ShoppingCart, AlertTriangle, ChevronLeft, ChevronRight, Image as ImageIcon, Search, X } from 'lucide-react';
import ProductForm from './ProductForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  const goToPrevious = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    setIsAutoScrolling(false);
  }, [images.length]);

  const goToNext = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    setIsAutoScrolling(false);
  }, [images.length]);

  // Auto scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, isAutoScrolling]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={images[currentIndex]}
        alt={`Product image ${currentIndex + 1}`}
        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {/* Image indicator dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`block h-1.5 rounded-full transition-all ${
                  currentIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Predefined categories
  const categoryTabs = [
    { id: 'all', label: 'All' },
    { id: 'uncategorized', label: 'Uncategorized' },
    { id: 'paintings', label: 'Paintings' },
    { id: 'sculptures', label: 'Sculptures' },
    { id: 'digital', label: 'Digital Art' },
    { id: 'photography', label: 'Photography' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Filter products based on search query and selected category
  useEffect(() => {
    let result = [...products];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name?.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category tab
    if (activeCategory !== 'all') {
      if (activeCategory === 'uncategorized') {
        result = result.filter(
          product => !product.category || product.category.trim() === '' || product.category.toLowerCase() === 'uncategorized'
        );
      } else {
        result = result.filter(
          product => product.category?.toLowerCase() === activeCategory
        );
      }
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, activeCategory]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        category: formData.category,
        images: formData.images,
        updatedAt: serverTimestamp()
      };

      if (!isEdit) {
        productData.createdAt = serverTimestamp();
      }

      if (isEdit && selectedProduct) {
        await updateDoc(doc(db, 'products', selectedProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      fetchProducts();
      setIsCreateOpen(false);
      setIsEditOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', productToDelete));
      fetchProducts();
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (productId) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedProduct(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Calculate discount price
  const getDiscountedPrice = (price, discount) => {
    return (price - (price * discount / 100)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 pt-40 md:pt-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Product Management</h1>
            <p className="text-gray-400 mt-1">Manage your art collection inventory</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
        
        {/* Search and Category Tabs */}
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, description or category..."
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
          
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <div className="border-b border-gray-700 mb-6 overflow-x-auto">
              <TabsList className="bg-transparent h-auto p-0 space-x-2">
                {categoryTabs.map(tab => (
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
            
            {/* Products Grid */}
            {categoryTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderProductsGrid()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Create Product Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
            <ProductForm onSubmit={handleSubmit} product={selectedProduct} onCancel={handleCancel} />
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
                Are you sure you want to delete this product? This action cannot be undone.
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
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
  
  // Helper function to render products grid
  function renderProductsGrid() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-700 rounded-lg"></div>
                <div className="mt-4 h-4 bg-gray-700 rounded w-full"></div>
                <div className="mt-2 h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="mt-4 h-6 bg-gray-700 rounded w-1/4"></div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (filteredProducts.length === 0) {
      return (
        <Card className="bg-gray-800 border-gray-700 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No matching products found</h3>
                <p className="text-gray-400 max-w-md mb-6">
                  No products match your search for "{searchQuery}" in the {activeCategory !== 'all' ? categoryTabs.find(c => c.id === activeCategory)?.label : 'selected'} category.
                </p>
                <Button onClick={clearSearch} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <ShoppingCart className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  {activeCategory !== 'all' 
                    ? `No ${categoryTabs.find(c => c.id === activeCategory)?.label} Products`
                    : 'No Products Yet'}
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  {activeCategory !== 'all'
                    ? `You don't have any products in the ${categoryTabs.find(c => c.id === activeCategory)?.label} category yet.`
                    : 'Start building your product catalog by adding your first product.'}
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative">
            <div className="absolute -inset-1 rounded-lg blur-md bg-blue-500/30"></div>
            <Card 
              className="relative bg-gray-800 border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-gray-100 line-clamp-1">{product.name}</CardTitle>
                  <Badge variant="outline" className="bg-gray-700 text-gray-300 px-2 py-0 text-xs">
                    {product.category || "Uncategorized"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                  <ImageCarousel images={product.images || []} />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3 min-h-12">{product.description}</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-bold text-white">₹{getDiscountedPrice(product.price, product.discount)}</p>
                  {product.discount > 0 && (
                    <p className="ml-2 text-sm text-gray-400 line-through">₹{product.price}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0 border-t border-gray-700">
                <p className="text-xs text-gray-500 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  ID: {product.id.substring(0, 8)}...
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleEdit(product)} 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => openDeleteDialog(product.id)} 
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-600 hover:border-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    );
  }
};

export default ProductManagement;