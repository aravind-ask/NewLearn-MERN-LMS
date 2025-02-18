import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetInstructorApplicationsQuery,
  useReviewInstructorApplicationMutation,
} from "@/redux/services/instructorApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const AdminInstructorRequests = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError, refetch } =
    useGetInstructorApplicationsQuery({
      page,
      limit: 5,
    });
  const [reviewApplication, { isLoading: isReviewing }] =
    useReviewInstructorApplicationMutation();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  // Handle opening the rejection dialog
  const handleRejectOpen = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsRejectDialogOpen(true);
  };

  // Handle closing the rejection dialog
  const handleRejectClose = () => {
    setSelectedApplicationId(null);
    setRejectionReason("");
    setIsRejectDialogOpen(false);
  };

  // Handle rejecting an application
  const handleReject = async () => {
    if (!rejectionReason || !selectedApplicationId) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      await reviewApplication({
        applicationId: selectedApplicationId,
        status: "rejected",
        rejectionReason,
      }).unwrap();
      toast.success("Instructor request rejected.");
      handleRejectClose();
      refetch();
    } catch (error: any) {
      toast.error("Failed to reject request.");
    }
  };

  // Handle approving an application
  const handleApprove = async (applicationId: string) => {
    try {
      await reviewApplication({
        applicationId,
        status: "approved",
        rejectionReason: "",
      }).unwrap();
      toast.success("Instructor request approved successfully!");
      refetch();
    } catch (error: any) {
      toast.error("Failed to approve request.");
    }
  };

  // Handle navigation to the application details page
  const handleViewDetails = (applicationId: string) => {
    navigate(`/dashboard/instructor/${applicationId}`);
  };

  if (isLoading) return <Skeleton className="h-full w-full" />;
  if (isError)
    return (
      <p className="text-center text-red-500">
        Failed to load instructor requests.
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Instructor Requests</h2>

      {/* Table for Instructor Requests */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.applications?.map((application) => (
            <TableRow
              key={application._id}
              onClick={() => handleViewDetails(application._id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>{application.fullName}</TableCell>
              <TableCell>{application.email}</TableCell>
              <TableCell>{application.qualification}</TableCell>
              <TableCell>{application.experience} years</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    application.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : application.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {application.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      handleApprove(application._id);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={application.status !== "pending" || isReviewing}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      handleRejectOpen(application._id);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={application.status !== "pending" || isReviewing}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={page === 1 ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm">
              Page {page} of {data?.data?.totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, data?.data?.totalPages))
              }
              disabled={page === data?.data?.totalPages}
              className={
                page === data?.data?.totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={handleRejectClose}>
        <DialogContent>
          <DialogTitle>Reject Instructor Application</DialogTitle>
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
              className="bg-red-500 text-white hover:bg-red-600"
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

export default AdminInstructorRequests;
