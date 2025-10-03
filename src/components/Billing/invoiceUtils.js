// Utility for generating invoice PDF using jsPDF
import jsPDF from 'jspdf';

export function generateInvoicePDF(bill) {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Smart Dine POS', 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text('Restaurant Management System', 105, y, { align: 'center' });
  y += 15;

  // Invoice Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 105, y, { align: 'center' });
  y += 15;

  // Bill Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Bill Number: ${bill.bill_number || bill.id}`, 14, y);
  doc.text(`Date: ${new Date(bill.created_at || bill.timestamp).toLocaleDateString()}`, 120, y);
  y += 8;
  doc.text(`Customer: ${bill.customer_name || 'Walk-in Customer'}`, 14, y);
  doc.text(`Table: ${bill.table_number || 'N/A'}`, 120, y);
  y += 8;
  doc.text(`Order Number: ${bill.order_number || 'N/A'}`, 14, y);
  doc.text(`Payment Status: ${bill.payment_status || 'Pending'}`, 120, y);
  y += 15;

  // Items Header
  doc.setFont(undefined, 'bold');
  doc.text('Items:', 14, y);
  y += 8;

  // Items Table Header
  doc.text('Description', 16, y);
  doc.text('Qty', 120, y);
  doc.text('Price', 140, y);
  doc.text('Total', 170, y);
  y += 5;
  doc.line(14, y, 196, y); // Horizontal line
  y += 8;

  // Items
  doc.setFont(undefined, 'normal');
  if (bill.items && bill.items.length > 0) {
    bill.items.forEach(item => {
      doc.text(`${item.name}`, 16, y);
      doc.text(`${item.quantity}`, 120, y);
      doc.text(`৳${parseFloat(item.price || 0).toFixed(2)}`, 140, y);
      doc.text(`৳${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}`, 170, y);
      y += 7;
    });
  } else {
    doc.text('No items available', 16, y);
    y += 7;
  }

  y += 5;
  doc.line(14, y, 196, y); // Horizontal line
  y += 10;

  // Totals
  const subtotal = parseFloat(bill.subtotal || bill.total_amount || 0);
  const tax = parseFloat(bill.tax || 0);
  const total = parseFloat(bill.total_amount || bill.total || 0);

  doc.text(`Subtotal:`, 140, y);
  doc.text(`৳${subtotal.toFixed(2)}`, 170, y);
  y += 7;

  if (tax > 0) {
    doc.text(`Tax:`, 140, y);
    doc.text(`৳${tax.toFixed(2)}`, 170, y);
    y += 7;
  }

  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text(`Total:`, 140, y);
  doc.text(`৳${total.toFixed(2)}`, 170, y);
  y += 15;

  // Payment Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  if (bill.payment_method) {
    doc.text(`Payment Method: ${bill.payment_method}`, 14, y);
    y += 7;
  }
  if (bill.paid_amount) {
    doc.text(`Amount Paid: ৳${parseFloat(bill.paid_amount).toFixed(2)}`, 14, y);
    y += 7;
  }

  // Footer
  y += 15;
  doc.setFontSize(10);
  doc.text('Thank you for dining with us!', 105, y, { align: 'center' });
  y += 5;
  doc.text('Visit us again soon.', 105, y, { align: 'center' });

  // Save the PDF
  const fileName = `Invoice_${bill.bill_number || bill.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
