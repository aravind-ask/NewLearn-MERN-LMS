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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/services/categoryApi";
import { useState } from "react";

const Category = () => {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [categoryName, setCategoryName] = useState<string>("");
  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCreateCategory = async () => {
    if (categoryName.trim()) {
      // Check for duplicates (case insensitive)
      const isDuplicate = categories?.data?.some(
        (category) => category.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (isDuplicate) {
        setErrorMessage("Category already exists.");
        return;
      }

      try {
        await createCategory({ name: categoryName }).unwrap();
        setCategoryName("");
        setErrorMessage(""); // Clear any previous error message
      } catch (error) {
        console.error("Failed to create category:", error);
        setErrorMessage("Failed to create category. Please try again.");
      }
    }
  };

  const handleEditCategory = (id: string, name: string) => {
    setEditingCategoryId(id);
    setEditCategoryName(name);
  };

  const handleUpdateCategory = async () => {
    if (editCategoryName.trim() && editingCategoryId) {
      try {
        await updateCategory({
          id: editingCategoryId,
          name: editCategoryName,
        }).unwrap();
        setEditingCategoryId(null);
        setEditCategoryName("");
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  if (isLoading) return <p>Loading categories...</p>;
  if (isError) return <p>Error loading categories</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Category</Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    setErrorMessage(""); // Clear error message when user types
                  }}
                  placeholder="Enter category name"
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating || !categoryName.trim()}
              >
                {isCreating ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : isError ? (
        <p>Failed to load categories.</p>
      ) : categories.data.length === 0 ? (
        <div>No Categories Found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.data?.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="mr-2"
                        variant="outline"
                        onClick={() =>
                          handleEditCategory(category._id, category.name)
                        }
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-category-name">
                            Category Name
                          </Label>
                          <Input
                            id="edit-category-name"
                            value={editCategoryName}
                            onChange={(e) =>
                              setEditCategoryName(e.target.value)
                            }
                            placeholder="Enter new category name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleUpdateCategory}
                          disabled={isUpdating || !editCategoryName.trim()}
                        >
                          {isUpdating ? "Updating..." : "Update Category"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Category;
