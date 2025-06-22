// backend/services/presentationService.js
const fs = require('fs-extra');
const path = require('path');

/**
 * Convert business document to professional presentation with analytics and modern design
 * @param {string} businessDocument - The business document content (markdown)
 * @param {string} wordDocumentHTML - The Word document HTML content for reference
 * @param {string} title - Presentation title
 * @returns {string} - HTML presentation content
 */
exports.convertDocumentToPresentation = (businessDocument, wordDocumentHTML, title = 'Business Presentation') => {
  // Parse the business document into professional slides with analytics
  const slides = parseDocumentToProfessionalSlides(businessDocument, wordDocumentHTML);

  return generateModernPresentationHTML(slides, title);
};

/**
 * Create editable presentation from Word document and save to project
 * @param {string} wordDocumentHTML - The Word document HTML content
 * @param {string} userPrompt - User's business idea
 * @param {string} projectId - Project ID
 * @returns {Promise<string>} - File path of created presentation
 */
exports.createEditablePresentation = async (wordDocumentHTML, userPrompt, projectId) => {
  try {
    // Extract business title from user prompt
    const businessTitle = extractBusinessTitle(userPrompt);
    const presentationTitle = `${businessTitle} - Business Presentation`;

    // Convert Word document to presentation
    const presentationHTML = exports.convertDocumentToPresentation(
      wordDocumentHTML,
      wordDocumentHTML,
      presentationTitle
    );

    // Save presentation to project
    const fileName = 'BusinessPresentation';
    const filePath = await exports.savePresentationHTML(projectId, fileName, presentationHTML);

    console.log(`✅ Emma created editable presentation: ${filePath}`);
    return filePath;

  } catch (error) {
    console.error('Error creating editable presentation:', error);
    throw new Error(`Failed to create presentation: ${error.message}`);
  }
};

/**
 * Extract business title from user prompt
 * @param {string} userPrompt - User's business idea
 * @returns {string} - Clean business title
 */
