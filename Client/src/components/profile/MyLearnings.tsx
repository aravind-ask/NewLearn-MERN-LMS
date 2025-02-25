import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetStudentCoursesQuery } from "@/redux/services/userApi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "../ui/button";
import { Watch } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  courseId: string;
  title: string;
  instructorName: string;
  dateOfPurchase: Date;
  courseImage: string;
}

const MyLearnings = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetStudentCoursesQuery({
    page,
    limit,
  });

  const navigate = useNavigate();

  console.log("Data", data);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to fetch enrolled courses.</div>;
  }

  const { courses, totalPages } = data?.data || { courses: [], totalPages: 0 };
  console.log("Copurses", courses);

  return (
    // <Card className="p-4">
    //   <h2 className="text-xl font-bold">My Learnings</h2>
    //   {courses.length === 0 ? (
    //     <p className="text-gray-600">Your enrolled courses will appear here.</p>
    //   ) : (
    //     <div className="space-y-4">
    //       {courses.map((course) => (
    //         <div
    //           key={course.courseId}
    //           className="flex gap-4 p-4 border rounded-lg"
    //         >
    //           <img
    //             src={course.courseImage}
    //             alt={course.title}
    //             className="w-32 h-20 object-cover rounded-lg"
    //           />
    //           <div>
    //             <h3 className="text-lg font-semibold">{course.title}</h3>
    //             <p className="text-sm text-gray-600">
    //               By {course.instructorName}
    //             </p>
    //             <p className="text-sm text-gray-600">
    //               Enrolled on{" "}
    //               {new Date(course.dateOfPurchase).toLocaleDateString()}
    //             </p>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   )}

    //   {/* Pagination */}
    //   {totalPages > 1 && (
    //     <Pagination className="mt-4">
    //       <PaginationContent>
    //         <PaginationItem>
    //           <PaginationPrevious
    //             onClick={() => handlePageChange(page - 1)}
    //             disabled={page === 1}
    //           />
    //         </PaginationItem>
    //         {Array.from({ length: totalPages }, (_, index) => (
    //           <PaginationItem key={index + 1}>
    //             <PaginationLink
    //               onClick={() => handlePageChange(index + 1)}
    //               isActive={page === index + 1}
    //             >
    //               {index + 1}
    //             </PaginationLink>
    //           </PaginationItem>
    //         ))}
    //         <PaginationItem>
    //           <PaginationNext
    //             onClick={() => handlePageChange(page + 1)}
    //             disabled={page === totalPages}
    //           />
    //         </PaginationItem>
    //       </PaginationContent>
    //     </Pagination>
    //   )}
    // </Card>
    <div className="p-4 ">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {courses && courses.length > 0 ? (
          courses.map((course: any) => (
            <Card key={course.courseId} className="flex flex-col">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course.courseImage}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold mb-1">{course.courseTitle}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course.instructorName}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate(`/course/${course.courseId}/learn`)}
                  className="flex-1"
                >
                  <Watch className="mr-2 h-4 -4" />
                  Start Watching
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <h1 className="text-3xl font-bold">No courses found</h1>
        )}
      </div>
    </div>
  );
};

export default MyLearnings;
