"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDFCertificate = void 0;
// src/utils/certificateGenerator.ts
const jspdf_1 = __importDefault(require("jspdf"));
require("jspdf-autotable");
const generatePDFCertificate = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userName, courseTitle, completionDate, certificateId, }) {
    const doc = new jspdf_1.default({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });
    // Certificate border
    doc.setDrawColor(0, 128, 128);
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
    doc.text(`Completed on: ${new Date(completionDate).toLocaleDateString()}`, 148.5, 150, { align: "center" });
    doc.text(`Certificate ID: ${certificateId}`, 148.5, 160, { align: "center" });
    // Footer
    doc.setFontSize(12);
    doc.text("Issued by: NewLearning Pvt ltd.", 148.5, 180, {
        align: "center",
    });
    // Return as Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    console.log("PDF Buffer length:", pdfBuffer.length); // Debug log
    return pdfBuffer;
});
exports.generatePDFCertificate = generatePDFCertificate;
