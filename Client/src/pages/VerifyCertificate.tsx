// src/pages/VerifyCertificate.tsx
import { useParams } from "react-router-dom";
import { useVerifyCertificateQuery } from "@/redux/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion"; // For subtle animations

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const {
    data,
    error: verifyError,
    isLoading,
  } = useVerifyCertificateQuery(certificateId);

  // Debugging logs
  console.log("Verifying certificate with ID:", certificateId);
  console.log("Query data:", data);
  console.log("Query error:", verifyError);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-medium text-gray-600"
        >
          Verifying certificate...
        </motion.p>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="border-none shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-red-50 border-b border-red-100 py-6">
              <CardTitle className="text-3xl font-serif font-semibold text-red-700 text-center">
                Certificate Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-10">
              <div className="space-y-6 text-center">
                <XCircle className="h-20 w-20 text-red-500 mx-auto" />
                <h2 className="text-2xl font-semibold text-red-600">
                  Verification Failed
                </h2>
                <p className="text-gray-600 text-lg font-light">
                  {verifyError.data?.message || "Failed to verify certificate"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const certificate = data?.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-none shadow-lg bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-teal-50 border-b border-teal-100 py-6">
            <CardTitle className="text-3xl font-serif font-semibold text-teal-700 text-center">
              Certificate Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            {certificate && data?.success ? (
              <div className="space-y-6 text-center">
                <CheckCircle className="h-20 w-20 text-teal-500 mx-auto" />
                <h2 className="text-2xl font-semibold text-teal-600">
                  Certificate Verified
                </h2>
                <div className="space-y-4 text-gray-700 text-lg font-light">
                  <p>
                    <span className="font-medium text-teal-700">
                      Student Name:
                    </span>{" "}
                    {certificate.userName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-teal-700">Course:</span>{" "}
                    {certificate.courseTitle}
                  </p>
                  <p>
                    <span className="font-medium text-teal-700">
                      Completed:
                    </span>{" "}
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium text-teal-700">
                      Certificate ID:
                    </span>{" "}
                    {certificate.certificateId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <XCircle className="h-20 w-20 text-red-500 mx-auto" />
                <h2 className="text-2xl font-semibold text-red-600">
                  Verification Failed
                </h2>
                <p className="text-gray-600 text-lg font-light">
                  {data?.message || "Certificate not found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyCertificate;
