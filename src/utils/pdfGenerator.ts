import jsPDF from "jspdf";

export interface CoverLetterPDFData {
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  jobTitle: string;
  jobDepartment?: string;
  appliedAt?: string;
  coverLetterText: string;
  companyName?: string;
}

export function generateCoverLetterPDF(data: CoverLetterPDFData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header Bar Accent
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, y, 5, 16, "F");

  // Title & Platform
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("HirePulse RMS", margin + 9, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Applicant Cover Letter Document", margin + 9, y + 12);

  // Line Divider
  y += 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // Candidate Details Card
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.applicantName, margin + 5, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const contactInfo = [
    data.applicantEmail ? `Email: ${data.applicantEmail}` : "",
    data.applicantPhone ? `Phone: ${data.applicantPhone}` : ""
  ].filter(Boolean).join("  |  ");
  doc.text(contactInfo, margin + 5, y + 13);

  const jobInfo = `Target Position: ${data.jobTitle}${data.jobDepartment ? ` (${data.jobDepartment})` : ""}`;
  doc.text(jobInfo, margin + 5, y + 19);

  const formattedDate = data.appliedAt 
    ? new Date(data.appliedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text(`Submitted: ${formattedDate}`, pageWidth - margin - 5, y + 7, { align: "right" });

  // Cover Letter Section Heading
  y += 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Cover Letter", margin, y);

  y += 4;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 28, y);

  // Cover Letter Body Text
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const lines = doc.splitTextToSize(data.coverLetterText || "No cover letter content provided.", contentWidth);
  const lineHeight = 5.5;

  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`HirePulse RMS Document  •  Page ${i} of ${pageCount}`, pageWidth / 2, 287, { align: "center" });
  }

  // Save PDF
  const safeFilename = `${data.applicantName.replace(/[^a-zA-Z0-9]/g, "_")}_Cover_Letter.pdf`;
  doc.save(safeFilename);
}
