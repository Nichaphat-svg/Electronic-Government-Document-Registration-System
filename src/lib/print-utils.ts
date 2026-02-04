/**
 * Mobile-friendly print utility
 * Uses iframe approach for better mobile browser compatibility
 */

export function printReport(htmlContent: string, title: string = 'Report') {
  // Create a hidden iframe for printing (works better on mobile)
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';
  
  document.body.appendChild(printFrame);
  
  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  
  if (!frameDoc) {
    // Fallback to window.open for older browsers
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต popup ในเบราว์เซอร์');
    }
    return;
  }
  
  frameDoc.open();
  frameDoc.write(htmlContent);
  frameDoc.close();
  
  // Wait for content to load then print
  printFrame.onload = () => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error('Print error:', e);
    }
    
    // Remove iframe after printing (with delay for print dialog)
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };
  
  // Trigger load for browsers that don't fire onload
  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error('Print timeout error:', e);
    }
    
    // Cleanup
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 1000);
  }, 500);
}

/**
 * Generate base print styles for Thai documents
 */
export function getBasePrintStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body { 
      font-family: 'Sarabun', 'TH SarabunPSK', 'Noto Sans Thai', sans-serif; 
      padding: 20px; 
      color: #333;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 10px 8px; 
      text-align: left; 
      font-size: 14px;
    }
    th { 
      background-color: #2563eb !important; 
      color: white !important;
      font-weight: bold;
    }
    tr:nth-child(even) { 
      background-color: #f9f9f9; 
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .header { 
      text-align: center; 
      margin-bottom: 20px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 15px;
    }
    .header h1 { 
      font-size: 22px; 
      margin: 0 0 8px 0;
      color: #1e40af;
    }
    .header p { 
      font-size: 14px; 
      margin: 3px 0;
      color: #666;
    }
    .summary-box { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 15px 0;
      text-align: center;
    }
    .summary-number { 
      font-size: 36px; 
      font-weight: bold; 
      color: #2563eb; 
    }
    .summary-label { 
      font-size: 14px; 
      color: #666; 
    }
    .percentage { 
      color: #059669; 
      font-weight: bold; 
    }
    .footer { 
      margin-top: 25px; 
      text-align: right; 
      font-size: 12px; 
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .total-row { 
      background-color: #dbeafe !important; 
      font-weight: bold; 
    }
    @media print {
      body { 
        padding: 10px; 
        font-size: 12px;
      }
      .no-print { display: none !important; }
      table { font-size: 11px; }
      th, td { padding: 6px 4px; }
    }
    @page {
      margin: 15mm;
      size: A4;
    }
  `;
}