function extractBusinessTitle(userPrompt) {
  // Simple extraction - take first part of prompt and clean it
  let title = userPrompt.split('.')[0].split(',')[0];
  title = title.replace(/^(create|build|make|develop)\s+/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  return title.length > 50 ? title.substring(0, 50) + '...' : title;
}

/**
 * Parse business document into professional presentation slides with analytics
 * @param {string} content - Business document content
 * @param {string} wordDocumentHTML - Word document HTML for reference
 * @returns {Array} - Array of professional slide objects
 */
function parseDocumentToProfessionalSlides(content, wordDocumentHTML) {
  const slides = [];

  // Extract specific business information from content
  const businessInfo = extractBusinessInformation(content);

  // 1. Title Slide - Specific to the business idea
  slides.push({
    type: 'title',
    title: refineText(businessInfo.businessName || businessInfo.businessIdea || 'Business Opportunity Analysis'),
    subtitle: refineText(`${businessInfo.businessType || 'Strategic Business Plan'} for ${businessInfo.industry || 'Market Analysis'}`),
    content: {
      date: new Date().toLocaleDateString(),
      presenter: 'Emma - Senior Business Analyst',
      company: 'AI-Powered Business Solutions',
      businessDescription: refineText(businessInfo.description || 'Comprehensive business analysis and strategic planning')
    }
  });

  // 2. Executive Summary with Key Metrics - Specific to the business
  slides.push({
    type: 'executive-summary',
    title: refineText(`Executive Summary - ${businessInfo.businessName || 'Business Opportunity'}`),
    content: {
      overview: refineText(`${businessInfo.description || 'Innovative business opportunity'} representing a ${businessInfo.businessType || 'strategic initiative'} in the ${businessInfo.industry || 'technology'} sector`),
      keyMetrics: generateBusinessSpecificMetrics(businessInfo),
      highlights: generateBusinessSpecificHighlights(businessInfo).map(h => refineText(h))
    }
  });

  // 3. Market Analysis with Charts
  slides.push({
    type: 'market-analysis',
    title: 'Market Analysis & Opportunity',
    content: {
      marketSize: {
        tam: '$2.5B',
        sam: '$500M',
        som: '$25M'
      },
      growth: '+15-20% annually',
      trends: [
        'Digital transformation is accelerating across all industries',
        'Increased focus on sustainability and environmental responsibility',
        'Customer experience has become the primary competitive differentiator',
        'Data-driven decision making is essential for business success'
      ],
      chartData: {
        labels: ['2024', '2025', '2026', '2027', '2028'],
        values: [100, 115, 132, 152, 175]
      }
    }
  });

  // 4. Target Audience & Customer Segmentation
  slides.push({
    type: 'target-audience',
    title: 'Target Audience & Customer Segments',
    content: {
      primarySegment: {
        demographics: 'Ages 25-45, Middle to upper-middle income',
        size: '60% of market',
        value: '$300-500 LTV'
      },
      secondarySegment: {
        demographics: 'Small to medium businesses',
        size: '25% of market',
        value: '$1000-2000 LTV'
      },
      customerJourney: [
        'Awareness: Digital marketing campaigns and customer referrals drive initial interest',
        'Consideration: Product demonstrations and free trials showcase value proposition',
        'Purchase: Streamlined buying process with multiple payment options',
        'Retention: Ongoing value delivery through excellent customer service and support'
      ]
    }
  });

  // 5. Competitive Landscape
  slides.push({
    type: 'competitive-analysis',
    title: 'Competitive Landscape & Positioning',
    content: {
      competitors: [
        { name: 'Competitor A', strength: 'Market leader', weakness: 'High prices', share: '35%' },
        { name: 'Competitor B', strength: 'Innovation', weakness: 'Limited reach', share: '20%' },
        { name: 'Competitor C', strength: 'Low cost', weakness: 'Poor quality', share: '15%' }
      ],
      ourPosition: {
        strength: 'Superior customer experience combined with competitive pricing strategy',
        differentiator: 'Technology-driven efficiency and innovation-focused approach',
        targetShare: 'Targeting 5-10% market share within 3 years through strategic positioning'
      }
    }
  });

  // 6. Business Model & Revenue Streams
  slides.push({
    type: 'business-model',
    title: 'Business Model & Revenue Strategy',
    content: {
      revenueStreams: [
        { stream: 'Product/Service Sales', percentage: '60%', type: 'One-time' },
        { stream: 'Subscription Fees', percentage: '25%', type: 'Recurring' },
        { stream: 'Professional Services', percentage: '15%', type: 'Project-based' }
      ],
      unitEconomics: {
        cac: '$50-150',
        ltv: '$500-2000',
        ltvCacRatio: '10:1',
        grossMargin: '65%'
      },
      scalability: 'Technology-enabled platform with minimal incremental costs and high growth potential'
    }
  });

  // 7. Financial Projections with Charts
  slides.push({
    type: 'financial-projections',
    title: 'Financial Projections & Growth',
    content: {
      projections: [
        { year: 'Year 1', revenue: '$100K', expenses: '$75K', profit: '$25K' },
        { year: 'Year 2', revenue: '$500K', expenses: '$350K', profit: '$150K' },
        { year: 'Year 3', revenue: '$1.2M', expenses: '$720K', profit: '$480K' }
      ],
      investment: {
        initial: '$50K-250K',
        breakdown: [
          'Technology & Infrastructure: 40%',
          'Marketing & Sales: 30%',
          'Operations & Staff: 20%',
          'Contingency: 10%'
        ]
      },
      roi: '25-40% within 3 years'
    }
  });

  // 8. Implementation Roadmap
  slides.push({
    type: 'implementation',
    title: 'Implementation Roadmap & Milestones',
    content: {
      phases: [
        { phase: 'Phase 1', duration: '0-3 months', focus: 'Setup & Development', milestones: ['Business setup', 'Initial development', 'Team hiring'] },
        { phase: 'Phase 2', duration: '4-6 months', focus: 'Market Entry', milestones: ['Product launch', 'Customer acquisition', 'Feedback integration'] },
        { phase: 'Phase 3', duration: '7-12 months', focus: 'Growth', milestones: ['Scale operations', 'Expand market', 'Optimize processes'] },
        { phase: 'Phase 4', duration: '12+ months', focus: 'Expansion', milestones: ['New markets', 'Product extensions', 'Strategic partnerships'] }
      ],
      criticalPath: [
        'Product development completion',
        'Initial customer acquisition',
        'Revenue milestone achievement',
        'Market validation confirmation'
      ]
    }
  });

  // 9. Risk Assessment & Mitigation
  slides.push({
    type: 'risk-assessment',
    title: 'Risk Assessment & Mitigation Strategies',
    content: {
      risks: [
        { risk: 'Market Competition', probability: 'High', impact: 'Medium', mitigation: 'Strong differentiation & customer focus' },
        { risk: 'Technology Challenges', probability: 'Medium', impact: 'High', mitigation: 'Experienced team & agile development' },
        { risk: 'Economic Downturn', probability: 'Medium', impact: 'Medium', mitigation: 'Flexible cost structure & diversification' },
        { risk: 'Regulatory Changes', probability: 'Low', impact: 'Medium', mitigation: 'Compliance monitoring & adaptation' }
      ],
      contingencyPlans: [
        'Alternative revenue streams',
        'Cost reduction strategies',
        'Partnership opportunities',
        'Pivot options if needed'
      ]
    }
  });

  // 10. Investment Ask & Next Steps
  slides.push({
    type: 'investment-ask',
    title: 'Investment Opportunity & Next Steps',
    content: {
      ask: {
        amount: '$150K-250K',
        use: 'Product development, market entry, team expansion',
        timeline: 'Seeking funding within 60 days'
      },
      returns: {
        roi: '25-40% projected ROI',
        timeline: '3-5 year investment horizon',
        exit: 'Strategic acquisition or continued growth'
      },
      nextSteps: [
        'Due diligence and detailed financial modeling',
        'Market validation through customer interviews',
        'Prototype development and testing',
        'Legal structure and partnership agreements',
        'Funding closure and implementation start'
      ]
    }
  });

  // 11. Thank You & Q&A
  slides.push({
    type: 'thankyou',
    title: 'Thank You',
    subtitle: 'Questions & Discussion',
    content: {
      contact: {
        email: 'business@company.com',
        phone: '+1 (555) 123-4567',
        website: 'www.businessopportunity.com'
      },
      followUp: [
        'Detailed business plan available',
        'Financial models and projections',
        'Market research and validation data',
        'Technical specifications and roadmap'
      ]
    }
  });

  return slides;
}

/**
 * Extract specific business information from content
 * @param {string} content - Business document content
 * @returns {Object} - Extracted business information
 */
function extractBusinessInformation(content) {
  const lines = content.split('\n');
  const businessInfo = {
    businessIdea: '',
    businessName: '',
    industry: '',
    businessType: '',
    description: '',
    targetMarket: '',
    keyFeatures: [],
    competitors: [],
    marketSize: '',
    revenue: ''
  };

  // Extract business idea from title
  for (const line of lines) {
    if (line.includes('Comprehensive Business Analysis:')) {
      businessInfo.businessIdea = line.replace('# Comprehensive Business Analysis:', '').trim();
      businessInfo.businessName = businessInfo.businessIdea;
      break;
    }
  }

  // Extract industry and business type from content
  const contentLower = content.toLowerCase();

  // Identify industry keywords
  const industries = {
    'food delivery': 'Food & Beverage',
    'fitness': 'Health & Fitness',
    'healthcare': 'Healthcare',
    'education': 'Education Technology',
    'fintech': 'Financial Technology',
    'e-commerce': 'E-commerce',
    'saas': 'Software as a Service',
    'mobile app': 'Mobile Technology',
    'ai': 'Artificial Intelligence',
    'blockchain': 'Blockchain Technology',
    'real estate': 'Real Estate',
    'travel': 'Travel & Tourism',
    'gaming': 'Gaming & Entertainment',
    'social media': 'Social Media',
    'marketplace': 'Digital Marketplace'
  };

  for (const [keyword, industry] of Object.entries(industries)) {
    if (contentLower.includes(keyword)) {
      businessInfo.industry = industry;
      break;
    }
  }

  // Identify business type
  const businessTypes = {
    'app': 'Mobile Application',
    'platform': 'Digital Platform',
    'service': 'Service Business',
    'product': 'Product Business',
    'marketplace': 'Marketplace',
    'saas': 'SaaS Platform',
    'subscription': 'Subscription Service',
    'delivery': 'Delivery Service',
    'consulting': 'Consulting Service'
  };

  for (const [keyword, type] of Object.entries(businessTypes)) {
    if (contentLower.includes(keyword)) {
      businessInfo.businessType = type;
      break;
    }
  }

  // Extract description from executive summary or first paragraph
  const executiveSummaryMatch = content.match(/## Executive Summary[\s\S]*?(?=##|$)/i);
  if (executiveSummaryMatch) {
    const summary = executiveSummaryMatch[0];
    const sentences = summary.split('.').slice(0, 2);
    businessInfo.description = sentences.join('.').replace(/##.*?\n/g, '').trim();
  }

  // Set defaults if not found
  if (!businessInfo.industry) businessInfo.industry = 'Technology';
  if (!businessInfo.businessType) businessInfo.businessType = 'Digital Business';
  if (!businessInfo.description) businessInfo.description = businessInfo.businessIdea;

  return businessInfo;
}

/**
 * Clean and refine text content for professional presentation
 * @param {string} text - Text to clean and refine
 * @returns {string} - Cleaned and refined text
 */
function cleanText(text) {
  if (!text) return '';

  return text
    .replace(/\*\*/g, '') // Remove ** symbols
    .replace(/\}\]/g, '') // Remove }] symbols
    .replace(/\[\{/g, '') // Remove [{ symbols
    .replace(/\{/g, '') // Remove { symbols
    .replace(/\}/g, '') // Remove } symbols
    .replace(/\]/g, '') // Remove ] symbols
    .replace(/\[/g, '') // Remove [ symbols
    .replace(/\(/g, '') // Remove ( symbols
    .replace(/\)/g, '') // Remove ) symbols
    .replace(/"/g, '') // Remove " symbols
    .replace(/'/g, '') // Remove ' symbols
    .replace(/\.\.\./g, '') // Remove ... symbols
    .replace(/…/g, '') // Remove ellipsis
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s*[-•]\s*/g, '') // Remove leading bullet points
    .replace(/^\d+\.\s*/g, '') // Remove numbered list markers
    .trim(); // Remove leading/trailing spaces
}

/**
 * Refine text for professional presentation display
 * @param {string} text - Text to refine
 * @returns {string} - Professionally refined text
 */
function refineText(text) {
  if (!text) return '';

  const cleaned = cleanText(text);

  // Capitalize first letter and ensure proper sentence structure
  return cleaned
    .split('. ')
    .map(sentence => {
      sentence = sentence.trim();
      if (sentence.length > 0) {
        return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
      }
      return sentence;
    })
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate business-specific metrics based on industry and business type
 * @param {Object} businessInfo - Business information
 * @returns {Array} - Array of metric objects
 */
function generateBusinessSpecificMetrics(businessInfo) {
  const industryMetrics = {
    'Food & Beverage': [
      { label: 'Market Size', value: '$150B', trend: '+8%' },
      { label: 'Target ROI', value: '20-35%', trend: '+' },
      { label: 'Break-even', value: '8-12 months', trend: 'fast' },
      { label: 'Investment', value: '$25K-100K', trend: 'moderate' }
    ],
    'Health & Fitness': [
      { label: 'Market Size', value: '$96B', trend: '+7.8%' },
      { label: 'Target ROI', value: '25-45%', trend: '+' },
      { label: 'Break-even', value: '6-10 months', trend: 'fast' },
      { label: 'Investment', value: '$30K-150K', trend: 'moderate' }
    ],
    'Software as a Service': [
      { label: 'Market Size', value: '$195B', trend: '+18%' },
      { label: 'Target ROI', value: '30-50%', trend: '+' },
      { label: 'Break-even', value: '12-18 months', trend: 'moderate' },
      { label: 'Investment', value: '$50K-300K', trend: 'high' }
    ],
    'Mobile Technology': [
      { label: 'Market Size', value: '$365B', trend: '+11.5%' },
      { label: 'Target ROI', value: '35-60%', trend: '+' },
      { label: 'Break-even', value: '10-15 months', trend: 'moderate' },
      { label: 'Investment', value: '$40K-200K', trend: 'moderate' }
    ],
    'E-commerce': [
      { label: 'Market Size', value: '$5.7T', trend: '+14.7%' },
      { label: 'Target ROI', value: '20-40%', trend: '+' },
      { label: 'Break-even', value: '6-12 months', trend: 'fast' },
      { label: 'Investment', value: '$20K-150K', trend: 'moderate' }
    ]
  };

  return industryMetrics[businessInfo.industry] || [
    { label: 'Market Size', value: '$2.5B', trend: '+15%' },
    { label: 'Target ROI', value: '25-40%', trend: '+' },
    { label: 'Break-even', value: '12-18 months', trend: 'moderate' },
    { label: 'Investment', value: '$50K-250K', trend: 'moderate' }
  ];
}

/**
 * Generate business-specific highlights
 * @param {Object} businessInfo - Business information
 * @returns {Array} - Array of highlight strings
 */
function generateBusinessSpecificHighlights(businessInfo) {
  const industryHighlights = {
    'Food & Beverage': [
      'Growing demand for convenient food delivery solutions',
      'Opportunity to leverage technology for operational efficiency',
      'Strong potential for customer loyalty and repeat business',
      'Scalable model with multiple revenue streams'
    ],
    'Health & Fitness': [
      'Increasing focus on health and wellness post-pandemic',
      'Technology-driven personalization opportunities',
      'Subscription-based revenue model potential',
      'Growing market for digital health solutions'
    ],
    'Software as a Service': [
      'High scalability with low marginal costs',
      'Recurring revenue model with predictable cash flow',
      'Strong market demand for digital transformation',
      'Opportunity for rapid growth and expansion'
    ],
    'Mobile Technology': [
      'Mobile-first consumer behavior trends',
      'High user engagement and retention potential',
      'Multiple monetization strategies available',
      'Global market reach and scalability'
    ],
    'E-commerce': [
      'Accelerated shift to online shopping',
      'Lower overhead costs compared to physical retail',
      'Data-driven customer insights and personalization',
      'Multiple revenue streams and partnership opportunities'
    ]
  };

  return industryHighlights[businessInfo.industry] || [
    'Strong market demand and growth potential',
    'Competitive advantages and differentiation opportunities',
    'Scalable business model with multiple revenue streams',
    'Technology-driven efficiency and customer experience'
  ];
}

/**
 * Generate modern business presentation HTML with analytics and charts
 * @param {Array} slides - Array of slide objects
 * @param {string} title - Presentation title
 * @returns {string} - Complete HTML presentation
 */
function generateModernPresentationHTML(slides, title) {
  const slideHTML = slides.map((slide, index) => {
    return generateModernSlideHTML(slide, index);
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Modern Business Presentation Styling */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            overflow: hidden;
            height: 100vh;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .presentation-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .slide {
            display: none;
            width: 90vw;
            height: 50.625vw; /* 16:9 aspect ratio (90vw * 9/16) */
            max-width: 1600px;
            max-height: 900px;
            min-width: 800px;
            min-height: 450px;
            margin: 0;
            padding: 3vw 4vw;
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            border-radius: 12px;
            border: 3px solid #e2e8f0;
            overflow: hidden;
        }

        /* Ensure proper 16:9 ratio on all screens */
        @media (max-height: 600px) {
            .slide {
                width: 80vh;
                height: 45vh; /* 16:9 ratio */
                padding: 2vh 3vh;
            }
        }

        @media (max-width: 900px) {
            .slide {
                width: 95vw;
                height: 53.4375vw; /* 16:9 ratio */
                padding: 2vw 3vw;
                min-width: 320px;
                min-height: 180px;
            }
        }

        .slide.active {
            display: flex;
            flex-direction: column;
            animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Editable content */
        .editable {
            outline: none;
            border: 2px solid transparent;
            border-radius: 4px;
            padding: 4px;
            transition: all 0.3s ease;
        }

        .editable:hover {
            border-color: #e2e8f0;
            background: rgba(255,255,255,0.5);
        }

        .editable:focus {
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .edit-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Modern Card Layouts - Fill entire slide */
        .slide-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 30px;
            justify-content: space-between;
        }

        .slide-content.full-height {
            height: 640px; /* Full slide height minus padding */
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
            flex: 1;
        }

        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            transition: transform 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .metric-label {
            font-size: 1rem;
            opacity: 0.9;
            font-weight: 500;
        }

        .metric-trend {
            font-size: 0.9rem;
            margin-top: 8px;
            opacity: 0.8;
        }

        /* Chart Container */
        .chart-container {
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin: 20px 0;
        }

        .chart-canvas {
            max-height: 300px;
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3vw;
            align-items: start;
            height: 100%;
        }

        .content-list {
            background: white;
            border-radius: 16px;
            padding: 2vw;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #e2e8f0;
            height: 100%;
            overflow: hidden;
        }

        /* Text containers with borders */
        .text-container {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.5vw;
            margin: 1vw 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            overflow: hidden;
            word-wrap: break-word;
            hyphens: auto;
        }

        .bordered-content {
            border: 2px solid #d1d5db;
            border-radius: 8px;
            padding: 1vw;
            margin: 0.5vw 0;
            background: #f9fafb;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .content-list h3 {
            color: #1e3c72;
            font-size: 1.3rem;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .content-list ul {
            list-style: none;
        }

        .content-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 1.1rem;
            position: relative;
            padding-left: 30px;
        }

        .content-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }

        .content-list li:last-child {
            border-bottom: none;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin: 20px 0;
        }

        .data-table th {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
        }

        .data-table td {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }

        .data-table tr:hover {
            background: #f8fafc;
        }
        
        /* Title Slide */
        .slide.title-slide {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            text-align: center;
            justify-content: center;
        }
        
        .slide.title-slide h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .slide.title-slide h2 {
            font-size: 1.8rem;
            font-weight: 300;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        
        .slide.title-slide .subtitle-content {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        /* Content Slide */
        .slide.content-slide h1 {
            font-size: 2.5rem;
            color: #1e3c72;
            margin-bottom: 40px;
            border-bottom: 3px solid #2a5298;
            padding-bottom: 15px;
        }
        
        .slide.content-slide ul {
            list-style: none;
            font-size: 1.3rem;
            line-height: 2;
        }
        
        .slide.content-slide li {
            margin-bottom: 15px;
            padding-left: 30px;
            position: relative;
            color: #333;
        }
        
        .slide.content-slide li:before {
            content: "▶";
            position: absolute;
            left: 0;
            color: #2a5298;
            font-weight: bold;
        }
        
        /* Conclusion Slide */
        .slide.conclusion-slide {
            background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
            color: white;
        }
        
        .slide.conclusion-slide h1 {
            color: white;
            border-bottom-color: white;
        }
        
        /* Thank You Slide */
        .slide.thankyou-slide {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            text-align: center;
            justify-content: center;
        }
        
        .slide.thankyou-slide h1 {
            font-size: 4rem;
            color: white;
            border: none;
            margin-bottom: 30px;
        }
        
        .slide.thankyou-slide h2 {
            font-size: 2rem;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        
        /* Navigation */
        .nav-controls {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            z-index: 1000;
        }
        
        .nav-btn {
            background: rgba(255,255,255,0.9);
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #1e3c72;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Slide Counter */
        .slide-counter {
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(255,255,255,0.9);
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
            color: #1e3c72;
            z-index: 1000;
        }
        
        /* Progress Bar */
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: #2a5298;
            transition: width 0.3s ease;
            z-index: 1000;
        }
        
        /* Responsive Design for 16:9 */
        @media (max-width: 1200px) {
            .slide {
                padding: 40px 60px;
            }

            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .content-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }

        @media (max-width: 768px) {
            .slide {
                padding: 30px 40px;
                width: 100vw;
                height: 56.25vw;
                max-height: none;
                max-width: none;
            }

            .slide h1 {
                font-size: 2rem !important;
            }

            .slide h2 {
                font-size: 1.5rem !important;
            }

            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }

            .metric-card {
                padding: 20px;
            }

            .metric-value {
                font-size: 2rem;
            }

            .nav-controls {
                bottom: 10px;
                gap: 8px;
            }

            .nav-btn {
                padding: 8px 12px;
                font-size: 14px;
            }
        }

        /* Print styles for 16:9 */
        @media print {
            .slide {
                width: 11in;
                height: 6.1875in; /* 16:9 ratio */
                margin: 0;
                padding: 0.5in;
                page-break-after: always;
            }

            .nav-controls, .slide-counter, .progress-bar, .edit-indicator {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="progress-bar" id="progressBar"></div>
        <div class="slide-counter" id="slideCounter">1 / ${slides.length}</div>
        
        ${slideHTML}

        <div class="nav-controls">
            <button class="nav-btn" id="prevBtn" onclick="previousSlide()">Previous</button>
            <button class="nav-btn" id="playBtn" onclick="toggleAutoplay()">Play</button>
            <button class="nav-btn" id="nextBtn" onclick="nextSlide()">Next</button>
            <button class="nav-btn" onclick="savePresentation()">Save Changes</button>
            <button class="nav-btn" onclick="exportToPowerPoint()">Export PPT</button>
            <button class="nav-btn" onclick="toggleFullscreen()">Fullscreen</button>
        </div>
    </div>

    <!-- Chart.js for Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        let currentSlide = 0;
        let totalSlides = ${slides.length};
        let autoplay = false;
        let autoplayInterval;
        
        function showSlide(n) {
            const slides = document.querySelectorAll('.slide');
            
            if (n >= totalSlides) currentSlide = 0;
            if (n < 0) currentSlide = totalSlides - 1;
            
            slides.forEach(slide => slide.classList.remove('active'));
            slides[currentSlide].classList.add('active');
            
            // Update counter
            document.getElementById('slideCounter').textContent = \`\${currentSlide + 1} / \${totalSlides}\`;
            
            // Update progress bar
            const progress = ((currentSlide + 1) / totalSlides) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            
            // Update navigation buttons
            document.getElementById('prevBtn').disabled = currentSlide === 0;
            document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
        }
        
        function nextSlide() {
            currentSlide++;
            showSlide(currentSlide);
        }
        
        function previousSlide() {
            currentSlide--;
            showSlide(currentSlide);
        }
        
        function toggleAutoplay() {
            const playBtn = document.getElementById('playBtn');
            
            if (autoplay) {
                clearInterval(autoplayInterval);
                autoplay = false;
                playBtn.textContent = '▶ Play';
            } else {
                autoplayInterval = setInterval(() => {
                    if (currentSlide < totalSlides - 1) {
                        nextSlide();
                    } else {
                        toggleAutoplay();
                    }
                }, 5000);
                autoplay = true;
                playBtn.textContent = '⏸ Pause';
            }
        }
        
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    previousSlide();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
        
        // Initialize charts
        function initializeCharts() {
            // Market Growth Chart
            const marketChartCanvas = document.querySelector('[id^="marketChart"]');
            if (marketChartCanvas) {
                new Chart(marketChartCanvas, {
                    type: 'line',
                    data: {
                        labels: ['2024', '2025', '2026', '2027', '2028'],
                        datasets: [{
                            label: 'Market Growth (%)',
                            data: [100, 115, 132, 152, 175],
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: 'Market Growth Projection'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Revenue Chart
            const revenueChartCanvas = document.querySelector('[id^="revenueChart"]');
            if (revenueChartCanvas) {
                new Chart(revenueChartCanvas, {
                    type: 'bar',
                    data: {
                        labels: ['Year 1', 'Year 2', 'Year 3'],
                        datasets: [
                            {
                                label: 'Revenue',
                                data: [100, 500, 1200],
                                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                                borderColor: '#667eea',
                                borderWidth: 2
                            },
                            {
                                label: 'Profit',
                                data: [25, 150, 480],
                                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                                borderColor: '#764ba2',
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: 'Financial Projections (in thousands)'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value + 'K';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Initialize
        showSlide(0);

        // Initialize charts after a short delay to ensure DOM is ready
        setTimeout(initializeCharts, 500);

        // Save presentation changes
        function savePresentation() {
            const slides = document.querySelectorAll('.slide');
            const presentationData = [];

            slides.forEach((slide, index) => {
                const editableElements = slide.querySelectorAll('.editable');
                const slideData = {
                    slideIndex: index,
                    content: {}
                };

                editableElements.forEach((element, elemIndex) => {
                    slideData.content[\`element_\${elemIndex}\`] = element.innerHTML;
                });

                presentationData.push(slideData);
            });

            // Save to localStorage
            localStorage.setItem('presentationEdits', JSON.stringify(presentationData));

            // Show save confirmation
            const saveBtn = document.querySelector('[onclick="savePresentation()"]');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = '#10b981';

            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }

        // Export to PowerPoint format
        function exportToPowerPoint() {
            const presentationTitle = document.querySelector('.slide h1').textContent;
            const slides = document.querySelectorAll('.slide');

            let pptContent = \`<?xml version="1.0" encoding="UTF-8"?>
<presentation xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
    <slides>\`;

            slides.forEach((slide, index) => {
                const title = slide.querySelector('h1')?.textContent || \`Slide \${index + 1}\`;
                const content = slide.querySelector('.slide-content')?.textContent || '';

                pptContent += \`
        <slide>
            <title>\${title}</title>
            <content>\${content}</content>
        </slide>\`;
            });

            pptContent += \`
    </slides>
</presentation>\`;

            // Create and download file
            const blob = new Blob([pptContent], { type: 'application/vnd.openxmlformats-presentationml.presentation' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`\${presentationTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pptx\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Load saved edits
        function loadSavedEdits() {
            const savedEdits = localStorage.getItem('presentationEdits');
            if (savedEdits) {
                const presentationData = JSON.parse(savedEdits);

                presentationData.forEach(slideData => {
                    const slide = document.querySelectorAll('.slide')[slideData.slideIndex];
                    if (slide) {
                        const editableElements = slide.querySelectorAll('.editable');
                        Object.keys(slideData.content).forEach((key, index) => {
                            if (editableElements[index]) {
                                editableElements[index].innerHTML = slideData.content[key];
                            }
                        });
                    }
                });
            }
        }

        // Auto-save on content change
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('editable')) {
                // Auto-save after 2 seconds of no changes
                clearTimeout(window.autoSaveTimeout);
                window.autoSaveTimeout = setTimeout(savePresentation, 2000);
            }
        });

        // Load saved edits on page load
        loadSavedEdits();
    </script>
</body>
</html>`;
}

/**
 * Generate modern business slide HTML
 * @param {Object} slide - Slide object
 * @param {number} index - Slide index
 * @returns {string} - HTML for the slide
 */
function generateModernSlideHTML(slide, index) {
  const activeClass = index === 0 ? ' active' : '';

  switch (slide.type) {
    case 'title':
      return `
        <div class="slide title-slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height" style="justify-content: center; text-align: center; align-items: center;">
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2vw;">
                    <div class="text-container" style="text-align: center; padding: 2vw;">
                        <h1 class="editable" contenteditable="true" style="font-size: 3.5vw; font-weight: 700; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2;">${slide.title}</h1>
                    </div>
                    <div class="text-container" style="text-align: center; padding: 1.5vw;">
                        <h2 class="editable" contenteditable="true" style="font-size: 2vw; color: #64748b; margin: 0; font-weight: 400; line-height: 1.4;">${slide.subtitle}</h2>
                    </div>
                    <div class="text-container" style="padding: 1.5vw;">
                        <p class="editable" contenteditable="true" style="font-size: 1.3vw; color: #475569; margin: 0; line-height: 1.5; text-align: center;">${slide.content.businessDescription}</p>
                    </div>
                </div>
                <div class="text-container" style="width: 100%; padding: 2vw;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2vw; text-align: center;">
                        <div class="bordered-content">
                            <p style="font-size: 1.1vw; color: #64748b; margin-bottom: 0.5vw; font-weight: 500;">Presentation Date</p>
                            <p class="editable" contenteditable="true" style="font-size: 1.4vw; color: #1e3c72; font-weight: 600; margin: 0;">${slide.content.date}</p>
                        </div>
                        <div class="bordered-content">
                            <p style="font-size: 1.1vw; color: #64748b; margin-bottom: 0.5vw; font-weight: 500;">Presented By</p>
                            <p class="editable" contenteditable="true" style="font-size: 1.4vw; color: #1e3c72; font-weight: 600; margin: 0;">${slide.content.presenter}</p>
                        </div>
                        <div class="bordered-content">
                            <p style="font-size: 1.1vw; color: #64748b; margin-bottom: 0.5vw; font-weight: 500;">Organization</p>
                            <p class="editable" contenteditable="true" style="font-size: 1.4vw; color: #1e3c72; font-weight: 600; margin: 0;">${slide.content.company}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    case 'executive-summary':
      return `
        <div class="slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height">
                <div class="text-container" style="text-align: center; margin-bottom: 2vw; padding: 1.5vw;">
                    <h1 class="editable" contenteditable="true" style="font-size: 2.8vw; color: #1e3c72; margin: 0; font-weight: 700;">${slide.title}</h1>
                </div>
                <div class="text-container" style="margin-bottom: 2vw; padding: 1.5vw;">
                    <p class="editable" contenteditable="true" style="font-size: 1.4vw; color: #475569; margin: 0; line-height: 1.5; text-align: center;">${slide.content.overview}</p>
                </div>
                <div class="metrics-grid" style="flex: 2; margin-bottom: 2vw;">
                    ${slide.content.keyMetrics.map(metric => `
                        <div class="metric-card text-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 10vw; min-height: 120px;">
                            <div class="metric-value editable" contenteditable="true" style="font-size: 2.2vw; font-weight: 700; margin-bottom: 0.5vw; color: #667eea;">${metric.value}</div>
                            <div class="metric-label editable" contenteditable="true" style="font-size: 1.1vw; text-align: center; margin-bottom: 0.5vw; color: #1e3c72; font-weight: 500;">${metric.label}</div>
                            <div class="metric-trend editable" contenteditable="true" style="font-size: 0.9vw; opacity: 0.8; color: #059669;">${metric.trend}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-container" style="flex: 1; padding: 1.5vw;">
                    <h3 class="editable" contenteditable="true" style="font-size: 1.8vw; color: #1e3c72; margin-bottom: 1vw; text-align: center; font-weight: 600;">Strategic Advantages & Key Highlights</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1vw;">
                        ${slide.content.highlights.map(highlight => `
                            <div class="bordered-content editable" contenteditable="true" style="font-size: 1.1vw; line-height: 1.5; padding: 1vw;">${highlight}</div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>`;

    case 'market-analysis':
      return `
        <div class="slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height">
                <div class="text-container" style="text-align: center; margin-bottom: 2vw;">
                    <h1 class="editable" contenteditable="true" style="font-size: 3vw; color: #1e3c72; margin: 0; font-weight: 700;">${cleanText(slide.title)}</h1>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2vw; flex: 1;">
                    <div style="display: flex; flex-direction: column; gap: 1vw;">
                        <div class="text-container" style="flex: 1;">
                            <h3 class="editable" contenteditable="true" style="font-size: 1.8vw; margin-bottom: 1vw; color: #1e3c72;">Market Size</h3>
                            <div style="display: grid; gap: 1vw;">
                                <div class="bordered-content editable" contenteditable="true" style="font-size: 1.2vw; background: #e0f2fe; padding: 1vw; line-height: 1.4;"><strong>Total Addressable Market:</strong> ${slide.content.marketSize.tam}</div>
                                <div class="bordered-content editable" contenteditable="true" style="font-size: 1.2vw; background: #f3e5f5; padding: 1vw; line-height: 1.4;"><strong>Serviceable Addressable Market:</strong> ${slide.content.marketSize.sam}</div>
                                <div class="bordered-content editable" contenteditable="true" style="font-size: 1.2vw; background: #e8f5e8; padding: 1vw; line-height: 1.4;"><strong>Serviceable Obtainable Market:</strong> ${slide.content.marketSize.som}</div>
                                <div class="bordered-content editable" contenteditable="true" style="font-size: 1.2vw; background: #fff3e0; padding: 1vw; line-height: 1.4;"><strong>Annual Growth Rate:</strong> ${slide.content.growth}</div>
                            </div>
                        </div>
                        <div class="text-container" style="flex: 1;">
                            <h3 class="editable" contenteditable="true" style="font-size: 1.8vw; margin-bottom: 1vw; color: #1e3c72;">Market Trends</h3>
                            <div style="display: grid; gap: 1vw;">
                                ${slide.content.trends.map(trend => `
                                    <div class="bordered-content editable" contenteditable="true" style="font-size: 1.1vw; line-height: 1.5; padding: 1vw;">${trend}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="text-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <h3 class="editable" contenteditable="true" style="font-size: 1.8vw; margin-bottom: 1vw; text-align: center; color: #1e3c72;">Market Growth Projection</h3>
                        <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 1vw; width: 100%; height: 70%; display: flex; align-items: center; justify-content: center;">
                            <canvas id="marketChart${index}" class="chart-canvas" style="max-height: 100%; max-width: 100%;"></canvas>
                        </div>
                        <div class="bordered-content" style="margin-top: 1vw; text-align: center; width: 100%;">
                            <p class="editable" contenteditable="true" style="font-size: 1.1vw; color: #64748b; margin: 0;">5 Year Growth Forecast</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    case 'financial-projections':
      return `
        <div class="slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height">
                <h1 class="editable" contenteditable="true" style="font-size: 3rem; color: #1e3c72; margin-bottom: 30px; font-weight: 700; text-align: center;">${cleanText(slide.title)}</h1>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1;">
                    <div class="chart-container" style="display: flex; flex-direction: column; justify-content: center;">
                        <h3 class="editable" contenteditable="true" style="font-size: 1.6rem; margin-bottom: 20px; text-align: center; color: #1e3c72;">Revenue & Profit Growth</h3>
                        <canvas id="revenueChart${index}" class="chart-canvas" style="max-height: 350px;"></canvas>
                        <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div style="text-align: center; padding: 15px; background: #e0f2fe; border-radius: 8px;">
                                <p class="editable" contenteditable="true" style="font-size: 1.1rem; font-weight: 600; color: #1e3c72;">Target ROI</p>
                                <p class="editable" contenteditable="true" style="font-size: 1.4rem; font-weight: 700; color: #667eea;">${cleanText(slide.content.roi)}</p>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #f3e5f5; border-radius: 8px;">
                                <p class="editable" contenteditable="true" style="font-size: 1.1rem; font-weight: 600; color: #1e3c72;">Investment</p>
                                <p class="editable" contenteditable="true" style="font-size: 1.4rem; font-weight: 700; color: #764ba2;">${cleanText(slide.content.investment.initial)}</p>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); flex: 1;">
                            <h3 class="editable" contenteditable="true" style="font-size: 1.6rem; margin-bottom: 20px; color: #1e3c72; text-align: center;">Financial Projections</h3>
                            <div style="display: grid; gap: 15px;">
                                ${slide.content.projections.map(proj => `
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 15px; background: #f8fafc; border-radius: 8px; align-items: center;">
                                        <div class="editable" contenteditable="true" style="font-weight: 600; color: #1e3c72; text-align: center;">${cleanText(proj.year)}</div>
                                        <div class="editable" contenteditable="true" style="color: #059669; text-align: center; font-weight: 500;">${cleanText(proj.revenue)}</div>
                                        <div class="editable" contenteditable="true" style="color: #7c3aed; text-align: center; font-weight: 500;">${cleanText(proj.profit)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); flex: 1;">
                            <h3 class="editable" contenteditable="true" style="font-size: 1.6rem; margin-bottom: 20px; color: #1e3c72; text-align: center;">Investment Breakdown</h3>
                            <div style="display: grid; gap: 12px;">
                                ${slide.content.investment.breakdown.map(item => `
                                    <div class="editable" contenteditable="true" style="padding: 12px; background: #f0f9ff; border-left: 4px solid #0ea5e9; font-size: 1rem; line-height: 1.4;">${cleanText(item)}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    case 'thankyou':
      return `
        <div class="slide thankyou-slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height" style="justify-content: center; text-align: center; align-items: center;">
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2vw;">
                    <div style="border: 3px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 2vw; background: rgba(255,255,255,0.1);">
                        <h1 class="editable" contenteditable="true" style="font-size: 5vw; color: white; margin: 0; font-weight: 700; line-height: 1.1;">${cleanText(slide.title)}</h1>
                    </div>
                    <div style="border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5vw; background: rgba(255,255,255,0.05);">
                        <h2 class="editable" contenteditable="true" style="font-size: 2.5vw; color: rgba(255,255,255,0.9); margin: 0; font-weight: 400;">${cleanText(slide.subtitle)}</h2>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 3vw; backdrop-filter: blur(10px); width: 100%;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3vw;">
                        <div style="border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 2vw; background: rgba(255,255,255,0.05);">
                            <h3 class="editable" contenteditable="true" style="color: white; margin-bottom: 2vw; font-size: 2vw; text-align: center;">Contact Information</h3>
                            <div style="display: grid; gap: 1vw;">
                                <div style="border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); padding: 1.5vw; border-radius: 8px; text-align: center;">
                                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5vw; font-size: 1.2vw;">Email</p>
                                    <p class="editable" contenteditable="true" style="color: white; font-size: 1.4vw; font-weight: 500; margin: 0;">${cleanText(slide.content.contact.email)}</p>
                                </div>
                                <div style="border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); padding: 1.5vw; border-radius: 8px; text-align: center;">
                                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5vw; font-size: 1.2vw;">Phone</p>
                                    <p class="editable" contenteditable="true" style="color: white; font-size: 1.4vw; font-weight: 500; margin: 0;">${cleanText(slide.content.contact.phone)}</p>
                                </div>
                                <div style="border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); padding: 1.5vw; border-radius: 8px; text-align: center;">
                                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5vw; font-size: 1.2vw;">Website</p>
                                    <p class="editable" contenteditable="true" style="color: white; font-size: 1.4vw; font-weight: 500; margin: 0;">${cleanText(slide.content.contact.website)}</p>
                                </div>
                            </div>
                        </div>
                        <div style="border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 2vw; background: rgba(255,255,255,0.05);">
                            <h3 class="editable" contenteditable="true" style="color: white; margin-bottom: 2vw; font-size: 2vw; text-align: center;">Available Resources</h3>
                            <div style="display: grid; gap: 1vw;">
                                ${slide.content.followUp.map(item => `
                                    <div class="editable" contenteditable="true" style="border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); padding: 1.5vw; border-radius: 8px; color: rgba(255,255,255,0.95); font-size: 1.2vw; line-height: 1.4; text-align: center;">${cleanText(item)}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    default:
      return `
        <div class="slide${activeClass}">
            <div class="edit-indicator">Click to edit content</div>
            <div class="slide-content full-height">
                <div class="text-container" style="text-align: center; margin-bottom: 2vw; padding: 1.5vw;">
                    <h1 class="editable" contenteditable="true" style="font-size: 2.8vw; color: #1e3c72; margin: 0; font-weight: 700;">${slide.title}</h1>
                </div>
                <div style="flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5vw; align-items: start;">
                    ${Array.isArray(slide.content) ?
                        slide.content.slice(0, 6).map(item => `
                            <div class="text-container editable" contenteditable="true" style="font-size: 1.2vw; line-height: 1.5; min-height: 8vw; display: flex; align-items: center; padding: 1.5vw;">${refineText(item)}</div>
                        `).join('') :
                        Object.values(slide.content).slice(0, 6).map(item => `
                            <div class="text-container editable" contenteditable="true" style="font-size: 1.2vw; line-height: 1.5; min-height: 8vw; display: flex; align-items: center; padding: 1.5vw;">${refineText(typeof item === 'string' ? item : JSON.stringify(item))}</div>
                        `).join('')
                    }
                </div>
            </div>
        </div>`;
  }
}

/**
 * Save presentation HTML to file system
 * @param {string} projectId - Project ID
 * @param {string} fileName - File name without extension
 * @param {string} htmlContent - HTML presentation content
 * @returns {Promise<string>} - File path
 */
exports.savePresentationHTML = async (projectId, fileName, htmlContent) => {
  const PROJECT_DIR = path.join(__dirname, '../data/projects');
  const filePath = path.join(PROJECT_DIR, projectId, 'docs', `${fileName}.html`);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(filePath));
  
  // Write file
  await fs.writeFile(filePath, htmlContent, 'utf-8');
  
  return `docs/${fileName}.html`;
};
