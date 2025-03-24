import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import prisma from '../utils/prisma';
import mammoth from 'mammoth';

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// PDF Table Extraction 
class    {
  /**
   * Extract tables from PDF buffer
   * @param pdfBuffer The PDF buffer
   * @returns Array of extracted tables with headers and rows
   */
  public async extractTables(pdfBuffer: Buffer): Promise<any[]> {
    try {
      const data = await pdfParse(pdfBuffer);
      const extractedTables: any[] = [];
      
      // Extract tables from text content
      const lines = data.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let currentTable: any = null;
      let tableHeaders: string[] = [];
      let tableRows: string[][] = [];
      let isInTable = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect table start based on multiple spaces or tabs
        const isTableRow = line.includes('\t') || line.match(/\s{2,}/);
        
        if (isTableRow) {
          const columns = line.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell.length > 0);
          
          if (!isInTable) {
            // Start new table
            isInTable = true;
            tableHeaders = columns;
          } else {
            // Add row to current table
            tableRows.push(columns);
          }
        } else if (isInTable) {
          // End of table
          isInTable = false;
          
          if (tableHeaders.length > 0 && tableRows.length > 0) {
            extractedTables.push({
              headers: tableHeaders,
              rows: tableRows
            });
          }
          
          tableHeaders = [];
          tableRows = [];
        }
      }
      
      // Add the last table if we're still in one at the end
      if (isInTable && tableHeaders.length > 0 && tableRows.length > 0) {
        extractedTables.push({
          headers: tableHeaders,
          rows: tableRows
        });
      }
      
      return extractedTables;
    } catch (error) {
      console.error('Error extracting tables from PDF:', error);
      return [];
    }
  }
}

const tableExtractor = new PDFTableExtractor();

// Upload File and Extract Data endpoint
router.post('/upload', authMiddleware, upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const fileType = fileExtension === '.pdf' ? 'pdf' : fileExtension === '.docx' ? 'docx' : null;

  if (!fileType) {
    return res.status(400).json({ message: 'Unsupported file type' });
  }

  try {
    let structuredData: any[] = [];
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    if (fileType === 'pdf') {
      //  Handle PDF file
      console.log(`Processing PDF file: ${fileName}`);
      const pdfBuffer = req.file.buffer;
      const data = await pdfParse(pdfBuffer);

      if (!data.text) {
        return res.status(400).json({ message: 'Failed to extract data from PDF' });
      }

      // Extract text into lines
      const extractedText = data.text.match(/[^\r\n]+/g) || [];
      let currentSection: any = null;

      extractedText.forEach(line => {
        if (/^\s*\d+\.\s*/.test(line)) {
          currentSection = { heading: line.trim(), content: [] };
          structuredData.push(currentSection);
        } else if (line.includes('\t') || line.match(/\s{2,}/)) {
          const columns = line.split(/\t|\s{2,}/).map(cell => cell.trim());
          if (!currentSection) {
            currentSection = { heading: 'Untitled Table', content: [] };
            structuredData.push(currentSection);
          }
          currentSection.content.push({ type: 'table', data: columns });
        } else {
          if (!currentSection) {
            currentSection = { heading: 'Untitled Section', content: [] };
            structuredData.push(currentSection);
          }
          currentSection.content.push({ type: 'paragraph', text: line.trim() });
        }
      });

      // Extract tables using the table extractor
      try {
        const extractedTables = await tableExtractor.extractTables(pdfBuffer);
        
        if (extractedTables.length > 0) {
          // Add a dedicated section for structured tables
          structuredData.push({
            heading: 'Extracted Tables',
            content: extractedTables.map((table, index) => ({
              type: 'structured_table',
              tableIndex: index,
              headers: table.headers,
              rows: table.rows
            }))
          });
        }
      } catch (tableError) {
        console.error('Table extraction error:', tableError);
      }

      fs.writeFileSync(filePath, pdfBuffer);
    } 
    
    else if (fileType === 'docx') {
      // Handle DOCX file
      console.log(`Processing DOCX file: ${fileName}`);
      const docBuffer = req.file.buffer;

      // Extract text from DOCX
      const { value } = await mammoth.extractRawText({ buffer: docBuffer });

      if (!value) {
        return res.status(400).json({ message: 'Failed to extract data from DOCX' });
      }

      const extractedText = value.match(/[^\r\n]+/g) || [];
      extractedText.forEach((line) => {
        structuredData.push({ type: 'paragraph', text: line.trim() });
      });

      fs.writeFileSync(filePath, docBuffer);
    }

    // Save to database
    const file = await prisma.pdf.create({
      data: {
        userid: req.user.id,
        data: JSON.stringify(structuredData),
        fileUrl: `/uploads/${fileName}`,
        fileType, 
      },
    });

    return res.status(201).json(file);
  } catch (error) {
    console.error('Failed to process file:', error);
    res.status(500).json({ message: 'Failed to process file' });
  }
});

// Get All Files of the respective user.
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const files = await prisma.pdf.findMany({
      where: { userid: req.user.id },
      select: {
        id: true,
        data: true,
        fileUrl: true,
      }
    });

    console.log(files);

    return res.send(files || []);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// Download File by ID
router.get('/download/:id', authMiddleware, async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const file = await prisma.pdf.findUnique({
      where: { id: parseInt(id) },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const extension = path.extname(filePath).toLowerCase();

    // Set Content-Type for PDF or DOCX
    if (extension === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (extension === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    res.send({
      url: file.fileUrl
    })
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// Get File Details by ID 
router.get('/details/:id', authMiddleware, async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const file = await prisma.pdf.findUnique({
      where: { id: parseInt(id) },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Detect file type based on extension
    const fileType = path.extname(filePath).toLowerCase().replace('.', '');

    res.status(200).json({
      id: file.id,
      fileUrl: file.fileUrl,
      data: file.data,
      fileType,
    });

  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({ message: 'Failed to fetch file details' });
  }
});

// Save Edited File
router.post('/save/:id', authMiddleware, async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const file = await prisma.pdf.findUnique({
      where: { id: parseInt(id) },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Use `req.body.data` instead of `req.body`
    const newdata = await prisma.pdf.update({
      where: { id: parseInt(id) },
      data: {
        data: JSON.stringify(req.body.data), // Save as a string
      },
    });

    res.status(200).json({ message: 'File saved successfully', data: newdata.data });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ message: 'Failed to save file' });
  }
});

export const pdfRoute = router;