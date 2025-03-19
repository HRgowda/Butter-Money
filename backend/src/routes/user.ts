import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key';

// Signup
router.post('/signup', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        username,
        password: hashedPassword 
      },
    });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

    return res.status(201).json({ 
      token,
      message: "Account created successfully."
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Internal server error."
    });
  }
});


// Signin
router.post('/signin', async (req: any, res: any) => {

  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { 
        username
       } 
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY);

    return res.status(200).json({ 
      token,
      message: "Logged in successfully."
    });
  } catch (error) {

    console.log("Error", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export const userRoute = router;
