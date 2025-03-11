import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/services/categoryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

const Category = () => {
  const [page, setPage] = useState(1);
  const limit = 5;
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useGetCategoriesQuery({ page, limit });
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const [categoryName, setCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }
    const isDuplicate = categories?.data?.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage("Category already exists.");
      return;
    }

    try {
      await createCategory({ name: categoryName }).unwrap();
      toast.success("Category created successfully");
      setCategoryName("");
      setErrorMessage("");
      refetch();
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory?.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await updateCategory({
        id: editCategory.id,
        name: editCategory.name,
      }).unwrap();
      toast.success("Category updated successfully");
      setEditCategory(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory(deleteConfirm).unwrap();
      toast.success("Category deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const columns = [
    {
      header: "Category Name",
      accessor: "name",
      render: (category: Category) => (
        <span className="text-gray-900 font-medium">{category.name}</span>
      ),
    },
    {
      header: "Actions",
      accessor: (category: Category) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setEditCategory({ id: category._id, name: category.name })
            }
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(category._id)}
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Category Management
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Create New Category
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name" className="text-gray-700">
                    Category Name
                  </Label>
                  <Input
                    id="category-name"
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Enter category name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCategory}
                  disabled={isCreating || !categoryName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={categories?.data.data || []}
          isLoading={isLoading}
          page={page}
          totalPages={categories?.data.totalPages}
          onPageChange={setPage}
        />
        {!isLoading && (!categories?.data || categories.data.length === 0) && (
          <div className="text-center py-10 text-gray-500">
            No categories found
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name" className="text-gray-700">
                Category Name
              </Label>
              <Input
                id="edit-category-name"
                value={editCategory?.name || ""}
                onChange={(e) =>
                  setEditCategory({ ...editCategory!, name: e.target.value })
                }
                placeholder="Enter new category name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCategory(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={isUpdating || !editCategory?.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Category;
