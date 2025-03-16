import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
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
import { Watch, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as ProgressPrimitive from "@radix-ui/react-progress";

interface Course {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  dateOfPurchase: Date;
  courseImage: string;
  courseProgressId: {
    totalLectures: number;
    viewedLectures: number;
  };
}

const MyLearnings = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetStudentCoursesQuery({
    page,
    limit,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        {isError}
      </div>
    );
  }

  const { courses, totalPages } = data?.data || { courses: [], totalPages: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Learning Journey
        </h1>
        <div className="text-sm text-gray-500">
          {courses.length} Active {courses.length === 1 ? "Course" : "Courses"}
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => {
            const progress = course.courseProgressId
              ? Math.round(
                  (course.courseProgressId.viewedLectures /
                    course.courseProgressId.totalLectures) *
                    100
                )
              : 0;

            return (
              <Card
                key={course.courseId}
                className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={course.courseImage}
                    alt={course.courseTitle}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                    {progress}% Complete
                  </div>
                </div>

                <CardContent className="p-5 flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {course.instructorName}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {course.courseProgressId?.totalLectures} Lectures
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {course.courseProgressId?.viewedLectures} Completed
                    </div>
                    <ProgressPrimitive.Root
                      value={progress}
                      className="w-full h-3 rounded-full bg-gray-200 overflow-hidden"
                    >
                      <ProgressPrimitive.Indicator
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </ProgressPrimitive.Root>
                    {course.courseProgressId?.viewedLectures &&
                    course?.courseProgressId?.totalLectures ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 text-center">
                          {progress === 100
                            ? "Course Completed!"
                            : `${course.courseProgressId?.viewedLectures} of ${course.courseProgressId?.totalLectures} lectures completed`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 text-center">
                          Start Learning now!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button
                    onClick={() => navigate(`/course/${course.courseId}/learn`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    <Watch className="mr-2 h-4 w-4" />
                    {progress === 0 ? "Start Learning" : "Continue Learning"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Courses Yet
          </h2>
          <p className="text-gray-500">
            Start your learning journey by exploring our course catalog!
          </p>
          <Button
            onClick={() => navigate("/courses")}
            className="mt-4 bg-blue-500 hover:bg-blue-600"
          >
            Browse Courses
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default MyLearnings;
