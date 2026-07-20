import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportOptions {
  filename: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Export an HTML element to PDF
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  options: PDFExportOptions
) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let yPosition = margin;

    // Add title if provided
    if (options.title) {
      pdf.setFontSize(18);
      pdf.text(options.title, margin, yPosition);
      yPosition += 15;
    }

    // Add content
    const maxHeight = pageHeight - 2 * margin;
    let remainingHeight = contentHeight;
    let imageYOffset = 0;

    while (remainingHeight > 0) {
      const currentHeight = Math.min(remainingHeight, maxHeight - (yPosition - margin));
      const sourceHeight = (currentHeight / contentWidth) * canvas.width;

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = sourceHeight;
      const ctx = croppedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, imageYOffset, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
      }

      const croppedImgData = croppedCanvas.toDataURL('image/png');
      pdf.addImage(croppedImgData, 'PNG', margin, yPosition, contentWidth, currentHeight);

      remainingHeight -= currentHeight;
      imageYOffset += sourceHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = margin;
      }
    }

    pdf.save(options.filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Export amortization data as PDF table
 */
export const exportAmortizationPDF = (
  amortizationData: Array<{
    year: number;
    principal: number;
    interest: number;
  }>,
  loanAmount: number,
  rate: number,
  term: number,
  monthlyPayment: number
) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    // Title
    pdf.setFontSize(18);
    pdf.text('Loan Amortization Schedule', margin, yPosition);
    yPosition += 12;

    // Loan details
    pdf.setFontSize(10);
    pdf.text(`Loan Amount: $${loanAmount.toLocaleString()}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Annual Rate: ${rate.toFixed(2)}%`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Term: ${term} months | Monthly Payment: $${monthlyPayment.toFixed(2)}`, margin, yPosition);
    yPosition += 10;

    // Table header
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(15, 127, 127);
    const col1X = margin;
    const col2X = margin + 40;
    const col3X = margin + 80;
    pdf.rect(col1X, yPosition - 5, 35, 8, 'F');
    pdf.rect(col2X, yPosition - 5, 35, 8, 'F');
    pdf.rect(col3X, yPosition - 5, pageWidth - col3X - margin, 8, 'F');
    pdf.text('Year', col1X + 2, yPosition);
    pdf.text('Principal', col2X + 2, yPosition);
    pdf.text('Interest', col3X + 2, yPosition);
    yPosition += 10;

    // Table rows
    pdf.setTextColor(0, 0, 0);
    amortizationData.forEach((row) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(row.year.toString(), col1X + 2, yPosition);
      pdf.text(`$${row.principal.toFixed(2)}`, col2X + 2, yPosition);
      pdf.text(`$${row.interest.toFixed(2)}`, col3X + 2, yPosition);
      yPosition += 6;
    });

    pdf.save(`amortization-schedule-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error exporting amortization PDF:', error);
    throw error;
  }
};

/**
 * Export application form as PDF
 */
export const exportApplicationPDF = (formData: Record<string, any>) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Title
    pdf.setFontSize(16);
    pdf.text('Loan Application Summary', margin, yPosition);
    yPosition += 12;

    // Content
    pdf.setFontSize(10);
    Object.entries(formData).forEach(([key, value]) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);

      pdf.setFont(undefined, 'bold');
      pdf.text(`${label}:`, margin, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(displayValue, margin + 50, yPosition);
      yPosition += 8;
    });

    // Footer
    yPosition += 5;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      margin,
      yPosition
    );

    pdf.save(`loan-application-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error exporting application PDF:', error);
    throw error;
  }
};
