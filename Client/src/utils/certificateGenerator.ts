import jsPDF from "jspdf";
import "jspdf-autotable";

export const generatePDFCertificate = ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Certificate border
  doc.setDrawColor(0, 128, 128); // Teal color
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  // Header
  doc.setFontSize(30);
  doc.setTextColor(0, 128, 128);
  doc.text("Certificate of Completion", 148.5, 40, { align: "center" });

  // Main content
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("This certifies that", 148.5, 70, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(0, 128, 128);
  doc.text(userName, 148.5, 90, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("has successfully completed the course", 148.5, 110, {
    align: "center",
  });

  doc.setFontSize(20);
  doc.setTextColor(0, 128, 128);
  doc.text(courseTitle, 148.5, 130, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Completed on: ${new Date(completionDate).toLocaleDateString()}`,
    148.5,
    150,
    { align: "center" }
  );
  doc.text(`Certificate ID: ${certificateId}`, 148.5, 160, { align: "center" });

  // Footer
  doc.setFontSize(12);
  doc.text("Issued by: NewLearning Pvt ltd.", 148.5, 180, {
    align: "center",
  });

  return doc.output("blob");
};
