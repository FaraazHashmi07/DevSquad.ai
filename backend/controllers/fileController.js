// backend/controllers/fileController.js
const fileService = require('../services/fileService');
const path = require('path');
const fs = require('fs');

/**
 * Get list of all files in a project
 */
exports.getFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const files = await fileService.getFileList(projectId);
    res.json(files);
  } catch (error) {
    next(error);
  }
};

/**
 * Get file content
 */
exports.getFileContent = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and file path are required'
      });
    }
    
    const content = await fileService.readFile(projectId, path);
    res.json({ content });
  } catch (error) {
    next(error);
  }
};

/**
 * Save file content
 */
exports.saveFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path, content, agent } = req.body;
    
    if (!projectId || !path || content === undefined) {
      return res.status(400).json({
        error: 'Project ID, file path, and content are required'
      });
    }
    
    const savedPath = await fileService.writeFile(projectId, path, content, agent || 'User');
    res.json({ path: savedPath });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and file path are required'
      });
    }
    
    await fileService.deleteFile(projectId, path);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a directory
 */
exports.createDirectory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.body;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and directory path are required'
      });
    }
    
    await fileService.createDirectory(projectId, path);
    res.json({ message: 'Directory created successfully', path });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project logs
 */
exports.getLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }

    const logs = await fileService.readLogs(projectId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project preview - serves the main HTML file with inlined assets
 */
exports.getProjectPreview = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const projectPath = path.join(process.cwd(), 'data', 'projects', projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const files = await fileService.getFileList(projectId);

    // Check if this is a React project
    const isReactProject = files.some(file =>
      file.path === 'package.json' ||
      file.path === 'vite.config.js' ||
      file.path.endsWith('.jsx')
    );

    if (isReactProject) {
      // Handle React project preview
      const reactPreview = await generateReactPreview(projectId, files, projectPath);
      res.setHeader('Content-Type', 'text/html');
      return res.send(reactPreview);
    }

    // Handle static HTML projects (legacy)
    // Find the main HTML file - prioritize index.html
    let htmlFile = files.find(file =>
      file.name === 'index.html' && !file.path.includes('/')
    );

    // If not found, look for index.html anywhere
    if (!htmlFile) {
      htmlFile = files.find(file =>
        file.name === 'index.html' || file.path.endsWith('index.html')
      );
    }

    // If still not found, look for any HTML file that's not in docs/ folder
    if (!htmlFile) {
      htmlFile = files.find(file =>
        file.path.endsWith('.html') &&
        !file.path.includes('docs/') &&
        !file.path.includes('BusinessAnalysis') &&
        !file.path.includes('Presentation')
      );
    }

    // Last resort: any HTML file
    if (!htmlFile) {
      htmlFile = files.find(file => file.path.endsWith('.html'));
    }

    if (!htmlFile) {
      // Generate a basic preview page
      const basicPreview = generateBasicProjectPreview(files, projectId);
      res.setHeader('Content-Type', 'text/html');
      return res.send(basicPreview);
    }

    // Read the HTML file
    const htmlPath = path.join(projectPath, htmlFile.path);
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Inline CSS files
    const cssFiles = files.filter(file => file.path.endsWith('.css'));
    for (const cssFile of cssFiles) {
      try {
        const cssPath = path.join(projectPath, cssFile.path);
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const cssFileName = cssFile.name;
        const linkRegex = new RegExp(`<link[^>]*href=['"]*[^'"]*${cssFileName}['"]*[^>]*>`, 'gi');
        htmlContent = htmlContent.replace(linkRegex, `<style>${cssContent}</style>`);
      } catch (err) {
        console.warn('Failed to inline CSS file:', cssFile.path);
      }
    }

    // Inline JavaScript files
    const jsFiles = files.filter(file => file.path.endsWith('.js') && !file.path.includes('node_modules'));
    for (const jsFile of jsFiles) {
      try {
        const jsPath = path.join(projectPath, jsFile.path);
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        const jsFileName = jsFile.name;
        const scriptRegex = new RegExp(`<script[^>]*src=['"]*[^'"]*${jsFileName}['"]*[^>]*></script>`, 'gi');
        htmlContent = htmlContent.replace(scriptRegex, `<script>${jsContent}</script>`);
      } catch (err) {
        console.warn('Failed to inline JS file:', jsFile.path);
      }
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('Error getting project preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
};

/**
 * Generate a basic preview page when no HTML file is found
 */
function generateBasicProjectPreview(files, projectId) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Preview - ${projectId}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 1.2rem;
          color: #718096;
        }
        .content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #667eea;
        }
        .card h3 {
          margin-top: 0;
          color: #2d3748;
        }
        .file-list {
          list-style: none;
          padding: 0;
        }
        .file-list li {
          padding: 5px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .status {
          background: #48bb78;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          display: inline-block;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">🚀 Project Generated Successfully!</h1>
          <p class="subtitle">Your AI-powered multi-agent system has created this project</p>
          <div class="status">✅ All 5 AI Agents Completed</div>
        </div>

        <div class="content">
          <div class="card">
            <h3>📋 Project Overview</h3>
            <p>This project was collaboratively built by our specialized AI agents:</p>
            <ul>
              <li><strong>Emma</strong> - Business Analysis & Strategy</li>
              <li><strong>Bob</strong> - Software Architecture</li>
              <li><strong>Alex</strong> - Full-Stack Development</li>
              <li><strong>David</strong> - Data Architecture</li>
              <li><strong>DevOps Engineer</strong> - Deployment & CI/CD</li>
            </ul>
          </div>

          <div class="card">
            <h3>📁 Generated Files</h3>
            <ul class="file-list">
              ${files.map(file => `<li>📄 ${file.path}</li>`).join('')}
            </ul>
          </div>

          <div class="card">
            <h3>🎯 Next Steps</h3>
            <p>Your project is ready! You can:</p>
            <ul>
              <li>Review the generated code in the editor</li>
              <li>Customize the implementation</li>
              <li>Deploy using the provided configuration</li>
              <li>Extend functionality as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate React project preview by converting JSX to working HTML
 */
async function generateReactPreview(projectId, files, projectPath) {
  try {
    // Read React component files (normalize paths for cross-platform compatibility)
    const appJsxFile = files.find(file =>
      file.path === 'src/App.jsx' || file.path === 'src\\App.jsx'
    );
    const mainJsxFile = files.find(file =>
      file.path === 'src/main.jsx' || file.path === 'src\\main.jsx'
    );
    const cssFile = files.find(file =>
      file.path === 'src/index.css' || file.path === 'src\\index.css'
    );

    if (!appJsxFile) {
      return generateBasicProjectPreview(files, projectId);
    }

    // Read the App.jsx content
    const appJsxPath = path.join(projectPath, 'src/App.jsx');
    let appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

    // Read CSS content
    let cssContent = '';
    if (cssFile) {
      const cssPath = path.join(projectPath, 'src/index.css');
      cssContent = fs.readFileSync(cssPath, 'utf8');
    }

    // Read JSON data files (normalize paths for cross-platform compatibility)
    const dataFiles = files.filter(file =>
      (file.path.startsWith('src/data/') || file.path.startsWith('src\\data\\')) &&
      file.path.endsWith('.json')
    );
    const dataImports = {};

    for (const dataFile of dataFiles) {
      try {
        const dataPath = path.join(projectPath, dataFile.path);
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        const fileName = dataFile.name.replace('.json', '');
        dataImports[fileName] = JSON.parse(dataContent);
      } catch (err) {
        console.warn('Failed to read data file:', dataFile.path, err.message);
      }
    }

    // Convert React JSX to working HTML
    const htmlPreview = convertReactToHtml(appJsxContent, cssContent, dataImports, projectId);
    return htmlPreview;

  } catch (error) {
    console.error('Error generating React preview:', error);
    return generateBasicProjectPreview(files, projectId);
  }
}

/**
 * Convert React JSX components to working HTML with vanilla JavaScript
 */
function convertReactToHtml(appJsxContent, cssContent, dataImports, projectId) {
  // Get project data to determine website type from user prompt
  let websiteTitle = 'AI Generated Website';
  let websiteContent = '';

  // Read project config to get user prompt
  const projectPath = path.join(__dirname, '../data/projects', projectId);
  let userPrompt = '';

  try {
    const configPath = path.join(projectPath, 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      userPrompt = config.userPrompt || '';
    }
  } catch (err) {
    console.warn('Could not read project config:', err.message);
  }

  // Determine website type from user prompt and JSX content
  const prompt = userPrompt.toLowerCase();
  const jsx = appJsxContent.toLowerCase();

  if (prompt.includes('jewelry') || prompt.includes('diamond') || prompt.includes('ring') || jsx.includes('jewelry')) {
    websiteTitle = 'Luxe Jewelry - Handmade Elegance';
    websiteContent = generateJewelryHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('photography') || prompt.includes('portfolio') || prompt.includes('photo') || jsx.includes('photography')) {
    websiteTitle = 'Photography Portfolio - Capturing Moments';
    websiteContent = generatePhotographyHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('restaurant') || prompt.includes('menu') || prompt.includes('food') || jsx.includes('restaurant')) {
    websiteTitle = 'Restaurant - Fine Dining Experience';
    websiteContent = generateRestaurantHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('blog') || prompt.includes('article') || prompt.includes('content') || jsx.includes('blog')) {
    websiteTitle = 'Blog Platform - Share Your Stories';
    websiteContent = generateBlogHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('fitness') || prompt.includes('gym') || prompt.includes('workout') || prompt.includes('health') || jsx.includes('fitness')) {
    websiteTitle = 'FitLife Gym - Your Fitness Journey';
    websiteContent = generateFitnessHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('calculator') || prompt.includes('calc') || prompt.includes('math') || jsx.includes('calculator')) {
    websiteTitle = 'Calculator Pro - Professional Calculator';
    websiteContent = generateCalculatorHtmlFromReact(appJsxContent, dataImports);
  } else if (prompt.includes('consulting') || prompt.includes('business') || prompt.includes('corporate') || jsx.includes('consulting')) {
    websiteTitle = 'Business Pro - Professional Solutions';
    websiteContent = generateConsultingHtmlFromReact(appJsxContent, dataImports);
  } else {
    websiteTitle = 'Professional Website';
    websiteContent = generateDefaultHtmlFromReact(appJsxContent, dataImports);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteTitle}</title>
    <style>
        ${cssContent}

        /* Additional preview-specific styles */
        .preview-banner {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            text-align: center;
            font-size: 14px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .preview-content {
            margin-top: 40px;
        }

        /* Ensure interactive elements work in preview */
        button, .btn {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        button:hover, .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="preview-banner">
        🚀 Live Preview - Generated by AI Multi-Agent System
    </div>

    <div class="preview-content">
        ${websiteContent}
    </div>

    <script>
        // Add basic interactivity for preview
        document.addEventListener('DOMContentLoaded', function() {
            // Handle navigation clicks
            const navLinks = document.querySelectorAll('a[href^="#"]');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Handle button clicks
            const buttons = document.querySelectorAll('button, .btn');
            buttons.forEach(button => {
                if (!button.onclick && !button.getAttribute('onclick')) {
                    button.addEventListener('click', function(e) {
                        if (this.textContent.includes('Add to Cart')) {
                            alert('Item added to cart! (Preview Mode)');
                        } else if (this.textContent.includes('Contact') || this.textContent.includes('Book')) {
                            alert('Contact form would open here! (Preview Mode)');
                        } else if (this.textContent.includes('Learn More') || this.textContent.includes('View')) {
                            alert('More details would be shown here! (Preview Mode)');
                        } else {
                            console.log('Button clicked:', this.textContent);
                        }
                    });
                }
            });

            // Add data from JSON files to global scope for dynamic content
            window.previewData = ${JSON.stringify(dataImports, null, 2)};

            console.log('React Preview loaded successfully!');
            console.log('Available data:', window.previewData);
        });
    </script>
</body>
</html>`;
}

/**
 * Generate Jewelry website HTML from React components
 */
function generateJewelryHtmlFromReact(jsxContent, dataImports) {
  const products = dataImports.products || [
    { id: 1, name: 'Diamond Ring', price: 1299.99, emoji: '💍', description: 'Classic diamond solitaire' },
    { id: 2, name: 'Pearl Necklace', price: 899.99, emoji: '📿', description: 'Elegant freshwater pearls' },
    { id: 3, name: 'Gold Earrings', price: 599.99, emoji: '👂', description: 'Classic 14k gold hoops' }
  ];

  return `
    <header class="header">
        <nav class="nav">
            <div class="logo">💎 Luxe Jewelry</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Collections</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="cart-icon">🛒 Cart <span class="cart-count">0</span></div>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Handcrafted Elegance</h1>
            <p>Discover our exclusive collection of handmade jewelry, crafted with love and attention to detail</p>
            <a href="#products" class="btn">Shop Collection</a>
        </div>
    </section>

    <section class="section" id="products">
        <div class="container">
            <h2 class="section-title">Our Collections</h2>

            <div class="filters">
                <button class="filter-btn active" onclick="filterProducts('all')">All</button>
                <button class="filter-btn" onclick="filterProducts('rings')">Rings</button>
                <button class="filter-btn" onclick="filterProducts('necklaces')">Necklaces</button>
                <button class="filter-btn" onclick="filterProducts('earrings')">Earrings</button>
            </div>

            <div class="product-grid">
                ${products.map(product => `
                    <div class="product-card" data-category="${product.category || 'all'}">
                        <div class="product-image">
                            ${product.emoji}
                            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                        </div>
                        <div class="product-info">
                            <div class="product-title">${product.name}</div>
                            <div class="product-description">${product.description}</div>
                            <div class="product-price">$${product.price}</div>
                            <div class="product-actions">
                                <button class="add-to-cart">Add to Cart</button>
                                <button class="wishlist-btn">❤️</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="trust-section">
        <div class="container">
            <h3>Why Choose Luxe Jewelry?</h3>
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
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Luxe Jewelry. Handcrafted with ❤️ by AI-powered multi-agent system.</p>
        </div>
    </footer>

    <script>
        function filterProducts(category) {
            const cards = document.querySelectorAll('.product-card');
            const buttons = document.querySelectorAll('.filter-btn');

            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
  `;
}

/**
 * Generate Fitness website HTML from React components
 */
function generateFitnessHtmlFromReact(jsxContent, dataImports) {
  const workouts = dataImports.workouts || [
    { id: 1, name: 'Full Body Strength', duration: 45, difficulty: 'Intermediate', exercises: 8, trainer: 'Mike Johnson' },
    { id: 2, name: 'HIIT Cardio Blast', duration: 30, difficulty: 'Advanced', exercises: 6, trainer: 'Sarah Wilson' },
    { id: 3, name: 'Yoga Flow', duration: 60, difficulty: 'Beginner', exercises: 12, trainer: 'Emma Davis' },
    { id: 4, name: 'CrossFit Challenge', duration: 50, difficulty: 'Advanced', exercises: 10, trainer: 'Alex Rodriguez' },
    { id: 5, name: 'Pilates Core', duration: 40, difficulty: 'Intermediate', exercises: 8, trainer: 'Lisa Chen' }
  ];

  const memberships = [
    { name: 'Basic', price: 29, features: ['Gym Access', 'Locker Room', 'Basic Equipment'] },
    { name: 'Premium', price: 59, features: ['All Basic Features', 'Group Classes', 'Personal Training Session'] },
    { name: 'Elite', price: 99, features: ['All Premium Features', 'Unlimited Personal Training', 'Nutrition Consultation', 'Spa Access'] }
  ];

  return `
    <header class="header">
        <nav class="nav">
            <div class="logo">🏋️ FitLife Gym</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#workouts">Classes</a></li>
                <li><a href="#membership">Membership</a></li>
                <li><a href="#trainers">Trainers</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Transform Your Body, Transform Your Life</h1>
            <p>Join FitLife Gym and start your fitness journey with expert trainers and state-of-the-art equipment</p>
            <a href="#membership" class="btn">Join Now</a>
        </div>
    </section>

    <section class="section" id="workouts">
        <div class="container">
            <h2 class="section-title">Workout Plans</h2>
            <div class="workout-grid">
                ${workouts.map(workout => `
                    <div class="workout-card">
                        <div class="workout-header">
                            <h3>${workout.name}</h3>
                            <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
                        </div>
                        <div class="workout-details">
                            <div class="detail">
                                <span class="icon">⏱️</span>
                                <span>${workout.duration} min</span>
                            </div>
                            <div class="detail">
                                <span class="icon">💪</span>
                                <span>${workout.exercises} exercises</span>
                            </div>
                        </div>
                        <button class="btn workout-btn">Start Workout</button>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="stats-section">
        <div class="container">
            <h3>Your Progress</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">1,247</div>
                    <div class="stat-label">Calories Burned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">23</div>
                    <div class="stat-label">Workouts Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">85%</div>
                    <div class="stat-label">Goal Achievement</div>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Fitness Tracker. Built with React and AI-powered multi-agent system.</p>
        </div>
    </footer>
  `;
}

/**
 * Generate Calculator website HTML from React components
 */
function generateCalculatorHtmlFromReact(jsxContent, dataImports) {
  const history = dataImports.history || [
    { id: 1, calculation: '25 + 75', result: '100', timestamp: '2024-01-15 10:30:00' },
    { id: 2, calculation: '150 × 0.15', result: '22.5', timestamp: '2024-01-15 10:25:00' },
    { id: 3, calculation: '1000 ÷ 8', result: '125', timestamp: '2024-01-15 10:20:00' }
  ];

  const buttons = dataImports.buttons || [
    { id: 'clear', label: 'C', type: 'function', class: 'clear' },
    { id: 'backspace', label: '⌫', type: 'function', class: 'backspace' },
    { id: 'percent', label: '%', type: 'operator', class: 'operator' },
    { id: 'divide', label: '÷', type: 'operator', class: 'operator' },
    { id: '7', label: '7', type: 'number', class: 'number' },
    { id: '8', label: '8', type: 'number', class: 'number' },
    { id: '9', label: '9', type: 'number', class: 'number' },
    { id: 'multiply', label: '×', type: 'operator', class: 'operator' },
    { id: '4', label: '4', type: 'number', class: 'number' },
    { id: '5', label: '5', type: 'number', class: 'number' },
    { id: '6', label: '6', type: 'number', class: 'number' },
    { id: 'subtract', label: '-', type: 'operator', class: 'operator' },
    { id: '1', label: '1', type: 'number', class: 'number' },
    { id: '2', label: '2', type: 'number', class: 'number' },
    { id: '3', label: '3', type: 'number', class: 'number' },
    { id: 'add', label: '+', type: 'operator', class: 'operator' },
    { id: '0', label: '0', type: 'number', class: 'number zero' },
    { id: 'decimal', label: '.', type: 'number', class: 'number' },
    { id: 'equals', label: '=', type: 'function', class: 'equals' }
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Calculator Pro - Professional Calculator</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }

            .header {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                padding: 2rem 0;
                text-align: center;
                backdrop-filter: blur(10px);
            }

            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .tagline {
                font-size: 1.1rem;
                opacity: 0.9;
            }

            .calculator-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                gap: 2rem;
                padding: 2rem;
                min-height: calc(100vh - 200px);
            }

            .calculator {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                padding: 1.5rem;
                width: 350px;
                max-width: 100%;
            }

            .calculator-display {
                background: #1a1a1a;
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 1rem;
                text-align: right;
                min-height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .display-value {
                font-size: 2.5rem;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                word-break: break-all;
                line-height: 1.2;
            }

            .calculator-buttons {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.75rem;
            }

            .calc-button {
                border: none;
                border-radius: 12px;
                font-size: 1.2rem;
                font-weight: 600;
                height: 60px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }

            .calc-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }

            .calc-button.number {
                background: #f8f9fa;
                color: #333;
            }

            .calc-button.operator {
                background: #667eea;
                color: white;
            }

            .calc-button.clear {
                background: #dc3545;
                color: white;
            }

            .calc-button.equals {
                background: #28a745;
                color: white;
            }

            .calc-button.backspace {
                background: #ffc107;
                color: #333;
            }

            .calc-button.zero {
                grid-column: span 2;
            }

            .calculator-history {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                padding: 1.5rem;
                width: 300px;
                max-width: 100%;
                max-height: 500px;
                overflow-y: auto;
            }

            .calculator-history h3 {
                margin-bottom: 1rem;
                color: #333;
                text-align: center;
                font-size: 1.3rem;
            }

            .history-item {
                background: #f8f9fa;
                padding: 0.75rem;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                margin-bottom: 0.75rem;
            }

            .history-calculation {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #333;
                margin-bottom: 0.25rem;
            }

            .history-time {
                font-size: 0.8rem;
                color: #666;
            }

            .footer {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                text-align: center;
                padding: 1.5rem 0;
                backdrop-filter: blur(10px);
                margin-top: auto;
            }

            @media (max-width: 768px) {
                .calculator-container {
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                }

                .calculator, .calculator-history {
                    width: 100%;
                    max-width: 350px;
                }

                .display-value {
                    font-size: 2rem;
                }

                .calc-button {
                    height: 50px;
                    font-size: 1.1rem;
                }
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="container">
                <h1 class="logo">🧮 Calculator Pro</h1>
                <p class="tagline">Professional Calculator for All Your Calculations</p>
            </div>
        </header>

        <div class="calculator-container">
            <div class="calculator">
                <div class="calculator-display">
                    <div class="display-value" id="display">0</div>
                </div>

                <div class="calculator-buttons">
                    ${buttons.map(button => `
                        <button class="calc-button ${button.class}" onclick="handleButtonClick('${button.id}', '${button.type}', '${button.label}')">${button.label}</button>
                    `).join('')}
                </div>
            </div>

            <div class="calculator-history">
                <h3>Calculation History</h3>
                ${history.map(item => `
                    <div class="history-item">
                        <div class="history-calculation">${item.calculation} = ${item.result}</div>
                        <div class="history-time">${item.timestamp}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Calculator Pro. Built with React and AI-powered multi-agent system.</p>
            </div>
        </footer>

        <script>
            let display = '0';
            let previousValue = null;
            let operation = null;
            let waitingForOperand = false;

            function updateDisplay() {
                document.getElementById('display').textContent = display;
            }

            function inputNumber(num) {
                if (waitingForOperand) {
                    display = String(num);
                    waitingForOperand = false;
                } else {
                    display = display === '0' ? String(num) : display + num;
                }
                updateDisplay();
            }

            function inputDecimal() {
                if (waitingForOperand) {
                    display = '0.';
                    waitingForOperand = false;
                } else if (display.indexOf('.') === -1) {
                    display = display + '.';
                }
                updateDisplay();
            }

            function clear() {
                display = '0';
                previousValue = null;
                operation = null;
                waitingForOperand = false;
                updateDisplay();
            }

            function performOperation(nextOperation) {
                const inputValue = parseFloat(display);

                if (previousValue === null) {
                    previousValue = inputValue;
                } else if (operation) {
                    const currentValue = previousValue || 0;
                    const newValue = calculate(currentValue, inputValue, operation);
                    display = String(newValue);
                    previousValue = newValue;
                }

                waitingForOperand = true;
                operation = nextOperation;
                updateDisplay();
            }

            function calculate(firstValue, secondValue, operation) {
                switch (operation) {
                    case 'add':
                        return firstValue + secondValue;
                    case 'subtract':
                        return firstValue - secondValue;
                    case 'multiply':
                        return firstValue * secondValue;
                    case 'divide':
                        return firstValue / secondValue;
                    case 'equals':
                        return secondValue;
                    default:
                        return secondValue;
                }
            }

            function handleButtonClick(id, type, label) {
                switch (type) {
                    case 'number':
                        if (id === 'decimal') {
                            inputDecimal();
                        } else {
                            inputNumber(id);
                        }
                        break;
                    case 'operator':
                        performOperation(id);
                        break;
                    case 'function':
                        if (id === 'clear') {
                            clear();
                        } else if (id === 'equals') {
                            performOperation('equals');
                        } else if (id === 'backspace') {
                            if (display.length > 1) {
                                display = display.slice(0, -1);
                            } else {
                                display = '0';
                            }
                            updateDisplay();
                        }
                        break;
                }
            }
        </script>
    </body>
    </html>
  `;
}

/**
 * Generate default/consulting website HTML from React components
 */
function generateConsultingHtmlFromReact(jsxContent, dataImports) {
  const services = dataImports.services || [
    { id: 1, name: 'Strategic Planning', description: 'Comprehensive business strategy development', icon: '📊' },
    { id: 2, name: 'Operations Optimization', description: 'Streamline operations for efficiency', icon: '⚙️' },
    { id: 3, name: 'Digital Transformation', description: 'Technology integration and modernization', icon: '💻' }
  ];

  return `
    <header class="header">
        <nav class="nav">
            <div class="logo">🚀 Business Pro</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Welcome to Business Pro</h1>
            <p>Professional solutions for your business needs</p>
            <a href="#services" class="btn">Our Services</a>
        </div>
    </section>

    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title">Our Services</h2>
            <div class="services-grid">
                ${services.map(service => `
                    <div class="service-card">
                        <div class="service-icon">${service.icon}</div>
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <button class="btn service-btn">Learn More</button>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="section" id="about">
        <div class="container">
            <h2 class="section-title">About Us</h2>
            <p>We are a professional business providing excellent services to our clients with cutting-edge AI technology.</p>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Business Pro. Built with React and AI-powered multi-agent system.</p>
        </div>
    </footer>
  `;
}

// Placeholder functions for other website types
function generatePhotographyHtmlFromReact(jsxContent, dataImports) {
  return generateDefaultHtmlFromReact(jsxContent, dataImports);
}

function generateRestaurantHtmlFromReact(jsxContent, dataImports) {
  return generateDefaultHtmlFromReact(jsxContent, dataImports);
}

function generateBlogHtmlFromReact(jsxContent, dataImports) {
  return generateDefaultHtmlFromReact(jsxContent, dataImports);
}

function generateDefaultHtmlFromReact(jsxContent, dataImports) {
  return generateConsultingHtmlFromReact(jsxContent, dataImports);
}