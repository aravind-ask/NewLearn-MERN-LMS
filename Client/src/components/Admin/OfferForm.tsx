import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi"; // Hypothetical API hook for categories

interface IOffer {
  _id?: string;
  title: string;
  description?: string;
  discountPercentage: number;
  category?: string; // ObjectId as string
  startDate: string; // ISO string for date input
  endDate: string; // ISO string for date input
  isActive?: boolean;
}

interface OfferFormProps {
  offer?: IOffer;
  onClose: () => void;
  createOffer: (values: Omit<IOffer, "_id" | "isActive">) => Promise<any>;
  updateOffer: (args: {
    id: string;
    offerData: Partial<IOffer>;
  }) => Promise<any>;
  isCreating: boolean;
  isUpdating: boolean;
}

const OfferForm = ({
  offer,
  onClose,
  createOffer,
  updateOffer,
  isCreating,
  isUpdating,
}: OfferFormProps) => {
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({});
  const categories = categoriesData?.data?.data || [];

  const [formData, setFormData] = useState({
    title: offer?.title || "",
    description: offer?.description || "",
    discountPercentage:
      offer?.discountPercentage !== undefined
        ? String(offer.discountPercentage)
        : "",
    category: offer?.category || "none", // Default to "none" instead of empty string
    startDate: offer?.startDate
      ? new Date(offer.startDate).toISOString().split("T")[0]
      : "",
    endDate: offer?.endDate
      ? new Date(offer.endDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      description: "",
      discountPercentage: "",
      category: "",
      startDate: "",
      endDate: "",
    };
    let isValid = true;

    if (!formData.title) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
      isValid = false;
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
      isValid = false;
    }

    const discount = formData.discountPercentage
      ? parseInt(formData.discountPercentage)
      : NaN;
    if (formData.discountPercentage === "" || isNaN(discount)) {
      newErrors.discountPercentage =
        "Discount percentage is required and must be a number";
      isValid = false;
    } else if (discount < 0) {
      newErrors.discountPercentage = "Discount cannot be negative";
      isValid = false;
    } else if (discount > 100) {
      newErrors.discountPercentage = "Discount cannot exceed 100%";
      isValid = false;
    }

    if (!formData.startDate || isNaN(Date.parse(formData.startDate))) {
      newErrors.startDate = "Start date is required and must be a valid date";
      isValid = false;
    }

    if (!formData.endDate || isNaN(Date.parse(formData.endDate))) {
      newErrors.endDate = "End date is required and must be a valid date";
      isValid = false;
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      title: formData.title,
      description: formData.description || undefined,
      discountPercentage: parseInt(formData.discountPercentage),
      category: formData.category === "none" ? undefined : formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    try {
      if (offer) {
        await updateOffer({
          id: offer._id!,
          offerData: submissionData,
        }).unwrap();
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        await createOffer(submissionData).unwrap();
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter offer title"
          className="mt-1"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter offer description"
          className="mt-1"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="discountPercentage"
          className="block text-sm font-medium text-gray-700"
        >
          Discount Percentage
        </label>
        <Input
          id="discountPercentage"
          name="discountPercentage"
          type="number"
          value={formData.discountPercentage}
          onChange={handleChange}
          placeholder="Enter discount (0-100)"
          className="mt-1"
        />
        {errors.discountPercentage && (
          <p className="text-red-500 text-sm mt-1">
            {errors.discountPercentage}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category (Optional)
        </label>
        <Select
          value={formData.category}
          onValueChange={handleCategoryChange}
          disabled={isCategoriesLoading}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="none">All</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700"
        >
          Start Date
        </label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          className="mt-1"
        />
        {errors.startDate && (
          <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          className="mt-1"
        />
        {errors.endDate && (
          <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isCreating || isUpdating}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : offer ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OfferForm;
