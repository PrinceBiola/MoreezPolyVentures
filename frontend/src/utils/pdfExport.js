import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportDebtsToPDF = (debts, type, statusFilter) => {
  if (!debts || !debts.length) {
    alert('No data to export');
    return;
  }

  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text(`Moreez Poly - ${type}s Ledger`, 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Status Filter: ${statusFilter}`, 14, 30);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 36);

  // Define Table Columns
  const tableColumn = [
    "Subject Identity", 
    "Date", 
    "Due Date", 
    "Context/Memo", 
    "Total (N)", 
    "Paid (N)", 
    "Balance (N)", 
    "Status",
    "Payment History Log"
  ];
  
  // Define Table Data
  const tableRows = [];

  debts.forEach(debt => {
    // Format part payment log
    let paymentsLog = "None";
    if (debt.paymentHistory && debt.paymentHistory.length > 0) {
      paymentsLog = debt.paymentHistory.map(ph => 
        `${new Date(ph.date).toLocaleDateString()}: N${(ph.amount || 0).toLocaleString()} ${ph.note ? '('+ph.note+')' : ''}`
      ).join('\n');
    }

    const debtData = [
      debt.name || '',
      new Date(debt.date).toLocaleDateString(),
      debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A',
      debt.description || 'No memo',
      (debt.amount || 0).toLocaleString(),
      (debt.amountPaid || 0).toLocaleString(),
      ((debt.amount || 0) - (debt.amountPaid || 0)).toLocaleString(),
      debt.status || 'Pending',
      paymentsLog
    ];
    
    tableRows.push(debtData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 42,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42] }, // Slate 900
    columnStyles: {
      8: { cellWidth: 60 } // More width for payment history
    }
  });

  doc.save(`${type.toLowerCase()}_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSingleDebtToPDF = (debt) => {
  if (!debt) return;

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text("MOREEZ POLYVENTURE", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`${debt.type || 'Debt'} Profile & Payment History`, 105, 30, { align: "center" });
  
  // Divider line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);
  
  // Debt Details
  doc.setFontSize(11);
  doc.setTextColor(20);
  
  doc.text(`Subject Name:`, 14, 45);
  doc.setFont("helvetica", "bold");
  const splitName = doc.splitTextToSize(debt.name || 'Unknown', 100);
  doc.text(splitName, 45, 45);
  doc.setFont("helvetica", "normal");
  
  // Calculate new Y offset based on name length
  const nextY = 45 + (splitName.length * 6);
  
  doc.text(`Status:`, 14, nextY);
  doc.setFont("helvetica", "bold");
  doc.text(`${debt.status}`, 45, nextY);
  doc.setFont("helvetica", "normal");

  doc.text(`Date of Issue:`, 120, nextY);
  doc.text(`${new Date(debt.date).toLocaleDateString()}`, 155, nextY);

  doc.text(`Total Amount:`, 14, nextY + 10);
  doc.setFont("helvetica", "bold");
  doc.text(`N${(debt.amount || 0).toLocaleString()}`, 45, nextY + 10);
  doc.setFont("helvetica", "normal");

  doc.text(`Amount Paid:`, 14, nextY + 20);
  doc.text(`N${(debt.amountPaid || 0).toLocaleString()}`, 45, nextY + 20);

  const balance = (debt.amount || 0) - (debt.amountPaid || 0);
  doc.text(`Remaining Balance:`, 120, nextY + 20);
  doc.setFont("helvetica", "bold");
  // Simple check to make it red if balance > 0, otherwise green
  doc.setTextColor(balance > 0 ? 220 : 16, balance > 0 ? 38 : 185, balance > 0 ? 38 : 129);
  doc.text(`N${balance.toLocaleString()}`, 155, nextY + 20);
  doc.setTextColor(20);
  doc.setFont("helvetica", "normal");

  doc.text(`Memo:`, 14, nextY + 30);
  doc.setFont("helvetica", "italic");
  const splitMemo = doc.splitTextToSize(debt.description || 'N/A', 140);
  doc.text(splitMemo, 45, nextY + 30);
  doc.setFont("helvetica", "normal");

  const tableStartY = nextY + 30 + (splitMemo.length * 6) + 10;

  // Payment History Section
  doc.setFontSize(14);
  doc.text(`Part Payment History`, 14, tableStartY);
  
  let finalY = tableStartY + 10;
  if (debt.paymentHistory && debt.paymentHistory.length > 0) {
    const tableColumn = ["Date", "Amount Paid (N)", "Note"];
    const tableRows = debt.paymentHistory.map(ph => [
      new Date(ph.date).toLocaleDateString() + ' ' + new Date(ph.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'}),
      (ph.amount || 0).toLocaleString(),
      ph.note || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: tableStartY + 5,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42] }
    });
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text(`No partial payments recorded.`, 14, tableStartY + 10);
    finalY = tableStartY + 20;
  }

  // Footer text indicating this is an official receipt/statement
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Official statement generated on ${new Date().toLocaleString()}`, 14, finalY);

  const safeName = (debt.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeName}_Statement.pdf`);
};
