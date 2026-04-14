import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart } from 'chart.js';

const formatNumber = (num) => {
  if (typeof num !== 'number') {
    return '0.00';
  }
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const addHeader = (doc, title, month, year) => {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Report for: ${month} ${year}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
  doc.setDrawColor(200);
  doc.line(14, 35, doc.internal.pageSize.getWidth() - 14, 35);
};

const addFooter = (doc, pageNumber, totalPages) => {
  doc.setPage(pageNumber);
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = `Page ${pageNumber} of ${totalPages} | Generated on: ${new Date().toLocaleDateString()}`;
  doc.text(footerText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
};

export const generateSalesReportPDF = (reportData, month, year) => {
  if (!reportData) {
    alert('No data available to generate a report.');
    return;
  }

  const doc = new jsPDF();

  // Page 1: Transaction Table
  addHeader(doc, 'Monthly Sales Report', month, year);
  const tableColumn = ["Order ID", "Retailer Name", "Product Name", "Quantity", "Amount", "Date of Order"];
  const tableRows = reportData.orders.map(order => [
    order.OrderID,
    order.RetailerName,
    order.ProductName,
    order.Quantity,
    `₹${formatNumber(order.Amount)}`,
    order.DateofOrder,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  const finalY = doc.lastAutoTable.finalY || 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ₹${formatNumber(reportData.totalAmount)}`, 14, finalY + 15);

  // Page 2: Bar Charts
  doc.addPage();
  addHeader(doc, 'Sales Analytics', month, year);

  // Graph 1: Product Sales Performance
  const productSalesCanvas = document.createElement('canvas');
  new Chart(productSalesCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(reportData.productSales),
      datasets: [{
        label: 'Total Quantity Sold',
        data: Object.values(reportData.productSales),
        backgroundColor: '#3498db',
      }],
    },
    options: { responsive: false, animation: false, plugins: { legend: { display: false } } },
  });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Sales Performance', 14, 45);
  doc.addImage(productSalesCanvas.toDataURL('image/png'), 'PNG', 14, 50, 180, 80);

  // Graph 2: Retailer Order Frequency
  const retailerOrdersCanvas = document.createElement('canvas');
  new Chart(retailerOrdersCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(reportData.retailerOrders),
      datasets: [{
        label: 'Total Number of Orders',
        data: Object.values(reportData.retailerOrders),
        backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'],
      }],
    },
    options: { responsive: false, animation: false, plugins: { legend: { display: false } } },
  });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Retailers by Order Count', 14, 145);
  doc.addImage(retailerOrdersCanvas.toDataURL('image/png'), 'PNG', 14, 150, 180, 80);

  // Page 3: Doughnut Chart
  if (reportData.productDistribution && Object.keys(reportData.productDistribution).length > 0) {
    doc.addPage();
    addHeader(doc, 'Sales Analytics', month, year);
    const productDistCanvas = document.createElement('canvas');
    new Chart(productDistCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(reportData.productDistribution),
        datasets: [{
          data: Object.values(reportData.productDistribution),
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'],
        }],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  const total = data.datasets[0].data.reduce((acc, value) => acc + value, 0);
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const percentage = Math.round((value / total) * 100);
                    return {
                      text: `${label} (${percentage} %)`, 
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: isNaN(data.datasets[0].data[i]),
                      // Extra data for the legend item
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          }
        }
      },
    });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Share of Total Sales', 14, 45);
    doc.addImage(productDistCanvas.toDataURL('image/png'), 'PNG', 20, 50, 120, 120);
  }

  addFooter(doc);

  doc.save(`SalesReport_${month}_${year}.pdf`);
};
