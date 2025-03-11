import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "@/redux/services/offersApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

// Form schema
const offerSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  discountPercentage: z.number().min(0).max(100),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

// Reusable Offer Form Component
const OfferForm = ({
  offer,
  onClose,
}: {
  offer?: any;
  onClose: () => void;
}) => {
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();

  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: offer
      ? {
          title: offer.title,
          description: offer.description || "",
          discountPercentage: offer.discountPercentage,
          startDate: new Date(offer.startDate).toISOString().split("T")[0],
          endDate: new Date(offer.endDate).toISOString().split("T")[0],
        }
      : {
          title: "",
          description: "",
          discountPercentage: 0,
          startDate: "",
          endDate: "",
        },
  });

  const onSubmit = async (values: z.infer<typeof offerSchema>) => {
    try {
      if (offer) {
        await updateOffer({
          id: offer._id,
          offerData: values,
        }).unwrap();
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        await createOffer(values).unwrap();
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discountPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Percentage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : offer ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const Offers = () => {
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const limit = 10;
  const {
    data: offersData,
    isLoading,
    isError,
    error,
  } = useGetOffersQuery({ page, limit });
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();

  const offers = offersData?.data || [];
  const totalItems = offersData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const handleDelete = async (id: string) => {
    try {
      await deleteOffer(id).unwrap();
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
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
          <DialogContent className="bg-white">
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
            />
          </DialogContent>
        </Dialog>
      </div>

      {offers.length === 0 ? (
        <Alert>
          <AlertTitle>No Offers Found</AlertTitle>
          <AlertDescription>
            There are currently no offers available. Create a new offer to get
            started.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell>{offer.title}</TableCell>
                    <TableCell>{offer.discountPercentage}%</TableCell>
                    <TableCell>{offer.category?.name || "All"}</TableCell>
                    <TableCell>
                      {new Date(offer.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(offer.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(offer)}
                      >
                        {offer.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete the offer "
                                {offer.title}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(offer._id)}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && setPage(page + 1)}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Offers;
