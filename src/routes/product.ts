import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL APPROVED PRODUCTS (For Storefront)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'APPROVED' },
      include: { vendor: { select: { name: true, email: true } } },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store products', error });
  }
});

// 2. GET ALL PENDING PRODUCTS (For Admin Approval Portal)
router.get('/pending', async (req, res) => {
  try {
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'PENDING' },
      include: { vendor: { select: { name: true, email: true } } },
    });
    res.status(200).json(pendingProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending products', error });
  }
});

// 3. VENDOR PRODUCT UPLOAD API
router.post('/upload', async (req, res) => {
  try {
    const { title, category, price, description, fileUrl, vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        category,
        price: parseFloat(price),
        description,
        fileUrl: fileUrl || 'https://example.com/files/sample-product.zip',
        status: 'PENDING',
        vendorId,
      },
    });

    res.status(201).json({ message: 'Product submitted for review!', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading product', error });
  }
});

// 4. ADMIN APPROVE OR REJECT API
router.patch('/status', async (req, res) => {
  try {
    const { productId, status } = req.body; // status: 'APPROVED' | 'REJECTED'

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    res.status(200).json({ message: `Product marked as ${status}`, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product status', error });
  }
});

export default router;