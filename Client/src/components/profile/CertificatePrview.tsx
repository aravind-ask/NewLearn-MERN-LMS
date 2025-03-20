// src/components/CertificatePreview.tsx
import { FC } from "react";

interface CertificatePreviewProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}

const CertificatePreview: FC<CertificatePreviewProps> = ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
}) => {
  return (
    <div className="w-full max-w-[842px] h-[595px] bg-white border-4 border-teal-600 p-8 flex flex-col justify-between shadow-lg relative">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-teal-600">
          Certificate of Completion
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
        <p className="text-lg text-gray-800">This certifies that</p>
        <h2 className="text-3xl font-semibold text-teal-600">{userName}</h2>
        <p className="text-lg text-gray-800">
          has successfully completed the course
        </p>
        <h3 className="text-2xl font-medium text-teal-600">{courseTitle}</h3>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Completed on: {new Date(completionDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">Certificate ID: {certificateId}</p>
        <p className="text-xs text-gray-500">
          Issued by: NewLearning Pvt ltd.
        </p>
      </div>
    </div>
  );
};

export default CertificatePreview;
