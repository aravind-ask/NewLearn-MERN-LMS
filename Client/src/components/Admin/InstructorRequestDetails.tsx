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

const InstructorApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } =
    useGetInstructorApplicationDetailsQuery({ applicationId });
  const [reviewApplication, { isLoading: isReviewing }] =
    useReviewInstructorApplicationMutation();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
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

  if (isLoading) return <Skeleton className="h-full w-full" />;
  if (isError)
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-6">
        <AlertDescription>
          Failed to load application details. Please try again later.
        </AlertDescription>
      </Alert>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Instructor Application Details</h1>
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{data?.data?.fullName}</CardTitle>
          <Badge
            className={`mt-2 ${
              data?.data?.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : data?.data?.status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {data?.data?.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{data?.data?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{data?.data?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Qualification</p>
              <p className="font-medium">{data?.data?.qualification}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="font-medium">{data?.data?.experience} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Skills</p>
              <p className="font-medium">{data?.data?.skills}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">LinkedIn Profile</p>
              <a
                href={data?.data?.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                View Profile
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Bio</p>
            <p className="font-medium">{data?.data?.bio}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Certificates</p>
            <div className="space-y-2">
              {data?.data?.certificates?.map((certificate, index) => (
                <a
                  key={index}
                  href={certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline block"
                >
                  Certificate {index + 1}
                </a>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {data?.data?.status === "pending" && (
            <div className="flex space-x-4 mt-6">
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                {isReviewing ? "Approving..." : "Approve"}
              </Button>
              <Button
                onClick={handleRejectOpen}
                variant="destructive"
                disabled={isReviewing}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isReviewing ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={handleRejectClose}>
        <DialogContent>
          <DialogTitle>Reject Application</DialogTitle>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this application.
          </p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="mb-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectClose}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={!rejectionReason || isReviewing}
            >
              {isReviewing ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorApplicationDetails;
