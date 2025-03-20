// src/components/CertificatesList.tsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetCertificatesQuery } from "@/redux/services/courseApi";
import { generatePDFCertificate } from "@/utils/certificateGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CertificatePreview from "./CertificatePrview";

const Certificates = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: certificatesData,
    isLoading,
    refetch,
  } = useGetCertificatesQuery(user?.id);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);

  const certificates = certificatesData?.data;

  const handleDownloadCertificate = async (certificate) => {
    try {
      const pdfBlob = await generatePDFCertificate({
        userName: user?.name,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verificationUrl,
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${certificate.courseId}_${user?.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateDialog(true);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading certificates...</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          My Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {certificates && certificates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow key={certificate.certificateId}>
                  <TableCell>{certificate.courseTitle}</TableCell>
                  <TableCell>
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{certificate.certificateId}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                        className="text-teal-500 border-teal-500 hover:bg-teal-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificate(certificate)}
                        className="text-teal-500 border-teal-500 hover:bg-teal-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No certificates earned yet. Complete a course to earn one!
          </p>
        )}

        {/* Certificate Preview Dialog */}
        {/* Certificate Preview Dialog */}
        <Dialog
          open={showCertificateDialog}
          onOpenChange={setShowCertificateDialog}
        >
          <DialogContent className="max-w-[900px] w-full p-0 bg-transparent border-none">
            <DialogHeader className="p-4 bg-white rounded-t-lg">
              <DialogTitle className="text-teal-500">
                Certificate Preview
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-white">
              {selectedCertificate && (
                <CertificatePreview
                  userName={user?.name}
                  courseTitle={selectedCertificate.courseTitle}
                  completionDate={selectedCertificate.completionDate}
                  certificateId={selectedCertificate.certificateId}
                  verificationUrl={selectedCertificate.verificationUrl}
                />
              )}
            </div>
            <div className="p-4 bg-white rounded-b-lg flex justify-end">
              <Button
                onClick={() => handleDownloadCertificate(selectedCertificate)}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Certificates;
