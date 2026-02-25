import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import { supabase } from '../supabaseClient';

const Products = ({ addToCart, selectedCategory, searchQuery, currentLanguage, user, setUser, onSignIn }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSelectedCategory, setLocalSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  const currentCategory = selectedCategory !== undefined ? selectedCategory : localSelectedCategory;

  // Skeleton loading products for better UX
  const skeletonProducts = Array(12).fill().map((_, index) => ({
    id: `skeleton-${index}`,
    isSkeleton: true
  }));

  // SEO-friendly category titles with descriptions
  const getCategorySEODetails = () => {
    const seoData = {
      'all': {
        title: 'All Computers & Electronics | Robert & Izak Computers Uganda',
        description: 'Browse our complete collection of computers, laptops, gaming PCs, and electronics. Best prices in Uganda with 2-year warranty and free Kampala delivery.',
        keywords: 'computers uganda, laptops kampala, electronics store, pc components uganda'
      },
      'laptops': {
        title: 'Laptops Uganda | Gaming, Business & Student Laptops Kampala',
        description: 'Premium laptops in Uganda - Gaming laptops from 2.8M UGX, Business laptops, MacBooks, Student laptops. Free delivery Kampala • 2-year warranty.',
        keywords: 'laptops uganda, gaming laptops kampala, business laptops, student laptops price'
      },
      'gaming-pcs': {
        title: 'Gaming PCs Uganda | Custom Gaming Computers Kampala | RTX Series',
        description: 'Custom Gaming PCs in Uganda with RTX 4060, 4070, 4080 graphics cards. High-performance gaming computers from 3.2M UGX. Free setup & delivery.',
        keywords: 'gaming pc uganda, rtx gaming computer, custom pc build kampala, gaming computers price'
      },
      'gaming-laptops': {
        title: 'Gaming Laptops Uganda | RTX Gaming Laptops Price Kampala',
        description: 'High-performance gaming laptops with RTX graphics, 144Hz displays, and Intel Core i7/i9 processors. Gaming laptops from 2.8M UGX in Uganda.',
        keywords: 'gaming laptops uganda, rtx laptop price, asus rog, msi gaming laptop kampala'
      },
      'business-laptops': {
        title: 'Business Laptops Uganda | Dell, HP, Lenovo ThinkPad Kampala',
        description: 'Professional business laptops from Dell, HP, Lenovo ThinkPad series. Perfect for office work, programming, and corporate use in Uganda.',
        keywords: 'business laptops uganda, dell laptop price, lenovo thinkpad kampala, hp elitebook'
      },
      'components': {
        title: 'PC Components Uganda | Graphics Cards, Processors, RAM Kampala',
        description: 'PC components and computer parts in Uganda. RTX graphics cards, Intel/AMD processors, DDR5 RAM, SSDs, motherboards. Best prices guaranteed.',
        keywords: 'pc components uganda, graphics cards kampala, processors, ram, ssd price'
      },
      'monitors': {
        title: 'Computer Monitors Uganda | Gaming Monitors & Displays Kampala',
        description: 'Gaming monitors, 4K displays, and professional monitors in Uganda. 144Hz, 240Hz gaming screens from Samsung, LG, ASUS. Free delivery.',
        keywords: 'monitors uganda, gaming monitor price, 4k display kampala, computer screen'
      },
      'accessories': {
        title: 'Computer Accessories Uganda | Keyboards, Mice, Headsets Kampala',
        description: 'Computer accessories and peripherals in Uganda. Mechanical keyboards, gaming mice, headsets, webcams, and PC components. Best prices.',
        keywords: 'computer accessories uganda, keyboard mouse price, gaming headset kampala'
      }
    };

    if (searchQuery) {
      return {
        title: `Search "${searchQuery}" | Robert & Izak Computers Uganda`,
        description: `Search results for "${searchQuery}" - Find computers, laptops, and electronics at Robert & Izak Computers Uganda.`,
        keywords: `${searchQuery}, computer search, electronics uganda`
      };
    }

    return seoData[currentCategory] || {
      title: `${getCategoryTitle()} | Robert & Izak Computers Uganda`,
      description: `Quality ${getCategoryTitle()} in Uganda. Best prices, 2-year warranty, free Kampala delivery. Robert & Izak Computers - Uganda's #1 computer store.`,
      keywords: `${getCategoryTitle().toLowerCase()} uganda, computer store kampala, electronics price`
    };
  };

  // Generate structured data for products
  const generateProductStructuredData = () => {
    if (!filteredProducts.length) return null;

    const productOffers = filteredProducts.map(product => ({
      "@type": "Product",
      "name": product.name,
      "description": product.short_description || product.description,
      "image": product.product_images?.[0]?.image_url || '/default-product.jpg',
      "sku": product.sku || `RI-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": product.brands?.name || "Robert & Izak Computers"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "UGX",
        "price": product.price?.toString() || "0",
        "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Robert & Izak Computers"
        }
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${getCategoryTitle()} - Robert & Izak Computers`,
      "description": getCategorySEODetails().description,
      "url": `https://www.robertandizakcomputers.com/products/${currentCategory}`,
      "numberOfItems": filteredProducts.length,
      "itemListElement": productOffers.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": product
      }))
    };
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = () => {
    const breadcrumbs = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.robertandizakcomputers.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://www.robertandizakcomputers.com/products"
      }
    ];

    if (currentCategory !== 'all') {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 3,
        "name": getCategoryTitle(),
        "item": `https://www.robertandizakcomputers.com/products/${currentCategory}`
      });
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    };
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();

    const subscription = supabase
      .channel('products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log('Real-time product update detected');
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (products.length > 0 && searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categories?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categories?.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching products for category:', currentCategory);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories!inner (
            id,
            name,
            slug,
            parent_id,
            is_active
          ),
          brands (
            id,
            name,
            slug
          ),
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `)
        .eq('is_published', true);
      
      // Handle featured products filter
      if (Array.isArray(currentCategory) && currentCategory.includes('featured')) {
        query = query.eq('is_featured', true);
        console.log('✅ Filtering featured products');
      } 
      else if (currentCategory !== 'all' && currentCategory !== undefined) {
        if (Array.isArray(currentCategory)) {
          // Multiple categories - filter by multiple slugs
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, slug, name, parent_id')
            .in('slug', currentCategory)
            .eq('is_active', true);
          
          console.log('📦 Multiple categories data:', categoryData);
          
          if (categoryData && categoryData.length > 0) {
            let allCategoryIds = [];
            
            for (const category of categoryData) {
              // SPECIAL HANDLING: Gaming PCs should not include laptops
              if (category.slug === 'gaming-pcs') {
                allCategoryIds.push(category.id);
                console.log('🎮 Gaming PCs category - only using its own ID');
              } else {
                allCategoryIds.push(category.id);
                
                // Check if this category has children (for non-gaming-pcs categories)
                const { data: childCategories } = await supabase
                  .from('categories')
                  .select('id')
                  .eq('parent_id', category.id)
                  .eq('is_active', true);
                
                if (childCategories && childCategories.length > 0) {
                  const childIds = childCategories.map(child => child.id);
                  allCategoryIds = [...allCategoryIds, ...childIds];
                }
              }
            }
            
            // Remove duplicates
            allCategoryIds = [...new Set(allCategoryIds)];
            query = query.in('category_id', allCategoryIds);
            console.log('🎯 Final category IDs to query:', allCategoryIds);
          }
        } else {
          // Single category - handle parent-child relationships
          console.log('🔎 Looking for category with slug:', currentCategory);
          
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, slug, name, parent_id')
            .eq('slug', currentCategory)
            .eq('is_active', true)
            .single();
          
          console.log('📋 Found category data:', categoryData);
          
          if (categoryData) {
            // SPECIAL HANDLING FOR GAMING PCS - ONLY SHOW ITS OWN PRODUCTS, NO CHILDREN
            if (currentCategory === 'gaming-pcs') {
              console.log('🎮 Gaming PCs category - showing only Gaming PCs products (no children)');
              query = query.eq('category_id', categoryData.id);
              console.log(`✅ Gaming PCs: Only products from category_id: ${categoryData.id}`);
            } else {
              // Regular logic for other categories
              const { data: childCategories } = await supabase
                .from('categories')
                .select('id')
                .eq('parent_id', categoryData.id)
                .eq('is_active', true);
              
              console.log('👶 Child categories:', childCategories);
              
              if (childCategories && childCategories.length > 0) {
                const childCategoryIds = childCategories.map(child => child.id);
                childCategoryIds.push(categoryData.id);
                query = query.in('category_id', childCategoryIds);
                console.log(`✅ Parent category: Including products from ${childCategoryIds.length} categories`);
              } else {
                query = query.eq('category_id', categoryData.id);
                console.log(`✅ Child category: Only products from category_id: ${categoryData.id}`);
              }
            }
          } else {
            console.log('❌ Category not found:', currentCategory);
          }
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      console.log(`📊 Fetched ${data?.length || 0} products for category:`, currentCategory);
      
      // Debug: Log the categories of fetched products
      if (data && data.length > 0) {
        console.log('🔍 Fetched products with categories:');
        data.forEach(product => {
          console.log(`   - ${product.name}: ${product.categories?.name} (${product.categories?.slug})`);
        });
      }
      
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    
    if (Array.isArray(currentCategory)) {
      if (currentCategory.includes('laptops')) {
        return 'Laptops';
       } else if (currentCategory.includes('gaming-laptops')) {
        return 'Gaming Laptops';
       } else if (currentCategory.includes('business-laptops')) {
        return 'Business Laptops';
       } else if (currentCategory.includes('macbooks')) {
        return 'MacBooks';
       } else if (currentCategory.includes('2-in-1s')) {
        return '2-in-1 Laptops';

      } else if (currentCategory.includes('gaming-pcs')) {
        return 'Gaming PCs';

      } else if (currentCategory.includes('monitors')) {
        return 'Monitors & Displays';
      } else if (currentCategory.includes('accessories') || currentCategory.includes('keyboards') || currentCategory.includes('mice') || currentCategory.includes('headsets') || currentCategory.includes('webcams')) {
        return 'Computer Accessories';
      } else if (currentCategory.includes('components')) {
        return 'PC Components';
      } else if (currentCategory.includes('networking')) {
        return 'Networking Equipment';
      } else if (currentCategory.includes('storage')) {
        return 'Storage Devices';
      } else if (currentCategory.includes('software')) {
        return 'Software';
      }
      return 'Products';
    }
    
    const categoryTitles = {
      'all': 'All Products',
      'laptops': 'Laptops',
      'desktops': 'Desktop Computers',
      'gaming-pcs': 'Gaming PCs',
      'components': 'PC Components',
      'monitors': 'Monitors & Displays',
      'accessories': 'Computer Accessories',
      'networking': 'Networking Equipment',
      'storage': 'Storage Devices',
      'software': 'Software',
      'gaming-laptops': 'Gaming Laptops',
      'business-laptops': 'Business Laptops',
      'macbooks': 'MacBooks',
      '2-in-1s': '2-in-1 Laptops',
      'student-laptops': 'Student Laptops',
      'workstations': 'Workstations',
      'chromebooks': 'Chromebooks',
      'keyboards': 'Keyboards',
      'mice': 'Computer Mice',
      'headsets': 'Headsets',
      'webcams': 'Webcams',
      'gpus': 'Graphics Cards',
      'cpus': 'Processors',
      'ram': 'Memory (RAM)',
      'motherboards': 'Motherboards'
    };
    return categoryTitles[currentCategory] || 'Products';
  };

  // Skeleton Loading Component
  const SkeletonProductCard = () => (
    <div className="amazon-product-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-badge"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-rating"></div>
      <div className="skeleton-price"></div>
      <div className="skeleton-button"></div>
    </div>
  );

  const seoDetails = getCategorySEODetails();
  const productStructuredData = generateProductStructuredData();
  const breadcrumbStructuredData = generateBreadcrumbStructuredData();

  if (loading) {
    return (
      <div className="products-section">
        <Helmet>
          <title>Loading {getCategoryTitle()} | Robert & Izak Computers Uganda</title>
        </Helmet>
        
        {/* Skeleton Header */}
        <div className="section-header">
          <div className="skeleton-title-large"></div>
          <div className="skeleton-subtitle"></div>
          {selectedCategory === undefined && (
            <div className="skeleton-select"></div>
          )}
        </div>

        {/* Skeleton Products Grid */}
        <div className="products-grid">
          {skeletonProducts.map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </div>

        {/* Loading Progress Bar */}
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
          <div className="loading-text">Loading {getCategoryTitle()}...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-section error-state">
        <Helmet>
          <title>Error | Robert & Izak Computers Uganda</title>
        </Helmet>
        
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>We're having trouble loading the products. Please try again.</p>
          <div className="error-details">
            <p><strong>Error:</strong> {error}</p>
            <p><strong>Category:</strong> {getCategoryTitle()}</p>
          </div>
          <button 
            className="retry-button"
            onClick={fetchProducts}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-section">
      {/* ===== SEO META TAGS ===== */}
      <Helmet>
        <title>{seoDetails.title}</title>
        <meta name="description" content={seoDetails.description} />
        <meta name="keywords" content={seoDetails.keywords} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={seoDetails.title} />
        <meta property="og:description" content={seoDetails.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.robertandizakcomputers.com/products/${currentCategory}`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://www.robertandizakcomputers.com/products/${currentCategory}`} />
        
        {/* Structured Data */}
        {breadcrumbStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbStructuredData)}
          </script>
        )}
        {productStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(productStructuredData)}
          </script>
        )}
      </Helmet>

      {/* ===== PAGE CONTENT ===== */}
      <div className="section-header">
        <h1 className="section-title">{getCategoryTitle()}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Showing {filteredProducts.length} products
          {currentCategory !== 'all' && ` in ${getCategoryTitle()}`}
        </p>
        {selectedCategory === undefined && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <select 
              value={currentCategory}
              onChange={(e) => setLocalSelectedCategory(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Categories</option>
              <option value="laptops">Laptops</option>
              <option value="gaming-pcs">Gaming PCs</option>
              <option value="desktops">Desktop PCs</option>
              <option value="components">PC Components</option>
              <option value="monitors">Monitors</option>
              <option value="accessories">Accessories</option>
              <option value="gaming-laptops">Gaming Laptops</option>
              <option value="business-laptops">Business Laptops</option>
              <option value="macbooks">MacBooks</option>
            </select>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>
            {searchQuery 
              ? `No products found for "${searchQuery}"`
              : `No products found in ${getCategoryTitle()}`
            }
          </h3>
          <p>
            {searchQuery
              ? 'Try adjusting your search terms or browse by category.'
              : 'Try selecting a different category or check back later for new products.'
            }
          </p>
          <div className="empty-details">
            <p>Current category: {currentCategory}</p>
            <p>Total products in database: {products.length}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                user={user} 
                setUser={setUser} 
                currentLanguage={currentLanguage}
                onSignIn={onSignIn}
              />
            ))}
          </div>
          
          {/* ===== ADDITIONAL SEO CONTENT ===== */}
          <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h2>About {getCategoryTitle()} in Uganda</h2>
            <p style={{ maxWidth: '24rem' }}>
              Robert & Izak Computers offers the best selection of {getCategoryTitle().toLowerCase()} in Uganda. 
              We provide competitive prices, 2-year warranty, and free delivery in Kampala. 
              As Uganda's leading computer store, we ensure quality products and expert customer support.
            </p>
            <p>
              <strong>Why choose Robert & Izak Computers?</strong><br/>
              ✅ 2-Year Warranty on All Products<br/>
              ✅ Free Delivery in Kampala<br/>
              ✅ Expert Technical Support<br/>
              ✅ Genuine Products Guaranteed<br/>
              ✅ Competitive Prices in Uganda
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;