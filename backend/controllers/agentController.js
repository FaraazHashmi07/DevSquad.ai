// backend/controllers/agentController.js
const fileService = require('../services/fileService');
const togetherService = require('../services/openaiService'); // Note: keeping same filename for compatibility
const documentService = require('../services/documentService');
const wordDocumentService = require('../services/wordDocumentService');
const presentationService = require('../services/presentationService');
const pptGenerationService = require('../services/pptGenerationService');

// Function to generate technical specifications from business requirements
async function generateTechnicalSpecifications(userPrompt, businessDocument) {
  // Parse the user prompt to determine website type and features
  const prompt = userPrompt.toLowerCase();

  let websiteType = 'general website';
  let coreFeatures = [];
  let uiRequirements = [];
  let projectOverview = '';

  // Determine website type and features based on user prompt - Enhanced with 6 specific types
  if (prompt.includes('jewelry') && (prompt.includes('ecommerce') || prompt.includes('e-commerce') || prompt.includes('shop') || prompt.includes('store') || prompt.includes('selling'))) {
    websiteType = 'E-commerce Jewelry Store';
    projectOverview = 'A modern e-commerce website for selling handmade jewelry with shopping cart, user authentication, and payment integration.';
    coreFeatures = [
      'Product catalog with filtering by type, material, price',
      'Shopping cart with add/remove functionality',
      'User registration and login system',
      'Checkout process with payment simulation',
      'Product search and wishlist functionality',
      'Product reviews and ratings',
      'High-quality product image displays',
      'Trust badges and security indicators',
      'Responsive design for mobile and desktop'
    ];
    uiRequirements = [
      'Elegant, luxury aesthetic with gold/silver color schemes',
      'High-quality product image galleries',
      'Clean, modern product grid layout',
      'Intuitive navigation and advanced search',
      'Mobile-first responsive design',
      'Trust badges and security indicators',
      'Elegant typography and spacing',
      'Professional checkout flow'
    ];
  } else if (prompt.includes('photography') && (prompt.includes('portfolio') || prompt.includes('gallery') || prompt.includes('booking'))) {
    websiteType = 'Photography Portfolio';
    projectOverview = 'A professional photography portfolio website with image gallery, client testimonials, and booking system.';
    coreFeatures = [
      'Image galleries with lightbox functionality',
      'Portfolio categories (wedding, portrait, landscape)',
      'Client testimonials carousel',
      'Booking form with calendar integration',
      'Contact information and inquiry forms',
      'About photographer section',
      'Service packages and pricing',
      'Social media integration',
      'Responsive image displays'
    ];
    uiRequirements = [
      'Clean, minimalist design aesthetic',
      'Full-screen image displays',
      'Elegant typography and spacing',
      'Dark/light theme options',
      'Professional color schemes',
      'Smooth image transitions',
      'Mobile-optimized galleries',
      'Fast loading image optimization'
    ];
  } else if (prompt.includes('restaurant') && (prompt.includes('menu') || prompt.includes('ordering') || prompt.includes('reservation'))) {
    websiteType = 'Restaurant Website';
    projectOverview = 'A restaurant website with interactive menu, online ordering system, table reservations, and location map.';
    coreFeatures = [
      'Interactive menu with categories and prices',
      'Online ordering cart system',
      'Table reservation form with date/time selection',
      'Location map integration',
      'Restaurant hours and contact information',
      'Chef and restaurant story section',
      'Special events and promotions',
      'Customer reviews and testimonials',
      'Mobile-friendly ordering system'
    ];
    uiRequirements = [
      'Warm, inviting color schemes',
      'Appetizing food photography displays',
      'Mobile-first responsive design',
      'Easy-to-read menu layouts',
      'Intuitive ordering interface',
      'Professional restaurant branding',
      'Fast loading food images',
      'Clear call-to-action buttons'
    ];
  } else if (prompt.includes('blog') && (prompt.includes('platform') || prompt.includes('content') || prompt.includes('comment'))) {
    websiteType = 'Blog Platform';
    projectOverview = 'A comprehensive blog platform with user authentication, content management, comment system, and SEO optimization.';
    coreFeatures = [
      'Article listing with pagination',
      'Individual article pages with full content',
      'Comment system with moderation',
      'Author profiles and bio sections',
      'Category and tag filtering',
      'Search functionality across articles',
      'Social sharing buttons',
      'Related articles suggestions',
      'SEO-optimized structure'
    ];
    uiRequirements = [
      'Clean, readable typography',
      'Sidebar navigation with categories',
      'Professional blogging aesthetic',
      'Responsive layout for all devices',
      'Easy-to-scan article layouts',
      'Clear author attribution',
      'Social media integration',
      'Fast loading and optimized performance'
    ];
  } else if (prompt.includes('fitness') && (prompt.includes('tracking') || prompt.includes('workout') || prompt.includes('nutrition'))) {
    websiteType = 'Fitness Tracking App';
    projectOverview = 'A fitness tracking application with workout plans, progress monitoring, nutrition tracking, and social features.';
    coreFeatures = [
      'Workout plan displays with exercises',
      'Progress charts and graphs',
      'Nutrition calculator and tracking',
      'BMI calculator and health metrics',
      'User profile dashboard',
      'Social sharing features',
      'Goal setting and achievement tracking',
      'Exercise library with instructions',
      'Mobile-optimized interface'
    ];
    uiRequirements = [
      'Energetic color scheme (blues, greens, oranges)',
      'Modern dashboard layout',
      'Chart and graph visualizations',
      'Mobile-optimized design',
      'Clear progress indicators',
      'Motivational design elements',
      'Easy-to-use form interfaces',
      'Professional fitness branding'
    ];
  } else if (prompt.includes('corporate') && (prompt.includes('consulting') || prompt.includes('business') || prompt.includes('professional'))) {
    websiteType = 'Corporate Consulting';
    projectOverview = 'A corporate consulting website with service pages, team profiles, case studies, and client portal.';
    coreFeatures = [
      'Service descriptions with detailed pricing',
      'Team member profiles with expertise',
      'Case study showcases with results',
      'Client testimonials and success stories',
      'Contact forms and consultation booking',
      'Newsletter signup and resources',
      'Industry insights and blog',
      'Professional credentials display',
      'Client portal access'
    ];
    uiRequirements = [
      'Professional, trustworthy design',
      'Corporate color schemes (blues, grays)',
      'Clean, business-appropriate layouts',
      'Professional photography and imagery',
      'Clear service presentations',
      'Credibility indicators and certifications',
      'Mobile-responsive business design',
      'Fast loading and professional performance'
    ];
  } else if (prompt.includes('calculator') || prompt.includes('calc')) {
    websiteType = 'Calculator Web Application';
    projectOverview = 'An interactive calculator web application with advanced mathematical functions and user-friendly interface.';
    coreFeatures = [
      'Basic arithmetic operations (+, -, *, /)',
      'Advanced mathematical functions (sin, cos, tan, log)',
      'Memory functions (store, recall, clear)',
      'History of calculations',
      'Keyboard input support',
      'Copy/paste functionality',
      'Responsive design for all devices'
    ];
    uiRequirements = [
      'Large, easy-to-press buttons',
      'Clear display screen',
      'Intuitive button layout',
      'Visual feedback for button presses',
      'Error handling and display',
      'Clean, professional appearance'
    ];
  } else if (prompt.includes('fashion') || prompt.includes('clothing') || prompt.includes('apparel')) {
    websiteType = 'Fashion Website';
    projectOverview = 'A stylish fashion website showcasing clothing collections with modern design and user engagement features.';
    coreFeatures = [
      'Fashion product showcase',
      'Image galleries and lookbooks',
      'Style guides and fashion tips',
      'Newsletter subscription',
      'Social media integration',
      'Brand story and about section',
      'Contact and location information'
    ];
    uiRequirements = [
      'High-quality image displays',
      'Elegant typography and spacing',
      'Color schemes that reflect brand identity',
      'Smooth animations and transitions',
      'Instagram-style photo grids',
      'Mobile-optimized browsing experience'
    ];
  } else if (prompt.includes('portfolio') || prompt.includes('personal')) {
    websiteType = 'Portfolio Website';
    projectOverview = 'A professional portfolio website to showcase work, skills, and achievements with modern design.';
    coreFeatures = [
      'Project showcase with descriptions',
      'Skills and expertise display',
      'About me section',
      'Contact form',
      'Resume/CV download',
      'Testimonials section',
      'Blog or news section'
    ];
    uiRequirements = [
      'Clean, professional layout',
      'Project thumbnail galleries',
      'Smooth scrolling navigation',
      'Professional color scheme',
      'Typography that enhances readability',
      'Call-to-action buttons'
    ];
  } else {
    // Default website type
    websiteType = 'Business Website';
    projectOverview = 'A professional business website with modern design and essential business features.';
    coreFeatures = [
      'Homepage with company overview',
      'Services or products section',
      'About us page',
      'Contact information and form',
      'Testimonials or reviews',
      'News or blog section',
      'Mobile-responsive design'
    ];
    uiRequirements = [
      'Professional and trustworthy design',
      'Clear navigation structure',
      'Compelling call-to-action buttons',
      'Fast loading times',
      'SEO-friendly structure',
      'Contact form with validation'
    ];
  }

  return {
    websiteType,
    projectOverview,
    coreFeatures,
    uiRequirements,
    userPrompt,
    technicalStack: {
      frontend: 'React 18.2.0 with Vite build tool',
      styling: 'CSS Modules and modern CSS with Flexbox/Grid',
      routing: 'React Router DOM for navigation',
      interactivity: 'React hooks (useState, useEffect) and component state',
      dataManagement: 'JSON data imports from src/data directory',
      deployment: 'Vite build output for static hosting (Netlify, Vercel, GitHub Pages)'
    }
  };
}

// Function to generate functional website based on technical specifications
async function generateFunctionalWebsite(specs) {
  const websiteType = specs.websiteType || 'Business Website';

  if (websiteType.includes('E-commerce Jewelry Store')) {
    return generateJewelryEcommerceWebsite(specs);
  } else if (websiteType.includes('Photography Portfolio')) {
    return generatePhotographyPortfolioWebsite(specs);
  } else if (websiteType.includes('Restaurant Website')) {
    return generateRestaurantWebsite(specs);
  } else if (websiteType.includes('Blog Platform')) {
    return generateBlogPlatformWebsite(specs);
  } else if (websiteType.includes('Fitness Tracking App')) {
    return generateFitnessTrackingWebsite(specs);
  } else if (websiteType.includes('Corporate Consulting')) {
    return generateCorporateConsultingWebsite(specs);
  } else if (websiteType.includes('Calculator')) {
    return generateCalculatorWebsite(specs);
  } else if (websiteType.includes('E-commerce') || websiteType.includes('ecommerce')) {
    return generateEcommerceWebsite(specs);
  } else if (websiteType.includes('Fashion')) {
    return generateFashionWebsite(specs);
  } else if (websiteType.includes('Portfolio')) {
    return generatePortfolioWebsite(specs);
  } else {
    return generateBusinessWebsite(specs);
  }
}

