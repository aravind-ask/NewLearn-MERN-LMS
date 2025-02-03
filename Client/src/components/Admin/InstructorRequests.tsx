import { useState } from "react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "../ui/skeleton";

// Admin Component for Managing Instructor Requests
const AdminInstructorRequests = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetInstructorApplicationsQuery({
    page: 1,
    limit: 5,
  });
  const [reviewApplication, { isLoading: isReviewing }] =
    useReviewInstructorApplicationMutation();

  
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const handleRejectOpen = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsRejectDialogOpen(true);
  };

  const handleRejectClose = () => {
    setSelectedApplicationId(null);
    setRejectionReason("");
    setIsRejectDialogOpen(false);
  };

  const handleReject = async () => {
    if (!rejectionReason || !selectedApplicationId) return;
    try {
      await reviewApplication({
        applicationId: selectedApplicationId,
        status: "rejected",
        rejectionReason,
      }).unwrap();
      toast.success("Instructor request rejected.");
      handleRejectClose();
    } catch (error: any) {
      toast.error("Failed to reject request.");
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await reviewApplication({
        applicationId,
        status: "approved",
        rejectionReason: "",
      }).unwrap();
      toast.success("Instructor request approved successfully!");
    } catch (error: any) {
      toast.error("Failed to approve request.");
    }
  };

 if (isLoading) return <Skeleton className="h-full w-full" />;
 if (isError)
   return <p className="text-center text-red-500">Failed to load users</p>;

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Instructor Requests</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.data?.applications?.map((application) => (
            <TableRow key={application._id}>
              <TableCell>{application.fullName}</TableCell>
              <TableCell>{application.email}</TableCell>
              <TableCell>{application.qualification}</TableCell>
              <TableCell>{application.experience}</TableCell>
              <TableCell>
                <Button
                  onClick={() => window.open(application.profileUrl)}
                  variant="outline"
                  className="mr-2"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleApprove(application._id)}
                  variant="outline"
                  isLoading={isReviewing}
                  className="mr-2"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleRejectOpen(application._id)}
                  variant="outline"
                  isLoading={isReviewing}
                  className="bg-red-500 text-white"
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination className="mt-4 cursor-pointer">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={page === 1 ? "disabled-class" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            Page {page} of {data?.data?.totalPages}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, data?.data?.totalPages))
              }
              className={
                page === data?.data?.totalPages ? "disabled-class" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onClose={handleRejectClose}>
        <DialogContent>
          <DialogTitle>Provide Rejection Reason</DialogTitle>
          <p>Please enter the reason for rejecting the instructor request.</p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason"
            className="mb-4"
          />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleRejectClose}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-500 text-white"
              isLoading={isReviewing}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInstructorRequests;
