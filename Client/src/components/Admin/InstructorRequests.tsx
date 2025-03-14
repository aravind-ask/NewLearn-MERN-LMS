import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetInstructorApplicationsQuery,
  useReviewInstructorApplicationMutation,
} from "@/redux/services/instructorApi";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Application {
  _id: string;
  fullName: string;
  email: string;
  qualification: string;
  experience: number;
  status: "pending" | "approved" | "rejected";
}

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

  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    applicationId: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Handle navigation to details
  const handleViewDetails = (applicationId: string) => {
    navigate(`/dashboard/instructor/${applicationId}`);
  };

  // Handle action confirmation
  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "approve") {
        await reviewApplication({
          applicationId: confirmAction.applicationId,
          status: "approved",
          rejectionReason: "",
        }).unwrap();
        toast.success("Instructor request approved successfully!");
      } else {
        if (!rejectionReason) {
          toast.error("Please provide a rejection reason.");
          return;
        }
        await reviewApplication({
          applicationId: confirmAction.applicationId,
          status: "rejected",
          rejectionReason,
        }).unwrap();
        toast.success("Instructor request rejected.");
      }
      refetch();
    } catch (error: any) {
      toast.error(`Failed to ${confirmAction.type} request.`);
    } finally {
      setConfirmAction(null);
      setRejectionReason("");
    }
  };

  if (isError) {
    return (
      <p className="text-center text-red-500">
        Failed to load instructor requests.
      </p>
    );
  }

  const columns = [
    {
      header: "Name",
      accessor: "fullName",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Qualification",
      accessor: "qualification",
    },
    {
      header: "Experience",
      accessor: (app: Application) => `${app.experience} years`,
    },
    {
      header: "Status",
      accessor: (app: Application) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            app.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : app.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {app.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (app: Application) => (
        <div className="flex space-x-2 justify-end">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({ type: "approve", applicationId: app._id });
            }}
            variant="outline"
            size="sm"
            disabled={app.status !== "pending" || isReviewing}
          >
            Approve
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({ type: "reject", applicationId: app._id });
            }}
            variant="outline"
            size="sm"
            disabled={app.status !== "pending" || isReviewing}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Reject
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Instructor Requests</h2>

      <DataTable
        columns={columns}
        data={data?.data?.applications || []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.data?.totalPages}
        onPageChange={setPage}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => {
          setConfirmAction(null);
          setRejectionReason("");
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm{" "}
              {confirmAction?.type === "approve" ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve" ? (
                "Are you sure you want to approve this instructor application?"
              ) : (
                <>
                  Are you sure you want to reject this instructor application?
                  Please provide a reason below:
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="mt-2"
                    disabled={isReviewing}
                  />
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReviewing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={
                isReviewing ||
                (confirmAction?.type === "reject" && !rejectionReason)
              }
            >
              {isReviewing
                ? "Processing..."
                : confirmAction?.type === "approve"
                ? "Approve"
                : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInstructorRequests;
