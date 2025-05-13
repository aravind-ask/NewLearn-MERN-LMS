import { useState, useEffect } from "react";
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

interface Offer {
  _id: string;
  title: string;
  discountPercentage: number;
  category?: { name: string };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const Offers = () => {
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const limit = 10;
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);

  const {
    data: offersData,
    isLoading,
    isError,
    error,
  } = useGetOffersQuery({ page, limit });
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const totalPages = Math.ceil(totalOffers / limit) || 1;

  // Update offersList and totalOffers when data changes
  useEffect(() => {
    if (offersData?.data) {
      setOffersList(offersData.data);
      setTotalOffers(offersData.pagination?.total || 0);
    }
  }, [offersData]);

  const handleCreate = async (offerData: any) => {
    // Optimistically add the new offer
    const tempId = `temp-${Date.now()}`;
    const newOffer: Offer = { ...offerData, _id: tempId, isActive: true };
    const originalOffers = [...offersList];
    setOffersList([...offersList, newOffer]);
    setTotalOffers(totalOffers + 1);
    setOpenForm(false);

    try {
      const response = await createOffer(offerData).unwrap();
      // Replace tempId with actual _id
      setOffersList((prev) =>
        prev.map((offer) =>
          offer._id === tempId ? { ...offer, _id: response._id } : offer
        )
      );
      toast({
        title: "Success",
        description: "Offer created successfully",
      });
    } catch (err: any) {
      // Revert on error
      setOffersList(originalOffers);
      setTotalOffers(totalOffers - 1);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.data?.message || "Failed to create offer",
      });
    }
  };

  const handleUpdate = async (offerData: any) => {
    if (!selectedOffer) return;

    // Optimistically update the offer
    const originalOffers = [...offersList];
    setOffersList((prev) =>
      prev.map((offer) =>
        offer._id === selectedOffer._id ? { ...offer, ...offerData } : offer
      )
    );

    try {
      await updateOffer({
        id: selectedOffer._id,
        offerData,
      }).unwrap();
      toast({
        title: "Success",
        description: "Offer updated successfully",
      });
      setSelectedOffer(null);
      setOpenForm(false);
    } catch (err: any) {
      // Revert on error
      setOffersList(originalOffers);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.data?.message || "Failed to update offer",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    // Optimistically remove the offer
    const originalOffers = [...offersList];
    setOffersList((prev) =>
      prev.filter((offer) => offer._id !== deleteConfirm)
    );
    setTotalOffers(totalOffers - 1);
    // Adjust page if necessary
    if (offersList.length === 1 && page > 1) {
      setPage(page - 1);
    }

    try {
      await deleteOffer(deleteConfirm).unwrap();
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      setDeleteConfirm(null);
    } catch (err: any) {
      // Revert on error
      setOffersList(originalOffers);
      setTotalOffers(totalOffers);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.data?.message || "Failed to delete offer",
      });
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    // Optimistically toggle the status
    const originalOffers = [...offersList];
    setOffersList((prev) =>
      prev.map((o) =>
        o._id === offer._id ? { ...o, isActive: !o.isActive } : o
      )
    );

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
    } catch (err: any) {
      // Revert on error
      setOffersList(originalOffers);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.data?.message || "Failed to update offer status",
      });
    }
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setOpenForm(true);
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (offer: Offer) => (
        <span className="font-medium">{offer.title}</span>
      ),
    },
    {
      header: "Discount",
      accessor: "discountPercentage",
      render: (offer: Offer) => `${offer.discountPercentage}%`,
    },
    {
      header: "Category",
      accessor: "category",
      render: (offer: Offer) => offer.category?.name || "All",
    },
    {
      header: "Start Date",
      accessor: "startDate",
      render: (offer: Offer) => new Date(offer.startDate).toLocaleDateString(),
    },
    {
      header: "End Date",
      accessor: "endDate",
      render: (offer: Offer) => new Date(offer.endDate).toLocaleDateString(),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (offer: Offer) => (
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
      accessor: (offer: Offer) => (
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
              createOffer={handleCreate}
              updateOffer={handleUpdate}
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
            data={offersList}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {offersList.length === 0 && (
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
