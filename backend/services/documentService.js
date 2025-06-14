// backend/services/documentService.js
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs-extra');
const path = require('path');

/**
 * Convert Markdown content to Word document
 * @param {string} markdownContent - The markdown content to convert
 * @param {string} title - Document title
 * @returns {Promise<Buffer>} - Word document buffer
 */
exports.convertMarkdownToWord = async (markdownContent, title = 'Business Document') => {
  try {
    // Parse markdown content into structured sections
    const sections = parseMarkdownToSections(markdownContent);
    
    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32,
                color: "2E74B5"
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Add all parsed sections
          ...sections
        ]
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
    
  } catch (error) {
    console.error('Error converting markdown to Word:', error);
    throw new Error(`Failed to convert to Word document: ${error.message}`);
  }
};

/**
 * Parse markdown content into Word document sections
 * @param {string} content - Markdown content
 * @returns {Array} - Array of Word document paragraphs
 */
function parseMarkdownToSections(content) {
  const lines = content.split('\n');
  const paragraphs = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - add spacing
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { after: 200 }
      }));
      continue;
    }
    
    // Main headers (# Header)
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line.substring(2),
            bold: true,
            size: 28,
            color: "1F4E79"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }));
    }
    // Sub headers (## Header)
    else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line.substring(3),
            bold: true,
            size: 24,
            color: "2E74B5"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      }));
    }
    // Sub-sub headers (### Header)
    else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line.substring(4),
            bold: true,
            size: 20,
            color: "4472C4"
          })
        ],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      }));
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: `• ${line.substring(2)}`,
            size: 22
          })
        ],
        spacing: { after: 100 },
        indent: { left: 400 }
      }));
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22
          })
        ],
        spacing: { after: 100 },
        indent: { left: 400 }
      }));
    }
    // Bold text (**text**)
    else if (line.includes('**')) {
      const parts = line.split('**');
      const children = [];
      
      for (let j = 0; j < parts.length; j++) {
        if (j % 2 === 0) {
          // Regular text
          if (parts[j]) {
            children.push(new TextRun({
              text: parts[j],
              size: 22
            }));
          }
        } else {
          // Bold text
          children.push(new TextRun({
            text: parts[j],
            bold: true,
            size: 22
          }));
        }
      }
      
      paragraphs.push(new Paragraph({
        children: children,
        spacing: { after: 150 }
      }));
    }
    // Regular paragraph
    else {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22
          })
        ],
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED
      }));
    }
  }
  
  return paragraphs;
}

/**
 * Save Word document to file system
 * @param {string} projectId - Project ID
 * @param {string} fileName - File name without extension
 * @param {Buffer} buffer - Word document buffer
 * @returns {Promise<string>} - File path
 */
exports.saveWordDocument = async (projectId, fileName, buffer) => {
  const PROJECT_DIR = path.join(__dirname, '../data/projects');
  const filePath = path.join(PROJECT_DIR, projectId, 'docs', `${fileName}.docx`);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(filePath));
  
  // Write file
  await fs.writeFile(filePath, buffer);
  
  return `docs/${fileName}.docx`;
};
