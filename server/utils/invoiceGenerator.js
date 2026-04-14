const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (orderData, invoicePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(invoicePath);

      doc.pipe(stream);

      // Colors
      const primaryColor = '#4F46E5'; // Indigo
      const secondaryColor = '#6B7280'; // Gray
      const borderColor = '#E5E7EB'; // Light Gray

      // --- Header ---
      doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold').text('LocalB2B', { align: 'left' });
      doc.fillColor(secondaryColor).fontSize(10).text('Connecting Local Businesses', { align: 'left' });

      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('INVOICE', 200, 50, { align: 'right' });

      // --- Invoice Details ---
      const invoiceNumber = `INV-${orderData.id.substring(0, 8).toUpperCase()}`;
      const invoiceDate = new Date().toLocaleDateString();
      const orderDate = new Date(orderData.orderDate).toLocaleDateString();

      doc.moveDown(2);
      const detailsY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Invoice Number:', 350, detailsY);
      doc.text('Invoice Date:', 350, detailsY + 15);
      doc.text('Order Date:', 350, detailsY + 30);

      doc.font('Helvetica');
      doc.text(invoiceNumber, 450, detailsY);
      doc.text(invoiceDate, 450, detailsY + 15);
      doc.text(orderDate, 450, detailsY + 30);

      // --- From/To Addresses ---
      doc.moveDown(3);
      const addressY = doc.y;
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text('From:', 50, addressY);
      doc.fillColor(secondaryColor).text('To:', 300, addressY);

      doc.fillColor('#000000').font('Helvetica');
      const seller = orderData.seller;
      doc.text(seller.businessName || `${seller.firstName} ${seller.lastName}`, 50, addressY + 15)
         .text(seller.address || 'Address not provided', { width: 200 })
         .text(`Phone: ${seller.phone || 'N/A'}`)
         .text(`Email: ${seller.email}`);

      const retailer = orderData.retailer;
      doc.text(retailer.businessName || `${retailer.firstName} ${retailer.lastName}`, 300, addressY + 15)
         .text(retailer.address || 'Address not provided', { width: 200 })
         .text(`Phone: ${retailer.phone || 'N/A'}`)
         .text(`Email: ${retailer.email}`);

      // --- Invoice Table ---
      const tableTop = doc.y + 30;
      doc.rect(50, tableTop, 500, 30).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('Product Name', 60, tableTop + 10);
      doc.text('Quantity', 260, tableTop + 10, { width: 90, align: 'right' });
      doc.text('Unit Price', 360, tableTop + 10, { width: 90, align: 'right' });
      doc.text('Total', 460, tableTop + 10, { width: 90, align: 'right' });

      const product = orderData.Product;
      const itemY = tableTop + 40;
      doc.fillColor('#000000').font('Helvetica');
      doc.text(product.name, 60, itemY);
      doc.text(`${orderData.quantity} ${product.unit || 'pcs'}`, 260, itemY, { width: 90, align: 'right' });
      doc.text(`₹${parseFloat(orderData.unitPrice).toFixed(2)}`, 360, itemY, { width: 90, align: 'right' });
      doc.text(`₹${parseFloat(orderData.totalAmount).toFixed(2)}`, 460, itemY, { width: 90, align: 'right' });

      doc.moveTo(50, itemY + 25).lineTo(550, itemY + 25).stroke(borderColor);

      // --- Grand Total ---
      const totalY = itemY + 40;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Grand Total:', 350, totalY);
      doc.text(`₹${parseFloat(orderData.totalAmount).toFixed(2)}`, 450, totalY, { align: 'right' });

      // --- Payment Info & Footer ---
      doc.moveDown(4);
      const footerY = doc.y;
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text('Payment Information', 50, footerY);
      
      // Show modern payment info
      const currentDate = new Date();
      const paymentInfo = `Payment processed through LocalB2B Payment Gateway
Transaction Date: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}
Payment Status: Completed
Reference ID: TXN${Date.now().toString().slice(-8).toUpperCase()}

Note: This order was placed through our secure online payment system.
For any payment-related queries, please contact customer support.`;
      
      doc.fillColor('#000000').font('Helvetica').text(paymentInfo);

      doc.fillColor(secondaryColor).fontSize(8).text(
        'Thank you for your business! For any questions, please contact your seller directly.',
        50, 750, { align: 'center', width: 500 }
      );

      doc.end();

      stream.on('finish', () => resolve(invoicePath));
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
