import { Button } from "@/components/ui/button";
import banner from "@/assets/images/banner-img.png";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import { useGetCoursesQuery } from "@/redux/services/courseApi";
import { useGetStudentCoursesQuery } from "@/redux/services/userApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Loading from "@/components/Loading";

export default function Homepage() {
  const navigate = useNavigate();

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  // Fetch featured courses
  const { data: coursesData, isLoading: isCoursesLoading } = useGetCoursesQuery(
    {
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
    }
  );

  // Fetch enrolled courses with progress
  const { data: studentCoursesData, isLoading: isStudentCoursesLoading } =
    useGetStudentCoursesQuery({ page: 1, limit: 6 });

  const handleCategoryClick = (categoryId) => {
    navigate(`/all-courses?category=${categoryId}`);
  };

  // if (isCategoriesLoading || isCoursesLoading || isStudentCoursesLoading) {
  //   return <Loading />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between py-12 px-4 lg:px-8 bg-gradient-to-r from-teal-50 to-purple-50">
        <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to NewLearn
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Embark on a transformative learning journey with our expertly
            curated courses. Unlock your potential today!
          </p>
          <Button
            onClick={() => navigate("/all-courses")}
            className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-full"
          >
            Explore Courses
          </Button>
        </div>
        <div className="lg:w-1/2">
          <img
            src={banner}
            alt="Learning Banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>

      {/* Progress Section with Carousel */}
      {studentCoursesData?.data?.courses?.length > 0 && (
        <section className="py-12 px-4 lg:px-8 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Your Learning Progress
            </h2>
            <Button
              variant="link"
              onClick={() => navigate("/profile/my-courses")}
              className="text-teal-600 hover:underline"
            >
              View All
            </Button>
          </div>
          <div className="flex justify-center">
            <Carousel
              className="w-full max-w-4xl"
              opts={{ align: "center", loop: true }}
            >
              <CarouselContent>
                {studentCoursesData.data.courses.map((course) => {
                  const progress = course.courseProgressId
                    ? Math.round(
                        (course.courseProgressId.viewedLectures /
                          course.courseProgressId.totalLectures) *
                          100
                      )
                    : 0;
                  return (
                    <CarouselItem
                      key={course.courseId}
                      className="md:basis-1/3 lg:basis-1/3"
                    >
                      <div className="p-2">
                        <div
                          className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white"
                          onClick={() =>
                            navigate(`/course/${course.courseId}/learn`)
                          }
                        >
                          <img
                            src={course.courseImage}
                            alt={course.courseTitle}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                              {course.courseTitle}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {course.instructorName}
                            </p>
                            <div className="space-y-2">
                              <Progress
                                value={progress}
                                className="h-2 bg-gray-200 rounded-full"
                              />
                              <p className="text-xs text-gray-500">
                                {progress}% Complete (
                                {course.courseProgressId?.viewedLectures}/
                                {course.courseProgressId?.totalLectures})
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="text-teal-600 hover:bg-teal-100" />
              <CarouselNext className="text-teal-600 hover:bg-teal-100" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {isCategoriesLoading ? (
        <Loading />
      ) : (
        <section className="py-12 px-4 lg:px-8 bg-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categoriesData?.data.map((categoryItem) => (
              <Button
                key={categoryItem._id}
                variant="outline"
                className="justify-start text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300 rounded-full py-2 px-4"
                onClick={() => handleCategoryClick(categoryItem._id)}
              >
                {categoryItem.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses Section */}
      {isCoursesLoading ? (
        <Loading />
      ) : (
        <section className="py-12 px-4 lg:px-8 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coursesData?.data?.courses?.length > 0 ? (
              coursesData.data.courses.map((course) => (
                <div
                  key={course._id}
                  className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {course.instructorName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {course.category.name}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-teal-600">
                        ₹ {course.pricing}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">No courses available yet.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
