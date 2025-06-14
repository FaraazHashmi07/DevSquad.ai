// backend/services/wordDocumentService.js
const fs = require('fs-extra');
const path = require('path');

/**
 * Convert Markdown content to Word-style HTML document
 * @param {string} markdownContent - The markdown content to convert
 * @param {string} title - Document title
 * @returns {string} - HTML content styled like a Word document
 */
exports.convertMarkdownToWordHTML = (markdownContent, title = 'Business Document') => {
  try {
    // Validate and clean input content
    const cleanedContent = validateAndCleanMarkdown(markdownContent);

    // Parse markdown content into structured HTML
    const htmlContent = parseMarkdownToHTML(cleanedContent);

    // Validate HTML output
    const validatedHTML = validateHTMLContent(htmlContent);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Word Document Styling */
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.15;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        
        .document-container {
            max-width: 8.5in;
            margin: 20px auto;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: 11in;
        }
        
        .document-content {
            padding: 1in;
            padding-top: 0.75in;
            padding-bottom: 0.75in;
        }
        
        /* Headers */
        h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #1f4e79;
            margin-top: 24pt;
            margin-bottom: 12pt;
            page-break-after: avoid;
            border-bottom: 2px solid #1f4e79;
            padding-bottom: 6pt;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            color: #2e74b5;
            margin-top: 18pt;
            margin-bottom: 6pt;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: bold;
            color: #4472c4;
            margin-top: 12pt;
            margin-bottom: 3pt;
            page-break-after: avoid;
        }
        
        /* Document Title */
        .document-title {
            font-size: 24pt;
            font-weight: bold;
            color: #1f4e79;
            text-align: center;
            margin-bottom: 24pt;
            padding-bottom: 12pt;
            border-bottom: 3px solid #1f4e79;
        }
        
        /* Document Info */
        .document-info {
            font-size: 10pt;
            color: #666;
            text-align: center;
            margin-bottom: 36pt;
            font-style: italic;
        }
        
        /* Paragraphs */
        p {
            margin-top: 0;
            margin-bottom: 8pt;
            text-align: justify;
            orphans: 2;
            widows: 2;
        }
        
        /* Lists */
        ul, ol {
            margin-top: 0;
            margin-bottom: 8pt;
            padding-left: 36pt;
        }
        
        li {
            margin-bottom: 4pt;
        }
        
        /* Strong text */
        strong, b {
            font-weight: bold;
            color: #1f4e79;
        }
        
        /* Emphasis */
        em, i {
            font-style: italic;
            color: #2e74b5;
        }
        
        /* Tables */
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 12pt;
            margin-bottom: 12pt;
        }
        
        th, td {
            border: 1px solid #bfbfbf;
            padding: 6pt;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #1f4e79;
        }
        
        /* Page breaks */
        .page-break {
            page-break-before: always;
        }
        
        /* Print styles */
        @media print {
            body {
                background-color: white;
            }
            
            .document-container {
                box-shadow: none;
                margin: 0;
                max-width: none;
            }
            
            .document-content {
                padding: 0.75in;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .document-container {
                margin: 10px;
                max-width: none;
            }
            
            .document-content {
                padding: 0.5in;
            }
        }
        
        /* Special sections */
        .executive-summary {
            background-color: #f8f9fa;
            border-left: 4px solid #1f4e79;
            padding: 12pt;
            margin: 12pt 0;
        }
        
        .key-points {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 12pt;
            margin: 12pt 0;
            border-radius: 4px;
        }
        
        .pros-cons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 12pt 0;
        }
        
        .pros {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 12pt;
            border-radius: 4px;
        }
        
        .cons {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 12pt;
            border-radius: 4px;
        }
        
        /* Footer */
        .document-footer {
            margin-top: 36pt;
            padding-top: 12pt;
            border-top: 1px solid #bfbfbf;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="document-container">
        <div class="document-content">
            <div class="document-title">${title}</div>
            <div class="document-info">
                Created by Emma - Senior Business Analyst & Strategic Consultant<br>
                Generated on ${new Date().toLocaleDateString()}<br>
                Document Type: Comprehensive Business Analysis Report
            </div>
            
            ${validatedHTML}

            <div class="document-footer">
                This document was generated by the AI-Powered Multi-Agent Business Analysis System<br>
                For internal use only - Confidential Business Information
            </div>
        </div>
    </div>
</body>
</html>`;
  } catch (error) {
    console.error('Error converting markdown to Word HTML:', error);
    // Return a fallback document
    return createFallbackWordDocument(title, markdownContent);
  }
};

/**
 * Parse markdown content into HTML with Word-style formatting
 * @param {string} content - Markdown content
 * @returns {string} - HTML content
 */
function parseMarkdownToHTML(content) {
  let html = content;
  
  // Convert headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  
  // Convert bold text
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Convert bullet points
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>\s*)+/gs, '<ul>$&</ul>');
  
  // Convert numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Convert line breaks to paragraphs
  const lines = html.split('\n');
  let result = '';
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (!inList) result += '</p><p>';
      continue;
    }
    
    if (line.startsWith('<h') || line.startsWith('<ul>') || line.startsWith('<ol>')) {
      if (!inList) result += '</p>';
      result += line;
      if (line.startsWith('<ul>') || line.startsWith('<ol>')) inList = true;
      if (!inList) result += '<p>';
    } else if (line.startsWith('</ul>') || line.startsWith('</ol>')) {
      result += line;
      inList = false;
      result += '<p>';
    } else if (!line.startsWith('<li>') && !inList) {
      if (i === 0) result += '<p>';
      result += line + ' ';
    } else {
      result += line;
    }
  }
  
  if (!inList) result += '</p>';
  
  // Clean up empty paragraphs
  result = result.replace(/<p>\s*<\/p>/g, '');
  result = result.replace(/<p><\/p>/g, '');
  
  return result;
}

/**
 * Save Word-style HTML document to file system
 * @param {string} projectId - Project ID
 * @param {string} fileName - File name without extension
 * @param {string} htmlContent - HTML content
 * @returns {Promise<string>} - File path
 */
exports.saveWordHTMLDocument = async (projectId, fileName, htmlContent) => {
  const PROJECT_DIR = path.join(__dirname, '../data/projects');
  const filePath = path.join(PROJECT_DIR, projectId, 'docs', `${fileName}.html`);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(filePath));
  
  // Write file
  await fs.writeFile(filePath, htmlContent, 'utf-8');
  
  return `docs/${fileName}.html`;
};

/**
 * Validate and clean markdown content
 * @param {string} content - Raw markdown content
 * @returns {string} - Cleaned markdown content
 */
function validateAndCleanMarkdown(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid markdown content provided');
  }

  return content
    // Remove any HTML tags that might interfere
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    // Fix common markdown issues
    .replace(/#{7,}/g, '######') // Limit header depth
    .replace(/\n{4,}/g, '\n\n\n') // Limit consecutive line breaks
    // Remove any potential XSS content
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Ensure proper encoding
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Restore markdown syntax
    .replace(/&lt;(\/?[h1-6]|p|ul|ol|li|strong|em|br)\s*&gt;/gi, '<$1>')
    .replace(/&amp;(#\d+|#x[\da-f]+|\w+);/gi, '&$1;')
    .trim();
}

/**
 * Validate HTML content for safety and structure
 * @param {string} html - Generated HTML content
 * @returns {string} - Validated HTML content
 */
function validateHTMLContent(html) {
  if (!html || typeof html !== 'string') {
    return '<p>Error: Invalid content generated</p>';
  }

  // Ensure minimum content length
  if (html.length < 100) {
    return '<p>Error: Insufficient content generated</p>';
  }

  // Check for balanced tags
  const openTags = (html.match(/<[^\/][^>]*>/g) || []).length;
  const closeTags = (html.match(/<\/[^>]*>/g) || []).length;

  if (Math.abs(openTags - closeTags) > 5) {
    console.warn('HTML tags may be unbalanced, attempting to fix...');
    html = fixUnbalancedTags(html);
  }

  return html;
}

/**
 * Fix unbalanced HTML tags
 * @param {string} html - HTML with potentially unbalanced tags
 * @returns {string} - Fixed HTML
 */
function fixUnbalancedTags(html) {
  // Simple fix for common unbalanced tags
  const tagStack = [];
  const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];

  // This is a simplified fix - in production, you'd want a more robust HTML parser
  return html
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<ul>\s*<\/ul>/g, '') // Remove empty lists
    .replace(/<ol>\s*<\/ol>/g, '') // Remove empty ordered lists
    .replace(/(<li>(?:(?!<\/?li>).)*)<\/li>/g, '$1</li>') // Ensure li tags are closed
    + (html.includes('<p>') && !html.includes('</p>') ? '</p>' : ''); // Close unclosed paragraphs
}

/**
 * Create fallback Word document when conversion fails
 * @param {string} title - Document title
 * @param {string} content - Original content
 * @returns {string} - Fallback HTML document
 */
function createFallbackWordDocument(title, content) {
  const safeContent = content ? content.replace(/[<>&"']/g, '') : 'Content could not be generated';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .content { background: #f5f5f5; padding: 20px; border-radius: 4px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="error">
        <strong>Document Generation Notice:</strong> The document could not be fully processed.
        Please review the content below and regenerate if necessary.
    </div>
    <div class="content">${safeContent}</div>
    <div style="margin-top: 40px; font-size: 12px; color: #666;">
        Generated by AI-Powered Business Analysis System<br>
        Date: ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;
}
