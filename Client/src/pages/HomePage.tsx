import { Button } from "@/components/ui/button";
import banner from "@/assets/images/banner-img.png";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import { useGetCoursesQuery } from "@/redux/services/courseApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Homepage() {
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();
  const { data: coursesData, isLoading: isCoursesLoading } = useGetCoursesQuery(
    {
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
    }
  );
  const navigate = useNavigate();
  console.log("courses", coursesData);

  const handleCategoryClick = (categoryName) => {
    navigate(`/all-courses?category=${categoryName}`);
  };

  if (isCategoriesLoading || isCoursesLoading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-white">
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4 lg:text-4xl">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">NewLearn</span>
          </h1>
          <p className="text-xl text-gray-700 mt-3">
            Welcome students! We are excited to have you on board. Dive into our
            extensive library of courses and start your learning journey today.
          </p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src={banner}
            alt="banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categoriesData?.data.map((categoryItem) => (
            <Button
              className="justify-start"
              variant="outline"
              key={categoryItem._id}
              onClick={() => handleCategoryClick(categoryItem.name)}
            >
              {categoryItem.name}
            </Button>
          ))}
        </div>
      </section>
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coursesData?.data?.courses &&
          coursesData?.data?.courses.length > 0 ? (
            coursesData.data.courses.map((course) => (
              <div
                className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  width={300}
                  height={150}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <p className="text-gray-700 mb-2">{course.instructorName}</p>
                  <p className="font-bold text-[16px]">₹ {course.pricing}</p>
                </div>
              </div>
            ))
          ) : (
            <h1>No Courses Found</h1>
          )}
        </div>
      </section>
    </div>
  );
}
