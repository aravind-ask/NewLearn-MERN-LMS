import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "@/redux/services/offersApi";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import OfferForm from "./OfferForm";

const Offers = () => {
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const limit = 10;

  const {
    data: offersData,
    isLoading,
    isError,
    error,
  } = useGetOffersQuery({ page, limit });
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const offers = offersData?.data || [];
  const totalPages = Math.ceil((offersData?.pagination?.total || 0) / limit);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteOffer(deleteConfirm).unwrap();
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      setDeleteConfirm(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete offer",
      });
    }
  };

  const handleToggleStatus = async (offer: any) => {
    try {
      await updateOffer({
        id: offer._id,
        offerData: { isActive: !offer.isActive },
      }).unwrap();
      toast({
        title: "Success",
        description: `Offer ${
          offer.isActive ? "deactivated" : "activated"
        } successfully`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update offer status",
      });
    }
  };

  const handleEdit = (offer: any) => {
    setSelectedOffer(offer);
    setOpenForm(true);
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (offer: any) => (
        <span className="font-medium">{offer.title}</span>
      ),
    },
    {
      header: "Discount",
      accessor: "discountPercentage",
      render: (offer: any) => `${offer.discountPercentage}%`,
    },
    {
      header: "Category",
      accessor: "category",
      render: (offer: any) => offer.category?.name || "All",
    },
    {
      header: "Start Date",
      accessor: "startDate",
      render: (offer: any) => new Date(offer.startDate).toLocaleDateString(),
    },
    {
      header: "End Date",
      accessor: "endDate",
      render: (offer: any) => new Date(offer.endDate).toLocaleDateString(),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (offer: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatus(offer)}
        >
          {offer.isActive ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
    {
      header: "Actions",
      accessor: (offer: any) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(offer)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(offer._id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load offers"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offers</h2>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedOffer(null)}>
              Create New Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedOffer ? "Edit Offer" : "Create Offer"}
              </DialogTitle>
              <DialogDescription>
                {selectedOffer
                  ? "Update the offer details below."
                  : "Fill in the details to create a new offer."}
              </DialogDescription>
            </DialogHeader>
            <OfferForm
              offer={selectedOffer}
              onClose={() => setOpenForm(false)}
              createOffer={createOffer}
              updateOffer={updateOffer}
              isCreating={isCreating}
              isUpdating={isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Offer List
          </CardTitle>
        </CardHeader>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={offers}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {offers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No offers found. Create a new offer to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this offer? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offers;
