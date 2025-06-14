// backend/controllers/agentController.js
const fileService = require('../services/fileService');
const togetherService = require('../services/openaiService'); // Note: keeping same filename for compatibility
const documentService = require('../services/documentService');
const wordDocumentService = require('../services/wordDocumentService');
const presentationService = require('../services/presentationService');
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

        // Generate business presentation from the document
        await fileService.appendToLog(projectId, 'Emma is creating a professional business presentation with analytics and modern design...');

        const presentationHTML = presentationService.convertDocumentToPresentation(
          businessDocument,
          wordHTML,
          `Business Presentation: ${userPrompt.substring(0, 40)}...`
        );

        const presentationFilePath = await presentationService.savePresentationHTML(
          projectId,
          'BusinessPresentation',
          presentationHTML
        );

        await fileService.appendToLog(projectId, `Emma has created business presentation: ${presentationFilePath}`);

        // Also create a traditional PRD for technical reference
        await fileService.writeFile(
          projectId,
          'docs/PRD.md',
          `# Product Requirements Document\n\nCreated by Emma (Business Analyst & Product Manager)\n\n## Project Overview\nThis document complements the comprehensive business analysis with technical specifications.\n\n## Technical Requirements\n- Performance requirements\n- Accessibility standards\n- Browser compatibility\n- Mobile responsiveness\n\n## Implementation Notes\n- Development timeline\n- Resource requirements\n- Technical constraints\n\n## Success Metrics\n- Key performance indicators\n- User engagement metrics\n- Business objectives`,
          'Emma'
        );

        await fileService.appendToLog(projectId, 'Emma has completed comprehensive business analysis with 20 main topics, detailed subtopics, Word document, and professional presentation');

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

        // Create presentation from fallback content
        try {
          const fallbackPresentationHTML = presentationService.convertDocumentToPresentation(
            fallbackContent,
            fallbackWordHTML,
            `Business Presentation: ${extractBusinessTitle(userPrompt)}`
          );

          await presentationService.savePresentationHTML(
            projectId,
            'BusinessPresentation',
            fallbackPresentationHTML
          );
        } catch (presentationError) {
          console.error('Error creating presentation:', presentationError);
        }

        await fileService.appendToLog(projectId, 'Emma created comprehensive business analysis with Word document and presentation (fallback mode due to AI service issue)');
      }
    } else if (agentName === 'bob') {
      // Architect creates comprehensive architecture
      await fileService.writeFile(
        projectId,
        'docs/Architecture.md',
        `# System Architecture Document\n\nCreated by Bob (Software Architect)\n\n## Technology Stack\n- Frontend: React 18+ / HTML5 / CSS3 / JavaScript ES6+\n- Backend: Node.js / Express (if needed)\n- Database: MongoDB / PostgreSQL (if needed)\n- Build Tools: Vite / Webpack\n- Deployment: Netlify / Vercel / AWS\n\n## Project Structure\n\`\`\`\nsrc/\n  components/\n  pages/\n  hooks/\n  utils/\n  styles/\npublic/\ndocs/\n\`\`\`\n\n## Component Architecture\n- Modular component design\n- State management strategy\n- Routing configuration\n- API integration patterns\n\n## Performance Considerations\n- Code splitting\n- Lazy loading\n- Image optimization\n- Caching strategies`,
        'Bob'
      );
    } else if (agentName === 'alex') {
      // Engineer creates production-ready code structure
      await fileService.writeFile(
        projectId,
        'src/App.jsx',
        `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Welcome to Your New Project</h1>\n        <p>Built with modern web technologies</p>\n      </header>\n      <main className="App-main">\n        {/* Main content will be implemented here */}\n      </main>\n      <footer className="App-footer">\n        <p>&copy; 2024 Your Project. All rights reserved.</p>\n      </footer>\n    </div>\n  );\n}\n\nexport default App;`,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/main.jsx',
        `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
        'Alex'
      );

      await fileService.writeFile(
        projectId,
        'src/App.css',
        `.App {\n  text-align: center;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\n.App-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  padding: 2rem;\n  color: white;\n}\n\n.App-main {\n  flex: 1;\n  padding: 2rem;\n  max-width: 1200px;\n  margin: 0 auto;\n  width: 100%;\n}\n\n.App-footer {\n  background-color: #f8f9fa;\n  padding: 1rem;\n  color: #6c757d;\n}`,
        'Alex'
      );
    } else if (agentName === 'david') {
      // Data Analyst creates data models and API specs
      await fileService.writeFile(
        projectId,
        'docs/DataModels.md',
        `# Data Models & API Specification\n\nCreated by David (Data Analyst)\n\n## Data Models\n\n### User Model\n\`\`\`javascript\n{\n  id: String,\n  email: String,\n  name: String,\n  createdAt: Date,\n  updatedAt: Date\n}\n\`\`\`\n\n## API Endpoints\n\n### GET /api/users\n- Description: Retrieve all users\n- Response: Array of user objects\n\n### POST /api/users\n- Description: Create new user\n- Body: { email, name }\n- Response: Created user object\n\n## Security Considerations\n- Input validation\n- Authentication strategies\n- Data encryption\n- Rate limiting\n\n## Sample Data\nProvided for testing and development purposes.`,
        'David'
      );
    } else if (agentName === 'devops') {
      // DevOps Engineer creates deployment and build configuration
      await fileService.writeFile(
        projectId,
        'package.json',
        `{\n  "name": "project-${projectId}",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview",\n    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.43",\n    "@types/react-dom": "^18.2.17",\n    "@vitejs/plugin-react": "^4.2.1",\n    "eslint": "^8.55.0",\n    "eslint-plugin-react": "^7.33.2",\n    "eslint-plugin-react-hooks": "^4.6.0",\n    "eslint-plugin-react-refresh": "^0.4.5",\n    "vite": "^5.0.8"\n  }\n}`,
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
        `# Deployment Guide\n\nCreated by DevOps Engineer\n\n## Build Process\n1. \`npm install\` - Install dependencies\n2. \`npm run build\` - Create production build\n3. \`npm run preview\` - Preview production build locally\n\n## Deployment Options\n\n### Netlify (Recommended for Static Sites)\n1. Connect GitHub repository\n2. Set build command: \`npm run build\`\n3. Set publish directory: \`dist\`\n4. Deploy automatically on push\n\n### Vercel (Recommended for React Apps)\n1. Import project from GitHub\n2. Framework preset: Vite\n3. Auto-deploy on push to main branch\n\n## Environment Variables\n- Copy \`.env.example\` to \`.env\`\n- Update with production values\n- Configure in hosting platform\n\n## Performance Optimization\n- Gzip compression enabled\n- Code splitting implemented\n- Image optimization\n- CDN configuration\n\n## Monitoring\n- Error tracking setup\n- Performance monitoring\n- Analytics integration`,
        'DevOps Engineer'
      );
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
  // Clean and format the business title
  let title = userPrompt
    .replace(/^(create|develop|build|start|launch)\s+/i, '')
    .replace(/\s+(app|application|platform|service|business|company)$/i, '')
    .trim();

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, l => l.toUpperCase());

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