import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Register User (Accepts ANY random email without OTP/verification)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB directly
    const user = await prisma.user.create({
      data: {
        name,
        email, // Can be any fake email: test@xyz.com
        passwordHash: hashedPassword,
        role: role || 'BUYER',
      },
    });

    return res.status(201).json({
      message: 'Registration successful! You can now log in.',
      userId: user.id,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};