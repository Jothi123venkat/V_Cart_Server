const SiteConfig = require('../model/SiteConfig');
const Invoice = require('../model/Invoice');

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
        // Check if the last part is a number to avoid issues if format changes
        if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
            nextNum = parseInt(parts[parts.length - 1]) + 1;
        }
    }
    
    const year = new Date().getFullYear();
    // Format: INV-2024-001
    return `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;
};

// Logic to create invoice from an order object
const createInvoiceFromOrder = async (order) => {
    try {
        // Check if invoice already exists
        const existing = await Invoice.findOne({ orderId: order._id });
        if (existing) return existing;
        
        const config = await SiteConfig.findOne();
        const invoiceNo = await generateInvoiceNumber();
        const taxRate = config?.invoiceSettings?.taxRate || 18;
        
        // Determine state from shipping address
        // Fallback to City if State is missing (common with simple forms) or default to Delhi
        const shippingState = order.shippingInfo.state || order.shippingInfo.city || 'Delhi'; 
        const storeState = config?.invoiceSettings?.address?.toLowerCase().includes('delhi') ? 'Delhi' : 'Other'; 
        const isInterState = shippingState.toLowerCase() !== storeState.toLowerCase();

        let subTotal = 0;
        let totalTax = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;

        const items = order.items.map(item => {
            // Price is inclusive of tax for online orders (standard retail logic)
            // Taxable = Inclusive / (1 + Rate/100)
            const totalItemPrice = item.price * item.quantity;
            const taxable = totalItemPrice / (1 + (taxRate/100)); 
            const taxAmount = totalItemPrice - taxable;
            
            subTotal += taxable;
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
                productName: item.productname,
                quantity: item.quantity,
                rate: item.price / (1 + (taxRate/100)), // Unit taxable rate
                taxableValue: taxable,
                cgst: { rate: isInterState ? 0 : taxRate/2, amount: itemCgst },
                sgst: { rate: isInterState ? 0 : taxRate/2, amount: itemSgst },
                igst: { rate: isInterState ? taxRate : 0, amount: itemIgst },
                total: totalItemPrice
            };
        });
        
        // Store Details Validation
        const storeDetails = {
             name: config?.invoiceSettings?.storeName || config?.brandName || 'V-CART',
             address: config?.invoiceSettings?.address || '',
             gstin: config?.invoiceSettings?.gstin || '',
             email: config?.contactEmail || '',
             phone: config?.contactPhone || ''
        };

        const newInvoice = new Invoice({
            invoiceNo,
            date: order.date,
            orderId: order._id,
            customerDetails: {
                name: order.shippingInfo.name,
                address: `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.zipCode}`,
                mobile: order.shippingInfo.phone,
                email: order.shippingInfo.email,
                state: shippingState
            },
            items,
            taxSummary: {
                cgst: cgstTotal,
                sgst: sgstTotal,
                igst: igstTotal,
                totalTax: totalTax
            },
            subTotal,
            roundOff: 0, 
            grandTotal: order.total,
            paymentDetails: {
                mode: 'Online', 
                status: 'Paid', // Assuming online orders are paid or COD (handled below)
                paidAmount: order.total,
                dueAmount: 0 // If COD, this might be different, but for invoice generation usually full amount is shown
            },
            storeDetails,
            termsAndConditions: config?.invoiceSettings?.termsAndConditions
        });
        
        await newInvoice.save();
        return newInvoice;

    } catch (error) {
        console.error("Error generating invoice from order:", error);
        throw error;
    }
};

module.exports = { generateInvoiceNumber, createInvoiceFromOrder };
