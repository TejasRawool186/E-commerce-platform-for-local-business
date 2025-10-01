const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (orderData, invoicePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(invoicePath);

      doc.pipe(stream);

      doc.fontSize(20).text('INVOICE', 50, 50, { align: 'right' });

      doc.fontSize(10)
        .text(`Invoice Number: ${orderData.invoice_number}`, 50, 80, { align: 'right' })
        .text(`Invoice Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 50, 95, { align: 'right' });

      doc.fontSize(12).text('From:', 50, 140);
      doc.fontSize(10)
        .text(orderData.seller.business_name || orderData.seller.username, 50, 160)
        .text(orderData.seller.address || 'Address not provided', 50, 175)
        .text(`Phone: ${orderData.seller.phone_number || 'N/A'}`, 50, 190)
        .text(`Email: ${orderData.seller.email}`, 50, 205);

      doc.fontSize(12).text('To:', 300, 140);
      doc.fontSize(10)
        .text(orderData.retailer.business_name || orderData.retailer.username, 300, 160)
        .text(orderData.retailer.address || 'Address not provided', 300, 175)
        .text(`Phone: ${orderData.retailer.phone_number || 'N/A'}`, 300, 190)
        .text(`Email: ${orderData.retailer.email}`, 300, 205);

      doc.moveTo(50, 250).lineTo(550, 250).stroke();

      const tableTop = 280;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Product Name', 50, tableTop);
      doc.text('Quantity', 250, tableTop);
      doc.text('Unit Price', 350, tableTop);
      doc.text('Subtotal', 450, tableTop);

      doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

      doc.font('Helvetica');
      const itemY = tableTop + 30;
      doc.text(orderData.product.name, 50, itemY, { width: 180 });
      doc.text(orderData.quantity.toString(), 250, itemY);
      doc.text(`$${parseFloat(orderData.unit_price).toFixed(2)}`, 350, itemY);
      doc.text(`$${parseFloat(orderData.total_amount).toFixed(2)}`, 450, itemY);

      doc.moveTo(50, itemY + 30).lineTo(550, itemY + 30).stroke();

      const totalY = itemY + 50;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Grand Total:', 350, totalY);
      doc.text(`$${parseFloat(orderData.total_amount).toFixed(2)}`, 450, totalY);

      doc.fontSize(10).font('Helvetica');
      doc.text('Payment Status: COD', 50, totalY + 40);

      doc.fontSize(8).text(
        'Thank you for your business!',
        50,
        700,
        { align: 'center', width: 500 }
      );

      doc.end();

      stream.on('finish', () => {
        resolve(invoicePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
