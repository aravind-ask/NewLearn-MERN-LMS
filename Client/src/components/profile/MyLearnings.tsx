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
import {
  Watch,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetStudentCoursesQuery({
    page,
    limit,
  });

  const { courses, totalPages } = data?.data || { courses: [], totalPages: 0 };
  const coursesPerSlide = 3;
  const totalSlides = Math.ceil(courses.length / coursesPerSlide);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setCarouselIndex(0);
  };

  const handleNextSlide = () => {
    if (carouselIndex < totalSlides - 1) {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // if (isError) {
  //   // Extract error message from the error object
  //   const errorMessage =
  //     (error as any)?.data?.message || // RTK Query typically puts the server message here
  //     (error as any)?.error || // Fallback for network errors
  //     "An unexpected error occurred. Please try again later.";

  //   return (
  //     <Card className="max-w-md mx-auto mt-20 border-red-200 shadow-sm">
  //       <CardContent className="p-6 text-center">
  //         <p className="text-red-600 font-medium">{errorMessage}</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <div className="container mx-auto h-screen px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          My Learning Journey
        </h1>
        <div className="flex items-center gap-2 text-gray-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">
            {courses.length} Active{" "}
            {courses.length === 1 ? "Course" : "Courses"}
          </span>
        </div>
      </div>

      {courses && courses.length > 0 ? (
        <div className="space-y-8">
          {/* Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${carouselIndex * 100}%)`,
                }}
              >
                {Array.from(
                  { length: Math.ceil(courses.length / coursesPerSlide) },
                  (_, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {courses
                        .slice(
                          slideIndex * coursesPerSlide,
                          (slideIndex + 1) * coursesPerSlide
                        )
                        .map((course: Course) => {
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
                                    {
                                      course.courseProgressId?.totalLectures
                                    }{" "}
                                    Lectures
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {
                                      course.courseProgressId?.viewedLectures || 0
                                    }{" "}
                                    Completed
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
                                  onClick={() =>
                                    navigate(`/course/${course.courseId}/learn`)
                                  }
                                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                                >
                                  <Watch className="mr-2 h-4 w-4" />
                                  {progress === 0
                                    ? "Start Learning"
                                    : "Continue Learning"}
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Carousel Controls */}
            {totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white shadow-md rounded-full"
                  onClick={handlePrevSlide}
                  disabled={carouselIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white shadow-md rounded-full"
                  onClick={handleNextSlide}
                  disabled={carouselIndex === totalSlides - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Dots Navigation */}
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <Button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === carouselIndex ? "bg-indigo-500 w-4" : "bg-gray-300"
                    }`}
                    onClick={() => setCarouselIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
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
      ) : (
        <Card className="max-w-md mx-auto mt-20 shadow-sm border-gray-100">
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Courses Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Begin your learning journey by exploring our course catalog!
            </p>
            <Button
              onClick={() => navigate("/all-courses")}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Explore Courses
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyLearnings;
