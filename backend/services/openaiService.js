// backend/services/togetherService.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Initialize dual API configuration with fallback defaults
// Emma uses Gemma API for business documents and presentations
const GEMMA_API_KEY = process.env.GEMMA_API_KEY || 'tgp_v1_eUnattoUs5__nOr0mlovti-ehtK138Oxc7yyxgC4-CQ';
// Other agents use Mistral API
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '6cc5deefffb1aaf11a1736414ddc0dc50d6b0bd3d4afe7081876ecbfa79b6ef6';
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1';

// API Key validation function
function validateApiKey(apiKey, keyName) {
  if (!apiKey) {
    throw new Error(`${keyName} is required but not provided. Please check your .env file.`);
  }

  if (apiKey === 'your_gemma_api_key_here' || apiKey === 'your_together_ai_api_key_here') {
    throw new Error(`${keyName} is using placeholder value. Please replace with your actual API key from https://api.together.xyz/`);
  }

  if (apiKey.length < 10) {
    throw new Error(`${keyName} appears to be invalid (too short). Please check your API key.`);
  }

  return true;
}

// Create axios instance for Gemma API (Emma's business documents)
const gemmaClient = axios.create({
  baseURL: TOGETHER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${GEMMA_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Create axios instance for Mistral API (other agents)
const togetherClient = axios.create({
  baseURL: TOGETHER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOGETHER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Enhanced client initialization with validation
let gemmaClientInitialized = false;
let mistralClientInitialized = false;
let initializationErrors = [];

// Initialize Gemma API client for Emma
try {
  validateApiKey(GEMMA_API_KEY, 'GEMMA_API_KEY');
  gemmaClientInitialized = true;
  console.log('✅ Gemma API client initialized for Emma (Business Analyst)');
} catch (error) {
  initializationErrors.push(`Gemma API: ${error.message}`);
  console.error('❌ Gemma API client initialization failed:', error.message);
  console.error('   Emma (Business Analyst) will not be able to generate content');
  console.error('   Please set GEMMA_API_KEY in your .env file');
}

// Initialize Mistral API client for other agents
try {
  validateApiKey(TOGETHER_API_KEY, 'TOGETHER_API_KEY');
  mistralClientInitialized = true;
  console.log('✅ Mistral API client initialized for other agents');
} catch (error) {
  initializationErrors.push(`Mistral API: ${error.message}`);
  console.error('❌ Mistral API client initialization failed:', error.message);
  console.error('   Bob, David, Alex, and DevOps agents will not be able to generate content');
  console.error('   Please set TOGETHER_API_KEY in your .env file');
}

// Startup validation summary
if (initializationErrors.length > 0) {
  console.error('\n🚨 API CONFIGURATION ISSUES DETECTED:');
  initializationErrors.forEach((error, index) => {
    console.error(`   ${index + 1}. ${error}`);
  });
  console.error('\n📖 Setup Instructions:');
  console.error('   1. Copy backend/.env.example to backend/.env');
  console.error('   2. Get API keys from https://api.together.xyz/');
  console.error('   3. Replace placeholder values in .env file');
  console.error('   4. Restart the server\n');
} else {
  console.log('✅ All API clients initialized successfully');
}

// Legacy compatibility
const clientInitialized = mistralClientInitialized;

/**
 * Test API connectivity for both Gemma and Mistral APIs
 * @returns {Promise<object>} - Test results for both APIs
 */
exports.testApiConnectivity = async () => {
  const results = {
    gemma: { initialized: gemmaClientInitialized, working: false, error: null },
    mistral: { initialized: mistralClientInitialized, working: false, error: null },
    overall: false
  };

  // Test Gemma API if initialized
  if (gemmaClientInitialized) {
    try {
      const testResponse = await gemmaClient.post('/chat/completions', {
        model: 'google/gemma-2-27b-it',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10,
        temperature: 0.1
      });

      if (testResponse.data && testResponse.data.choices) {
        results.gemma.working = true;
        console.log('✅ Gemma API connectivity test passed');
      }
    } catch (error) {
      results.gemma.error = error.response?.data?.error?.message || error.message;
      console.error('❌ Gemma API connectivity test failed:', results.gemma.error);
    }
  }

  // Test Mistral API if initialized
  if (mistralClientInitialized) {
    try {
      const testResponse = await togetherClient.post('/chat/completions', {
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10,
        temperature: 0.1
      });

      if (testResponse.data && testResponse.data.choices) {
        results.mistral.working = true;
        console.log('✅ Mistral API connectivity test passed');
      }
    } catch (error) {
      results.mistral.error = error.response?.data?.error?.message || error.message;
      console.error('❌ Mistral API connectivity test failed:', results.mistral.error);
    }
  }

  results.overall = results.gemma.working && results.mistral.working;
  return results;
};

/**
 * Get API initialization status
 * @returns {object} - Status of both API clients
 */
exports.getApiStatus = () => {
  return {
    gemma: {
      initialized: gemmaClientInitialized,
      keyConfigured: GEMMA_API_KEY && GEMMA_API_KEY !== 'your_gemma_api_key_here'
    },
    mistral: {
      initialized: mistralClientInitialized,
      keyConfigured: TOGETHER_API_KEY && TOGETHER_API_KEY !== 'your_together_ai_api_key_here'
    },
    errors: initializationErrors
  };
};

/**
 * Execute a request to Together AI API
 * @param {string} systemPrompt - The system prompt to use
 * @param {string} userPrompt - The user prompt to use
 * @param {object} options - Additional options like temperature
 * @returns {Promise<string>} - The response from Together AI
 */
exports.executePrompt = async (systemPrompt, userPrompt, options = {}) => {
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];

  // Determine which API client and model to use
  const isGemmaModel = options.model && (
    options.model.includes('gemma') ||
    options.model === 'gemma-business' ||
    options.model === 'google/gemma-7b-it' ||
    options.model === 'google/gemma-2b-it'
  );

  let apiClient, model, clientName;

  if (isGemmaModel) {
    // Use Gemma API for Emma's business documents
    if (!gemmaClientInitialized) {
      throw new Error('Gemma API client not initialized. Check your Gemma API key for Emma.');
    }
    apiClient = gemmaClient;
    clientName = 'Gemma';

    // Map to actual Gemma models (using working serverless models)
    const gemmaModelMapping = {
      'gemma-7b': 'google/gemma-2-27b-it',
      'gemma-2b': 'google/gemma-2-27b-it',
      'gemma-business': 'google/gemma-2-27b-it',
      'google/gemma-7b-it': 'google/gemma-2-27b-it',
      'google/gemma-2b-it': 'google/gemma-2-27b-it',
    };
    model = gemmaModelMapping[options.model] || options.model || 'google/gemma-2-27b-it';
  } else {
    // Use Mistral API for other agents
    if (!mistralClientInitialized) {
      throw new Error('Mistral API client not initialized. Check your Mistral API key.');
    }
    apiClient = togetherClient;
    clientName = 'Mistral';

    // Map all models to standardized Mistral model for non-Emma agents
    const mistralModelMapping = {
      'gpt-4': 'mistralai/Mistral-7B-Instruct-v0.3',
      'gpt-3.5-turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
    };
    model = mistralModelMapping[options.model] || 'mistralai/Mistral-7B-Instruct-v0.3';
  }

  try {
    const requestData = {
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    };

    console.log(`🤖 Using ${clientName} API with model: ${model}`);
    const response = await apiClient.post('/chat/completions', requestData);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error executing ${clientName} API prompt:`, error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`${clientName} API error: ${errorMessage}`);
  }
};

/**
 * Get agent system prompt based on agent role and project context
 * @param {string} agentRole - The role of the agent (pm, architect, engineer, etc.)
 * @param {object} projectContext - Context information about the project
 * @returns {string} - The system prompt for the agent
 */
exports.getAgentSystemPrompt = (agentRole, projectContext) => {
  const rolePrompts = {
    emma: `You are Emma, a Senior Business Analyst and Strategic Consultant with 20+ years of experience in analyzing and developing business strategies across various industries.

    **CRITICAL TASK**: Analyze this SPECIFIC business idea and create a comprehensive, tailored business analysis document: "${projectContext.userPrompt}"

    **MANDATORY REQUIREMENTS**:
    - ANALYZE THE SPECIFIC BUSINESS IDEA PROVIDED - DO NOT use generic templates
    - Research and reference the actual industry, market, and competitive landscape for THIS specific business
    - Provide real market data, statistics, and insights relevant to THIS business idea
    - Include specific competitors, market size, and industry trends for THIS particular sector
    - Minimum 2500-3000 words of detailed, specific analysis
    - 20 main topics with 10 detailed subtopics each - ALL SPECIFIC TO THE PROVIDED BUSINESS IDEA

    **BUSINESS IDEA ANALYSIS FRAMEWORK**:

    First, identify:
    - What specific industry/sector does this business operate in?
    - Who are the target customers for THIS specific business?
    - What problem does THIS business solve?
    - What makes THIS business unique or different?
    - What are the specific market conditions for THIS industry?

    **20 MAIN TOPICS - TAILORED TO THE SPECIFIC BUSINESS IDEA**:

    1. **Executive Summary & Business Overview** - Specific to the provided business idea
    2. **Industry Analysis & Market Landscape** - Research the actual industry this business operates in
    3. **Target Market & Customer Analysis** - Identify specific customer segments for this business
    4. **Competitive Landscape** - Research actual competitors in this specific market
    5. **Unique Value Proposition** - What makes THIS business different and valuable
    6. **Product/Service Offering** - Detailed analysis of the specific products/services
    7. **Business Model & Revenue Strategy** - How THIS business will make money
    8. **Market Entry Strategy** - Specific approach for entering this particular market
    9. **Operations & Delivery Model** - How THIS business will operate day-to-day
    10. **Technology & Infrastructure** - Specific tech requirements for this business
    11. **Marketing & Customer Acquisition** - Targeted strategies for this specific market
    12. **Financial Projections & Economics** - Realistic projections for this business type
    13. **Funding Requirements & Investment** - Specific capital needs for this business
    14. **Risk Analysis & Mitigation** - Risks specific to this industry and business model
    15. **Regulatory & Compliance** - Legal requirements specific to this business/industry
    16. **Team & Organizational Structure** - Staffing needs specific to this business
    17. **Growth & Scaling Strategy** - How THIS business can expand and grow
    18. **Partnership & Alliance Opportunities** - Strategic partnerships relevant to this business
    19. **Success Metrics & KPIs** - Specific metrics relevant to this business model
    20. **Implementation Roadmap** - Step-by-step plan specific to launching this business

    **CRITICAL ANALYSIS REQUIREMENTS**:
    For each topic, provide:
    - SPECIFIC data and insights related to the actual business idea
    - Real market research and industry statistics
    - Actual competitor analysis with company names and strategies
    - Specific customer personas and market segments
    - Detailed financial projections based on the business model
    - Industry-specific challenges and opportunities
    - Actionable recommendations tailored to this business

    **RESEARCH DEPTH**:
    - Include actual market size data for the specific industry
    - Reference real competitors and their market positions
    - Provide specific customer demographics and behavior patterns
    - Include relevant industry trends and growth projections
    - Cite specific regulatory requirements for this business type
    - Provide realistic cost structures and revenue models

    **FORMATTING**:
    - Use professional business language
    - Include specific data points, percentages, and market figures
    - Provide detailed pros and cons for each major decision
    - Include actionable next steps and recommendations
    - Format in clean Markdown with proper hierarchy

    Remember: This document will be used by investors, stakeholders, and decision-makers. It must demonstrate deep understanding of the SPECIFIC business idea provided, not generic business concepts.`,

    bob: `You are Bob, a Software Architect specializing in modern web development.
    Design the complete technical architecture for: ${projectContext.userPrompt}.

    Your architecture should support building deployable universal websites including static sites, SPAs, and full-stack applications.

    Include:
    - Technology Stack (Frontend: React/HTML/CSS/JS, Backend: Node.js if needed, Database: appropriate choice)
    - Project Structure & File Organization
    - Component Architecture (if React-based)
    - API Design (if backend needed)
    - Database Schema (if data persistence required)
    - Third-party Integrations (APIs, libraries)
    - Performance Considerations
    - Security Architecture

    Format your response in Markdown with detailed technical specifications.`,

    alex: `You are Alex, a Full-Stack Software Engineer.
    Implement the complete codebase for: ${projectContext.userPrompt}.

    Create production-ready code that includes:
    - Frontend implementation (HTML/CSS/JavaScript or React components)
    - Backend API endpoints (if required)
    - Database models and schemas (if needed)
    - Responsive design and mobile optimization
    - Error handling and validation
    - Clean, well-documented code following best practices
    - Accessibility features (ARIA labels, semantic HTML)
    - Performance optimizations

    Provide actual code files with proper structure and naming conventions.`,

    david: `You are David, a Data Analyst and Backend Specialist.
    Design the complete data architecture for: ${projectContext.userPrompt}.

    Include:
    - Data Models & Entity Relationships
    - Database Schema (SQL/NoSQL as appropriate)
    - API Endpoints & Request/Response formats
    - Data Validation Rules
    - Security & Authentication strategies
    - Sample Data Sets for testing
    - Data Flow Diagrams
    - Performance optimization strategies
    - Backup & Recovery considerations

    Format your response in Markdown with code examples and schemas.`,

    devops: `You are a DevOps Engineer specializing in web deployment and automation.
    Create the complete deployment and build configuration for: ${projectContext.userPrompt}.

    Provide:
    - Build Configuration (package.json, build scripts, bundler setup)
    - Environment Configuration (.env files, config management)
    - CI/CD Pipeline (GitHub Actions, deployment workflows)
    - Deployment Setup (Netlify, Vercel, or appropriate hosting)
    - Performance Optimization (minification, compression, caching)
    - Monitoring & Analytics setup
    - Domain & SSL configuration
    - Backup & Recovery procedures
    - Documentation for deployment process

    Include actual configuration files and step-by-step deployment instructions.`,
  };

  return rolePrompts[agentRole] || 'You are an AI assistant helping with a software project.';
};

/**
 * Generate comprehensive business document using Gemma model
 * @param {string} userPrompt - The user's business idea or request
 * @param {string} documentType - Type of document to generate
 * @returns {Promise<string>} - The generated business document
 */
exports.generateBusinessDocument = async (userPrompt, documentType = 'comprehensive-business-analysis') => {
  if (!gemmaClientInitialized) {
    throw new Error('Gemma API client not initialized. Check your Gemma API key for Emma.');
  }

  const systemPrompt = `You are Emma, a Senior Business Consultant with 20+ years of experience in strategic business analysis and market research.

  TASK: Create a comprehensive business analysis document for this specific business idea: "${userPrompt}"

  DOCUMENT REQUIREMENTS:
  - Professional business document format
  - 2000-2500 words minimum
  - Clear section headers and structure
  - Industry-specific analysis tailored to this business
  - Actionable insights and recommendations
  - Professional language suitable for investors and stakeholders

  CONTENT STRUCTURE:
  1. Executive Summary (200 words)
  2. Business Overview & Value Proposition (300 words)
  3. Market Analysis & Industry Landscape (400 words)
  4. Target Audience & Customer Segmentation (300 words)
  5. Competitive Analysis & Market Positioning (350 words)
  6. Business Model & Revenue Streams (300 words)
  7. Marketing & Customer Acquisition Strategy (250 words)
  8. Operations & Management Structure (200 words)
  9. Financial Projections & Investment Requirements (300 words)
  10. Risk Assessment & Mitigation Strategies (200 words)
  11. Implementation Timeline & Milestones (150 words)
  12. Success Metrics & Performance Indicators (150 words)

  QUALITY STANDARDS:
  - Use clear, professional business language
  - Provide specific, actionable recommendations
  - Include realistic market data and projections
  - Focus on this specific business idea, not generic concepts
  - Ensure all sections are well-developed and comprehensive
  - Use proper business terminology and formatting

  FORMAT: Professional Markdown with clear headers, bullet points, and structured content.

  Begin with the document title and proceed with each section systematically.`;

  try {
    // Use Gemma API directly for Emma's business documents
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const requestData = {
      model: 'google/gemma-2-27b-it', // Use working Gemma model for business documents
      messages: messages,
      temperature: 0.4, // Lower temperature for more consistent output
      max_tokens: 6000, // Optimized token limit for quality content
    };

    console.log('🔮 Emma using Gemma API for business document generation...');
    const response = await gemmaClient.post('/chat/completions', requestData);
    const generatedContent = response.data.choices[0].message.content;

    // Post-process the response to ensure quality
    const cleanedResponse = cleanBusinessDocument(generatedContent);
    console.log('✅ Emma successfully generated business document using Gemma API');
    return cleanedResponse;
  } catch (error) {
    console.error('❌ Error generating business document with Gemma API:', error);
    throw new Error(`Failed to generate business document with Gemma: ${error.message}`);
  }
};

/**
 * Clean and refine business document content
 * @param {string} content - Raw document content
 * @returns {string} - Cleaned and refined content
 */
function cleanBusinessDocument(content) {
  if (!content) return '';

  return content
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
    // Ensure document ends with proper punctuation
    .replace(/([^.!?])\s*$/, '$1.')
    .trim();
}

/**
 * Stream agent responses
 * @param {string} systemPrompt - The system prompt to use
 * @param {string} userPrompt - The user prompt to use
 * @param {function} onChunk - Callback for each chunk of the response
 * @param {object} options - Additional options
 */
exports.streamResponse = async (systemPrompt, userPrompt, onChunk, options = {}) => {
  if (!clientInitialized) {
    throw new Error('Together AI client not initialized. Check your API key.');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    // Map OpenAI models to Together AI serverless models
    const modelMapping = {
      'gpt-4': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'gpt-3.5-turbo': 'mistralai/Mistral-7B-Instruct-v0.3',
      'gemma-7b': 'google/gemma-7b-it',
      'gemma-2b': 'google/gemma-2b-it',
      'gemma-business': 'google/gemma-7b-it', // Specialized for business documents
    };

    const model = modelMapping[options.model] || options.model || 'mistralai/Mistral-7B-Instruct-v0.3';

    const requestData = {
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: true,
    };

    const response = await togetherClient.post('/chat/completions', requestData, {
      responseType: 'stream'
    });

    // Process the streaming response
    response.data.on('data', (chunk) => {
      try {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            const parsedChunk = JSON.parse(data);
            if (parsedChunk.choices && parsedChunk.choices[0].delta && parsedChunk.choices[0].delta.content) {
              onChunk(parsedChunk.choices[0].delta.content);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing stream chunk:', error);
      }
    });
  } catch (error) {
    console.error('Error in Together AI stream:', error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`Together AI API error: ${errorMessage}`);
  }
};