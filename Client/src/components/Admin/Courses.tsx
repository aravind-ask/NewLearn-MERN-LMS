import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetCoursesQuery,
  useDeleteCourseMutation,
} from "@/redux/services/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DataTable } from "../../components/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  students: string[];
  pricing: number;
}

const AllCourses = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const limit = 5;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useGetCoursesQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder: order,
  });

  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCourse(deleteConfirm).unwrap();
      toast.success("Course deleted successfully");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split("_");
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  };

  const columns = [
    {
      header: "Course Title",
      accessor: "title",
      render: (course: Course) => (
        <span className="font-medium text-gray-900">{course.title}</span>
      ),
    },
    {
      header: "Students",
      accessor: (course: Course) => course.students.length || 0,
      align: "center",
    },
    {
      header: "Revenue",
      accessor: (course: Course) =>
        `$${course.students.length * course.pricing || 0}`,
      align: "right",
    },
    {
      header: "Actions",
      accessor: (course: Course) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(course.id);
          }}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      ),
      align: "right",
    },
  ];

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load courses
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">
            All Courses
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              onValueChange={handleSortChange}
              defaultValue="createdAt_desc"
            >
              <SelectTrigger className="w-48 border-gray-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg border-gray-200">
                <SelectItem value="createdAt_desc">Most Recent</SelectItem>
                <SelectItem value="revenue_desc">
                  Revenue (High to Low)
                </SelectItem>
                <SelectItem value="revenue_asc">
                  Revenue (Low to High)
                </SelectItem>
                <SelectItem value="enrolledStudents_desc">
                  Students (High to Low)
                </SelectItem>
                <SelectItem value="enrolledStudents_asc">
                  Students (Low to High)
                </SelectItem>
              </SelectContent>
            </Select>
            {/* <Button
              onClick={() => navigate("/instructor/create-new-course")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create New Course
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={data?.data.courses || []}
          isLoading={isLoading}
          page={page}
          totalPages={data?.data.totalPages}
          onPageChange={setPage}
        />
        {data?.data.courses?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No courses found matching your criteria
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this course? This action cannot be
              undone.
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
              onClick={handleDelete}
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

export default AllCourses;
