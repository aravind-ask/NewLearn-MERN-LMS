import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Delete, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetInstructorCoursesQuery } from "@/redux/services/instructorApi";
import { useDeleteCourseMutation } from "@/redux/services/courseApi";
import { useState } from "react";

const InstructorCourses = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 5;
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const { data, isLoading, isError } = useGetInstructorCoursesQuery({
    page,
    limit,
    sortBy,
    order,
  });
  const [deleteCourse] = useDeleteCourseMutation();

  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      console.log("Course deleted successfully");
    } catch (error) {
      console.error("Failed to delete course", error);
    }
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split("_");
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1); 
  };

  if (isLoading) return <p>Loading courses...</p>;
  if (isError) return <p>Failed to load courses</p>;

  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
        <Select onValueChange={handleSortChange} defaultValue="createdAt_desc">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md">
            <SelectItem value="createdAt_desc">Most Recent</SelectItem>
            <SelectItem value="revenue_desc">Revenue (High to Low)</SelectItem>
            <SelectItem value="revenue_asc">Revenue (Low to High)</SelectItem>
            <SelectItem value="enrolledStudents_desc">
              Students (High to Low)
            </SelectItem>
            <SelectItem value="enrolledStudents_asc">
              Students (Low to High)
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="p-5 cursor-pointer"
          onClick={() => navigate("/instructor/create-new-course")}
        >
          Create New Course
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.courses?.length > 0 ? (
                data.data?.courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>{course.enrolledStudents || 0}</TableCell>
                    <TableCell>${course.revenue || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="cursor-pointer"
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-6 w-6" />
                      </Button>
                      <Button
                        className="cursor-pointer"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Delete className="h-6 w-6" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No courses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              />
            </PaginationItem>

            {Array.from({ length: data?.data.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) => Math.min(data?.data?.totalPages, prev + 1))
                }
                disabled={page === data?.data?.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
};

export default InstructorCourses;