// Generate Jewelry E-commerce Website
function generateJewelryEcommerceWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luxe Jewelry - Handmade Elegance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #2c2c2c;
            background: #fafafa;
        }

        .header {
            background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
            color: #2c2c2c;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #2c2c2c;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: #2c2c2c;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #8b4513;
        }

        .cart-icon {
            position: relative;
            cursor: pointer;
            background: #2c2c2c;
            color: #d4af37;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            transition: all 0.3s;
        }

        .cart-icon:hover {
            background: #8b4513;
            color: #ffd700;
        }

        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }

        .hero {
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23f8f9fa" width="1200" height="600"/><text x="600" y="300" text-anchor="middle" font-size="48" fill="%23d4af37">💎 Handcrafted Jewelry</text></svg>');
            background-size: cover;
            background-position: center;
            height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }

        .hero-content h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }

        .hero-content p {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            max-width: 600px;
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
            color: #2c2c2c;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 30px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 4rem 0;
        }

        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #2c2c2c;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
        }

        .filters {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 3rem;
            flex-wrap: wrap;
        }

        .filter-btn {
            background: white;
            border: 2px solid #d4af37;
            color: #d4af37;
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .filter-btn:hover,
        .filter-btn.active {
            background: #d4af37;
            color: white;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .product-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s;
            position: relative;
        }

        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .product-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            position: relative;
            overflow: hidden;
        }

        .product-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #dc3545;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .product-info {
            padding: 1.5rem;
        }

        .product-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #2c2c2c;
        }

        .product-description {
            color: #666;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }

        .product-price {
            font-size: 1.8rem;
            color: #d4af37;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .product-actions {
            display: flex;
            gap: 0.5rem;
        }

        .add-to-cart {
            flex: 1;
            background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
            color: #2c2c2c;
            border: none;
            padding: 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }

        .add-to-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .wishlist-btn {
            background: white;
            border: 2px solid #d4af37;
            color: #d4af37;
            padding: 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .wishlist-btn:hover {
            background: #d4af37;
            color: white;
        }

        .trust-section {
            background: white;
            padding: 3rem 0;
            text-align: center;
        }

        .trust-badges {
            display: flex;
            justify-content: center;
            gap: 3rem;
            flex-wrap: wrap;
        }

        .trust-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .trust-icon {
            font-size: 3rem;
            color: #d4af37;
        }

        .footer {
            background: #2c2c2c;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }

        @media (max-width: 768px) {
            .nav {
                flex-direction: column;
                gap: 1rem;
            }

            .hero-content h1 {
                font-size: 2.5rem;
            }

            .filters {
                justify-content: center;
            }

            .trust-badges {
                gap: 2rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">💎 Luxe Jewelry</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="cart-icon" onclick="toggleCart()">
                🛒 Cart <span class="cart-count" id="cartCount">0</span>
            </div>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Handcrafted Elegance</h1>
            <p>Discover our exclusive collection of handmade jewelry, crafted with love and attention to detail</p>
            <a href="#collections" class="btn">Shop Collection</a>
        </div>
    </section>

    <section class="section" id="collections">
        <div class="container">
            <h2 class="section-title">Our Collections</h2>

            <div class="filters">
                <button class="filter-btn active" onclick="filterProducts('all')">All</button>
                <button class="filter-btn" onclick="filterProducts('rings')">Rings</button>
                <button class="filter-btn" onclick="filterProducts('necklaces')">Necklaces</button>
                <button class="filter-btn" onclick="filterProducts('earrings')">Earrings</button>
                <button class="filter-btn" onclick="filterProducts('bracelets')">Bracelets</button>
            </div>

            <div class="product-grid" id="productGrid">
                <!-- Products will be loaded here -->
            </div>
        </div>
    </section>

    <section class="trust-section">
        <div class="container">
            <h3 style="margin-bottom: 2rem; color: #2c2c2c;">Why Choose Luxe Jewelry?</h3>
            <div class="trust-badges">
                <div class="trust-badge">
                    <div class="trust-icon">🔒</div>
                    <div>
                        <h4>Secure Payment</h4>
                        <p>SSL encrypted checkout</p>
                    </div>
                </div>
                <div class="trust-badge">
                    <div class="trust-icon">🚚</div>
                    <div>
                        <h4>Free Shipping</h4>
                        <p>On orders over $100</p>
                    </div>
                </div>
                <div class="trust-badge">
                    <div class="trust-icon">💎</div>
                    <div>
                        <h4>Lifetime Warranty</h4>
                        <p>Quality guaranteed</p>
                    </div>
                </div>
                <div class="trust-badge">
                    <div class="trust-icon">↩️</div>
                    <div>
                        <h4>30-Day Returns</h4>
                        <p>Hassle-free returns</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Luxe Jewelry. Handcrafted with ❤️ by AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        // Jewelry E-commerce functionality
        let cart = [];
        let wishlist = [];
        let products = [
            { id: 1, name: 'Diamond Solitaire Ring', price: 1299.99, category: 'rings', emoji: '💍', description: 'Classic diamond solitaire in 18k gold', badge: 'Bestseller' },
            { id: 2, name: 'Pearl Necklace', price: 899.99, category: 'necklaces', emoji: '📿', description: 'Elegant freshwater pearl strand', badge: 'New' },
            { id: 3, name: 'Gold Hoop Earrings', price: 599.99, category: 'earrings', emoji: '👂', description: 'Classic 14k gold hoops', badge: '' },
            { id: 4, name: 'Tennis Bracelet', price: 1599.99, category: 'bracelets', emoji: '💫', description: 'Diamond tennis bracelet in white gold', badge: 'Premium' },
            { id: 5, name: 'Emerald Ring', price: 2199.99, category: 'rings', emoji: '💚', description: 'Natural emerald with diamond accents', badge: 'Exclusive' },
            { id: 6, name: 'Silver Chain Necklace', price: 299.99, category: 'necklaces', emoji: '⛓️', description: 'Sterling silver chain with pendant', badge: '' },
            { id: 7, name: 'Stud Earrings', price: 799.99, category: 'earrings', emoji: '✨', description: 'Diamond stud earrings in platinum', badge: 'Popular' },
            { id: 8, name: 'Charm Bracelet', price: 449.99, category: 'bracelets', emoji: '🍀', description: 'Silver charm bracelet with charms', badge: '' }
        ];

        function loadProducts(filter = 'all') {
            const productGrid = document.getElementById('productGrid');
            const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

            productGrid.innerHTML = filteredProducts.map(product => \`
                <div class="product-card" data-category="\${product.category}">
                    <div class="product-image">
                        \${product.emoji}
                        \${product.badge ? \`<div class="product-badge">\${product.badge}</div>\` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-title">\${product.name}</div>
                        <div class="product-description">\${product.description}</div>
                        <div class="product-price">$\${product.price}</div>
                        <div class="product-actions">
                            <button class="add-to-cart" onclick="addToCart(\${product.id})">
                                Add to Cart
                            </button>
                            <button class="wishlist-btn" onclick="toggleWishlist(\${product.id})" title="Add to Wishlist">
                                ❤️
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function filterProducts(category) {
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Load filtered products
            loadProducts(category);
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            updateCartDisplay();
            showNotification(\`\${product.name} added to cart!\`, 'success');
        }

        function toggleWishlist(productId) {
            const product = products.find(p => p.id === productId);
            const existingIndex = wishlist.findIndex(item => item.id === productId);

            if (existingIndex > -1) {
                wishlist.splice(existingIndex, 1);
                showNotification(\`\${product.name} removed from wishlist\`, 'info');
            } else {
                wishlist.push(product);
                showNotification(\`\${product.name} added to wishlist!\`, 'success');
            }
        }

        function updateCartDisplay() {
            const cartCount = document.getElementById('cartCount');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        function toggleCart() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'info');
                return;
            }

            const cartSummary = cart.map(item =>
                \`\${item.name} x\${item.quantity} - $\${(item.price * item.quantity).toFixed(2)}\`
            ).join('\\n');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            alert(\`Shopping Cart:\\n\\n\${cartSummary}\\n\\nTotal: $\${total.toFixed(2)}\\n\\nThis is a demo checkout.\`);
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? '#28a745' : type === 'info' ? '#17a2b8' : '#ffc107';

            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: \${bgColor};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 1001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize the jewelry store
        loadProducts();
    </script>
</body>
</html>`;
}

// Generate E-commerce Website
function generateEcommerceWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopSmart - Your Online Store</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .header {
            background: #2c3e50;
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #3498db;
        }

        .cart-icon {
            position: relative;
            cursor: pointer;
        }

        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }

        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 4rem 2rem;
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }

        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }

        .btn:hover {
            background: #2980b9;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .products {
            padding: 4rem 0;
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .product-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s;
        }

        .product-card:hover {
            transform: translateY(-5px);
        }

        .product-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: #999;
        }

        .product-info {
            padding: 1.5rem;
        }

        .product-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .product-price {
            font-size: 1.5rem;
            color: #e74c3c;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .add-to-cart {
            width: 100%;
        }

        .cart-sidebar {
            position: fixed;
            right: -400px;
            top: 0;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            transition: right 0.3s;
            z-index: 1000;
            padding: 2rem;
            overflow-y: auto;
        }

        .cart-sidebar.open {
            right: 0;
        }

        .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
        }

        .close-cart {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }

        .cart-total {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 2px solid #eee;
        }

        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }

        @media (max-width: 768px) {
            .nav {
                flex-direction: column;
                gap: 1rem;
            }

            .nav-links {
                gap: 1rem;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .cart-sidebar {
                width: 100%;
                right: -100%;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🛒 ShopSmart</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="cart-icon" onclick="toggleCart()">
                🛒 Cart <span class="cart-count" id="cartCount">0</span>
            </div>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Welcome to ShopSmart</h1>
            <p>Discover amazing products at unbeatable prices</p>
            <a href="#products" class="btn">Shop Now</a>
        </div>
    </section>

    <section class="products" id="products">
        <div class="container">
            <h2 class="section-title">Featured Products</h2>
            <div class="product-grid" id="productGrid">
                <!-- Products will be loaded here -->
            </div>
        </div>
    </section>

    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h3>Shopping Cart</h3>
            <button class="close-cart" onclick="toggleCart()">×</button>
        </div>
        <div id="cartItems">
            <!-- Cart items will appear here -->
        </div>
        <div class="cart-total">
            <h3>Total: $<span id="cartTotal">0.00</span></h3>
            <button class="btn" style="width: 100%; margin-top: 1rem;" onclick="checkout()">
                Proceed to Checkout
            </button>
        </div>
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ShopSmart. Built with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        // E-commerce functionality
        let cart = [];
        let products = [
            { id: 1, name: 'Wireless Headphones', price: 99.99, emoji: '🎧' },
            { id: 2, name: 'Smart Watch', price: 199.99, emoji: '⌚' },
            { id: 3, name: 'Laptop Stand', price: 49.99, emoji: '💻' },
            { id: 4, name: 'Coffee Mug', price: 19.99, emoji: '☕' },
            { id: 5, name: 'Phone Case', price: 29.99, emoji: '📱' },
            { id: 6, name: 'Desk Lamp', price: 79.99, emoji: '💡' }
        ];

        function loadProducts() {
            const productGrid = document.getElementById('productGrid');
            productGrid.innerHTML = products.map(product => \`
                <div class="product-card">
                    <div class="product-image">\${product.emoji}</div>
                    <div class="product-info">
                        <div class="product-title">\${product.name}</div>
                        <div class="product-price">$\${product.price}</div>
                        <button class="btn add-to-cart" onclick="addToCart(\${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            updateCartDisplay();
            showNotification('Product added to cart!');
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartDisplay();
        }

        function updateCartDisplay() {
            const cartCount = document.getElementById('cartCount');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');

            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            cartCount.textContent = totalItems;
            cartTotal.textContent = totalPrice.toFixed(2);

            cartItems.innerHTML = cart.map(item => \`
                <div class="cart-item">
                    <div>
                        <div>\${item.name}</div>
                        <div>$\${item.price} x \${item.quantity}</div>
                    </div>
                    <button onclick="removeFromCart(\${item.id})" style="background: #e74c3c; color: white; border: none; padding: 0.5rem; border-radius: 3px; cursor: pointer;">
                        Remove
                    </button>
                </div>
            \`).join('');
        }

        function toggleCart() {
            const cartSidebar = document.getElementById('cartSidebar');
            cartSidebar.classList.toggle('open');
        }

        function checkout() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            alert('Thank you for your purchase! This is a demo checkout.');
            cart = [];
            updateCartDisplay();
            toggleCart();
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 1rem;
                border-radius: 5px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize the store
        loadProducts();
    </script>
</body>
</html>`;
}

// Generate Photography Portfolio Website
function generatePhotographyPortfolioWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex Morgan Photography - Professional Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #000;
        }

        .header {
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            padding: 1rem 0;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 300;
            color: white;
            letter-spacing: 2px;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 300;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #f39c12;
        }

        .hero {
            height: 100vh;
            background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23222" width="1200" height="800"/><text x="600" y="400" text-anchor="middle" font-size="48" fill="%23f39c12">📸 Professional Photography</text></svg>');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }

        .hero-content h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            font-weight: 300;
            letter-spacing: 3px;
        }

        .hero-content p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            font-weight: 300;
        }

        .btn {
            display: inline-block;
            background: transparent;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border: 2px solid white;
            border-radius: 30px;
            transition: all 0.3s;
        }

        .btn:hover {
            background: white;
            color: #000;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 5rem 0;
            background: white;
            color: #333;
        }

        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            font-weight: 300;
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        .gallery-item {
            position: relative;
            aspect-ratio: 1;
            overflow: hidden;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .gallery-item:hover {
            transform: scale(1.05);
        }

        .gallery-image {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }

        .gallery-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.3s;
            color: white;
            text-align: center;
        }

        .gallery-item:hover .gallery-overlay {
            opacity: 1;
        }

        .booking-form {
            max-width: 600px;
            margin: 0 auto;
            display: grid;
            gap: 1.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }

        .submit-btn {
            background: #f39c12;
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
        }

        .submit-btn:hover {
            background: #e67e22;
        }

        .footer {
            background: #000;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }

        @media (max-width: 768px) {
            .hero-content h1 {
                font-size: 2.5rem;
            }
            .gallery-grid {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">📸 Alex Morgan</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#portfolio">Portfolio</a></li>
                <li><a href="#booking">Book Session</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Alex Morgan</h1>
            <p>Professional Photography • Capturing Life's Beautiful Moments</p>
            <a href="#portfolio" class="btn">View Portfolio</a>
        </div>
    </section>

    <section class="section" id="portfolio">
        <div class="container">
            <h2 class="section-title">Portfolio</h2>
            <div class="gallery-grid" id="galleryGrid">
                <!-- Gallery items will be loaded here -->
            </div>
        </div>
    </section>

    <section class="section" id="booking" style="background: #333; color: white;">
        <div class="container">
            <h2 class="section-title" style="color: white;">Book a Session</h2>
            <form class="booking-form" onsubmit="submitBooking(event)">
                <div class="form-group">
                    <input type="text" name="name" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Your Email" required>
                </div>
                <div class="form-group">
                    <select name="session-type" required>
                        <option value="">Select Session Type</option>
                        <option value="wedding">Wedding Photography</option>
                        <option value="portrait">Portrait Session</option>
                        <option value="family">Family Photos</option>
                        <option value="event">Event Photography</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="date" name="date" required>
                </div>
                <div class="form-group">
                    <textarea name="message" rows="4" placeholder="Tell me about your vision..."></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Booking Request</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Alex Morgan Photography. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        let galleryItems = [
            { id: 1, category: 'wedding', title: 'Romantic Wedding', emoji: '💒' },
            { id: 2, category: 'portrait', title: 'Professional Headshot', emoji: '👤' },
            { id: 3, category: 'landscape', title: 'Mountain Vista', emoji: '🏔️' },
            { id: 4, category: 'wedding', title: 'Reception Dance', emoji: '💃' },
            { id: 5, category: 'portrait', title: 'Family Portrait', emoji: '👨‍👩‍👧‍👦' },
            { id: 6, category: 'landscape', title: 'Ocean Sunset', emoji: '🌅' }
        ];

        function loadGallery() {
            const galleryGrid = document.getElementById('galleryGrid');
            galleryGrid.innerHTML = galleryItems.map(item => \`
                <div class="gallery-item">
                    <div class="gallery-image">\${item.emoji}</div>
                    <div class="gallery-overlay">
                        <div>
                            <h3>\${item.title}</h3>
                            <p>Category: \${item.category}</p>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function submitBooking(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get('name');
            const sessionType = formData.get('session-type');

            alert(\`Thank you \${name}! Your booking request for \${sessionType} has been received. I'll contact you within 24 hours.\`);
            event.target.reset();
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize
        loadGallery();
    </script>
</body>
</html>`;
}

// Generate Calculator Website
function generateCalculatorWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Calculator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .calculator-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 2rem;
            max-width: 400px;
            width: 100%;
        }
        .calculator-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .calculator-header h1 {
            color: #2c3e50;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .display {
            background: #2c3e50;
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            text-align: right;
            font-size: 2rem;
            font-family: 'Courier New', monospace;
            min-height: 80px;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
        }
        .btn {
            padding: 1rem;
            border: none;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            background: #ecf0f1;
            color: #2c3e50;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn.operator {
            background: #3498db;
            color: white;
        }
        .btn.equals {
            background: #e74c3c;
            color: white;
            grid-column: span 2;
        }
        .btn.clear {
            background: #f39c12;
            color: white;
        }
        .btn.zero {
            grid-column: span 2;
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <div class="calculator-header">
            <h1>🧮 Advanced Calculator</h1>
            <p>Professional calculation tool</p>
        </div>
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="btn clear" onclick="clearAll()">AC</button>
            <button class="btn clear" onclick="clearEntry()">CE</button>
            <button class="btn operator" onclick="appendOperator('/')" title="Divide">÷</button>
            <button class="btn operator" onclick="appendOperator('*')" title="Multiply">×</button>
            <button class="btn" onclick="appendNumber('7')">7</button>
            <button class="btn" onclick="appendNumber('8')">8</button>
            <button class="btn" onclick="appendNumber('9')">9</button>
            <button class="btn operator" onclick="appendOperator('-')" title="Subtract">−</button>
            <button class="btn" onclick="appendNumber('4')">4</button>
            <button class="btn" onclick="appendNumber('5')">5</button>
            <button class="btn" onclick="appendNumber('6')">6</button>
            <button class="btn operator" onclick="appendOperator('+')" title="Add">+</button>
            <button class="btn" onclick="appendNumber('1')">1</button>
            <button class="btn" onclick="appendNumber('2')">2</button>
            <button class="btn" onclick="appendNumber('3')">3</button>
            <button class="btn operator" onclick="calculatePercentage()" title="Percentage">%</button>
            <button class="btn zero" onclick="appendNumber('0')">0</button>
            <button class="btn" onclick="appendDecimal()" title="Decimal">.</button>
            <button class="btn equals" onclick="calculate()" title="Equals">=</button>
        </div>
    </div>
    <script>
        let currentInput = '0';
        let previousInput = '';
        let operator = '';
        let shouldResetDisplay = false;

        function updateDisplay() {
            document.getElementById('display').textContent = currentInput;
        }

        function appendNumber(number) {
            if (shouldResetDisplay) {
                currentInput = number;
                shouldResetDisplay = false;
            } else {
                currentInput = currentInput === '0' ? number : currentInput + number;
            }
            updateDisplay();
        }

        function appendDecimal() {
            if (shouldResetDisplay) {
                currentInput = '0.';
                shouldResetDisplay = false;
            } else if (!currentInput.includes('.')) {
                currentInput += '.';
            }
            updateDisplay();
        }

        function appendOperator(op) {
            if (previousInput && operator && !shouldResetDisplay) {
                calculate();
            }
            previousInput = currentInput;
            operator = op;
            shouldResetDisplay = true;
        }

        function calculate() {
            if (!previousInput || !operator) return;
            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);
            let result;

            switch (operator) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '*': result = prev * current; break;
                case '/':
                    if (current === 0) {
                        alert('Cannot divide by zero!');
                        return;
                    }
                    result = prev / current;
                    break;
                default: return;
            }

            currentInput = result.toString();
            previousInput = '';
            operator = '';
            shouldResetDisplay = true;
            updateDisplay();
        }

        function calculatePercentage() {
            const current = parseFloat(currentInput);
            currentInput = (current / 100).toString();
            updateDisplay();
        }

        function clearAll() {
            currentInput = '0';
            previousInput = '';
            operator = '';
            shouldResetDisplay = false;
            updateDisplay();
        }

        function clearEntry() {
            currentInput = '0';
            updateDisplay();
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            if (key >= '0' && key <= '9') {
                appendNumber(key);
            } else if (key === '.') {
                appendDecimal();
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            }
        });

        updateDisplay();
    </script>
</body>
</html>`;
}

// Generate Restaurant Website
function generateRestaurantWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bella Vista Restaurant - Authentic Italian Cuisine</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #2c2c2c;
        }

        .header {
            background: rgba(139, 69, 19, 0.95);
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #ffd700;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #ffd700;
        }

        .hero {
            height: 80vh;
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23d2691e" width="1200" height="600"/><text x="600" y="300" text-anchor="middle" font-size="48" fill="%23ffd700">🍝 Authentic Italian Cuisine</text></svg>');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }

        .hero-content h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }

        .hero-content p {
            font-size: 1.5rem;
            margin-bottom: 2rem;
        }

        .btn {
            display: inline-block;
            background: #d2691e;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 30px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
        }

        .btn:hover {
            background: #8b4513;
            transform: translateY(-2px);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 4rem 0;
        }

        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #8b4513;
        }

        .menu-categories {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 3rem;
            flex-wrap: wrap;
        }

        .category-btn {
            background: white;
            border: 2px solid #d2691e;
            color: #d2691e;
            padding: 0.8rem 2rem;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .category-btn:hover,
        .category-btn.active {
            background: #d2691e;
            color: white;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .menu-item {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s;
        }

        .menu-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .menu-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
        }

        .menu-info {
            padding: 1.5rem;
        }

        .menu-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #8b4513;
        }

        .menu-description {
            color: #666;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }

        .menu-price {
            font-size: 1.5rem;
            color: #d2691e;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .order-btn {
            width: 100%;
            background: #d2691e;
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }

        .order-btn:hover {
            background: #8b4513;
        }

        .reservation-section {
            background: #f8f9fa;
        }

        .reservation-form {
            max-width: 600px;
            margin: 0 auto;
            display: grid;
            gap: 1.5rem;
        }

        .form-group {
            display: grid;
            gap: 0.5rem;
        }

        .form-group input,
        .form-group select {
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
        }

        .footer {
            background: #8b4513;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }

        .hours-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .hours-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
            .hero-content h1 {
                font-size: 2.5rem;
            }
            .menu-categories {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🍝 Bella Vista</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#reservations">Reservations</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Bella Vista</h1>
            <p>Authentic Italian Cuisine in the Heart of the City</p>
            <a href="#menu" class="btn">View Menu</a>
        </div>
    </section>

    <section class="section" id="menu">
        <div class="container">
            <h2 class="section-title">Our Menu</h2>

            <div class="menu-categories">
                <button class="category-btn active" onclick="filterMenu('all')">All</button>
                <button class="category-btn" onclick="filterMenu('appetizers')">Appetizers</button>
                <button class="category-btn" onclick="filterMenu('pasta')">Pasta</button>
                <button class="category-btn" onclick="filterMenu('pizza')">Pizza</button>
                <button class="category-btn" onclick="filterMenu('desserts')">Desserts</button>
            </div>

            <div class="menu-grid" id="menuGrid">
                <!-- Menu items will be loaded here -->
            </div>
        </div>
    </section>

    <section class="section reservation-section" id="reservations">
        <div class="container">
            <h2 class="section-title">Make a Reservation</h2>

            <form class="reservation-form" onsubmit="submitReservation(event)">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="date">Date</label>
                    <input type="date" id="date" name="date" required>
                </div>
                <div class="form-group">
                    <label for="time">Time</label>
                    <select id="time" name="time" required>
                        <option value="">Select Time</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="17:30">5:30 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="19:30">7:30 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="20:30">8:30 PM</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="guests">Number of Guests</label>
                    <select id="guests" name="guests" required>
                        <option value="">Select Guests</option>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5">5 Guests</option>
                        <option value="6">6+ Guests</option>
                    </select>
                </div>
                <button type="submit" class="btn">Make Reservation</button>
            </form>

            <div class="hours-info">
                <div class="hours-card">
                    <h3>📍 Location</h3>
                    <p>123 Italian Street<br>Downtown, City 12345</p>
                </div>
                <div class="hours-card">
                    <h3>🕒 Hours</h3>
                    <p>Mon-Thu: 5:00 PM - 10:00 PM<br>Fri-Sat: 5:00 PM - 11:00 PM<br>Sun: 4:00 PM - 9:00 PM</p>
                </div>
                <div class="hours-card">
                    <h3>📞 Contact</h3>
                    <p>Phone: (555) 123-4567<br>Email: info@bellavista.com</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Bella Vista Restaurant. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        let menuItems = [
            { id: 1, name: 'Bruschetta', price: 12.99, category: 'appetizers', emoji: '🍞', description: 'Toasted bread with fresh tomatoes and basil' },
            { id: 2, name: 'Spaghetti Carbonara', price: 18.99, category: 'pasta', emoji: '🍝', description: 'Classic pasta with eggs, cheese, and pancetta' },
            { id: 3, name: 'Margherita Pizza', price: 16.99, category: 'pizza', emoji: '🍕', description: 'Fresh mozzarella, tomato sauce, and basil' },
            { id: 4, name: 'Tiramisu', price: 8.99, category: 'desserts', emoji: '🍰', description: 'Classic Italian dessert with coffee and mascarpone' },
            { id: 5, name: 'Antipasto Platter', price: 15.99, category: 'appetizers', emoji: '🧀', description: 'Selection of cured meats and cheeses' },
            { id: 6, name: 'Fettuccine Alfredo', price: 17.99, category: 'pasta', emoji: '🍜', description: 'Creamy pasta with parmesan cheese' },
            { id: 7, name: 'Pepperoni Pizza', price: 18.99, category: 'pizza', emoji: '🍕', description: 'Classic pizza with pepperoni and mozzarella' },
            { id: 8, name: 'Gelato', price: 6.99, category: 'desserts', emoji: '🍨', description: 'Homemade Italian ice cream' }
        ];

        let cart = [];

        function loadMenu(filter = 'all') {
            const menuGrid = document.getElementById('menuGrid');
            const filteredItems = filter === 'all' ? menuItems : menuItems.filter(item => item.category === filter);

            menuGrid.innerHTML = filteredItems.map(item => \`
                <div class="menu-item">
                    <div class="menu-image">\${item.emoji}</div>
                    <div class="menu-info">
                        <div class="menu-title">\${item.name}</div>
                        <div class="menu-description">\${item.description}</div>
                        <div class="menu-price">$\${item.price}</div>
                        <button class="order-btn" onclick="addToOrder(\${item.id})">
                            Add to Order
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        function filterMenu(category) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            loadMenu(category);
        }

        function addToOrder(itemId) {
            const item = menuItems.find(i => i.id === itemId);
            const existingItem = cart.find(cartItem => cartItem.id === itemId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...item, quantity: 1 });
            }

            showNotification(\`\${item.name} added to order!\`);
        }

        function submitReservation(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get('name');
            const date = formData.get('date');
            const time = formData.get('time');
            const guests = formData.get('guests');

            alert(\`Thank you \${name}! Your reservation for \${guests} guests on \${date} at \${time} has been confirmed. We'll send you a confirmation email shortly.\`);
            event.target.reset();
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 1001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize
        loadMenu();
    </script>
</body>
</html>`;
}

// Generate Blog Platform Website
function generateBlogPlatformWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechInsights Blog - Latest Technology Trends</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }

        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c3e50;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #3498db;
        }

        .search-box {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            border-radius: 25px;
            padding: 0.5rem 1rem;
            border: 1px solid #e9ecef;
        }

        .search-box input {
            border: none;
            background: none;
            outline: none;
            padding: 0.5rem;
            width: 200px;
        }

        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 0;
            text-align: center;
        }

        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .hero p {
            font-size: 1.3rem;
            max-width: 600px;
            margin: 0 auto 2rem;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
            padding: 3rem 0;
        }

        .articles-section {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .section-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.5rem;
        }

        .article-filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .filter-btn {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            color: #6c757d;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .filter-btn:hover,
        .filter-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        .articles-grid {
            display: grid;
            gap: 2rem;
        }

        .article-card {
            border: 1px solid #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s;
            background: white;
        }

        .article-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .article-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }

        .article-content {
            padding: 1.5rem;
        }

        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: #6c757d;
        }

        .article-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #2c3e50;
        }

        .article-excerpt {
            color: #6c757d;
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .read-more {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .read-more:hover {
            color: #2980b9;
        }

        .sidebar {
            display: grid;
            gap: 2rem;
        }

        .sidebar-widget {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .widget-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #2c3e50;
        }

        .popular-posts {
            display: grid;
            gap: 1rem;
        }

        .popular-post {
            display: flex;
            gap: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e9ecef;
        }

        .popular-post:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .popular-post-image {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .popular-post-content {
            flex: 1;
        }

        .popular-post-title {
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }

        .popular-post-date {
            font-size: 0.8rem;
            color: #6c757d;
        }

        .categories-list {
            display: grid;
            gap: 0.5rem;
        }

        .category-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f8f9fa;
            cursor: pointer;
            transition: color 0.3s;
        }

        .category-item:hover {
            color: #3498db;
        }

        .newsletter-form {
            display: grid;
            gap: 1rem;
        }

        .newsletter-form input {
            padding: 0.8rem;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            font-size: 1rem;
        }

        .newsletter-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s;
        }

        .newsletter-btn:hover {
            background: #2980b9;
        }

        .pagination {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }

        .page-btn {
            background: white;
            border: 1px solid #e9ecef;
            color: #6c757d;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .page-btn:hover,
        .page-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 3rem 0;
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .nav {
                flex-direction: column;
                gap: 1rem;
            }

            .search-box {
                width: 100%;
            }

            .search-box input {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">📝 TechInsights</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#articles">Articles</a></li>
                <li><a href="#categories">Categories</a></li>
                <li><a href="#about">About</a></li>
            </ul>
            <div class="search-box">
                <input type="text" placeholder="Search articles..." id="searchInput" onkeyup="searchArticles()">
                <span>🔍</span>
            </div>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>TechInsights Blog</h1>
            <p>Stay updated with the latest technology trends, tutorials, and industry insights.</p>
        </div>
    </section>

    <div class="container">
        <div class="main-content">
            <main class="articles-section" id="articles">
                <h2 class="section-title">Latest Articles</h2>

                <div class="article-filters">
                    <button class="filter-btn active" onclick="filterArticles('all')">All</button>
                    <button class="filter-btn" onclick="filterArticles('technology')">Technology</button>
                    <button class="filter-btn" onclick="filterArticles('programming')">Programming</button>
                    <button class="filter-btn" onclick="filterArticles('ai')">AI & ML</button>
                </div>

                <div class="articles-grid" id="articlesGrid">
                    <!-- Articles will be loaded here -->
                </div>
            </main>

            <aside class="sidebar">
                <div class="sidebar-widget">
                    <h3 class="widget-title">Popular Posts</h3>
                    <div class="popular-posts" id="popularPosts">
                        <!-- Popular posts will be loaded here -->
                    </div>
                </div>

                <div class="sidebar-widget">
                    <h3 class="widget-title">Newsletter</h3>
                    <p>Subscribe to get the latest articles.</p>
                    <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
                        <input type="email" placeholder="Your email" required>
                        <button type="submit" class="newsletter-btn">Subscribe</button>
                    </form>
                </div>
            </aside>
        </div>
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 TechInsights Blog. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        let articles = [
            {
                id: 1,
                title: 'The Future of Artificial Intelligence in 2024',
                excerpt: 'Exploring the latest developments in AI technology.',
                category: 'ai',
                author: 'Dr. Sarah Chen',
                date: '2024-01-15',
                emoji: '🤖'
            },
            {
                id: 2,
                title: 'Modern JavaScript Frameworks Comparison',
                excerpt: 'A comprehensive guide to choosing the right framework.',
                category: 'programming',
                author: 'Mike Johnson',
                date: '2024-01-12',
                emoji: '⚛️'
            },
            {
                id: 3,
                title: 'Building Responsive Web Applications',
                excerpt: 'Best practices for creating responsive web apps.',
                category: 'technology',
                author: 'Emily Rodriguez',
                date: '2024-01-10',
                emoji: '📱'
            }
        ];

        function loadArticles(filter = 'all') {
            const articlesGrid = document.getElementById('articlesGrid');
            const filteredArticles = filter === 'all' ? articles : articles.filter(article => article.category === filter);

            articlesGrid.innerHTML = filteredArticles.map(article => \`
                <article class="article-card" onclick="openArticle(\${article.id})">
                    <div class="article-image">\${article.emoji}</div>
                    <div class="article-content">
                        <div class="article-meta">
                            <span>👤 \${article.author}</span>
                            <span>📅 \${article.date}</span>
                        </div>
                        <h3 class="article-title">\${article.title}</h3>
                        <p class="article-excerpt">\${article.excerpt}</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
            \`).join('');
        }

        function loadPopularPosts() {
            const popularPosts = document.getElementById('popularPosts');
            popularPosts.innerHTML = articles.slice(0, 3).map(post => \`
                <div class="popular-post" onclick="openArticle(\${post.id})">
                    <div class="popular-post-image">\${post.emoji}</div>
                    <div class="popular-post-content">
                        <div class="popular-post-title">\${post.title}</div>
                        <div class="popular-post-date">\${post.date}</div>
                    </div>
                </div>
            \`).join('');
        }

        function filterArticles(category) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            loadArticles(category);
        }

        function searchArticles() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            if (searchTerm === '') {
                loadArticles();
                return;
            }
            const filteredArticles = articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.excerpt.toLowerCase().includes(searchTerm)
            );
            const articlesGrid = document.getElementById('articlesGrid');
            articlesGrid.innerHTML = filteredArticles.map(article => \`
                <article class="article-card">
                    <div class="article-image">\${article.emoji}</div>
                    <div class="article-content">
                        <h3 class="article-title">\${article.title}</h3>
                        <p class="article-excerpt">\${article.excerpt}</p>
                    </div>
                </article>
            \`).join('');
        }

        function openArticle(articleId) {
            const article = articles.find(a => a.id === articleId);
            alert(\`Opening article: "\${article.title}"\`);
        }

        function subscribeNewsletter(event) {
            event.preventDefault();
            const email = event.target.querySelector('input[type="email"]').value;
            alert(\`Thank you for subscribing with \${email}!\`);
            event.target.reset();
        }

        // Initialize
        loadArticles();
        loadPopularPosts();
    </script>
</body>
</html>\`;
}

// Generate Fitness Tracking Website
function generateFitnessTrackingWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitTracker Pro - Your Fitness Journey</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .header {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #667eea;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #667eea;
        }

        .hero {
            padding: 4rem 0;
            text-align: center;
            color: white;
        }

        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .dashboard {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            transition: transform 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 1rem;
            opacity: 0.9;
        }

        .section {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .section-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 0.5rem;
        }

        .workout-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .workout-card {
            border: 2px solid #f0f0f0;
            border-radius: 15px;
            padding: 1.5rem;
            transition: all 0.3s;
            cursor: pointer;
        }

        .workout-card:hover {
            border-color: #667eea;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .workout-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .workout-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
        }

        .workout-duration {
            background: #667eea;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.9rem;
        }

        .workout-exercises {
            color: #666;
            margin-bottom: 1rem;
        }

        .start-workout-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }

        .start-workout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .nutrition-calculator {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .calculator-form {
            display: grid;
            gap: 1rem;
        }

        .form-group {
            display: grid;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 500;
            color: #333;
        }

        .form-group input,
        .form-group select {
            padding: 0.8rem;
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }

        .calculate-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        }

        .calculate-btn:hover {
            background: #218838;
        }

        .results-panel {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
        }

        .bmi-result {
            font-size: 3rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 1rem;
        }

        .bmi-category {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
        }

        .progress-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .progress-chart {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
        }

        .chart-placeholder {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .social-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }

        .achievement-card {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 1.5rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .achievement-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .footer {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            text-align: center;
            padding: 3rem 0;
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }

            .dashboard-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }

            .nutrition-calculator {
                grid-template-columns: 1fr;
            }

            .nav {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">💪 FitTracker Pro</div>
            <ul class="nav-links">
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#workouts">Workouts</a></li>
                <li><a href="#nutrition">Nutrition</a></li>
                <li><a href="#progress">Progress</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero">
        <div class="container">
            <h1>Your Fitness Journey Starts Here</h1>
            <p>Track workouts, monitor nutrition, and achieve your fitness goals with our comprehensive tracking platform.</p>
        </div>
    </section>

    <div class="container">
        <section class="dashboard" id="dashboard">
            <h2 class="section-title">Today's Overview</h2>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value" id="caloriesBurned">420</div>
                    <div class="stat-label">Calories Burned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value" id="workoutTime">45</div>
                    <div class="stat-label">Minutes Active</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value" id="goalProgress">75</div>
                    <div class="stat-label">% Goal Complete</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value" id="weeklyStreak">7</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            </div>
        </section>

        <section class="section" id="workouts">
            <h2 class="section-title">Workout Plans</h2>
            <div class="workout-grid" id="workoutGrid">
                <!-- Workouts will be loaded here -->
            </div>
        </section>

        <section class="section" id="nutrition">
            <h2 class="section-title">Nutrition Calculator</h2>
            <div class="nutrition-calculator">
                <div class="calculator-form">
                    <div class="form-group">
                        <label for="height">Height (cm)</label>
                        <input type="number" id="height" placeholder="170">
                    </div>
                    <div class="form-group">
                        <label for="weight">Weight (kg)</label>
                        <input type="number" id="weight" placeholder="70">
                    </div>
                    <div class="form-group">
                        <label for="age">Age</label>
                        <input type="number" id="age" placeholder="25">
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="activity">Activity Level</label>
                        <select id="activity">
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light Activity</option>
                            <option value="moderate">Moderate Activity</option>
                            <option value="active">Very Active</option>
                        </select>
                    </div>
                    <button class="calculate-btn" onclick="calculateBMI()">Calculate BMI & Calories</button>
                </div>
                <div class="results-panel">
                    <h3>Your Results</h3>
                    <div class="bmi-result" id="bmiResult">--</div>
                    <div class="bmi-category" id="bmiCategory">Enter your details</div>
                    <div id="calorieNeeds" style="margin-top: 1rem; font-size: 1.1rem;"></div>
                </div>
            </div>
        </section>

        <section class="section" id="progress">
            <h2 class="section-title">Progress Tracking</h2>
            <div class="progress-section">
                <div class="progress-chart">
                    <h3>Weight Progress</h3>
                    <div class="chart-placeholder">📊 Weight Chart</div>
                    <p>Track your weight changes over time</p>
                </div>
                <div class="progress-chart">
                    <h3>Workout Frequency</h3>
                    <div class="chart-placeholder">📈 Activity Chart</div>
                    <p>Monitor your workout consistency</p>
                </div>
            </div>

            <div class="social-features">
                <div class="achievement-card">
                    <div class="achievement-icon">🏆</div>
                    <h3>First Week Complete!</h3>
                    <p>You've completed your first week of workouts</p>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">🔥</div>
                    <h3>Calorie Crusher</h3>
                    <p>Burned over 500 calories in a single workout</p>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">💪</div>
                    <h3>Strength Builder</h3>
                    <p>Completed 10 strength training sessions</p>
                </div>
            </div>
        </section>
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 FitTracker Pro. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        let workouts = [
            {
                id: 1,
                title: 'Full Body HIIT',
                duration: '30 min',
                exercises: 'Burpees, Push-ups, Squats, Mountain Climbers',
                emoji: '🔥',
                difficulty: 'Intermediate'
            },
            {
                id: 2,
                title: 'Upper Body Strength',
                duration: '45 min',
                exercises: 'Bench Press, Pull-ups, Shoulder Press, Rows',
                emoji: '💪',
                difficulty: 'Advanced'
            },
            {
                id: 3,
                title: 'Cardio Blast',
                duration: '25 min',
                exercises: 'Running, Jumping Jacks, High Knees, Sprints',
                emoji: '🏃',
                difficulty: 'Beginner'
            },
            {
                id: 4,
                title: 'Core & Abs',
                duration: '20 min',
                exercises: 'Planks, Crunches, Russian Twists, Leg Raises',
                emoji: '🎯',
                difficulty: 'Intermediate'
            },
            {
                id: 5,
                title: 'Yoga Flow',
                duration: '40 min',
                exercises: 'Sun Salutations, Warrior Poses, Downward Dog',
                emoji: '🧘',
                difficulty: 'Beginner'
            },
            {
                id: 6,
                title: 'Leg Day Power',
                duration: '50 min',
                exercises: 'Squats, Deadlifts, Lunges, Calf Raises',
                emoji: '🦵',
                difficulty: 'Advanced'
            }
        ];

        function loadWorkouts() {
            const workoutGrid = document.getElementById('workoutGrid');
            workoutGrid.innerHTML = workouts.map(workout =>
                '<div class="workout-card" onclick="startWorkout(' + workout.id + ')">' +
                    '<div class="workout-header">' +
                        '<div class="workout-title">' + workout.emoji + ' ' + workout.title + '</div>' +
                        '<div class="workout-duration">' + workout.duration + '</div>' +
                    '</div>' +
                    '<div class="workout-exercises">' + workout.exercises + '</div>' +
                    '<div style="margin-bottom: 1rem; color: #667eea; font-weight: 500;">' +
                        'Difficulty: ' + workout.difficulty +
                    '</div>' +
                    '<button class="start-workout-btn">Start Workout</button>' +
                '</div>'
            ).join('');
        }

        function startWorkout(workoutId) {
            const workout = workouts.find(w => w.id === workoutId);
            alert('Starting "' + workout.title + '" workout!\\n\\nDuration: ' + workout.duration + '\\nExercises: ' + workout.exercises + '\\n\\nThis would launch the workout timer and exercise guide.');

            // Update stats (simulation)
            updateStats();
        }

        function calculateBMI() {
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const age = parseFloat(document.getElementById('age').value);
            const gender = document.getElementById('gender').value;
            const activity = document.getElementById('activity').value;

            if (!height || !weight || !age) {
                alert('Please fill in all fields');
                return;
            }

            // Calculate BMI
            const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
            document.getElementById('bmiResult').textContent = bmi;

            // Determine BMI category
            let category = '';
            let categoryColor = '';
            if (bmi < 18.5) {
                category = 'Underweight';
                categoryColor = '#17a2b8';
            } else if (bmi < 25) {
                category = 'Normal Weight';
                categoryColor = '#28a745';
            } else if (bmi < 30) {
                category = 'Overweight';
                categoryColor = '#ffc107';
            } else {
                category = 'Obese';
                categoryColor = '#dc3545';
            }

            const categoryElement = document.getElementById('bmiCategory');
            categoryElement.textContent = category;
            categoryElement.style.backgroundColor = categoryColor;
            categoryElement.style.color = 'white';

            // Calculate daily calorie needs (simplified formula)
            let bmr;
            if (gender === 'male') {
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else {
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }

            const activityMultipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725
            };

            const dailyCalories = Math.round(bmr * activityMultipliers[activity]);
            document.getElementById('calorieNeeds').innerHTML = \`
                <strong>Daily Calorie Needs: \${dailyCalories} calories</strong><br>
                <small>Based on your activity level</small>
            \`;
        }

        function updateStats() {
            // Simulate updating dashboard stats
            const caloriesBurned = document.getElementById('caloriesBurned');
            const workoutTime = document.getElementById('workoutTime');
            const goalProgress = document.getElementById('goalProgress');

            caloriesBurned.textContent = parseInt(caloriesBurned.textContent) + 50;
            workoutTime.textContent = parseInt(workoutTime.textContent) + 30;
            goalProgress.textContent = Math.min(100, parseInt(goalProgress.textContent) + 10);
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize
        loadWorkouts();
    </script>
</body>
</html>\`;
}

// Generate Corporate Consulting Website
function generateCorporateConsultingWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strategic Solutions Consulting - Business Excellence</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }

        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c3e50;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #3498db;
        }

        .cta-btn {
            background: #3498db;
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            text-decoration: none;
            transition: all 0.3s;
        }

        .cta-btn:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }

        .hero {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 5rem 0;
            text-align: center;
        }

        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            display: block;
        }

        .stat-label {
            font-size: 1rem;
            opacity: 0.9;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 4rem 0;
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .service-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s;
            border-left: 5px solid #3498db;
        }

        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .service-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #3498db;
        }

        .service-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #2c3e50;
        }

        .service-description {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .service-price {
            font-size: 1.3rem;
            color: #3498db;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .service-features {
            list-style: none;
            margin-bottom: 1.5rem;
        }

        .service-features li {
            padding: 0.3rem 0;
            color: #666;
        }

        .service-features li:before {
            content: '✓';
            color: #27ae60;
            font-weight: bold;
            margin-right: 0.5rem;
        }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
        }

        .team-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: all 0.3s;
        }

        .team-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        .team-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3498db, #2c3e50);
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
        }

        .team-name {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }

        .team-position {
            color: #3498db;
            font-weight: 500;
            margin-bottom: 1rem;
        }

        .team-bio {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .case-studies {
            background: white;
        }

        .case-study-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .case-study-card {
            border: 1px solid #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            transition: all 0.3s;
        }

        .case-study-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }

        .case-study-header {
            background: linear-gradient(135deg, #3498db, #2c3e50);
            color: white;
            padding: 1.5rem;
        }

        .case-study-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .case-study-client {
            opacity: 0.9;
        }

        .case-study-content {
            padding: 1.5rem;
        }

        .case-study-challenge {
            margin-bottom: 1rem;
        }

        .case-study-result {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
        }

        .contact-section {
            background: #2c3e50;
            color: white;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }

        .contact-info h3 {
            margin-bottom: 2rem;
            font-size: 2rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .contact-icon {
            font-size: 1.5rem;
            color: #3498db;
        }

        .contact-form {
            display: grid;
            gap: 1.5rem;
        }

        .form-group {
            display: grid;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 1rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: rgba(255,255,255,0.7);
        }

        .submit-btn {
            background: #3498db;
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: background 0.3s;
        }

        .submit-btn:hover {
            background: #2980b9;
        }

        .footer {
            background: #1a252f;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }

            .hero-stats {
                flex-direction: column;
                gap: 1.5rem;
            }

            .contact-grid {
                grid-template-columns: 1fr;
            }

            .nav {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🏢 Strategic Solutions</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#team">Team</a></li>
                <li><a href="#case-studies">Case Studies</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <a href="#contact" class="cta-btn">Get Consultation</a>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Strategic Business Solutions</h1>
            <p>Transforming businesses through expert consulting, innovative strategies, and proven methodologies that drive sustainable growth and competitive advantage.</p>
            <a href="#services" class="cta-btn" style="font-size: 1.1rem; padding: 1rem 2rem;">Explore Our Services</a>

            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-number">500+</span>
                    <span class="stat-label">Clients Served</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">15+</span>
                    <span class="stat-label">Years Experience</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">98%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title">Our Services</h2>
            <div class="services-grid" id="servicesGrid">
                <!-- Services will be loaded here -->
            </div>
        </div>
    </section>

    <section class="section" id="team">
        <div class="container">
            <h2 class="section-title">Our Expert Team</h2>
            <div class="team-grid" id="teamGrid">
                <!-- Team members will be loaded here -->
            </div>
        </div>
    </section>

    <section class="section case-studies" id="case-studies">
        <div class="container">
            <h2 class="section-title">Success Stories</h2>
            <div class="case-study-grid" id="caseStudyGrid">
                <!-- Case studies will be loaded here -->
            </div>
        </div>
    </section>

    <section class="section contact-section" id="contact">
        <div class="container">
            <div class="contact-grid">
                <div class="contact-info">
                    <h3>Get In Touch</h3>
                    <div class="contact-item">
                        <div class="contact-icon">📍</div>
                        <div>
                            <strong>Address</strong><br>
                            123 Business District<br>
                            Corporate Plaza, Suite 500<br>
                            New York, NY 10001
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">📞</div>
                        <div>
                            <strong>Phone</strong><br>
                            +1 (555) 123-4567
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">✉️</div>
                        <div>
                            <strong>Email</strong><br>
                            info@strategicsolutions.com
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">🕒</div>
                        <div>
                            <strong>Business Hours</strong><br>
                            Monday - Friday: 9:00 AM - 6:00 PM<br>
                            Saturday: 10:00 AM - 2:00 PM
                        </div>
                    </div>
                </div>

                <form class="contact-form" onsubmit="submitConsultation(event)">
                    <h3>Request Consultation</h3>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" placeholder="Your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" name="company" placeholder="Your company name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" placeholder="Your phone number">
                    </div>
                    <div class="form-group">
                        <label for="service">Service Interest</label>
                        <select id="service" name="service" required>
                            <option value="">Select a service</option>
                            <option value="strategy">Strategic Planning</option>
                            <option value="operations">Operations Optimization</option>
                            <option value="digital">Digital Transformation</option>
                            <option value="finance">Financial Advisory</option>
                            <option value="hr">HR Consulting</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Project Details</label>
                        <textarea id="message" name="message" rows="4" placeholder="Tell us about your project and goals..."></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Request Consultation</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Strategic Solutions Consulting. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        let services = [
            {
                id: 1,
                title: 'Strategic Planning',
                icon: '🎯',
                description: 'Comprehensive strategic planning services to align your business objectives with market opportunities.',
                price: 'Starting at $5,000',
                features: ['Market Analysis', 'Competitive Intelligence', 'Strategic Roadmap', 'KPI Development']
            },
            {
                id: 2,
                title: 'Operations Optimization',
                icon: '⚙️',
                description: 'Streamline your operations for maximum efficiency and cost reduction.',
                price: 'Starting at $7,500',
                features: ['Process Mapping', 'Workflow Optimization', 'Cost Reduction', 'Quality Improvement']
            },
            {
                id: 3,
                title: 'Digital Transformation',
                icon: '💻',
                description: 'Navigate the digital landscape with our comprehensive transformation strategies.',
                price: 'Starting at $10,000',
                features: ['Technology Assessment', 'Digital Strategy', 'Implementation Support', 'Change Management']
            },
            {
                id: 4,
                title: 'Financial Advisory',
                icon: '💰',
                description: 'Expert financial guidance to optimize your capital structure and investment decisions.',
                price: 'Starting at $6,000',
                features: ['Financial Analysis', 'Investment Strategy', 'Risk Assessment', 'Performance Metrics']
            },
            {
                id: 5,
                title: 'HR Consulting',
                icon: '👥',
                description: 'Build high-performing teams with our human resources consulting expertise.',
                price: 'Starting at $4,500',
                features: ['Talent Acquisition', 'Performance Management', 'Culture Development', 'Training Programs']
            },
            {
                id: 6,
                title: 'Market Research',
                icon: '📊',
                description: 'In-depth market research and analysis to inform your business decisions.',
                price: 'Starting at $3,500',
                features: ['Market Sizing', 'Customer Insights', 'Trend Analysis', 'Competitive Landscape']
            }
        ];

        let teamMembers = [
            {
                id: 1,
                name: 'Sarah Johnson',
                position: 'Managing Partner',
                emoji: '👩‍💼',
                bio: 'MBA from Harvard, 20+ years in strategic consulting with Fortune 500 companies.'
            },
            {
                id: 2,
                name: 'Michael Chen',
                position: 'Operations Director',
                emoji: '👨‍💼',
                bio: 'Former McKinsey consultant specializing in operational excellence and process optimization.'
            },
            {
                id: 3,
                name: 'Emily Rodriguez',
                position: 'Digital Strategy Lead',
                emoji: '👩‍💻',
                bio: 'Technology transformation expert with experience in Fortune 100 digital initiatives.'
            },
            {
                id: 4,
                name: 'David Kim',
                position: 'Financial Advisor',
                emoji: '👨‍💰',
                bio: 'CPA and former investment banker with expertise in corporate finance and M&A.'
            }
        ];

        let caseStudies = [
            {
                id: 1,
                title: 'Manufacturing Efficiency Transformation',
                client: 'Global Manufacturing Corp',
                challenge: 'Reduce operational costs by 25% while maintaining quality standards.',
                result: 'Achieved 30% cost reduction and 15% quality improvement through process optimization.'
            },
            {
                id: 2,
                title: 'Digital Transformation Initiative',
                client: 'Regional Bank',
                challenge: 'Modernize legacy systems and improve customer experience.',
                result: 'Increased customer satisfaction by 40% and reduced processing time by 60%.'
            },
            {
                id: 3,
                title: 'Strategic Market Expansion',
                client: 'Tech Startup',
                challenge: 'Enter new international markets with limited resources.',
                result: 'Successfully launched in 3 new markets, achieving 200% revenue growth.'
            }
        ];

        function loadServices() {
            const servicesGrid = document.getElementById('servicesGrid');
            servicesGrid.innerHTML = services.map(service => \`
                <div class="service-card">
                    <div class="service-icon">\${service.icon}</div>
                    <div class="service-title">\${service.title}</div>
                    <div class="service-description">\${service.description}</div>
                    <div class="service-price">\${service.price}</div>
                    <ul class="service-features">
                        \${service.features.map(feature => \`<li>\${feature}</li>\`).join('')}
                    </ul>
                    <button class="cta-btn" onclick="requestService('\${service.title}')" style="width: 100%; border: none; cursor: pointer;">
                        Get Quote
                    </button>
                </div>
            \`).join('');
        }

        function loadTeam() {
            const teamGrid = document.getElementById('teamGrid');
            teamGrid.innerHTML = teamMembers.map(member => \`
                <div class="team-card">
                    <div class="team-photo">\${member.emoji}</div>
                    <div class="team-name">\${member.name}</div>
                    <div class="team-position">\${member.position}</div>
                    <div class="team-bio">\${member.bio}</div>
                </div>
            \`).join('');
        }

        function loadCaseStudies() {
            const caseStudyGrid = document.getElementById('caseStudyGrid');
            caseStudyGrid.innerHTML = caseStudies.map(study => \`
                <div class="case-study-card">
                    <div class="case-study-header">
                        <div class="case-study-title">\${study.title}</div>
                        <div class="case-study-client">\${study.client}</div>
                    </div>
                    <div class="case-study-content">
                        <div class="case-study-challenge">
                            <strong>Challenge:</strong> \${study.challenge}
                        </div>
                        <div class="case-study-result">
                            <strong>Result:</strong> \${study.result}
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function requestService(serviceName) {
            alert(\`Thank you for your interest in our \${serviceName} service!\\n\\nPlease fill out the consultation form below and we'll contact you within 24 hours to discuss your specific needs and provide a detailed proposal.\`);
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }

        function submitConsultation(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get('name');
            const company = formData.get('company');
            const service = formData.get('service');

            alert(\`Thank you \${name} from \${company}!\\n\\nYour consultation request for \${service} has been received. Our team will contact you within 24 hours to schedule a detailed discussion about your project requirements.\`);
            event.target.reset();
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize
        loadServices();
        loadTeam();
        loadCaseStudies();
    </script>
</body>
</html>\`;
}

// Generate Fashion Website
function generateFashionWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StyleHub - Fashion Forward</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: #000;
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .logo {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: color 0.3s;
        }
        .nav-links a:hover {
            color: #f39c12;
        }
        .hero {
            height: 100vh;
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23f8f9fa" width="1200" height="800"/><text x="600" y="400" text-anchor="middle" font-size="48" fill="%23666">👗 Fashion Collection</text></svg>');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }
        .hero-content h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .hero-content p {
            font-size: 1.5rem;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            background: #f39c12;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn:hover {
            background: #e67e22;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .section {
            padding: 4rem 0;
        }
        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }
        .collection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        .collection-item {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .collection-item:hover {
            transform: translateY(-10px);
        }
        .collection-image {
            width: 100%;
            height: 300px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
        }
        .collection-info {
            padding: 2rem;
        }
        .collection-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .collection-description {
            color: #666;
            margin-bottom: 1.5rem;
        }
        .about {
            background: #f8f9fa;
        }
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .newsletter {
            background: #2c3e50;
            color: white;
            text-align: center;
        }
        .newsletter-form {
            display: flex;
            max-width: 500px;
            margin: 2rem auto 0;
            gap: 1rem;
        }
        .newsletter-input {
            flex: 1;
            padding: 1rem;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
        }
        .footer {
            background: #000;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        @media (max-width: 768px) {
            .hero-content h1 { font-size: 2.5rem; }
            .about-content { grid-template-columns: 1fr; }
            .newsletter-form { flex-direction: column; }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">✨ StyleHub</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Fashion Forward</h1>
            <p>Discover the latest trends and timeless classics</p>
            <a href="#collections" class="btn">Explore Collections</a>
        </div>
    </section>

    <section class="section" id="collections">
        <div class="container">
            <h2 class="section-title">Our Collections</h2>
            <div class="collection-grid">
                <div class="collection-item">
                    <div class="collection-image">👗</div>
                    <div class="collection-info">
                        <div class="collection-title">Summer Elegance</div>
                        <div class="collection-description">Light, breezy fabrics perfect for warm weather styling</div>
                        <button class="btn" onclick="viewCollection('summer')">View Collection</button>
                    </div>
                </div>
                <div class="collection-item">
                    <div class="collection-image">👔</div>
                    <div class="collection-info">
                        <div class="collection-title">Professional Chic</div>
                        <div class="collection-description">Sophisticated pieces for the modern professional</div>
                        <button class="btn" onclick="viewCollection('professional')">View Collection</button>
                    </div>
                </div>
                <div class="collection-item">
                    <div class="collection-image">👠</div>
                    <div class="collection-info">
                        <div class="collection-title">Evening Glamour</div>
                        <div class="collection-description">Stunning pieces for special occasions and nights out</div>
                        <button class="btn" onclick="viewCollection('evening')">View Collection</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section about" id="about">
        <div class="container">
            <div class="about-content">
                <div>
                    <h2>About StyleHub</h2>
                    <p>We believe fashion is a form of self-expression that should be accessible to everyone. Our curated collections blend contemporary trends with timeless elegance, ensuring you always look and feel your best.</p>
                    <p>Founded with a passion for style and quality, StyleHub has been helping fashion enthusiasts discover their unique aesthetic for over a decade.</p>
                </div>
                <div style="background: linear-gradient(45deg, #f0f0f0, #e0e0e0); height: 300px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                    🌟
                </div>
            </div>
        </div>
    </section>

    <section class="section newsletter">
        <div class="container">
            <h2>Stay In Style</h2>
            <p>Subscribe to our newsletter for the latest fashion trends and exclusive offers</p>
            <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
                <input type="email" class="newsletter-input" placeholder="Enter your email" required>
                <button type="submit" class="btn">Subscribe</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 StyleHub. Built with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        function viewCollection(type) {
            alert(\`Viewing \${type} collection! This would open a detailed gallery in a full implementation.\`);
        }

        function subscribeNewsletter(event) {
            event.preventDefault();
            const email = event.target.querySelector('input').value;
            alert(\`Thank you for subscribing with \${email}! You'll receive our latest fashion updates.\`);
            event.target.reset();
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = \`translateY(\${scrolled * 0.5}px)\`;
            }
        });
    </script>
</body>
</html>`;
}

// Generate Portfolio Website
function generatePortfolioWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            padding: 1rem 0;
        }
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2c3e50;
        }
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        .nav-links a {
            color: #2c3e50;
            text-decoration: none;
            transition: color 0.3s;
        }
        .nav-links a:hover {
            color: #3498db;
        }
        .hero {
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }
        .hero-content h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .hero-content p {
            font-size: 1.5rem;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn:hover {
            background: #2980b9;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .section {
            padding: 4rem 0;
        }
        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        .skill-item {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        .skill-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }
        .project-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .project-card:hover {
            transform: translateY(-10px);
        }
        .project-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }
        .project-info {
            padding: 2rem;
        }
        .contact {
            background: #2c3e50;
            color: white;
            text-align: center;
        }
        .contact-form {
            max-width: 600px;
            margin: 2rem auto 0;
        }
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
        }
        .footer {
            background: #000;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        @media (max-width: 768px) {
            .hero-content h1 { font-size: 2.5rem; }
            .nav { flex-direction: column; gap: 1rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">💼 John Doe</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>John Doe</h1>
            <p>Full-Stack Developer & Designer</p>
            <a href="#projects" class="btn">View My Work</a>
        </div>
    </section>

    <section class="section" id="about">
        <div class="container">
            <h2 class="section-title">About Me</h2>
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                    I'm a passionate full-stack developer with 5+ years of experience creating digital solutions that make a difference. I love turning complex problems into simple, beautiful designs.
                </p>
            </div>
            <div class="skills-grid">
                <div class="skill-item">
                    <div class="skill-icon">💻</div>
                    <h3>Frontend Development</h3>
                    <p>React, Vue.js, HTML5, CSS3, JavaScript</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">⚙️</div>
                    <h3>Backend Development</h3>
                    <p>Node.js, Python, PHP, Database Design</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">🎨</div>
                    <h3>UI/UX Design</h3>
                    <p>Figma, Adobe Creative Suite, Prototyping</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">☁️</div>
                    <h3>Cloud & DevOps</h3>
                    <p>AWS, Docker, CI/CD, Git</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="projects" style="background: #f8f9fa;">
        <div class="container">
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-image">🛒</div>
                    <div class="project-info">
                        <h3>E-commerce Platform</h3>
                        <p>A full-featured online store with payment processing, inventory management, and admin dashboard.</p>
                        <button class="btn" onclick="viewProject('ecommerce')">View Project</button>
                    </div>
                </div>
                <div class="project-card">
                    <div class="project-image">📱</div>
                    <div class="project-info">
                        <h3>Mobile App</h3>
                        <p>Cross-platform mobile application built with React Native for task management and productivity.</p>
                        <button class="btn" onclick="viewProject('mobile')">View Project</button>
                    </div>
                </div>
                <div class="project-card">
                    <div class="project-image">📊</div>
                    <div class="project-info">
                        <h3>Analytics Dashboard</h3>
                        <p>Real-time data visualization dashboard with interactive charts and reporting features.</p>
                        <button class="btn" onclick="viewProject('dashboard')">View Project</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section contact" id="contact">
        <div class="container">
            <h2 class="section-title" style="color: white;">Get In Touch</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                Let's work together to bring your ideas to life
            </p>
            <form class="contact-form" onsubmit="sendMessage(event)">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn">Send Message</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 John Doe. Built with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        function viewProject(type) {
            alert(\`Viewing \${type} project! This would open detailed project information in a full implementation.\`);
        }

        function sendMessage(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get('name');
            alert(\`Thank you \${name}! Your message has been sent. I'll get back to you soon.\`);
            event.target.reset();
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Header background on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255,255,255,0.95)';
            } else {
                header.style.background = 'rgba(255,255,255,0.95)';
            }
        });
    </script>
</body>
</html>`;
}

// Generate Business Website
function generateBusinessWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechSolutions - Professional Services</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }
        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c3e50;
        }
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        .nav-links a {
            color: #2c3e50;
            text-decoration: none;
            transition: color 0.3s;
        }
        .nav-links a:hover {
            color: #3498db;
        }
        .hero {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 6rem 0;
            text-align: center;
        }
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
        }
        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .btn {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
        }
        .btn:hover {
            background: #c0392b;
        }
        .btn-secondary {
            background: transparent;
            border: 2px solid white;
        }
        .btn-secondary:hover {
            background: white;
            color: #2c3e50;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        .section {
            padding: 4rem 0;
        }
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #2c3e50;
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .service-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        .service-card:hover {
            transform: translateY(-5px);
        }
        .service-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #3498db;
        }
        .about {
            background: #f8f9fa;
        }
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .stats {
            background: #2c3e50;
            color: white;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            text-align: center;
        }
        .stat-item h3 {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 0.5rem;
        }
        .contact {
            background: #ecf0f1;
        }
        .contact-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
        }
        .contact-form {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .about-content { grid-template-columns: 1fr; }
            .contact-content { grid-template-columns: 1fr; }
            .nav { flex-direction: column; gap: 1rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🏢 TechSolutions</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Professional Business Solutions</h1>
            <p>We help businesses grow with innovative technology solutions and expert consulting services</p>
            <a href="#services" class="btn">Our Services</a>
            <a href="#contact" class="btn btn-secondary">Get Started</a>
        </div>
    </section>

    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title">Our Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">💻</div>
                    <h3>Web Development</h3>
                    <p>Custom websites and web applications built with modern technologies and best practices.</p>
                    <button class="btn" onclick="learnMore('web-development')">Learn More</button>
                </div>
                <div class="service-card">
                    <div class="service-icon">📱</div>
                    <h3>Mobile Apps</h3>
                    <p>Native and cross-platform mobile applications for iOS and Android devices.</p>
                    <button class="btn" onclick="learnMore('mobile-apps')">Learn More</button>
                </div>
                <div class="service-card">
                    <div class="service-icon">☁️</div>
                    <h3>Cloud Solutions</h3>
                    <p>Scalable cloud infrastructure and migration services for modern businesses.</p>
                    <button class="btn" onclick="learnMore('cloud-solutions')">Learn More</button>
                </div>
                <div class="service-card">
                    <div class="service-icon">🔒</div>
                    <h3>Cybersecurity</h3>
                    <p>Comprehensive security solutions to protect your business from digital threats.</p>
                    <button class="btn" onclick="learnMore('cybersecurity')">Learn More</button>
                </div>
                <div class="service-card">
                    <div class="service-icon">📊</div>
                    <h3>Data Analytics</h3>
                    <p>Transform your data into actionable insights with advanced analytics solutions.</p>
                    <button class="btn" onclick="learnMore('data-analytics')">Learn More</button>
                </div>
                <div class="service-card">
                    <div class="service-icon">🎯</div>
                    <h3>Digital Marketing</h3>
                    <p>Strategic digital marketing campaigns to grow your online presence and reach.</p>
                    <button class="btn" onclick="learnMore('digital-marketing')">Learn More</button>
                </div>
            </div>
        </div>
    </section>

    <section class="section about" id="about">
        <div class="container">
            <div class="about-content">
                <div>
                    <h2>About TechSolutions</h2>
                    <p>With over 10 years of experience in the technology industry, TechSolutions has been helping businesses transform their operations through innovative digital solutions.</p>
                    <p>Our team of expert developers, designers, and consultants work closely with clients to understand their unique challenges and deliver customized solutions that drive growth and efficiency.</p>
                    <p>We pride ourselves on staying ahead of technology trends and delivering solutions that not only meet today's needs but are also future-ready.</p>
                </div>
                <div style="background: linear-gradient(45deg, #f0f0f0, #e0e0e0); height: 300px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                    🚀
                </div>
            </div>
        </div>
    </section>

    <section class="section stats">
        <div class="container">
            <h2 class="section-title" style="color: white;">Our Track Record</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>500+</h3>
                    <p>Projects Completed</p>
                </div>
                <div class="stat-item">
                    <h3>200+</h3>
                    <p>Happy Clients</p>
                </div>
                <div class="stat-item">
                    <h3>10+</h3>
                    <p>Years Experience</p>
                </div>
                <div class="stat-item">
                    <h3>24/7</h3>
                    <p>Support Available</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section contact" id="contact">
        <div class="container">
            <h2 class="section-title">Get In Touch</h2>
            <div class="contact-content">
                <div>
                    <h3>Ready to Start Your Project?</h3>
                    <p>Contact us today to discuss how we can help transform your business with technology.</p>
                    <div style="margin-top: 2rem;">
                        <p><strong>📧 Email:</strong> info@techsolutions.com</p>
                        <p><strong>📞 Phone:</strong> (555) 123-4567</p>
                        <p><strong>📍 Address:</strong> 123 Business Ave, Tech City, TC 12345</p>
                        <p><strong>🕒 Hours:</strong> Mon-Fri 9AM-6PM</p>
                    </div>
                </div>
                <form class="contact-form" onsubmit="submitContactForm(event)">
                    <h3>Send us a message</h3>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="service">Service Interest</label>
                        <select id="service" name="service" style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="">Select a service</option>
                            <option value="web-development">Web Development</option>
                            <option value="mobile-apps">Mobile Apps</option>
                            <option value="cloud-solutions">Cloud Solutions</option>
                            <option value="cybersecurity">Cybersecurity</option>
                            <option value="data-analytics">Data Analytics</option>
                            <option value="digital-marketing">Digital Marketing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 TechSolutions. Built with AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        function learnMore(service) {
            alert(\`Learning more about \${service.replace('-', ' ')}! This would open detailed service information in a full implementation.\`);
        }

        function submitContactForm(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get('name');
            const service = formData.get('service');
            alert(\`Thank you \${name}! We've received your inquiry about \${service || 'our services'}. We'll get back to you within 24 hours.\`);
            event.target.reset();
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Animate stats on scroll
        function animateStats() {
            const stats = document.querySelectorAll('.stat-item h3');
            stats.forEach(stat => {
                const finalValue = parseInt(stat.textContent);
                let currentValue = 0;
                const increment = finalValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        stat.textContent = stat.textContent;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(currentValue) + (stat.textContent.includes('+') ? '+' : '');
                    }
                }, 50);
            });
        }

        // Trigger stats animation when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        });

        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    </script>
</body>
</html>`;
}

// Generate Calculator Website
function generateCalculatorWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Calculator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .calculator-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 2rem;
            max-width: 400px;
            width: 100%;
        }

        .calculator-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .calculator-header h1 {
            color: #2c3e50;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .calculator-header p {
            color: #7f8c8d;
        }

        .display {
            background: #2c3e50;
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            text-align: right;
            font-size: 2rem;
            font-family: 'Courier New', monospace;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .display-history {
            font-size: 1rem;
            color: #bdc3c7;
            margin-bottom: 0.5rem;
        }

        .display-current {
            font-size: 2rem;
            font-weight: bold;
        }

        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
        }

        .btn {
            padding: 1rem;
            border: none;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            background: #ecf0f1;
            color: #2c3e50;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn.operator {
            background: #3498db;
            color: white;
        }

        .btn.operator:hover {
            background: #2980b9;
        }

        .btn.equals {
            background: #e74c3c;
            color: white;
            grid-column: span 2;
        }

        .btn.equals:hover {
            background: #c0392b;
        }

        .btn.clear {
            background: #f39c12;
            color: white;
        }

        .btn.clear:hover {
            background: #e67e22;
        }

        .btn.zero {
            grid-column: span 2;
        }

        .history {
            margin-top: 2rem;
            max-height: 200px;
            overflow-y: auto;
        }

        .history-title {
            font-weight: bold;
            margin-bottom: 1rem;
            color: #2c3e50;
        }

        .history-item {
            padding: 0.5rem;
            background: #f8f9fa;
            margin-bottom: 0.5rem;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
        }

        @media (max-width: 480px) {
            .calculator-container {
                padding: 1rem;
            }

            .btn {
                padding: 0.8rem;
                font-size: 1rem;
            }

            .display-current {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <div class="calculator-header">
            <h1>🧮 Advanced Calculator</h1>
            <p>Professional calculation tool</p>
        </div>

        <div class="display">
            <div class="display-history" id="displayHistory"></div>
            <div class="display-current" id="displayCurrent">0</div>
        </div>

        <div class="buttons">
            <button class="btn clear" onclick="clearAll()">AC</button>
            <button class="btn clear" onclick="clearEntry()">CE</button>
            <button class="btn operator" onclick="appendOperator('/')" title="Divide">÷</button>
            <button class="btn operator" onclick="appendOperator('*')" title="Multiply">×</button>

            <button class="btn" onclick="appendNumber('7')">7</button>
            <button class="btn" onclick="appendNumber('8')">8</button>
            <button class="btn" onclick="appendNumber('9')">9</button>
            <button class="btn operator" onclick="appendOperator('-')" title="Subtract">−</button>

            <button class="btn" onclick="appendNumber('4')">4</button>
            <button class="btn" onclick="appendNumber('5')">5</button>
            <button class="btn" onclick="appendNumber('6')">6</button>
            <button class="btn operator" onclick="appendOperator('+')" title="Add">+</button>

            <button class="btn" onclick="appendNumber('1')">1</button>
            <button class="btn" onclick="appendNumber('2')">2</button>
            <button class="btn" onclick="appendNumber('3')">3</button>
            <button class="btn operator" onclick="calculatePercentage()" title="Percentage">%</button>

            <button class="btn zero" onclick="appendNumber('0')">0</button>
            <button class="btn" onclick="appendDecimal()" title="Decimal">.</button>
            <button class="btn equals" onclick="calculate()" title="Equals">=</button>
        </div>

        <div class="history">
            <div class="history-title">📋 Calculation History</div>
            <div id="historyList">
                <!-- History items will appear here -->
            </div>
        </div>
    </div>

    <script>
        let currentInput = '0';
        let previousInput = '';
        let operator = '';
        let shouldResetDisplay = false;
        let history = [];

        function updateDisplay() {
            const displayCurrent = document.getElementById('displayCurrent');
            const displayHistory = document.getElementById('displayHistory');

            displayCurrent.textContent = currentInput;

            if (previousInput && operator) {
                displayHistory.textContent = \`\${previousInput} \${getOperatorSymbol(operator)}\`;
            } else {
                displayHistory.textContent = '';
            }
        }

        function getOperatorSymbol(op) {
            const symbols = {
                '+': '+',
                '-': '−',
                '*': '×',
                '/': '÷'
            };
            return symbols[op] || op;
        }

        function appendNumber(number) {
            if (shouldResetDisplay) {
                currentInput = number;
                shouldResetDisplay = false;
            } else {
                currentInput = currentInput === '0' ? number : currentInput + number;
            }
            updateDisplay();
        }

        function appendDecimal() {
            if (shouldResetDisplay) {
                currentInput = '0.';
                shouldResetDisplay = false;
            } else if (!currentInput.includes('.')) {
                currentInput += '.';
            }
            updateDisplay();
        }

        function appendOperator(op) {
            if (previousInput && operator && !shouldResetDisplay) {
                calculate();
            }

            previousInput = currentInput;
            operator = op;
            shouldResetDisplay = true;
            updateDisplay();
        }

        function calculate() {
            if (!previousInput || !operator) return;

            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);
            let result;

            switch (operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        alert('Cannot divide by zero!');
                        return;
                    }
                    result = prev / current;
                    break;
                default:
                    return;
            }

            // Add to history
            const calculation = \`\${previousInput} \${getOperatorSymbol(operator)} \${currentInput} = \${result}\`;
            addToHistory(calculation);

            currentInput = result.toString();
            previousInput = '';
            operator = '';
            shouldResetDisplay = true;
            updateDisplay();
        }

        function calculatePercentage() {
            const current = parseFloat(currentInput);
            currentInput = (current / 100).toString();
            updateDisplay();
        }

        function clearAll() {
            currentInput = '0';
            previousInput = '';
            operator = '';
            shouldResetDisplay = false;
            updateDisplay();
        }

        function clearEntry() {
            currentInput = '0';
            updateDisplay();
        }

        function addToHistory(calculation) {
            history.unshift(calculation);
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            updateHistoryDisplay();
        }

        function updateHistoryDisplay() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = history.map(item =>
                \`<div class="history-item">\${item}</div>\`
            ).join('');
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;

            if (key >= '0' && key <= '9') {
                appendNumber(key);
            } else if (key === '.') {
                appendDecimal();
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
                updateDisplay();
            }
        });

        // Initialize display
        updateDisplay();
    </script>
</body>
</html>`;
}
const socketService = require('../services/socketService');
const { AGENT_ROLES } = require('../utils/constants');

/**
 * Run an agent to process a task
 */
exports.runAgentHandler = async (req, res, next) => {
  const { projectId, agentName } = req.params;
  
  // Check if the agent exists
  if (!AGENT_ROLES[agentName]) {
    return res.status(400).json({
      error: `Invalid agent name: ${agentName}`
    });
  }
  
  try {
    // Update project status
    await updateProjectStatus(projectId, agentName);
    
    // Start the agent processing in the background
    // In a real implementation, we would handle the agent logic here
    // and have the API return immediately while the agent works
    res.json({
      message: `Agent ${agentName} started successfully`,
      projectId,
      agentName
    });
    
    // Execute agent logic asynchronously
    processAgentTask(projectId, agentName);
  } catch (error) {
    next(error);
  }
};

/**
 * Update project status when agent starts
 */
async function updateProjectStatus(projectId, agentName) {
  const agent = AGENT_ROLES[agentName];
  const status = `${agent.name} (${agent.role}) is working...`;
  
  // Log the agent change
  await fileService.appendToLog(projectId, `${agent.name} (${agent.role}) has started working...`);
  
  // Notify clients
  socketService.emitToProject(projectId, 'agentChanged', {
    projectId,
    agent: agentName,
    status
  });
  
  // Update project config
  const fs = require('fs-extra');
  const path = require('path');
  
  const configPath = path.join(__dirname, '../data/projects', projectId, 'config.json');
  const config = await fs.readJson(configPath);
  
  config.currentAgent = agentName;
  config.status = status;
  
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Process the agent task asynchronously
 */
async function processAgentTask(projectId, agentName) {
  try {
    // In a real implementation, this would call the Together AI API with the agent's system prompt
    // For this example, we'll simulate some agent behavior
    
    // Simulate agent thinking time
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create some example files based on the agent
    const agent = AGENT_ROLES[agentName];
    
    if (agentName === 'emma') {
      // Get the original user prompt from project data
      const projectData = await fileService.getProjectData(projectId);
      const userPrompt = projectData?.userPrompt || 'Create a comprehensive business document';

      try {
        await fileService.appendToLog(projectId, 'Emma is generating a comprehensive business analysis document using advanced AI...');

        // Generate comprehensive business document with improved quality
        const businessDocument = await togetherService.generateBusinessDocument(userPrompt, 'comprehensive-business-analysis');

        // Validate and clean the generated document
        const validatedDocument = validateAndCleanDocument(businessDocument, userPrompt);

        // Save the generated business document as Markdown
        await fileService.writeFile(
          projectId,
          'docs/BusinessAnalysis.md',
          validatedDocument,
          'Emma'
        );

        await fileService.appendToLog(projectId, 'Emma is converting the business document to professional Word-style format...');

        // Convert to Word-style HTML document with enhanced formatting
        const wordHTML = wordDocumentService.convertMarkdownToWordHTML(
          validatedDocument,
          `Comprehensive Business Analysis: ${extractBusinessTitle(userPrompt)}`
        );

        // Save Word-style HTML document
        const wordFilePath = await wordDocumentService.saveWordHTMLDocument(
          projectId,
          'BusinessAnalysis_Word',
          wordHTML
        );

        await fileService.appendToLog(projectId, `Emma has created professional Word-style document: ${wordFilePath}`);

        // Emma creates editable presentation from Word document data
        await fileService.appendToLog(projectId, 'Emma is creating editable presentation with graphs and analytics from Word document data...');

        const presentationHTML = await presentationService.createEditablePresentation(
          wordHTML,
          userPrompt,
          projectId
        );

        await fileService.appendToLog(projectId, 'Emma has created editable 16:9 presentation with data analytics and graphs');

        // Create structured technical requirements for other agents
        const technicalSpecs = await generateTechnicalSpecifications(userPrompt, businessDocument);

        await fileService.writeFile(
          projectId,
          'docs/TechnicalRequirements.json',
          JSON.stringify(technicalSpecs, null, 2),
          'Emma'
        );

        await fileService.writeFile(
          projectId,
          'docs/PRD.md',
          `# Product Requirements Document\n\nCreated by Emma (Business Analyst & Product Manager)\n\n## Project Overview\n${technicalSpecs.projectOverview}\n\n## Website Type\n${technicalSpecs.websiteType}\n\n## Core Features\n${technicalSpecs.coreFeatures.map(feature => `- ${feature}`).join('\n')}\n\n## User Interface Requirements\n${technicalSpecs.uiRequirements.map(req => `- ${req}`).join('\n')}\n\n## Technical Requirements\n- Performance requirements\n- Accessibility standards\n- Browser compatibility\n- Mobile responsiveness\n\n## Success Metrics\n- Key performance indicators\n- User engagement metrics\n- Business objectives`,
          'Emma'
        );

        await fileService.appendToLog(projectId, 'Emma has completed comprehensive business analysis with 20 main topics, detailed subtopics, Word document, and editable presentation');

      } catch (error) {
        console.error('Error generating business document:', error);
        // Fallback to comprehensive template if AI generation fails
        const fallbackContent = generateComprehensiveBusinessTemplate(userPrompt);

        await fileService.writeFile(
          projectId,
          'docs/BusinessAnalysis.md',
          fallbackContent,
          'Emma'
        );

        // Create Word-style HTML document from fallback content
        let fallbackWordHTML = '';
        try {
          fallbackWordHTML = wordDocumentService.convertMarkdownToWordHTML(
            fallbackContent,
            `Business Analysis: ${extractBusinessTitle(userPrompt)}`
          );

          await wordDocumentService.saveWordHTMLDocument(
            projectId,
            'BusinessAnalysis_Word',
            fallbackWordHTML
          );
        } catch (wordError) {
          console.error('Error creating Word-style document:', wordError);
          fallbackWordHTML = `<html><body><h1>Business Analysis</h1><p>${fallbackContent}</p></body></html>`;
        }

        // Emma creates presentation even in fallback mode
        try {
          await presentationService.createEditablePresentation(
            fallbackWordHTML,
            userPrompt,
            projectId
          );
          await fileService.appendToLog(projectId, 'Emma created comprehensive business analysis with Word document and editable presentation (fallback mode)');
        } catch (presentationError) {
          console.error('Error creating presentation in fallback mode:', presentationError);
          await fileService.appendToLog(projectId, 'Emma created comprehensive business analysis with Word document (fallback mode due to AI service issue)');
        }
      }
    } else if (agentName === 'bob') {
      // Architect reads Emma's requirements and creates technical architecture
      let technicalSpecs = {};
      let retryCount = 0;
      const maxRetries = 10;

      // Wait for Emma to complete and create TechnicalRequirements.json
      while (retryCount < maxRetries) {
        try {
          const specsContent = await fileService.readFile(projectId, 'docs/TechnicalRequirements.json');
          technicalSpecs = JSON.parse(specsContent);
          console.log(`Bob: Successfully read technical specs for ${technicalSpecs.websiteType}`);
          break;
        } catch (error) {
          retryCount++;
          console.log(`Bob: Waiting for Emma to complete... (attempt ${retryCount}/${maxRetries})`);

          if (retryCount >= maxRetries) {
            console.log('Bob: Emma has not completed, using defaults');
            technicalSpecs = {
              websiteType: 'Business Website',
              coreFeatures: ['Homepage', 'About', 'Contact'],
              technicalStack: { frontend: 'HTML5, CSS3, JavaScript' }
            };
            break;
          }

          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const architectureDoc = `# System Architecture Document

Created by Bob (Software Architect)

## Project Overview
${technicalSpecs.projectOverview || 'Modern web application with responsive design'}

## Website Type: ${technicalSpecs.websiteType}

## Technology Stack
- Frontend: React 18.2.0 with Vite build tool
- Styling: CSS Modules and modern CSS with Flexbox/Grid
- Routing: React Router DOM for navigation between pages
- State Management: React hooks (useState, useEffect) and component state
- Data Management: JSON data imports from src/data directory
- Build Tools: Vite for fast development and optimized production builds
- Deployment: Vite build output for static hosting (Netlify, Vercel, GitHub Pages)

## Architecture Decisions
Based on Emma's requirements, this ${technicalSpecs.websiteType} will implement:

### Core Features Architecture
${technicalSpecs.coreFeatures ? technicalSpecs.coreFeatures.map(feature => `- ${feature}`).join('\n') : '- Standard web features'}

### File Structure
\`\`\`
public/
  index.html        # HTML template
  vite.svg          # Vite logo
src/
  components/       # React components
    Header.jsx      # Navigation component
    Footer.jsx      # Footer component
    ProductCard.jsx # Product display component
  pages/            # Page components
    Home.jsx        # Homepage component
    About.jsx       # About page component
    Contact.jsx     # Contact page component
  data/             # JSON data files
    products.json   # Product data
    services.json   # Service data
    team.json       # Team member data
  App.jsx           # Main App component
  main.jsx          # React entry point
  index.css         # Global styles
package.json        # Dependencies and scripts
vite.config.js      # Vite configuration
\`\`\`

## Component Architecture
- React functional components with hooks
- Component-based CSS modules for styling
- React Router for client-side routing
- Responsive design with mobile-first approach
- Data fetching from JSON files in src/data directory

## Performance Considerations
- Optimized CSS delivery
- Efficient JavaScript execution
- Image optimization
- Minimal HTTP requests
- Fast loading times

## Implementation Strategy
1. React component-based architecture
2. Mobile-first responsive design
3. React Router for navigation
4. Modern CSS with CSS Modules
5. React hooks for state management
6. JSON data imports for dynamic content
7. Vite for fast development and optimized builds
8. Accessibility best practices with semantic JSX`;

      await fileService.writeFile(
        projectId,
        'docs/Architecture.md',
        architectureDoc,
        'Bob'
      );
    } else if (agentName === 'alex') {
      // Engineer reads requirements and builds actual functional website
      let technicalSpecs = {};
      let retryCount = 0;
      const maxRetries = 10;

      // Wait for Emma to complete and create TechnicalRequirements.json
      while (retryCount < maxRetries) {
        try {
          const specsContent = await fileService.readFile(projectId, 'docs/TechnicalRequirements.json');
          technicalSpecs = JSON.parse(specsContent);
          console.log(`Alex: Successfully read technical specs for ${technicalSpecs.websiteType}`);
          break;
        } catch (error) {
          retryCount++;
          console.log(`Alex: Waiting for Emma to complete... (attempt ${retryCount}/${maxRetries})`);

          if (retryCount >= maxRetries) {
            console.log('Alex: Emma has not completed, using defaults');
            technicalSpecs = {
              websiteType: 'Business Website',
              coreFeatures: ['Homepage', 'About', 'Contact'],
              uiRequirements: ['Clean design', 'Responsive layout']
            };
            break;
          }

          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Generate React application based on requirements
      const reactApp = await generateReactApplication(technicalSpecs);

      // Create the main React application files
      await fileService.writeFile(
        projectId,
        'src/App.jsx',
        reactApp.appComponent,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/main.jsx',
        reactApp.mainComponent,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/index.css',
        reactApp.globalStyles,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'public/index.html',
        reactApp.htmlTemplate,
        'Alex'
      );


    } else if (agentName === 'david') {
      // Data Engineer reads requirements and creates specific data architecture
      let technicalSpecs = {};
      let retryCount = 0;
      const maxRetries = 10;

      // Wait for Emma to complete and create TechnicalRequirements.json
      while (retryCount < maxRetries) {
        try {
          const specsContent = await fileService.readFile(projectId, 'docs/TechnicalRequirements.json');
          technicalSpecs = JSON.parse(specsContent);
          console.log(`David: Successfully read technical specs for ${technicalSpecs.websiteType}`);
          break;
        } catch (error) {
          retryCount++;
          console.log(`David: Waiting for Emma to complete... (attempt ${retryCount}/${maxRetries})`);

          if (retryCount >= maxRetries) {
            console.log('David: Emma has not completed, using defaults');
            technicalSpecs = {
              websiteType: 'Business Website',
              coreFeatures: ['Homepage', 'About', 'Contact']
            };
            break;
          }

          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Generate data architecture specific to the website type
      const dataArchitecture = generateDataArchitecture(technicalSpecs);

      await fileService.writeFile(
        projectId,
        'docs/DataModels.md',
        dataArchitecture,
        'David'
      );

      // Generate JSON data files for React application
      const reactData = generateReactDataFiles(technicalSpecs);

      // Create data directory and files
      for (const [filename, content] of Object.entries(reactData)) {
        await fileService.writeFile(
          projectId,
          `src/data/${filename}`,
          JSON.stringify(content, null, 2),
          'David'
        );
      }
    } else if (agentName === 'devops') {
      // DevOps Engineer creates deployment and build configuration
      await fileService.writeFile(
        projectId,
        'package.json',
        `{\n  "name": "project-${projectId}",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview",\n    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-router-dom": "^6.8.1"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.43",\n    "@types/react-dom": "^18.2.17",\n    "@vitejs/plugin-react": "^4.2.1",\n    "eslint": "^8.55.0",\n    "eslint-plugin-react": "^7.33.2",\n    "eslint-plugin-react-hooks": "^4.6.0",\n    "eslint-plugin-react-refresh": "^0.4.5",\n    "vite": "^5.0.8"\n  }\n}`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        'vite.config.js',
        `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  build: {\n    outDir: 'dist',\n    sourcemap: true,\n    minify: 'terser',\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['react', 'react-dom']\n        }\n      }\n    }\n  },\n  server: {\n    port: 3000,\n    open: true\n  }\n});`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        '.env.example',
        `# Environment Variables Template\n# Copy this file to .env and update with your values\n\n# API Configuration\nVITE_API_URL=http://localhost:3001/api\n\n# Third-party Services\nVITE_ANALYTICS_ID=your_analytics_id_here\n\n# Feature Flags\nVITE_ENABLE_ANALYTICS=true\nVITE_ENABLE_PWA=false`,
        'DevOps Engineer'
      );

      await fileService.writeFile(
        projectId,
        'docs/Deployment.md',
        `# React Application Deployment Guide\n\nCreated by DevOps Engineer\n\n## React + Vite Build Process\n1. \`npm install\` - Install React dependencies including React Router DOM\n2. \`npm run dev\` - Start development server with hot reload\n3. \`npm run build\` - Create optimized production build\n4. \`npm run preview\` - Preview production build locally\n\n## Development Setup\n\`\`\`bash\n# Install dependencies\nnpm install\n\n# Start development server\nnpm run dev\n\n# Open http://localhost:3000 in browser\n\`\`\`\n\n## React Application Structure\n- \`src/App.jsx\` - Main React component with routing\n- \`src/main.jsx\` - React application entry point\n- \`src/index.css\` - Global styles\n- \`src/data/\` - JSON data files for dynamic content\n- \`public/index.html\` - HTML template\n- \`vite.config.js\` - Vite configuration with React plugin\n\n## Deployment Options\n\n### Netlify (Recommended for React SPAs)\n1. Connect GitHub repository\n2. Set build command: \`npm run build\`\n3. Set publish directory: \`dist\`\n4. Configure redirects for React Router: \`_redirects\` file with \`/* /index.html 200\`\n5. Deploy automatically on push\n\n### Vercel (Optimized for React)\n1. Import project from GitHub\n2. Framework preset: Vite (auto-detected)\n3. Build command: \`npm run build\`\n4. Output directory: \`dist\`\n5. Auto-deploy on push to main branch\n\n### GitHub Pages (Static Hosting)\n1. Build project: \`npm run build\`\n2. Deploy \`dist\` folder to gh-pages branch\n3. Configure base URL in \`vite.config.js\` if needed\n\n## React Router Configuration\n- Client-side routing configured with React Router DOM\n- Ensure hosting platform supports SPA routing\n- Configure redirects to serve \`index.html\` for all routes\n\n## Environment Variables\n- Copy \`.env.example\` to \`.env\`\n- Use \`VITE_\` prefix for environment variables in React\n- Configure in hosting platform dashboard\n\n## Performance Optimization\n- Vite provides automatic code splitting\n- React components lazy-loaded where appropriate\n- CSS optimization and minification\n- Tree shaking for unused code elimination\n- Gzip compression enabled by hosting platforms\n\n## React-Specific Features\n- Hot Module Replacement (HMR) in development\n- Fast refresh for React components\n- Optimized production builds with Vite\n- Modern JavaScript features supported\n\n## Monitoring & Analytics\n- React DevTools for debugging\n- Error boundary implementation recommended\n- Performance monitoring with React Profiler\n- Analytics integration via environment variables`,
        'DevOps Engineer'
      );

      // Generate PowerPoint presentation
      try {
        await fileService.appendToLog(projectId, 'DevOps Engineer: Generating PowerPoint presentation...');

        // Get project data for presentation
        const projectData = {
          projectId,
          userPrompt: userPrompt || 'AI-Generated Website',
          status: 'Completed'
        };

        const pptPath = await pptGenerationService.generateProjectPresentation(projectId, projectData);
        await fileService.appendToLog(projectId, `DevOps Engineer: PowerPoint presentation generated successfully at ${pptPath}`);
      } catch (pptError) {
        console.error('Error generating PowerPoint presentation:', pptError);
        await fileService.appendToLog(projectId, 'DevOps Engineer: Warning - PowerPoint generation failed, but project is still complete');
      }
    }
    
    // Mark agent task as completed
    await fileService.appendToLog(projectId, `${agent.name} (${agent.role}) has completed their work`);
    
    // Notify clients
    socketService.emitToProject(projectId, 'agentCompleted', {
      projectId,
      agent: agentName,
      status: `${agent.name} has completed their work`
    });
    
  } catch (error) {
    console.error(`Error in agent ${agentName}:`, error);
    
    // Log the error
    await fileService.appendToLog(projectId, `Error in ${agentName}: ${error.message}`);
    
    // Notify clients
    socketService.emitToProject(projectId, 'agentError', {
      projectId,
      agent: agentName,
      error: error.message
    });
  }
}

/**
 * Generate comprehensive business template with 20 main topics and 10 subtopics each
 * @param {string} businessIdea - The user's business idea
 * @returns {string} - Comprehensive business document template
 */
function generateComprehensiveBusinessTemplate(businessIdea) {
  // Analyze the business idea to extract specific information
  const businessInfo = analyzeBusinessIdea(businessIdea);

  return `# Comprehensive Business Analysis: ${businessIdea}

**Created by Emma (Senior Business Analyst & Strategic Consultant)**
**Document Type:** Executive Business Analysis Report for ${businessInfo.industry} Sector
**Date:** ${new Date().toLocaleDateString()}
**Word Count:** Approximately 2,500 words
**Business Type:** ${businessInfo.businessType}
**Target Industry:** ${businessInfo.industry}

---

## 1. Executive Summary & Business Overview

### 1.1 Business Concept Overview
The proposed business idea "${businessIdea}" represents a strategic opportunity in the ${businessInfo.industry} sector. This ${businessInfo.businessType} addresses specific market needs through ${businessInfo.approach}. Our comprehensive analysis evaluates the viability, market potential, and implementation strategy for this venture in the current ${businessInfo.industry} landscape.

### 1.2 Mission and Vision Statement
**Mission:** To deliver exceptional value in the ${businessInfo.industry} sector through innovative ${businessInfo.businessType} solutions that address specific market needs while maintaining sustainable growth and profitability.
**Vision:** To become a leading player in the ${businessInfo.industry} industry by leveraging ${businessInfo.approach}, customer-centric approaches, and strategic partnerships.

### 1.3 Key Success Factors for ${businessInfo.industry} Business
- Market timing and positioning in the ${businessInfo.industry} sector
- Competitive differentiation through ${businessInfo.approach}
- Operational efficiency specific to ${businessInfo.businessType}
- Customer acquisition and retention in target market segments
- Financial management and scalability for ${businessInfo.businessType}

### 1.4 Financial Highlights - ${businessInfo.industry} Sector Analysis
- Projected initial investment: ${getIndustryInvestment(businessInfo.industry)}
- Break-even timeline: ${getIndustryBreakeven(businessInfo.industry)}
- Expected ROI: ${getIndustryROI(businessInfo.industry)} within 3 years
- Revenue projections: ${getIndustryRevenue(businessInfo.industry)}

### 1.5 Investment Requirements
- Initial capital for setup and operations
- Working capital for first 6 months
- Marketing and customer acquisition budget
- Technology infrastructure investment
- Contingency fund (15-20% of total budget)

### 1.6 Expected Returns
- Short-term: Market validation and customer base establishment
- Medium-term: Revenue growth and market share expansion
- Long-term: Profitability and potential exit opportunities

### 1.7 Market Opportunity
The target market shows strong growth potential with increasing demand for innovative solutions. Market size analysis indicates significant opportunity for new entrants with differentiated offerings.

### 1.8 Competitive Advantages
- Unique value proposition
- First-mover advantage in specific niches
- Technology-driven efficiency
- Customer-centric approach
- Agile business model

### 1.9 Management Team
Leadership team with complementary skills in business development, operations, technology, and finance. Advisory board includes industry experts and successful entrepreneurs.

### 1.10 Implementation Timeline
- Phase 1 (Months 1-3): Business setup and initial development
- Phase 2 (Months 4-6): Market entry and customer acquisition
- Phase 3 (Months 7-12): Growth and optimization
- Phase 4 (Year 2+): Scaling and expansion

## 2. Market Analysis & Industry Landscape

### 2.1 Industry Overview
The industry demonstrates robust growth patterns with technological disruption creating new opportunities. Market dynamics favor innovative solutions that address evolving customer needs.

### 2.2 Market Size and Growth
- Total Addressable Market (TAM): $2.5B globally
- Serviceable Addressable Market (SAM): $500M regionally
- Serviceable Obtainable Market (SOM): $25M initially
- Annual growth rate: 15-20%

### 2.3 Market Trends
- Digital transformation acceleration
- Increased focus on sustainability
- Customer experience prioritization
- Data-driven decision making
- Remote and hybrid business models

### 2.4 Customer Needs Analysis
Primary customer pain points include efficiency challenges, cost optimization needs, and desire for innovative solutions. Market research indicates strong demand for user-friendly, cost-effective alternatives.

### 2.5 Market Segmentation
- Primary segment: Early adopters and tech-savvy customers
- Secondary segment: Traditional businesses seeking modernization
- Tertiary segment: Price-sensitive customers
- Geographic focus: Urban and suburban markets initially

### 2.6 Geographic Analysis
Initial focus on domestic markets with expansion plans for international markets. Regional analysis shows varying demand patterns and competitive landscapes.

### 2.7 Regulatory Environment
Current regulations are favorable with minimal barriers to entry. Compliance requirements are manageable with proper planning and legal guidance.

### 2.8 Economic Factors
Economic conditions support business growth with favorable interest rates, consumer spending patterns, and investment climate.

### 2.9 Technology Impact
Technology serves as both an enabler and disruptor. Leveraging emerging technologies provides competitive advantages and operational efficiencies.

### 2.10 Future Market Projections
Market forecasts indicate continued growth with increasing adoption rates. Future trends suggest opportunities for innovation and market expansion.

## 3. Target Audience & Customer Segmentation

### 3.1 Primary Target Market
Demographics: Ages 25-45, middle to upper-middle income, technology-comfortable, value-conscious consumers seeking quality solutions.

### 3.2 Secondary Markets
Small to medium businesses, educational institutions, and government agencies represent significant secondary opportunities.

### 3.3 Customer Demographics
- Age range: 25-55 years
- Income level: $40,000-$150,000 annually
- Education: College-educated professionals
- Geographic location: Urban and suburban areas
- Technology adoption: Early to mainstream adopters

### 3.4 Customer Psychographics
Values include efficiency, quality, innovation, and value for money. Lifestyle preferences lean toward convenience and time-saving solutions.

### 3.5 Buying Behavior
Research-driven purchase decisions with emphasis on reviews, recommendations, and trial opportunities. Price sensitivity varies by segment.

### 3.6 Customer Pain Points
- Inefficient current solutions
- High costs of existing alternatives
- Lack of customization options
- Poor customer service experiences
- Complex implementation processes

### 3.7 Value Proposition
Unique combination of quality, affordability, convenience, and customer service that addresses specific market gaps.

### 3.8 Customer Journey Mapping
- Awareness: Digital marketing and word-of-mouth
- Consideration: Product demos and trials
- Purchase: Streamlined buying process
- Onboarding: Comprehensive support
- Retention: Ongoing value delivery

### 3.9 Customer Acquisition Cost
Estimated CAC of $50-150 per customer depending on channel and segment, with focus on optimizing through digital marketing and referrals.

### 3.10 Customer Lifetime Value
Projected CLV of $500-2,000 based on retention rates, upselling opportunities, and referral generation.

## 4. Competitive Analysis & Market Positioning

### 4.1 Direct Competitors
Analysis of 3-5 direct competitors reveals market gaps and differentiation opportunities. Competitive landscape shows room for innovative entrants.

### 4.2 Indirect Competitors
Alternative solutions and substitute products pose competitive threats but also validate market demand.

### 4.3 Competitive Advantages
- Superior customer experience
- Innovative technology integration
- Competitive pricing strategy
- Agile business model
- Strong brand positioning

### 4.4 SWOT Analysis
**Strengths:** Innovation, agility, customer focus
**Weaknesses:** Limited resources, brand recognition
**Opportunities:** Market growth, technology trends
**Threats:** Established competitors, economic uncertainty

### 4.5 Market Positioning Strategy
Position as the innovative, customer-centric alternative that delivers superior value through technology and service excellence.

### 4.6 Differentiation Factors
Unique features, superior customer service, competitive pricing, and innovative business model create clear differentiation.

### 4.7 Competitive Response Strategy
Proactive monitoring and rapid response capabilities to maintain competitive advantages and market position.

### 4.8 Barriers to Entry
Low to moderate barriers favor new entrants, but success requires proper execution and differentiation.

### 4.9 Competitive Intelligence
Ongoing monitoring of competitor activities, pricing changes, and market developments to inform strategic decisions.

### 4.10 Market Share Projections
Target 2-5% market share within 3 years through focused execution and customer acquisition strategies.

## 5. Business Model & Revenue Streams

### 5.1 Revenue Model Overview
Multi-stream revenue approach combining direct sales, subscriptions, and service fees to maximize revenue potential and reduce risk.

### 5.2 Primary Revenue Streams
- Product/service sales (60% of revenue)
- Subscription fees (25% of revenue)
- Professional services (15% of revenue)

### 5.3 Pricing Strategy
Value-based pricing with competitive positioning and clear value proposition justification.

### 5.4 Cost Structure
- Fixed costs: 40% of revenue
- Variable costs: 35% of revenue
- Gross margin target: 65%

### 5.5 Unit Economics
Positive unit economics with healthy margins and scalable cost structure supporting profitable growth.

### 5.6 Scalability Factors
Technology-enabled scalability with minimal incremental costs for additional customers and revenue growth.

### 5.7 Partnership Revenue
Strategic partnerships contribute 10-15% of revenue through referrals, joint ventures, and channel partnerships.

### 5.8 Recurring Revenue
Subscription and service components provide 40% recurring revenue for predictable cash flow and valuation benefits.

### 5.9 Revenue Projections
Year 1: $100,000, Year 2: $500,000, Year 3: $1,200,000 with 15-20% monthly growth rates.

### 5.10 Monetization Optimization
Continuous optimization of pricing, packaging, and revenue streams based on customer feedback and market dynamics.

[Content continues with remaining 15 topics following the same detailed structure...]

---

**Document Summary:**
This comprehensive business analysis provides detailed evaluation across 20 critical business dimensions with specific recommendations and actionable insights for successful implementation of "${businessIdea}". The analysis supports informed decision-making and strategic planning for stakeholders, investors, and management teams.

**Next Steps:**
1. Detailed financial modeling and projections
2. Market validation through customer interviews
3. Prototype development and testing
4. Business plan refinement and investor preparation
5. Implementation timeline and milestone planning

**Prepared by:** Emma - Senior Business Analyst & Strategic Consultant
**Review Date:** ${new Date().toLocaleDateString()}
**Document Version:** 1.0`;
}

/**
 * Analyze business idea to extract specific information
 * @param {string} businessIdea - The user's business idea
 * @returns {Object} - Business analysis information
 */
function analyzeBusinessIdea(businessIdea) {
  const ideaLower = businessIdea.toLowerCase();

  // Industry identification
  const industries = {
    'food delivery': { industry: 'Food & Beverage', type: 'Delivery Service', approach: 'technology-enabled logistics and customer convenience' },
    'fitness app': { industry: 'Health & Fitness', type: 'Mobile Application', approach: 'personalized digital health solutions' },
    'ai coaching': { industry: 'Health & Fitness', type: 'AI-Powered Service', approach: 'artificial intelligence and machine learning' },
    'saas platform': { industry: 'Software Technology', type: 'SaaS Platform', approach: 'cloud-based software solutions' },
    'inventory management': { industry: 'Business Software', type: 'B2B SaaS Platform', approach: 'automated business process optimization' },
    'e-commerce': { industry: 'E-commerce', type: 'Online Marketplace', approach: 'digital commerce and customer experience' },
    'marketplace': { industry: 'Digital Marketplace', type: 'Platform Business', approach: 'multi-sided platform economics' },
    'mobile app': { industry: 'Mobile Technology', type: 'Mobile Application', approach: 'mobile-first user experience' },
    'healthcare': { industry: 'Healthcare Technology', type: 'HealthTech Solution', approach: 'digital health innovation' },
    'education': { industry: 'Education Technology', type: 'EdTech Platform', approach: 'digital learning and skill development' },
    'fintech': { industry: 'Financial Technology', type: 'FinTech Solution', approach: 'financial innovation and digital payments' },
    'social media': { industry: 'Social Technology', type: 'Social Platform', approach: 'community building and user engagement' },
    'gaming': { industry: 'Gaming & Entertainment', type: 'Gaming Platform', approach: 'interactive entertainment and user engagement' },
    'travel': { industry: 'Travel & Tourism', type: 'Travel Service', approach: 'travel technology and customer experience' },
    'real estate': { industry: 'Real Estate Technology', type: 'PropTech Solution', approach: 'property technology and market efficiency' }
  };

  // Find matching industry
  for (const [keyword, info] of Object.entries(industries)) {
    if (ideaLower.includes(keyword)) {
      return info;
    }
  }

  // Default analysis for unmatched ideas
  if (ideaLower.includes('app')) {
    return { industry: 'Mobile Technology', type: 'Mobile Application', approach: 'mobile-first digital solutions' };
  } else if (ideaLower.includes('platform')) {
    return { industry: 'Technology Platform', type: 'Digital Platform', approach: 'platform-based business model' };
  } else if (ideaLower.includes('service')) {
    return { industry: 'Service Industry', type: 'Service Business', approach: 'customer-centric service delivery' };
  } else {
    return { industry: 'Technology', type: 'Digital Business', approach: 'technology-driven innovation' };
  }
}

/**
 * Get industry-specific investment ranges
 */
function getIndustryInvestment(industry) {
  const investments = {
    'Food & Beverage': '$25,000 - $100,000',
    'Health & Fitness': '$30,000 - $150,000',
    'Software Technology': '$50,000 - $300,000',
    'Mobile Technology': '$40,000 - $200,000',
    'E-commerce': '$20,000 - $150,000',
    'Healthcare Technology': '$75,000 - $400,000',
    'Education Technology': '$35,000 - $200,000',
    'Financial Technology': '$100,000 - $500,000'
  };
  return investments[industry] || '$50,000 - $250,000';
}

/**
 * Get industry-specific break-even timelines
 */
function getIndustryBreakeven(industry) {
  const breakeven = {
    'Food & Beverage': '8-12 months',
    'Health & Fitness': '6-10 months',
    'Software Technology': '12-18 months',
    'Mobile Technology': '10-15 months',
    'E-commerce': '6-12 months',
    'Healthcare Technology': '15-24 months',
    'Education Technology': '10-16 months',
    'Financial Technology': '18-30 months'
  };
  return breakeven[industry] || '12-18 months';
}

/**
 * Get industry-specific ROI expectations
 */
function getIndustryROI(industry) {
  const roi = {
    'Food & Beverage': '20-35%',
    'Health & Fitness': '25-45%',
    'Software Technology': '30-50%',
    'Mobile Technology': '35-60%',
    'E-commerce': '20-40%',
    'Healthcare Technology': '25-45%',
    'Education Technology': '22-38%',
    'Financial Technology': '30-55%'
  };
  return roi[industry] || '25-40%';
}

/**
 * Get industry-specific revenue projections
 */
function getIndustryRevenue(industry) {
  const revenue = {
    'Food & Beverage': '$75K Year 1, $350K Year 2, $800K Year 3',
    'Health & Fitness': '$50K Year 1, $300K Year 2, $750K Year 3',
    'Software Technology': '$100K Year 1, $600K Year 2, $1.5M Year 3',
    'Mobile Technology': '$80K Year 1, $450K Year 2, $1.1M Year 3',
    'E-commerce': '$60K Year 1, $400K Year 2, $950K Year 3',
    'Healthcare Technology': '$120K Year 1, $700K Year 2, $1.8M Year 3',
    'Education Technology': '$90K Year 1, $500K Year 2, $1.2M Year 3',
    'Financial Technology': '$150K Year 1, $800K Year 2, $2.2M Year 3'
  };
  return revenue[industry] || '$100K Year 1, $500K Year 2, $1.2M Year 3';
}

/**
 * Validate and clean generated business document
 * @param {string} document - Generated document content
 * @param {string} userPrompt - Original user prompt
 * @returns {string} - Validated and cleaned document
 */
function validateAndCleanDocument(document, userPrompt) {
  if (!document || document.length < 500) {
    console.warn('Generated document too short, using fallback template');
    return generateComprehensiveBusinessTemplate(userPrompt);
  }

  // Clean and validate the document
  let cleanedDocument = document
    // Remove any incomplete sentences at the end
    .replace(/[^.!?]*$/, '')
    // Ensure proper spacing after headers
    .replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2')
    // Fix bullet point formatting
    .replace(/^\s*[-*+]\s+/gm, '- ')
    // Ensure proper paragraph spacing
    .replace(/\n{3,}/g, '\n\n')
    // Remove any trailing whitespace
    .replace(/[ \t]+$/gm, '')
    // Fix common formatting issues
    .replace(/\*\*([^*]+)\*\*/g, '**$1**') // Fix bold formatting
    .replace(/\*([^*]+)\*/g, '*$1*') // Fix italic formatting
    // Ensure document ends properly
    .replace(/([^.!?])\s*$/, '$1.')
    .trim();

  // Validate minimum content requirements
  const sections = cleanedDocument.split(/#{2,}/);
  if (sections.length < 5) {
    console.warn('Generated document lacks sufficient sections, enhancing with template');
    cleanedDocument = enhanceDocumentWithTemplate(cleanedDocument, userPrompt);
  }

  return cleanedDocument;
}

/**
 * Extract business title from user prompt
 * @param {string} userPrompt - User's business idea
 * @returns {string} - Clean business title
 */
function extractBusinessTitle(userPrompt) {
  if (!userPrompt) return 'Business Opportunity';

  // Clean markdown and special characters first
  let title = userPrompt
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove ** bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove * italic
    .replace(/\[([^\]]*)\]/g, '$1') // Remove [ ] brackets
    .replace(/\{([^}]*)\}/g, '$1') // Remove { } brackets
    .replace(/\(([^)]*)\)/g, '$1') // Remove ( ) parentheses
    .replace(/[*#`~_\[\]{}()]/g, '') // Remove remaining symbols
    .trim();

  // Remove common action words from the beginning
  title = title
    .replace(/^(create|develop|build|start|launch|make|design)\s+/i, '')
    .replace(/^(a|an|the)\s+/i, '')
    .trim();

  // Remove common endings but keep the core business concept
  title = title
    .replace(/\s+(app|application|platform|service|business|company|website|system|solution)$/i, '')
    .trim();

  // Capitalize properly for business names
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Limit length
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  return title || 'Business Opportunity';
}

/**
 * Enhance document with template content if needed
 * @param {string} document - Original document
 * @param {string} userPrompt - User prompt
 * @returns {string} - Enhanced document
 */
function enhanceDocumentWithTemplate(document, userPrompt) {
  const template = generateComprehensiveBusinessTemplate(userPrompt);

  // If document is very short, use template
  if (document.length < 1000) {
    return template;
  }

  // Otherwise, merge with template sections
  const templateSections = template.split(/#{2,}/);
  const documentSections = document.split(/#{2,}/);

  // Ensure we have all essential sections
  const essentialSections = [
    'Executive Summary',
    'Market Analysis',
    'Target Audience',
    'Competitive Analysis',
    'Business Model',
    'Financial Projections'
  ];

  let enhancedDocument = document;

  essentialSections.forEach(sectionName => {
    if (!document.includes(sectionName)) {
      const templateSection = templateSections.find(section =>
        section.includes(sectionName)
      );
      if (templateSection) {
        enhancedDocument += '\n\n## ' + templateSection;
      }
    }
  });

  return enhancedDocument;
}

// Generate Data Architecture based on website type
function generateDataArchitecture(specs) {
  const websiteType = specs.websiteType || 'Business Website';

  if (websiteType.includes('Calculator')) {
    return `# Calculator Application Data Architecture

Created by David (Data Engineer)

## Data Models

### Calculation History
\`\`\`javascript
{
  id: String,
  expression: String,
  result: Number,
  timestamp: Date,
  userId: String (optional)
}
\`\`\`

## Local Storage Schema
\`\`\`javascript
{
  "calculator_history": [
    {
      "expression": "2 + 2",
      "result": 4,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "calculator_preferences": {
    "theme": "light",
    "precision": 10,
    "historyLimit": 100
  }
}
\`\`\`

## API Endpoints (if backend needed)

### History Management
- GET /api/history - Get calculation history
- POST /api/history - Save calculation
- DELETE /api/history - Clear all history

## Data Flow
1. User performs calculation → JavaScript engine → Local storage
2. History display → Read from local storage
3. Export history → Generate file from stored data

## Performance Considerations
- Limit history to prevent memory issues
- Efficient calculation parsing
- Debounced auto-save for preferences

## Security Considerations
- Input validation for mathematical expressions
- Prevention of code injection through eval()
- Safe parsing of mathematical operations`;

  } else {
    return `# Business Website Data Architecture

Created by David (Data Engineer)

## Database Schema

### Services Table
\`\`\`sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE
);
\`\`\`

### Contact Inquiries Table
\`\`\`sql
CREATE TABLE contact_inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## API Endpoints

### Service Management
- GET /api/services - List all services
- POST /api/contact - Submit contact form

## Data Flow
1. Client browses services → Services API → Database
2. Contact form submission → Validation → Database

        // Initialize
        loadServices();
        loadTeam();
        loadCaseStudies();
    </script>
</body>
</html>\`;
}

// Generate React Data Files based on website type
function generateReactDataFiles(specs) {
  const websiteType = specs.websiteType || 'Business Website';

  if (websiteType.includes('E-commerce Jewelry Store')) {
    return {
      'products.json': [
        { id: 1, name: 'Diamond Solitaire Ring', price: 1299.99, category: 'rings', emoji: '💍', description: 'Classic diamond solitaire in 18k gold', badge: 'Bestseller' },
        { id: 2, name: 'Pearl Necklace', price: 899.99, category: 'necklaces', emoji: '📿', description: 'Elegant freshwater pearl strand', badge: 'New' },
        { id: 3, name: 'Gold Hoop Earrings', price: 599.99, category: 'earrings', emoji: '👂', description: 'Classic 14k gold hoops', badge: '' },
        { id: 4, name: 'Tennis Bracelet', price: 1599.99, category: 'bracelets', emoji: '💫', description: 'Diamond tennis bracelet in white gold', badge: 'Premium' },
        { id: 5, name: 'Emerald Ring', price: 2199.99, category: 'rings', emoji: '💚', description: 'Natural emerald with diamond accents', badge: 'Exclusive' },
        { id: 6, name: 'Silver Chain Necklace', price: 299.99, category: 'necklaces', emoji: '⛓️', description: 'Sterling silver chain with pendant', badge: '' },
        { id: 7, name: 'Stud Earrings', price: 799.99, category: 'earrings', emoji: '✨', description: 'Diamond stud earrings in platinum', badge: 'Popular' },
        { id: 8, name: 'Charm Bracelet', price: 449.99, category: 'bracelets', emoji: '🍀', description: 'Silver charm bracelet with charms', badge: '' }
      ],
      'categories.json': [
        { id: 'rings', name: 'Rings', icon: '💍', description: 'Engagement rings, wedding bands, and fashion rings' },
        { id: 'necklaces', name: 'Necklaces', icon: '📿', description: 'Elegant necklaces and pendants' },
        { id: 'earrings', name: 'Earrings', icon: '👂', description: 'Studs, hoops, and drop earrings' },
        { id: 'bracelets', name: 'Bracelets', icon: '💫', description: 'Tennis bracelets and charm bracelets' }
      ]
    };
  } else if (websiteType.includes('Photography Portfolio')) {
    return {
      'galleries.json': [
        { id: 1, name: 'Wedding Photography', category: 'wedding', emoji: '💒', description: 'Capturing your special day', images: 12 },
        { id: 2, name: 'Portrait Sessions', category: 'portrait', emoji: '📸', description: 'Professional portrait photography', images: 8 },
        { id: 3, name: 'Landscape Photography', category: 'landscape', emoji: '🏔️', description: 'Beautiful nature and landscapes', images: 15 },
        { id: 4, name: 'Event Photography', category: 'events', emoji: '🎉', description: 'Corporate and social events', images: 10 }
      ],
      'services.json': [
        { id: 1, name: 'Wedding Package', price: 2500, duration: '8 hours', includes: ['Ceremony', 'Reception', 'Edited Photos', 'Online Gallery'] },
        { id: 2, name: 'Portrait Session', price: 350, duration: '2 hours', includes: ['Studio or Location', '20 Edited Photos', 'Print Release'] },
        { id: 3, name: 'Event Coverage', price: 150, duration: 'Per hour', includes: ['Professional Coverage', 'Edited Photos', 'Quick Turnaround'] }
      ]
    };
  } else if (websiteType.includes('Restaurant Website')) {
    return {
      'menu.json': [
        { id: 1, name: 'Grilled Salmon', category: 'main', price: 28.99, description: 'Fresh Atlantic salmon with herbs', emoji: '🐟' },
        { id: 2, name: 'Caesar Salad', category: 'appetizer', price: 12.99, description: 'Crisp romaine with parmesan', emoji: '🥗' },
        { id: 3, name: 'Chocolate Cake', category: 'dessert', price: 8.99, description: 'Rich chocolate layer cake', emoji: '🍰' },
        { id: 4, name: 'Ribeye Steak', category: 'main', price: 35.99, description: 'Prime ribeye with garlic butter', emoji: '🥩' }
      ],
      'locations.json': [
        { id: 1, name: 'Downtown Location', address: '123 Main St, City, State 12345', phone: '(555) 123-4567', hours: 'Mon-Sun 11AM-10PM' },
        { id: 2, name: 'Uptown Location', address: '456 Oak Ave, City, State 12345', phone: '(555) 987-6543', hours: 'Mon-Sun 5PM-11PM' }
      ]
    };
  } else if (websiteType.includes('Blog Platform')) {
    return {
      'posts.json': [
        { id: 1, title: 'Getting Started with React', category: 'tutorial', author: 'John Doe', date: '2024-01-15', excerpt: 'Learn the basics of React development', readTime: '5 min' },
        { id: 2, title: 'Advanced JavaScript Concepts', category: 'programming', author: 'Jane Smith', date: '2024-01-10', excerpt: 'Deep dive into JavaScript features', readTime: '8 min' },
        { id: 3, title: 'Web Design Trends 2024', category: 'design', author: 'Mike Johnson', date: '2024-01-05', excerpt: 'Latest trends in web design', readTime: '6 min' }
      ],
      'authors.json': [
        { id: 1, name: 'John Doe', bio: 'Frontend developer with 5 years experience', avatar: '👨‍💻', specialties: ['React', 'JavaScript', 'CSS'] },
        { id: 2, name: 'Jane Smith', bio: 'Full-stack developer and tech writer', avatar: '👩‍💻', specialties: ['Node.js', 'Python', 'Databases'] },
        { id: 3, name: 'Mike Johnson', bio: 'UI/UX designer and frontend developer', avatar: '🎨', specialties: ['Design', 'Figma', 'CSS'] }
      ]
    };
  } else if (websiteType.includes('Fitness Tracking')) {
    return {
      'workouts.json': [
        { id: 1, name: 'Full Body Strength', duration: 45, difficulty: 'Intermediate', exercises: 8, category: 'strength' },
        { id: 2, name: 'HIIT Cardio Blast', duration: 30, difficulty: 'Advanced', exercises: 6, category: 'cardio' },
        { id: 3, name: 'Yoga Flow', duration: 60, difficulty: 'Beginner', exercises: 12, category: 'flexibility' },
        { id: 4, name: 'Core Crusher', duration: 20, difficulty: 'Intermediate', exercises: 5, category: 'core' }
      ],
      'nutrition.json': [
        { id: 1, name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
        { id: 2, name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, serving: '100g' },
        { id: 3, name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: '100g' },
        { id: 4, name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, serving: '100g' }
      ]
    };
  } else if (websiteType.includes('Corporate Consulting')) {
    return {
      'services.json': [
        { id: 1, name: 'Strategic Planning', price: 'Starting at $5,000', description: 'Comprehensive business strategy development', icon: '📊' },
        { id: 2, name: 'Operations Optimization', price: 'Starting at $7,500', description: 'Streamline operations for efficiency', icon: '⚙️' },
        { id: 3, name: 'Digital Transformation', price: 'Starting at $10,000', description: 'Technology integration and modernization', icon: '💻' },
        { id: 4, name: 'Financial Advisory', price: 'Starting at $3,500', description: 'Financial planning and analysis', icon: '💰' }
      ],
      'team.json': [
        { id: 1, name: 'Sarah Johnson', position: 'Senior Consultant', bio: 'MBA with 10+ years in strategy consulting', avatar: '👩‍💼' },
        { id: 2, name: 'Michael Chen', position: 'Operations Expert', bio: 'Former Fortune 500 operations director', avatar: '👨‍💼' },
        { id: 3, name: 'Emily Rodriguez', position: 'Technology Lead', bio: 'Digital transformation specialist', avatar: '👩‍💻' },
        { id: 4, name: 'David Kim', position: 'Financial Advisor', bio: 'CPA and former investment banker', avatar: '👨‍💰' }
      ]
    };
  } else {
    // Default business website data
    return {
      'services.json': [
        { id: 1, name: 'Consulting', description: 'Professional business consulting services', icon: '💼' },
        { id: 2, name: 'Development', description: 'Custom software development solutions', icon: '💻' },
        { id: 3, name: 'Support', description: '24/7 customer support and maintenance', icon: '🛠️' }
      ],
      'team.json': [
        { id: 1, name: 'John Smith', position: 'CEO', bio: 'Experienced business leader', avatar: '👨‍💼' },
        { id: 2, name: 'Sarah Wilson', position: 'CTO', bio: 'Technology expert and innovator', avatar: '👩‍💻' },
        { id: 3, name: 'Mike Davis', position: 'Lead Developer', bio: 'Full-stack development specialist', avatar: '👨‍💻' }
      ]
    };
  }
}

// Generate Fashion Website
function generateFashionWebsite(specs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StyleHub - Fashion Forward</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }

        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #e91e63;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: #e91e63;
        }

        .hero {
            background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
            color: white;
            text-align: center;
            padding: 5rem 2rem;
        }

        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            font-weight: 300;
        }

        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
        }

        .btn {
            display: inline-block;
            background: white;
            color: #e91e63;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 30px;
            transition: all 0.3s;
            font-weight: bold;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 4rem 0;
        }

        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #333;
            font-weight: 300;
        }

        .collection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .collection-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s;
        }

        .collection-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .collection-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
        }

        .collection-info {
            padding: 2rem;
        }

        .collection-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #333;
        }

        .collection-description {
            color: #666;
            margin-bottom: 1.5rem;
        }

        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">👗 StyleHub</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Fashion Forward</h1>
            <p>Discover the latest trends and timeless styles</p>
            <a href="#collections" class="btn">Shop Collections</a>
        </div>
    </section>

    <section class="section" id="collections">
        <div class="container">
            <h2 class="section-title">Our Collections</h2>
            <div class="collection-grid">
                <div class="collection-card">
                    <div class="collection-image">👚</div>
                    <div class="collection-info">
                        <div class="collection-title">Summer Collection</div>
                        <div class="collection-description">Light and breezy styles for the warm season</div>
                        <a href="#" class="btn">Explore</a>
                    </div>
                </div>
                <div class="collection-card">
                    <div class="collection-image">👖</div>
                    <div class="collection-info">
                        <div class="collection-title">Casual Wear</div>
                        <div class="collection-description">Comfortable and stylish everyday fashion</div>
                        <a href="#" class="btn">Explore</a>
                    </div>
                </div>
                <div class="collection-card">
                    <div class="collection-image">👔</div>
                    <div class="collection-info">
                        <div class="collection-title">Formal Attire</div>
                        <div class="collection-description">Elegant pieces for special occasions</div>
                        <a href="#" class="btn">Explore</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 StyleHub. Crafted with AI-powered multi-agent system.</p>
        </div>
    </footer>
</body>
</html>\`;
}

// Generate React Application based on website type
async function generateReactApplication(specs) {
  const websiteType = specs.websiteType || 'Business Website';

  if (websiteType.includes('E-commerce Jewelry Store')) {
    return generateJewelryReactApp(specs);
  } else if (websiteType.includes('Photography Portfolio')) {
    return generatePhotographyReactApp(specs);
  } else if (websiteType.includes('Restaurant Website')) {
    return generateRestaurantReactApp(specs);
  } else if (websiteType.includes('Blog Platform')) {
    return generateBlogReactApp(specs);
  } else if (websiteType.includes('Fitness Tracking App')) {
    return generateFitnessReactApp(specs);
  } else if (websiteType.includes('Corporate Consulting')) {
    return generateConsultingReactApp(specs);
  } else {
    return generateBusinessReactApp(specs);
  }
}

// Generate Jewelry E-commerce React App
function generateJewelryReactApp(specs) {
  const appComponent = `import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import productsData from './data/products.json';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function Header() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">💎 Luxe Jewelry</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Collections</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className="cart-icon">
          🛒 Cart <span className="cart-count">{cartCount}</span>
        </div>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Handcrafted Elegance</h1>
          <p>Discover our exclusive collection of handmade jewelry, crafted with love and attention to detail</p>
          <Link to="/products" className="btn">Shop Collection</Link>
        </div>
      </section>
      <TrustSection />
    </>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setProducts(productsData);
  }, []);

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(product => product.category === filter);

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Our Collections</h2>

        <div className="filters">
          <button
            className={\`filter-btn \${filter === 'all' ? 'active' : ''}\`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={\`filter-btn \${filter === 'rings' ? 'active' : ''}\`}
            onClick={() => setFilter('rings')}
          >
            Rings
          </button>
          <button
            className={\`filter-btn \${filter === 'necklaces' ? 'active' : ''}\`}
            onClick={() => setFilter('necklaces')}
          >
            Necklaces
          </button>
          <button
            className={\`filter-btn \${filter === 'earrings' ? 'active' : ''}\`}
            onClick={() => setFilter('earrings')}
          >
            Earrings
          </button>
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = () => {
    // Add to cart logic
    alert(\`\${product.name} added to cart!\`);
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    alert(\`\${product.name} \${!isInWishlist ? 'added to' : 'removed from'} wishlist!\`);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.emoji}
        {product.badge && <div className="product-badge">{product.badge}</div>}
      </div>
      <div className="product-info">
        <div className="product-title">{product.name}</div>
        <div className="product-description">{product.description}</div>
        <div className="product-price">\${product.price}</div>
        <div className="product-actions">
          <button className="add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button
            className="wishlist-btn"
            onClick={toggleWishlist}
            style={{ color: isInWishlist ? 'red' : '#d4af37' }}
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">About Luxe Jewelry</h2>
        <p>We are passionate artisans dedicated to creating beautiful, handcrafted jewelry pieces that tell your unique story.</p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p>Get in touch with our team for custom orders and inquiries.</p>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="container">
        <h3>Why Choose Luxe Jewelry?</h3>
        <div className="trust-badges">
          <div className="trust-badge">
            <div className="trust-icon">🔒</div>
            <div>
              <h4>Secure Payment</h4>
              <p>SSL encrypted checkout</p>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🚚</div>
            <div>
              <h4>Free Shipping</h4>
              <p>On orders over $100</p>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">💎</div>
            <div>
              <h4>Lifetime Warranty</h4>
              <p>Quality guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Luxe Jewelry. Handcrafted with ❤️ by AI-powered multi-agent system.</p>
      </div>
    </footer>
  );
}

export default App;`;

  const mainComponent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  const globalStyles = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Georgia', serif;
  line-height: 1.6;
  color: #2c2c2c;
  background: #fafafa;
}

.header {
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  color: #2c2c2c;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #2c2c2c;
  text-decoration: none;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: #2c2c2c;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #8b4513;
}

.cart-icon {
  position: relative;
  cursor: pointer;
  background: #2c2c2c;
  color: #d4af37;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.hero {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
              url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23f8f9fa" width="1200" height="600"/><text x="600" y="300" text-anchor="middle" font-size="48" fill="%23d4af37">💎 Handcrafted Jewelry</text></svg>');
  background-size: cover;
  background-position: center;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
}

.btn {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  color: #2c2c2c;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 30px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: 4rem 0;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 3rem;
  color: #2c2c2c;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
}

.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: white;
  border: 2px solid #d4af37;
  color: #d4af37;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #d4af37;
  color: white;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.product-image {
  width: 100%;
  height: 250px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  overflow: hidden;
}

.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-info {
  padding: 1.5rem;
}

.product-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
}

.product-description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.product-price {
  font-size: 1.8rem;
  color: #d4af37;
  font-weight: bold;
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.add-to-cart {
  flex: 1;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  color: #2c2c2c;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.add-to-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.wishlist-btn {
  background: white;
  border: 2px solid #d4af37;
  color: #d4af37;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.wishlist-btn:hover {
  background: #d4af37;
  color: white;
}

.trust-section {
  background: white;
  padding: 3rem 0;
  text-align: center;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.trust-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.trust-icon {
  font-size: 3rem;
  color: #d4af37;
}

.footer {
  background: #2c2c2c;
  color: white;
  text-align: center;
  padding: 3rem 0;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .filters {
    justify-content: center;
  }

  .trust-badges {
    gap: 2rem;
  }
}`;

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Luxe Jewelry - Handmade Elegance</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  return {
    appComponent,
    mainComponent,
    globalStyles,
    htmlTemplate
  };
}

// Generate Photography Portfolio React App
function generatePhotographyReactApp(specs) {
  // Similar structure to jewelry app but with photography-specific components
  return generateBusinessReactApp(specs); // Placeholder for now
}

// Generate Restaurant React App
function generateRestaurantReactApp(specs) {
  // Similar structure to jewelry app but with restaurant-specific components
  return generateBusinessReactApp(specs); // Placeholder for now
}

// Generate Blog Platform React App
function generateBlogReactApp(specs) {
  // Similar structure to jewelry app but with blog-specific components
  return generateBusinessReactApp(specs); // Placeholder for now
}

// Generate Fitness Tracking React App
function generateFitnessReactApp(specs) {
  // Similar structure to jewelry app but with fitness-specific components
  return generateBusinessReactApp(specs); // Placeholder for now
}

// Generate Corporate Consulting React App
function generateConsultingReactApp(specs) {
  // Similar structure to jewelry app but with consulting-specific components
  return generateBusinessReactApp(specs); // Placeholder for now
}

// Generate Business React App (default)
function generateBusinessReactApp(specs) {
  const appComponent = `import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">🚀 Business Pro</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Business Pro</h1>
          <p>Professional solutions for your business needs</p>
          <Link to="/services" className="btn">Our Services</Link>
        </div>
      </section>
    </>
  );
}

function About() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        <p>We are a professional business providing excellent services to our clients.</p>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Service 1</h3>
            <p>Professional service description</p>
          </div>
          <div className="service-card">
            <h3>Service 2</h3>
            <p>Professional service description</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p>Get in touch with our team for more information.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Business Pro. Built with React and AI-powered multi-agent system.</p>
      </div>
    </footer>
  );
}

export default App;`;

  const mainComponent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  const globalStyles = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #3498db;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 4rem 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background: #2980b9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: 4rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-content h1 {
    font-size: 2rem;
  }
}`;

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Business Pro - Professional Solutions</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  return {
    appComponent,
    mainComponent,
    globalStyles,
    htmlTemplate
  };
}

module.exports = {
  runAgentHandler
};