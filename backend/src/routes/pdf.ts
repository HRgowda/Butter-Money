import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import prisma from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('file'), async (req: any, res: any) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const data = await pdfParse(req.file.buffer);

    const tables = data.text.match(/(\S+\s+\S+\s+\S+)/g);

    await prisma.pdf.create({
      data: {
        userid: (req as any).user.id,
        data: JSON.stringify(tables),
      },
    });

    return res.status(200).json({ tables });

  } catch (err) {
    console.log("Erro", err)
    res.status(500).json({ message: 'Failed to process PDF' });
  }
});

export const pdfRoute = router;
