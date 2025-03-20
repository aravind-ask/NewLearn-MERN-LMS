// src/utils/certificateGenerator.js
import jsPDF from "jspdf";
import QRCode from "qrcode";

export const generatePDFCertificate = async ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
  verificationUrl,
}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // A4 dimensions in mm: 297mm wide x 210mm tall
  const pageWidth = 297;
  const pageHeight = 210;

  // Border
  doc.setDrawColor(0, 128, 128); // Teal color
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header
  doc.setFontSize(30);
  doc.setTextColor(0, 128, 128);
  doc.text("Certificate of Completion", pageWidth / 2, 40, { align: "center" });

  // Main Content
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("This certifies that", pageWidth / 2, 70, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(0, 128, 128);
  doc.text(userName, pageWidth / 2, 90, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("has successfully completed the course", pageWidth / 2, 110, {
    align: "center",
  });

  doc.setFontSize(20);
  doc.setTextColor(0, 128, 128);
  doc.text(courseTitle, pageWidth / 2, 130, { align: "center" });

  // Footer Section
  // QR Code (positioned bottom-left)
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 40 }); // Smaller size for better fit
  doc.addImage(qrCodeDataUrl, "PNG", 15, pageHeight - 55, 40, 40); // Adjusted to fit within page
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text("Scan to verify", 35, pageHeight - 10, { align: "center" });

  // Footer Text (positioned bottom-right)
  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.text(
    `Completed on: ${new Date(completionDate).toLocaleDateString()}`,
    pageWidth - 15,
    pageHeight - 35,
    { align: "right" }
  );
  doc.text(
    `Certificate ID: ${certificateId}`,
    pageWidth - 15,
    pageHeight - 25,
    { align: "right" }
  );
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "Issued by: NewLearn Pvt Ltd.",
    pageWidth - 15,
    pageHeight - 15,
    { align: "right" }
  );

  return doc.output("blob");
};
