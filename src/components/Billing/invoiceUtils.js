// Utility for generating invoice PDF using jsPDF
import jsPDF from 'jspdf';

export function generateInvoicePDF(bill) {
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(18);
  doc.text('Invoice', 105, y, { align: 'center' });
  y += 10;
  doc.setFontSize(12);
  doc.text(`Bill ID: #${bill.id}`, 14, y);
  doc.text(`Table: ${bill.tableNumber}`, 100, y);
  y += 8;
  doc.text(`Waiter: ${bill.waiter}`, 14, y);
  doc.text(`Date: ${new Date(bill.timestamp).toLocaleString()}`, 100, y);
  y += 10;
  doc.text('Items:', 14, y);
  y += 8;
  bill.items.forEach(item => {
    doc.text(`${item.name} x${item.quantity}`, 16, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 160, y, { align: 'right' });
    y += 7;
  });
  y += 5;
  doc.text(`Subtotal: $${bill.subtotal}`, 140, y);
  y += 7;
  doc.text(`Tax: $${bill.tax}`, 140, y);
  y += 7;
  doc.setFontSize(14);
  doc.text(`Total: $${bill.total}`, 140, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Payment Method: ${bill.paymentMethod}`, 14, y);
  doc.save(`Invoice_${bill.id}.pdf`);
}
