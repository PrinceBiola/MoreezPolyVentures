/**
 * Utility to export an array of objects to a CSV file and trigger a download.
 * @param {Array<Object>} data - The data to export.
 * @param {string} filename - The name of the file (without extension).
 * @param {Array<string>} [headers] - Optional array of header names.
 */
export const exportToCSV = (data, filename, headers = []) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object if not provided
  const columnHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    columnHeaders.join(','), // Header row
    ...data.map(row => 
      columnHeaders.map(fieldName => {
        const value = row[fieldName] ?? '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ];

  // Create a Blob from the CSV rows with a UTF-8 BOM to fix encoding issues in Excel
  const csvContent = csvRows.join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a link and trigger download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportDebtsToCSV = (debts, filename = 'debt_ledger') => {
  if (!debts || !debts.length) {
    console.error('No debits or credits to export');
    return;
  }

  const rows = debts.map((debt) => {
    const lastPayment = debt.paymentHistory?.length ? debt.paymentHistory[debt.paymentHistory.length - 1] : null;
    return {
      Type: debt.type,
      Direction: debt.type === 'Debtor' ? 'They owe me' : 'I owe them',
      Name: debt.name,
      Status: debt.status,
      Amount: debt.amount ?? 0,
      AmountPaid: debt.amountPaid ?? 0,
      RemainingAmount: (debt.amount ?? 0) - (debt.amountPaid ?? 0),
      Date: debt.date ? new Date(debt.date).toLocaleDateString() : '',
      Description: debt.description || '',
      LastPaymentDate: lastPayment?.date ? new Date(lastPayment.date).toLocaleDateString() : '',
      LastPaymentAmount: lastPayment?.amount ?? '',
      LastPaymentNote: lastPayment?.note || ''
    };
  });

  exportToCSV(rows, filename, [
    'Type',
    'Direction',
    'Name',
    'Status',
    'Amount',
    'AmountPaid',
    'RemainingAmount',
    'Date',
    'Description',
    'LastPaymentDate',
    'LastPaymentAmount',
    'LastPaymentNote'
  ]);
};
