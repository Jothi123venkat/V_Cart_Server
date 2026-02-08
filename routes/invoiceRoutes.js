const express = require('express');
const router = express.Router();
const Invoice = require('../model/Invoice');
const Order = require('../model/Order');
const SiteConfig = require('../model/SiteConfig');
const auth = require('../middleware/authMiddleware');

// Helper to generate next invoice number
const generateInvoiceNumber = async () => {
    const config = await SiteConfig.findOne();
    const prefix = config?.invoiceSettings?.prefix || 'INV';
    const startNum = config?.invoiceSettings?.startInvoiceNumber || 1;
    
    // Find last invoice to increment
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNum = startNum;
    
    if (lastInvoice) {
        const parts = lastInvoice.invoiceNo.split('-');
        if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
            nextNum = parseInt(parts[parts.length - 1]) + 1;
        }
    }
    
    const year = new Date().getFullYear();
    // Format: INV-2024-001
    return `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;
};

// @route   POST /api/invoices/create
// @desc    Manually create an invoice
// @access  Admin
router.post('/create', async (req, res) => {
    try {
        const { customerDetails, items, paymentDetails, notes } = req.body;
        
        const config = await SiteConfig.findOne();
        const invoiceNo = await generateInvoiceNumber();
        
        let subTotal = 0;
        let totalTax = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;
        
        const storeState = config?.invoiceSettings?.address?.toLowerCase().includes('delhi') ? 'Delhi' : 'Other'; // Simple check, ideally store state is separate field
        // Basic State extraction from address if not explicit
        const customerState = customerDetails.state || 'Delhi';
        
        // Determine Inter-state vs Intra-state
        // Logic: If states match => Intra (CGST+SGST). Else => Inter (IGST)
        // Adjust logic as per exact requirement. Assuming Delhi-Delhi is Intra.
        const isInterState = customerState.toLowerCase() !== storeState.toLowerCase();

        const processedItems = items.map(item => {
            const taxable = (item.rate * item.quantity) - (item.discount || 0);
            subTotal += taxable;
            
            // Tax logic
            let taxRate = item.taxRate || config?.invoiceSettings?.taxRate || 18;
            let taxAmount = (taxable * taxRate) / 100;
            
            totalTax += taxAmount;
            
            let itemCgst = 0, itemSgst = 0, itemIgst = 0;
            
            if (isInterState) {
                itemIgst = taxAmount;
                igstTotal += itemIgst;
            } else {
                itemCgst = taxAmount / 2;
                itemSgst = taxAmount / 2;
                cgstTotal += itemCgst;
                sgstTotal += itemSgst;
            }
            
            return {
                ...item,
                taxableValue: taxable,
                cgst: { rate: isInterState ? 0 : taxRate/2, amount: itemCgst },
                sgst: { rate: isInterState ? 0 : taxRate/2, amount: itemSgst },
                igst: { rate: isInterState ? taxRate : 0, amount: itemIgst },
                total: taxable + taxAmount
            };
        });
        
        const grandTotalRaw = subTotal + totalTax;
        const grandTotal = Math.round(grandTotalRaw);
        const roundOff = grandTotal - grandTotalRaw;
        
        const newInvoice = new Invoice({
            invoiceNo,
            customerDetails,
            items: processedItems,
            taxSummary: {
                cgst: cgstTotal,
                sgst: sgstTotal,
                igst: igstTotal,
                totalTax: totalTax
            },
            subTotal,
            roundOff,
            grandTotal,
            paymentDetails,
            notes,
            termsAndConditions: config?.invoiceSettings?.termsAndConditions,
            storeDetails: {
                name: config?.invoiceSettings?.storeName || config?.brandName,
                address: config?.invoiceSettings?.address,
                gstin: config?.invoiceSettings?.gstin,
                email: config?.contactEmail,
                phone: config?.contactPhone
            }
        });
        
        await newInvoice.save();
        res.json(newInvoice);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ date: -1 });
        res.json(invoices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/invoices/:id
// @desc    Get invoice by ID
// @access  Admin
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/invoices/generate/:orderId
// @desc    Generate invoice from existing order
// @access  Admin/System
router.post('/generate/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user');
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        
        const { createInvoiceFromOrder } = require('../utils/invoiceUtils');
        const invoice = await createInvoiceFromOrder(order);
        
        res.json(invoice);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
