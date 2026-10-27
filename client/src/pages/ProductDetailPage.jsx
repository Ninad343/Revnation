import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Car,
  Wrench,
  Share2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slugOrId } = useParams();
  const { user, isAuthenticated, activeVehicle } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], total: 0, averageRating: 0, distribution: {} });
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slugOrId}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.relatedProducts || []);

          // Load reviews
          const revRes = await api.get(`/reviews/product/${res.data.product._id}`);
          if (revRes.data.success) {
            setReviewsData(revRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-slate-900 rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-900 rounded-xl w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-900 rounded-xl w-1/2 animate-pulse"></div>
            <div className="h-24 bg-slate-900 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">This automobile part may have been removed or discontinued.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  // Compatibility checking
  const isCompatible = activeVehicle?.make && product.compatibility?.some((c) => {
    const makeMatch = c.make.toLowerCase() === activeVehicle.make.toLowerCase();
    const modelMatch = c.model.toLowerCase() === activeVehicle.model.toLowerCase();
    const yearMatch = !activeVehicle.year || (activeVehicle.year >= c.yearStart && activeVehicle.year <= c.yearEnd);
    return makeMatch && modelMatch && yearMatch;
  });

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product._id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit a review');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: Number(rating),
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setReviewTitle('');
        setReviewComment('');
        // Reload reviews
        const revRes = await api.get(`/reviews/product/${product._id}`);
        if (revRes.data.success) {
          setReviewsData(revRes.data);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Could not post review. (Note: Only buyers with confirmed orders can review)');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-white transition">Parts</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-white transition">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative">
            <img
              src={product.images?.[activeImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badges && product.badges.length > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-lg">
                {product.badges[0]}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === idx ? 'border-red-500 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Fitment */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-extrabold text-red-500 uppercase tracking-wider">{product.brand}</span>
              <span className="text-slate-500 font-mono">Part #{product.partNumber || product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="ml-1 font-bold text-slate-200">
                  {reviewsData.averageRating > 0 ? reviewsData.averageRating : (product.rating || 5.0)}
                </span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-medium">
                {reviewsData.total} Verified Reviews
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold">
                Sold by {product.seller?.name || 'Authorized Partner'}
              </span>
            </div>
          </div>

          {/* Vehicle Compatibility Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <Car className="w-4 h-4 mr-1.5 text-red-500" />
                Vehicle Fitment Check
              </span>
              <Link to="/my-garage" className="text-red-400 hover:text-red-300 font-semibold">
                Manage Garage
              </Link>
            </div>

            {activeVehicle?.make ? (
              <div className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                isCompatible
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/80 border border-slate-700 text-slate-400'
              }`}>
                <div className="flex items-center space-x-2">
                  {isCompatible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span>
                    {isCompatible
                      ? `Guaranteed Fit for your ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                      : `Compatibility not confirmed for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Select your vehicle to confirm fitment before ordering</span>
                <Link to="/my-garage" className="text-red-400 font-bold hover:underline">
                  Select Ride
                </Link>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-white">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-500 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  In Stock ({product.stock} units available for instant dispatch)
                </span>
              ) : (
                <span className="text-red-400 font-bold">Currently Out of Stock</span>
              )}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="px-3 font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition"
              >
                <span>Buy Now</span>
              </button>

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3.5 rounded-xl border transition ${
                  wishlisted
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                }`}
                title={wishlisted ? 'Saved' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Genuine Warranty</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>14-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Description' },
            { id: 'specifications', label: 'Technical Specifications' },
            { id: 'compatibility', label: 'Vehicle Compatibility' },
            { id: 'warranty', label: 'Warranty & Returns' },
            { id: 'reviews', label: `Customer Reviews (${reviewsData.total})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 text-sm">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 max-w-3xl text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white">Product Description</h3>
              <p>{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Category</span>
                  <span className="font-semibold text-white">{product.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Subcategory</span>
                  <span className="font-semibold text-white">{product.subcategory || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Brand</span>
                  <span className="font-semibold text-white">{product.brand}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SKU</span>
                  <span className="font-semibold text-white">{product.sku}</span>
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <h3 className="text-base font-bold text-white mb-4">Engineering Specifications</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 px-4 text-xs odd:bg-slate-950/30">
                      <span className="text-slate-400 font-semibold">{spec.name}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No extra specifications listed for this product.</p>
              )}
            </div>
          )}

          {/* Compatibility */}
          {activeTab === 'compatibility' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-base font-bold text-white">Verified Automotive Applications</h3>
              <p className="text-xs text-slate-400">
                This part has been designed and tested for the following vehicle makes, models, and model years:
              </p>
              {product.compatibility && product.compatibility.length > 0 ? (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-4 bg-slate-950/60 p-3 text-[11px] font-bold uppercase text-slate-400">
                    <div>Make</div>
                    <div>Model</div>
                    <div>Years</div>
                    <div>Variant</div>
                  </div>
                  {product.compatibility.map((c, i) => (
                    <div key={i} className="grid grid-cols-4 p-3 text-xs text-slate-300">
                      <div className="font-bold text-white">{c.make}</div>
                      <div>{c.model}</div>
                      <div>{c.yearStart} - {c.yearEnd}</div>
                      <div className="text-slate-400">{c.variant || 'All'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Universal fitment or compatibility information pending confirmation.</p>
              )}
            </div>
          )}

          {/* Warranty & Returns */}
          {activeTab === 'warranty' && (
            <div className="space-y-4 max-w-2xl text-xs text-slate-300">
              <h3 className="text-base font-bold text-white">Warranty & Return Policies</h3>
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="font-bold text-white">Manufacturer Warranty</div>
                <p>{product.warranty || '1 Year Manufacturer Limited Warranty covering defects in material and craftsmanship.'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="font-bold text-white">Return Policy</div>
                <p>{product.returnPolicy || '14 Days Replacement Guarantee on uninstalled items in original factory packaging.'}</p>
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Summary */}
              <div className="flex items-center space-x-6 pb-6 border-b border-slate-800">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">
                    {reviewsData.averageRating > 0 ? reviewsData.averageRating : '5.0'}
                  </div>
                  <div className="flex text-amber-400 justify-center my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400">{reviewsData.total} reviews</div>
                </div>
              </div>

              {/* Review Submission Form */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white">Submit a Verified Purchase Review</h4>
                <p className="text-xs text-slate-400">
                  Note: RevNation enforces verified reviews. You must have an approved order containing this product to submit feedback.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                      <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                      <option value={1}>⭐ (1 Star - Poor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Incredible stopping power on circuit lap"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Your Detailed Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Detail fitment, performance change, installation notes..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </form>
              </div>

              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                  reviewsData.reviews.map((r) => (
                    <div key={r._id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{r.user?.name || 'Customer'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                            Verified Purchase
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="font-bold text-sm text-slate-100">{r.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No customer reviews yet. Be the first to review after purchasing!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            Related Parts in {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
