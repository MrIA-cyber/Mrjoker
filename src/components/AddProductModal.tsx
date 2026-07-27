import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  Check, 
  AlertCircle, 
  Package, 
  DollarSign, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Truck, 
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Product, Merchant } from '../types';
import { Language } from '../translations';
import ProductDetailsModal from './ProductDetailsModal';

interface AddProductModalProps {
  merchant: Merchant;
  onClose: () => void;
  onPublishProduct: (newProduct: Product) => void;
  onSaveDraft?: (draftProduct: Product) => void;
  lang?: Language;
  existingProduct?: Product; // for editing existing products
}

export default function AddProductModal({
  merchant,
  onClose,
  onPublishProduct,
  onSaveDraft,
  lang = 'fr',
  existingProduct,
}: AddProductModalProps) {
  const isFr = lang === 'fr';

  // Active Wizard Tab
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'media' | 'description' | 'stock' | 'shipping'>('general');

  // Form Fields State
  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState(existingProduct?.category || 'Alimentation & Épicerie');
  const [subCategory, setSubCategory] = useState(existingProduct?.subCategory || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [condition, setCondition] = useState<'Neuf' | 'Occasion' | 'Reconditionné'>(existingProduct?.condition || 'Neuf');
  const [sku, setSku] = useState(existingProduct?.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`);

  // Pricing
  const [price, setPrice] = useState<string>(existingProduct?.price ? String(existingProduct.price) : '');
  const [oldPrice, setOldPrice] = useState<string>(existingProduct?.oldPrice ? String(existingProduct.oldPrice) : '');

  // Calculated Discount
  const numPrice = parseFloat(price) || 0;
  const numOldPrice = parseFloat(oldPrice) || 0;
  const discountPercent = (numOldPrice > numPrice && numPrice > 0)
    ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100)
    : 0;

  // Media
  const [primaryImage, setPrimaryImage] = useState<string>(existingProduct?.image || '');
  const [secondaryImages, setSecondaryImages] = useState<string[]>(existingProduct?.images || []);
  const [videos, setVideos] = useState<string[]>(existingProduct?.videos || (existingProduct?.videoUrl ? [existingProduct.videoUrl] : []));
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Description & Specs
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [weight, setWeight] = useState(existingProduct?.weight || '');
  const [dimensions, setDimensions] = useState(existingProduct?.dimensions || '');
  const [materials, setMaterials] = useState(existingProduct?.materials || '');
  const [warranty, setWarranty] = useState(existingProduct?.warranty || '3 mois');
  const [usageTips, setUsageTips] = useState(existingProduct?.usageTips || '');
  const [colorsInput, setColorsInput] = useState<string>(existingProduct?.colors ? existingProduct.colors.join(', ') : '');
  const [sizesInput, setSizesInput] = useState<string>(existingProduct?.sizes ? existingProduct.sizes.join(', ') : '');

  // Custom Specs array
  const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>(
    existingProduct?.specifications || [{ label: '', value: '' }]
  );

  // Stock
  const [stock, setStock] = useState<string>(existingProduct?.stock !== undefined ? String(existingProduct.stock) : '10');
  const [minStockThreshold, setMinStockThreshold] = useState<string>(existingProduct?.minStockThreshold ? String(existingProduct.minStockThreshold) : '2');
  const [availabilityStatus, setAvailabilityStatus] = useState<'in_stock' | 'limited' | 'out_of_stock' | 'preorder'>(
    existingProduct?.availabilityStatus || 'in_stock'
  );

  // Shipping
  const [shipLocal, setShipLocal] = useState(true);
  const [shipNational, setShipNational] = useState(true);
  const [shipInternational, setShipInternational] = useState(false);
  const [storePickup, setStorePickup] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState(existingProduct?.deliveryOptions?.deliveryTime || '30 - 45 min');
  const [deliveryFee, setDeliveryFee] = useState<string>(existingProduct?.deliveryOptions?.deliveryFee ? String(existingProduct.deliveryOptions.deliveryFee) : '500');

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Errors State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate Progress Completion
  const calculateProgress = () => {
    let completed = 0;
    let total = 6;

    if (name.trim() && category) completed++;
    if (numPrice > 0) completed++;
    if (primaryImage) completed++;
    if (description.trim().length >= 10) completed++;
    if (parseInt(stock) >= 0) completed++;
    if (deliveryFee) completed++;

    return Math.round((completed / total) * 100);
  };

  // Add Secondary Image from Input or File
  const handleAddSecondaryImage = (url: string) => {
    if (!url) return;
    if (secondaryImages.length >= 9) {
      alert(isFr ? 'Vous pouvez ajouter un maximum de 10 photos.' : 'Maximum 10 photos allowed.');
      return;
    }
    setSecondaryImages([...secondaryImages, url]);
    setImageUrlInput('');
  };

  // Handle File Upload for Images
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (!primaryImage) {
            setPrimaryImage(reader.result);
          } else if (secondaryImages.length < 9) {
            setSecondaryImages(prev => [...prev, reader.result as string]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Video
  const handleAddVideo = (url: string) => {
    if (!url) return;
    if (videos.length >= 3) {
      alert(isFr ? 'Vous pouvez ajouter un maximum de 3 vidéos.' : 'Maximum 3 videos allowed.');
      return;
    }
    setVideos([...videos, url]);
    setVideoUrlInput('');
  };

  // Add Custom Spec Row
  const handleAddSpecRow = () => {
    setCustomSpecs([...customSpecs, { label: '', value: '' }]);
  };

  // Remove Spec Row
  const handleRemoveSpecRow = (index: number) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== index));
  };

  // Validate Fields
  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = isFr ? 'Le nom du produit est obligatoire.' : 'Product name is required.';
    if (!category) errs.category = isFr ? 'La catégorie est obligatoire.' : 'Category is required.';
    if (!price || numPrice <= 0) errs.price = isFr ? 'Veuillez entrer un prix valide.' : 'Valid price is required.';
    if (!primaryImage) errs.image = isFr ? 'Au moins une photo principale est obligatoire.' : 'Main image is required.';
    if (!description.trim()) errs.description = isFr ? 'La description du produit est obligatoire.' : 'Description is required.';
    if (stock === '' || parseInt(stock) < 0) errs.stock = isFr ? 'La quantité en stock doit être >= 0.' : 'Valid stock is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Construct final Product Object
  const buildProductObject = (isDraft: boolean = false): Product => {
    const parsedColors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const parsedSizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean);
    const validCustomSpecs = customSpecs.filter(s => s.label.trim() && s.value.trim());

    return {
      id: existingProduct?.id || `p-new-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      oldPrice: numOldPrice > numPrice ? numOldPrice : undefined,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      image: primaryImage,
      images: secondaryImages.length > 0 ? secondaryImages : undefined,
      videos: videos.length > 0 ? videos : undefined,
      category,
      subCategory: subCategory.trim() || undefined,
      brand: brand.trim() || undefined,
      condition,
      sku,
      merchantId: merchant.id,
      merchantName: merchant.shopName || merchant.name,
      isBoosted: merchant.isPremium || false,
      stock: parseInt(stock) || 0,
      minStockThreshold: parseInt(minStockThreshold) || 2,
      availabilityStatus,
      rating: existingProduct?.rating || 5.0,
      reviewsCount: existingProduct?.reviewsCount || 0,
      origin: merchant.location || 'Bafoussam, Cameroun',
      specifications: validCustomSpecs.length > 0 ? validCustomSpecs : undefined,
      weight: weight.trim() || undefined,
      dimensions: dimensions.trim() || undefined,
      materials: materials.trim() || undefined,
      usageTips: usageTips.trim() || undefined,
      warranty: warranty.trim() || undefined,
      colors: parsedColors.length > 0 ? parsedColors : undefined,
      sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
      deliveryOptions: {
        local: shipLocal,
        national: shipNational,
        international: shipInternational,
        storePickup: storePickup,
        deliveryTime: deliveryTime,
        deliveryFee: parseFloat(deliveryFee) || 500,
      },
      isDraft,
    };
  };

  // Handle Save Draft
  const handleDraftSubmit = () => {
    const draftProd = buildProductObject(true);
    if (onSaveDraft) {
      onSaveDraft(draftProd);
    } else {
      onPublishProduct(draftProd);
    }
    onClose();
  };

  // Handle Final Publish
  const handlePublishSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const confirmPublish = () => {
    const prod = buildProductObject(false);
    onPublishProduct(prod);
    setShowConfirmModal(false);
    onClose();
  };

  // Sample Product object for Live Preview Modal
  const previewProduct = buildProductObject(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md font-sans overflow-hidden animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden transition-colors duration-200">
        
        {/* TOP HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                {existingProduct ? (isFr ? 'Modifier le Produit' : 'Edit Product') : (isFr ? 'Ajouter un Nouveau Produit' : 'Add New Product')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {merchant.shopName} • {isFr ? 'Espace Vendeur Pro Bafoussam' : 'Merchant Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Completion Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{isFr ? 'Complétion' : 'Progress'}</span>
              <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${calculateProgress()}%` }} />
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{calculateProgress()}%</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION WIZARD TABS */}
        <div className="flex items-center gap-1 px-4 pt-3 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar shrink-0">
          {[
            { id: 'general', label: isFr ? '1. Général' : '1. General', icon: Layers, hasError: !!errors.name || !!errors.category },
            { id: 'pricing', label: isFr ? '2. Prix' : '2. Price', icon: DollarSign, hasError: !!errors.price },
            { id: 'media', label: isFr ? '3. Photos & Vidéos' : '3. Media', icon: ImageIcon, hasError: !!errors.image },
            { id: 'description', label: isFr ? '4. Description' : '4. Details', icon: FileText, hasError: !!errors.description },
            { id: 'stock', label: isFr ? '5. Stock' : '5. Stock', icon: Package, hasError: !!errors.stock },
            { id: 'shipping', label: isFr ? '6. Livraison' : '6. Shipping', icon: Truck, hasError: false },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shrink-0 border-t border-x ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.hasError && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-fade-in max-w-3xl">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isFr ? 'Nom complet du produit *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isFr ? 'Ex: Café Arabica Pur de Bafoussam (250g)' : 'e.g., Pure Bafoussam Arabica Coffee (250g)'}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-400' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Catégorie principale *' : 'Main Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Alimentation & Épicerie">{isFr ? 'Alimentation & Épicerie' : 'Food & Grocery'}</option>
                    <option value="Artisanat & Mode">{isFr ? 'Artisanat & Mode' : 'Craft & Fashion'}</option>
                    <option value="Électronique & Tech">{isFr ? 'Électronique & Tech' : 'Electronics & Tech'}</option>
                    <option value="Maison & Décoration">{isFr ? 'Maison & Décoration' : 'Home & Living'}</option>
                    <option value="Beauté & Santé">{isFr ? 'Beauté & Santé' : 'Beauty & Health'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Sous-catégorie' : 'Sub-category'}
                  </label>
                  <input
                    type="text"
                    placeholder={isFr ? 'Ex: Café & Boissons, Ndop, Mobilier' : 'e.g., Coffee, Traditional Fabrics'}
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Marque / Fabricant' : 'Brand'}
                  </label>
                  <input
                    type="text"
                    placeholder={isFr ? 'Ex: Maison du Café, Tecno, Local' : 'e.g., Tecno, Local Artisan'}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'État du produit' : 'Condition'}
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Neuf">{isFr ? 'Neuf sous emballage' : 'New in box'}</option>
                    <option value="Occasion">{isFr ? 'Occasion bon état' : 'Used good condition'}</option>
                    <option value="Reconditionné">{isFr ? 'Reconditionné garanti' : 'Refurbished'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Référence (SKU / Code)' : 'SKU / Code'}
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-fade-in max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Prix actuel de vente (FCFA) *' : 'Sale Price (FCFA) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 2500"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (errors.price) setErrors({ ...errors, price: '' });
                      }}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-base font-black font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                        errors.price ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-indigo-600">FCFA</span>
                  </div>
                  {errors.price && <p className="text-xs text-red-500 font-bold mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Ancien Prix barré (Optionnel pour Promo)' : 'Original Strikethrough Price'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 3000"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">FCFA</span>
                  </div>
                </div>
              </div>

              {/* Automatic Discount Banner Preview */}
              {discountPercent > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                      %{discountPercent}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                        {isFr ? 'Réduction automatique calculée !' : 'Automatic Discount Calculated!'}
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {isFr ? `Les clients verront un badge "-${discountPercent}% OFF" sur la fiche produit.` : `Customers will see a "-${discountPercent}% OFF" promo badge.`}
                      </p>
                    </div>
                  </div>
                  <Tag className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA (PHOTOS & VIDEOS) */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              
              {/* Image Upload Header */}
              <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>{isFr ? 'Galerie Photos du Produit (Jusqu\'à 10 photos)' : 'Product Image Gallery (Up to 10 photos)'}</span>
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    {1 + secondaryImages.length} / 10
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>{isFr ? 'Téléverser des images depuis l\'appareil' : 'Upload Images'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex items-center gap-2 min-w-[240px]">
                    <input
                      type="url"
                      placeholder={isFr ? 'Ou coller l\'URL d\'une image web' : 'Or paste web image URL'}
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSecondaryImage(imageUrlInput)}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      {isFr ? 'Ajouter' : 'Add'}
                    </button>
                  </div>
                </div>
                {errors.image && <p className="text-xs text-red-500 font-bold mt-1">{errors.image}</p>}
              </div>

              {/* Photo Preview Grid */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  {isFr ? 'Aperçu des Photos' : 'Photo Preview'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {/* Primary Image Slot */}
                  {primaryImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-md group">
                      <img src={primaryImage} alt="Main" className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                        {isFr ? 'Principale' : 'Main'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrimaryImage('')}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-indigo-500 transition">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500">{isFr ? 'Ajouter Image Principale' : 'Add Main Image'}</span>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  )}

                  {/* Secondary Images Slots */}
                  {secondaryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs group">
                      <img src={img} alt={`Secondary ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSecondaryImages(secondaryImages.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Upload Section */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 pt-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>{isFr ? 'Vidéos de démonstration (Jusqu\'à 3 vidéos MP4/WebM)' : 'Product Videos (Up to 3)'}</span>
                </h3>

                <div className="flex items-center gap-2 max-w-xl">
                  <input
                    type="url"
                    placeholder={isFr ? 'Coller l\'URL d\'une vidéo MP4 (Ex: https://example.com/demo.mp4)' : 'Paste MP4 video URL'}
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVideo(videoUrlInput)}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    {isFr ? 'Ajouter Vidéo' : 'Add Video'}
                  </button>
                </div>

                {videos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {videos.map((vid, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video group">
                        <video src={vid} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: DESCRIPTION & CUSTOM SPECS */}
          {activeTab === 'description' && (
            <div className="space-y-5 animate-fade-in max-w-3xl">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isFr ? 'Description détaillée du produit *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder={isFr ? 'Décrivez votre produit en détail : origine, bienfaits, méthode de fabrication...' : 'Describe your product in detail...'}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                    errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                {errors.description && <p className="text-xs text-red-500 font-bold mt-1">{errors.description}</p>}
              </div>

              {/* Technical Specifications Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {isFr ? 'Spécifications Techniques sur mesure (Clé / Valeur)' : 'Custom Specifications'}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Ajouter une ligne' : 'Add Row'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customSpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={isFr ? 'Ex: Poids' : 'Label (e.g. Weight)'}
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...customSpecs];
                          updated[idx].label = e.target.value;
                          setCustomSpecs(updated);
                        }}
                        className="w-1/3 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder={isFr ? 'Ex: 250 grammes' : 'Value (e.g. 250g)'}
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...customSpecs];
                          updated[idx].value = e.target.value;
                          setCustomSpecs(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                      />
                      {customSpecs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors & Sizes Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {isFr ? 'Couleurs (séparées par une virgule)' : 'Colors (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Noir, Rouge, Vert, Bleu"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {isFr ? 'Tailles (séparées par une virgule)' : 'Sizes (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: S, M, L, XL, 42, 43"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-5 animate-fade-in max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Quantité initiale en stock *' : 'Initial Stock Quantity *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) setErrors({ ...errors, stock: '' });
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-base font-black font-mono text-slate-900 dark:text-white ${
                      errors.stock ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.stock && <p className="text-xs text-red-500 font-bold mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isFr ? 'Seuil d\'alerte stock faible' : 'Low Stock Alert Threshold'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {isFr ? 'Statut de disponibilité affiché' : 'Displayed Stock Status'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'in_stock', label: isFr ? 'En Stock' : 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { id: 'limited', label: isFr ? 'Stock Limité' : 'Limited Stock', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { id: 'out_of_stock', label: isFr ? 'Rupture' : 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200' },
                    { id: 'preorder', label: isFr ? 'Précommande' : 'Pre-order', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAvailabilityStatus(st.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-extrabold cursor-pointer transition ${
                        availabilityStatus === st.id ? `${st.color} ring-2 ring-indigo-500` : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="space-y-5 animate-fade-in max-w-3xl">
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {isFr ? 'Zones de livraison disponibles' : 'Delivery Zones'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={shipLocal} onChange={(e) => setShipLocal(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded-sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{isFr ? 'Livraison Locale Bafoussam (Moto-Taxi)' : 'Local Bafoussam Delivery'}</span>
                  </label>

                  <label className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={shipNational} onChange={(e) => setShipNational(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded-sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{isFr ? 'Livraison Nationale (Cameroun Agences)' : 'National Cameroon Delivery'}</span>
                  </label>

                  <label className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={storePickup} onChange={(e) => setStorePickup(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded-sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{isFr ? 'Retrait direct en boutique à Bafoussam' : 'In-Store Pickup in Bafoussam'}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {isFr ? 'Délai estimé de livraison' : 'Estimated Delivery Time'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 30 - 45 minutes"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {isFr ? 'Frais de livraison standard (FCFA)' : 'Standard Delivery Fee'}
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION FOOTER BAR */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          
          <button
            type="button"
            onClick={handleDraftSubmit}
            className="px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-2xl cursor-pointer transition"
          >
            {isFr ? 'Enregistrer en Brouillon' : 'Save Draft'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  setIsPreviewOpen(true);
                }
              }}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl cursor-pointer transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>{isFr ? 'Prévisualiser Fiche' : 'Preview Product Sheet'}</span>
            </button>

            <button
              type="button"
              onClick={handlePublishSubmit}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs rounded-2xl cursor-pointer shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>{existingProduct ? (isFr ? 'Mettre à Jour' : 'Update Product') : (isFr ? 'Publier le Produit' : 'Publish Product')}</span>
            </button>
          </div>
        </div>

      </div>

      {/* LIVE PREVIEW MODAL OVERLAY */}
      {isPreviewOpen && (
        <ProductDetailsModal
          product={previewProduct}
          isMerchantVerified={merchant.isVerified}
          onClose={() => setIsPreviewOpen(false)}
          onAddToCart={() => {}}
          allProducts={[previewProduct]}
          merchants={[merchant]}
          reviews={[]}
          lang={lang}
        />
      )}

      {/* CONFIRMATION MODAL BEFORE PUBLISHING */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {isFr ? 'Confirmer la publication ?' : 'Confirm Publication?'}
              </h3>
              <p className="text-xs text-slate-500">
                {isFr ? `Votre produit "${name}" sera immédiatement visible par les acheteurs de Bafoussam.` : `Your product will be published immediately.`}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl cursor-pointer"
              >
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={confirmPublish}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-md"
              >
                {isFr ? 'Oui, Publier !' : 'Yes, Publish!'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
