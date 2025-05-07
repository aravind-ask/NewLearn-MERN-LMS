import { useParams, useNavigate } from "react-router-dom";
import {
  useGetInstructorApplicationDetailsQuery,
  useReviewInstructorApplicationMutation,
} from "@/redux/services/instructorApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import {
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  Code,
  User,
  ExternalLink,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const S3_BASE_URL = "https://newlearn-lms-mern.s3.ap-south-1.amazonaws.com/";

const InstructorApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } =
    useGetInstructorApplicationDetailsQuery({ applicationId });
  const [reviewApplication, { isLoading: isReviewing }] =
    useReviewInstructorApplicationMutation();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Handle opening the rejection dialog
  const handleRejectOpen = () => {
    setIsRejectDialogOpen(true);
  };

  // Handle closing the rejection dialog
  const handleRejectClose = () => {
    setRejectionReason("");
    setIsRejectDialogOpen(false);
  };

  // Handle rejecting the application
  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      await reviewApplication({
        applicationId,
        status: "rejected",
        rejectionReason,
      }).unwrap();
      toast.success("Application rejected successfully.");
      handleRejectClose();
      refetch();
    } catch (error: any) {
      toast.error("Failed to reject application.");
    }
  };

  // Handle approving the application
  const handleApprove = async () => {
    try {
      await reviewApplication({
        applicationId,
        status: "approved",
        rejectionReason: "",
      }).unwrap();
      toast.success("Application approved successfully!");
      refetch();
    } catch (error: any) {
      toast.error("Failed to approve application.");
    }
  };

  // Handle opening the PDF modal
  const handlePdfOpen = (url: string) => {
    setSelectedPdfUrl(url);
    setIsPdfModalOpen(true);
  };

  // Handle closing the PDF modal
  const handlePdfClose = () => {
    setSelectedPdfUrl(null);
    setIsPdfModalOpen(false);
  };

  // Prevent modal from closing on outside click or escape key
  const preventModalClose = () => {
    // Do nothing to keep modal open
  };

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-lg" />;
  if (isError)
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-6">
        <AlertDescription>
          Failed to load application details. Please try again later.
        </AlertDescription>
      </Alert>
    );

  // Construct full certificate URLs
  const certificateUrls = data?.data?.certificates?.map(
    (cert) => `${S3_BASE_URL}${cert}`
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Instructor Application Details
        </h1>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-gray-600" />
            {data?.data?.fullName}
          </CardTitle>
          <Badge
            className={`mt-2 text-sm font-medium capitalize ${
              data?.data?.status === "pending"
                ? "bg-yellow-500 text-white"
                : data?.data?.status === "approved"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {data?.data?.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{data?.data?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{data?.data?.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Qualification</p>
                <p className="font-medium text-gray-900">
                  {data?.data?.qualification}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium text-gray-900">
                  {data?.data?.experience} years
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Skills</p>
                <p className="font-medium text-gray-900">
                  {data?.data?.skills?.join(", ") || "None"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">LinkedIn Profile</p>
                {data?.data?.linkedinProfile ? (
                  <a
                    href={data.data.linkedinProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                ) : (
                  <p className="text-gray-500 italic">Not provided</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Bio</p>
            <p className="font-medium text-gray-900 bg-gray-50 p-4 rounded-lg">
              {data?.data?.bio || "No bio provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Certificates</p>
            {certificateUrls?.length ? (
              <div className="space-y-2">
                {certificateUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handlePdfOpen(url)}
                    className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Certificate {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No certificates provided</p>
            )}
          </div>

          {/* Action Buttons */}
          {data?.data?.status === "pending" && (
            <div className="flex space-x-4 mt-6">
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </Button>
              <Button
                onClick={handleRejectOpen}
                variant="destructive"
                disabled={isReviewing}
                className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={preventModalClose}>
        <DialogContent className="sm:max-w-md bg-white" showCloseButton={false}>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Reject Application
          </DialogTitle>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this application.
          </p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="mb-4 border-gray-300 focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleRejectClose}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={!rejectionReason || isReviewing}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={preventModalClose}>
        <DialogContent className="max-w-4xl p-0" showCloseButton={false}>
          <DialogTitle className="p-4 text-lg font-semibold text-gray-900">
            Certificate Preview
          </DialogTitle>
          <div className="flex-1 p-4 bg-gray-100">
            {selectedPdfUrl ? (
              <iframe
                src={selectedPdfUrl}
                className="w-full h-[600px] border-0"
                title={`Certificate Preview`}
              />
            ) : (
              <p className="text-gray-500 italic">No PDF selected</p>
            )}
          </div>
          <DialogFooter className="p-4 flex justify-end">
            <Button
              onClick={handlePdfClose}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorApplicationDetails;
