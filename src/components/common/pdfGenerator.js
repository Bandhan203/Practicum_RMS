import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate PDF receipt for a bill
 * @param {Object} bill - Bill object with all details
 * @param {Object} order - Order object with items
 * @returns {jsPDF} PDF document
 */
export const generateBillReceipt = (bill, order = null) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Restaurant Header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('SMART DINE RESTAURANT', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('123 Restaurant Street, City, State 12345', pageWidth / 2, 30, { align: 'center' });
  pdf.text('Phone: (555) 123-4567 | Email: info@smartdine.com', pageWidth / 2, 37, { align: 'center' });
  
  // Bill Details
  const billDate = new Date(bill.created_at).toLocaleDateString();
  const billTime = new Date(bill.created_at).toLocaleTimeString();
  
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('RECEIPT', pageWidth / 2, 55, { align: 'center' });
  
  // Bill Information
  let yPos = 70;
  pdf.setFontSize(10);
  
  const billInfo = [
    ['Bill Number:', bill.bill_number],
    ['Date:', `${billDate} ${billTime}`],
    ['Customer:', bill.customer_name || 'Walk-in Customer'],
    ['Table:', bill.table_number ? `Table ${bill.table_number}` : 'Takeaway'],
    ['Waiter:', bill.waiter_name || 'N/A'],
    ['Payment Method:', bill.payment_method || 'Cash']
  ];
  
  billInfo.forEach(([label, value]) => {
    pdf.text(label, 20, yPos);
    pdf.text(value, 80, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  // Items Table
  if (order && order.items && order.items.length > 0) {
    const tableData = order.items.map(item => [
      item.name || `Item ${item.menu_item_id}`,
      item.quantity.toString(),
      `$${parseFloat(item.price).toFixed(2)}`,
      `$${(item.quantity * parseFloat(item.price)).toFixed(2)}`
    ]);
    
    pdf.autoTable({
      startY: yPos,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [66, 125, 157],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    
    yPos = pdf.lastAutoTable.finalY + 10;
  }
  
  // Bill Summary
  const summaryData = [];
  
  if (bill.subtotal_amount) {
    summaryData.push(['Subtotal:', `$${parseFloat(bill.subtotal_amount).toFixed(2)}`]);
  }
  
  if (bill.tax_amount && parseFloat(bill.tax_amount) > 0) {
    summaryData.push([`Tax (${bill.tax_rate || 0}%):`, `$${parseFloat(bill.tax_amount).toFixed(2)}`]);
  }
  
  if (bill.service_charge && parseFloat(bill.service_charge) > 0) {
    summaryData.push(['Service Charge:', `$${parseFloat(bill.service_charge).toFixed(2)}`]);
  }
  
  if (bill.discount_amount && parseFloat(bill.discount_amount) > 0) {
    summaryData.push(['Discount:', `-$${parseFloat(bill.discount_amount).toFixed(2)}`]);
  }
  
  summaryData.push(['Total Amount:', `$${parseFloat(bill.total_amount).toFixed(2)}`]);
  
  if (bill.paid_amount) {
    summaryData.push(['Paid Amount:', `$${parseFloat(bill.paid_amount).toFixed(2)}`]);
    
    const remainingAmount = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);
    if (remainingAmount > 0.01) {
      summaryData.push(['Remaining:', `$${remainingAmount.toFixed(2)}`]);
    } else if (remainingAmount < -0.01) {
      summaryData.push(['Change:', `$${Math.abs(remainingAmount).toFixed(2)}`]);
    }
  }
  
  pdf.autoTable({
    startY: yPos,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: pageWidth - 100 },
    tableWidth: 80
  });
  
  // Footer
  const footerY = pdf.internal.pageSize.height - 30;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Thank you for dining with us!', pageWidth / 2, footerY, { align: 'center' });
  pdf.text('Please visit us again soon.', pageWidth / 2, footerY + 7, { align: 'center' });
  
  if (bill.notes) {
    pdf.text(`Notes: ${bill.notes}`, pageWidth / 2, footerY - 10, { align: 'center' });
  }
  
  return pdf;
};

/**
 * Download PDF receipt
 * @param {Object} bill - Bill object
 * @param {Object} order - Order object
 * @param {string} filename - Optional filename
 */
export const downloadBillReceipt = (bill, order = null, filename = null) => {
  const pdf = generateBillReceipt(bill, order);
  const defaultFilename = `receipt-${bill.bill_number}.pdf`;
  pdf.save(filename || defaultFilename);
};

/**
 * Print PDF receipt
 * @param {Object} bill - Bill object
 * @param {Object} order - Order object
 */
export const printBillReceipt = (bill, order = null) => {
  const pdf = generateBillReceipt(bill, order);
  
  // Create blob URL and open in new window for printing
  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      // Clean up blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    };
  } else {
    // Fallback: download the PDF if popup is blocked
    downloadBillReceipt(bill, order);
  }
};

/**
 * Generate daily sales report PDF
 * @param {Object} data - Sales data with bills and statistics
 * @returns {jsPDF} PDF document
 */
export const generateSalesReport = (data) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text('DAILY SALES REPORT', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Smart Dine Restaurant', pageWidth / 2, 30, { align: 'center' });
  
  const reportDate = new Date().toLocaleDateString();
  pdf.text(`Report Date: ${reportDate}`, pageWidth / 2, 40, { align: 'center' });
  
  // Summary Statistics
  let yPos = 60;
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Summary', 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(10);
  
  const summaryData = [
    ['Total Bills:', data.total_bills?.toString() || '0'],
    ['Total Revenue:', `$${(data.total_revenue || 0).toFixed(2)}`],
    ['Paid Bills:', data.paid_bills?.toString() || '0'],
    ['Pending Bills:', data.pending_bills?.toString() || '0'],
    ['Average Bill Amount:', `$${(data.average_bill || 0).toFixed(2)}`]
  ];
  
  summaryData.forEach(([label, value]) => {
    pdf.text(label, 20, yPos);
    pdf.text(value, 100, yPos);
    yPos += 8;
  });
  
  return pdf;
};

export default {
  generateBillReceipt,
  downloadBillReceipt,
  printBillReceipt,
  generateSalesReport
};