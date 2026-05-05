import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Product } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { Plus, Edit2, Trash2, X, Upload, Loader2, Search, Filter, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { seedProducts } from '../../services/seedService';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    stockStatus: 'All',
    isFeatured: 'All'
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [batchItems, setBatchItems] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: 'Women',
    gender: 'Women' as Product['gender'],
    description: '',
    images: [] as string[],
    stock: '',
    isFeatured: false,
    specs: {} as Record<string, string>
  });

  const [specInput, setSpecInput] = useState({ key: '', value: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'All' || product.category === filters.category;
    const matchesFeatured = filters.isFeatured === 'All' || 
      (filters.isFeatured === 'true' && product.isFeatured) || 
      (filters.isFeatured === 'false' && !product.isFeatured);
    
    let matchesStock = true;
    if (filters.stockStatus === 'In Stock') matchesStock = product.stock > 10;
    if (filters.stockStatus === 'Low Stock') matchesStock = product.stock > 0 && product.stock <= 10;
    if (filters.stockStatus === 'Out of Stock') matchesStock = product.stock <= 0;

    return matchesSearch && matchesCategory && matchesFeatured && matchesStock;
  });

  const handleOpenModal = (product?: Product) => {
    setBatchItems([]);
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        gender: product.gender,
        description: product.description,
        images: product.images,
        stock: product.stock.toString(),
        isFeatured: product.isFeatured,
        specs: product.specs || {}
      });
    } else {
      setEditingProduct(null);
      setForm({
        name: '', price: '', category: 'Women', gender: 'Women', 
        description: '', images: [], stock: '', isFeatured: false, specs: {}
      });
    }
    setIsModalOpen(true);
  };

  const addToBatch = () => {
    const name = form.name.trim();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock) || 0; // Default to 0 if empty

    if (!name || isNaN(price)) {
      alert("Please ensure the Name and Price are correctly filled.");
      return;
    }

    const data = {
      ...form,
      name,
      price,
      stock,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    setBatchItems(prev => [...prev, data]);
    // Reset form for next item but keep category/gender for faster entry
    setForm({ 
      ...form, 
      name: '', 
      price: '', 
      stock: '', 
      description: '', 
      images: [], 
      specs: {},
      isFeatured: false 
    });
    // Add small feedback
    console.log("Item added to batch:", name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading) return;

    setActionLoading(true);
    try {
      if (editingProduct) {
        const data = {
          ...form,
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock) || 0,
          updatedAt: serverTimestamp(),
        };
        const docRef = doc(db, 'products', editingProduct.id);
        await updateDoc(docRef, data);
        alert("Portfolio piece updated successfully.");
      } else {
        let itemsToSave = [...batchItems];
        
        // Check if the current form has unsaved data
        const currentName = form.name.trim();
        const currentPrice = parseFloat(form.price);
        
        if (currentName && !isNaN(currentPrice)) {
          itemsToSave.push({
            ...form,
            name: currentName,
            price: currentPrice,
            stock: parseInt(form.stock) || 0,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          });
        }

        if (itemsToSave.length === 0) {
          alert("Nothing to save. Please add items to the batch or fill the form details (Name and Price).");
          setActionLoading(false);
          return;
        }

        console.log(`Attempting to save ${itemsToSave.length} items...`);

        // Save items sequentially or in parallel
        for (const item of itemsToSave) {
          await addDoc(collection(db, 'products'), item);
        }

        alert(itemsToSave.length > 1 ? `${itemsToSave.length} pieces successfully uploaded to catalog.` : "New piece successfully added.");
      }
      setIsModalOpen(false);
      setBatchItems([]);
      fetchProducts();
    } catch (err) {
      console.error("Submission Error Details:", err);
      const isPermissionErr = err instanceof Error && (err.message.includes('permission-denied') || err.message.includes('insufficient permissions'));
      
      if (isPermissionErr) {
        alert("Security Error: You do not have permission to write to this database. Please check your admin status.");
      } else {
        alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
      handleFirestoreError(err, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this piece from the collection?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('CRITICAL: Delete ALL products in the catalog? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      for (const p of products) {
        await deleteDoc(doc(db, 'products', p.id));
      }
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'products');
    } finally {
      setActionLoading(false);
    }
  };

  const addSpec = () => {
    if (specInput.key && specInput.value) {
      setForm({
        ...form,
        specs: { ...form.specs, [specInput.key]: specInput.value }
      });
      setSpecInput({ key: '', value: '' });
    }
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...form.specs };
    delete newSpecs[key];
    setForm({ ...form, specs: newSpecs });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...form.images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (newImages.length >= 5) break;

        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newImages.push(downloadURL);
      }
      setForm({ ...form, images: newImages });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative max-w-sm flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search catalog by name..." 
              className="w-full bg-white/5 border border-white/10 rounded-none py-2 pl-10 pr-4 text-sm focus:border-gold outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <select 
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
              className="bg-white/5 border border-white/10 text-white/60 text-[10px] uppercase tracking-widest px-3 py-2 outline-none focus:border-gold"
            >
              <option value="All">All Categories</option>
              {['Women', 'Men', 'Kids', 'Babies', 'Accessories', 'Beauty', 'Footwear'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filters.stockStatus}
              onChange={e => setFilters({...filters, stockStatus: e.target.value})}
              className="bg-white/5 border border-white/10 text-white/60 text-[10px] uppercase tracking-widest px-3 py-2 outline-none focus:border-gold"
            >
              <option value="All">Stock: All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out Of Stock</option>
            </select>

            <select 
              value={filters.isFeatured}
              onChange={e => setFilters({...filters, isFeatured: e.target.value})}
              className="bg-white/5 border border-white/10 text-white/60 text-[10px] uppercase tracking-widest px-3 py-2 outline-none focus:border-gold"
            >
              <option value="All">Featured: All</option>
              <option value="true">Featured Only</option>
              <option value="false">Standard Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={async () => {
              setActionLoading(true);
              await seedProducts();
              fetchProducts();
              setActionLoading(false);
            }}
            disabled={actionLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
          >
            <Database size={14} />
            <span>Seed Catalog</span>
          </button>

          <button 
            onClick={handleDeleteAll}
            disabled={actionLoading || products.length === 0}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-colors flex items-center space-x-2 disabled:opacity-30"
          >
            <Trash2 size={14} />
            <span>Wipe Catalog</span>
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="premium-btn-solid flex items-center space-x-2 py-2 px-6"
          >
            <Plus size={16} />
            <span>Add Piece</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gold/50">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="bg-black/40 border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 micro-label">
                <th className="px-6 py-4">Piece</th>
                <th className="px-6 py-4">Category / Dept</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 bg-zinc-900 border border-white/10 shrink-0">
                        {product.images[0] && <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate uppercase">{product.name}</p>
                        {product.isFeatured && <span className="text-[9px] text-gold border border-gold/30 px-1 uppercase tracking-tighter">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/60">
                    {product.category} • {product.gender}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase font-bold py-1 px-2 rounded-sm",
                      product.stock > 10 ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10",
                      product.stock <= 0 && "text-red-500 bg-red-500/10"
                    )}>
                      {product.stock <= 0 ? 'Out of Stock' : `${product.stock} items`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(product)} className="p-2 hover:text-gold transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-20 text-center text-white/30 italic">No products in catalog yet.</div>
          )}
        </div>
      )}

      {/* Modal Luxe */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-black border border-white/10 p-10 z-[101] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-serif italic text-gold">{editingProduct ? 'Edit Portfolio Piece' : 'Add New Portfolio Piece'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="micro-label">Piece Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-luxury" placeholder="E.g. Vintage Silk Gown" />
                  </div>
                  <div>
                    <label className="micro-label">Price (GHS)</label>
                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-luxury" placeholder="500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="micro-label">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-luxury appearance-none">
                      {['Women', 'Men', 'Kids', 'Babies', 'Accessories', 'Beauty', 'Footwear'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="micro-label">Gender Dept</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})} className="input-luxury appearance-none">
                      {['Women', 'Men', 'Kids', 'Babies', 'Unisex'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="micro-label">Description</label>
                  <textarea rows={4} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-luxury resize-none" placeholder="Crafted with care in Accra..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="micro-label">Stock Quantity</label>
                    <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-luxury" placeholder="10" />
                  </div>
                  <div className="flex items-center space-x-3 pt-6">
                    <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 accent-gold" />
                    <label htmlFor="featured" className="micro-label cursor-pointer text-white">Feature on Homepage</label>
                  </div>
                </div>

                <div>
                   <label className="micro-label mb-4 block">Product Images</label>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-[3/4] bg-zinc-900 border border-white/10 group/img">
                           <img src={img} className="w-full h-full object-cover" alt="Preview" />
                           <button 
                            type="button"
                            onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                           >
                             <Trash2 size={12} />
                           </button>
                        </div>
                      ))}
                      {form.images.length < 5 && (
                        <label className={cn(
                          "aspect-[3/4] border-2 border-dashed border-white/10 hover:border-gold/50 flex flex-col items-center justify-center cursor-pointer transition-colors group",
                          uploading && "opacity-50 cursor-not-allowed"
                        )}>
                           <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleImageUpload} 
                            disabled={uploading}
                            className="hidden" 
                           />
                           {uploading ? (
                             <Loader2 size={20} className="animate-spin text-gold" />
                           ) : (
                             <>
                               <Upload size={20} className="text-white/20 group-hover:text-gold transition-colors mb-2" />
                               <span className="text-[8px] uppercase tracking-widest text-white/40 group-hover:text-gold/60">Upload</span>
                             </>
                           )}
                        </label>
                      )}
                   </div>

                   <div className="space-y-2">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Or Paste URLs</p>
                     {form.images.map((img, idx) => (
                        <div key={idx} className="flex space-x-2">
                           <input 
                             value={img} 
                             onChange={e => {
                               const newImages = [...form.images];
                               newImages[idx] = e.target.value;
                               setForm({...form, images: newImages});
                             }}
                             className="input-luxury flex-grow" placeholder="https://..." 
                           />
                           <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})} className="text-red-500 px-2"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      {form.images.length < 5 && (
                        <button type="button" onClick={() => setForm({...form, images: [...form.images, '']})} className="text-[10px] uppercase text-gold/60 mt-2 flex items-center hover:text-gold transition-colors">
                          <Plus size={12} className="mr-1" /> Add URL slot
                        </button>
                      )}
                   </div>
                </div>

                <div>
                   <label className="micro-label mb-4 block">Specifications</label>
                   <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <input 
                          value={specInput.key} 
                          onChange={e => setSpecInput({...specInput, key: e.target.value})}
                          className="input-luxury" placeholder="e.g. Material" 
                        />
                        <div className="flex space-x-2">
                          <input 
                            value={specInput.value} 
                            onChange={e => setSpecInput({...specInput, value: e.target.value})}
                            className="input-luxury flex-grow" placeholder="e.g. 100% Silk" 
                          />
                          <button type="button" onClick={addSpec} className="text-gold px-2"><Plus size={16} /></button>
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {Object.entries(form.specs).map(([k, v]) => (
                          <div key={k} className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-sm group/spec">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{k}:</span>
                            <span className="text-[10px] text-white/80">{v}</span>
                            <button type="button" onClick={() => removeSpec(k)} className="text-white/20 hover:text-red-500 transition-colors">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                     </div>
                   </div>
                </div>

                {!editingProduct && (
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="micro-label">Batch Pipeline ({batchItems.length} items ready)</h4>
                      <button 
                        type="button"
                        onClick={addToBatch}
                        className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-white transition-colors flex items-center"
                      >
                        <Plus size={12} className="mr-2" /> Add Current to Batch
                      </button>
                    </div>

                    {batchItems.length > 0 && (
                      <div className="space-y-3 mb-8">
                        {batchItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-sm">
                            <span className="text-[10px] uppercase tracking-widest text-white/60">{item.name}</span>
                            <button 
                              type="button"
                              onClick={() => setBatchItems(batchItems.filter((_, i) => i !== idx))} 
                              className="text-red-500/40 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  disabled={actionLoading || (!editingProduct && batchItems.length === 0 && (!form.name || !form.price))}
                  className="premium-btn-solid w-full h-14 flex items-center justify-center disabled:opacity-50"
                  type="submit"
                >
                  {actionLoading ? <Loader2 className="animate-spin" /> : (
                    <span>
                      {editingProduct ? 'Commit Changes' : (
                        batchItems.length > 0 ? `Commit Batch of ${batchItems.length} Pieces` : 'Save to Catalog'
                      )}
                    </span>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
