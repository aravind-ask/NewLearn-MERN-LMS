import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { useGetCoursesQuery } from "@/redux/services/courseApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import debounce from "lodash.debounce";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";

const AllCourses = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 6;
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";

  useEffect(() => {
    if (searchQuery !== search) setSearch(searchQuery);
    if (categoryQuery !== category) setCategory(categoryQuery);
  }, [searchQuery, categoryQuery]);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({});

  const {
    data: coursesData,
    isLoading,
    isError,
  } = useGetCoursesQuery({
    page,
    limit,
    search,
    category,
    difficulty,
    sortBy,
    sortOrder,
  });

  const handleSearch = debounce((value) => {
    setSearch(value);
    navigate(`/all-courses?search=${value}&category=${category}`);
  }, 500);

  const handleCategoryChange = (value) => {
    if (value === "All") value = "";
    setCategory(value);
    navigate(`/all-courses?search=${search}&category=${value}`);
  };

  useEffect(() => {
    return () => handleSearch.cancel();
  }, []);

  const filterOptions = {
    Category: [
      { id: "All", label: "All" },
      ...(categoriesData?.data?.data
        ? categoriesData.data.data.map((cat) => ({
            id: cat._id,
            label: cat.name,
          }))
        : []),
    ],
    Difficulty: [
      { id: "beginner", label: "Beginner" },
      { id: "intermediate", label: "Intermediate" },
      { id: "advanced", label: "Advanced" },
    ],
  };

  const sortOptions = [
    { id: "price", label: "Price" },
    { id: "createdAt", label: "Newest" },
  ];

  const selectedSortLabel = sortOptions.find(
    (item) => item.id === sortBy
  )?.label;

  const handleClearAllFilters = () => {
    setSearch("");
    setCategory("");
    setDifficulty("");
    setSortBy("createdAt");
    setSortOrder("desc");
    navigate("/all-courses");
  };

  if (isError) return <p>Failed to load courses</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-64 space-y-4">
          <div className="sticky top-28">
            <h1 className="text-3xl font-bold mb-4 mt-4">All Courses</h1>
            {Object.keys(filterOptions).map((keyItem) => (
              <div className="p-4 border-b" key={keyItem}>
                <h3 className="font-bold mb-3">{keyItem.toUpperCase()}</h3>
                <div className="grid gap-2 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label
                      className="flex font-medium items-center gap-3"
                      key={option.id}
                    >
                      <Checkbox
                        checked={
                          (keyItem === "Category" && category === option.id) ||
                          (keyItem === "Difficulty" && difficulty === option.id)
                        }
                        onCheckedChange={() =>
                          keyItem === "Category"
                            ? handleCategoryChange(option.id)
                            : setDifficulty(option.id)
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </div>
            ))}
            <Button
              onClick={handleClearAllFilters}
              variant="outline"
              className="w-full mt-4 hover:bg-black hover:text-white hover:font-bold"
            >
              Clear All Filters
            </Button>
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex justify-end items-center mb-4 gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 p-5 transition-all hover:bg-gray-100 active:scale-95"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span className="text-[16px] font-medium">
                    Sort By: {selectedSortLabel}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] bg-white">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="cursor-pointer px-8 py-2 hover:bg-gray-100"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full p-1 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              }}
            >
              {sortOrder === "asc" ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-black font-bold">
              {coursesData?.data?.courses?.length} Results
            </span>
          </div>
          {isLoading || isCategoriesLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              {coursesData?.data?.courses?.length > 0 ? (
                coursesData.data.courses.map((course) => (
                  <Card
                    key={course._id}
                    className="cursor-pointer hover:bg-gray-50 hover:shadow-lg transition-all duration-300 relative"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <CardContent className="flex gap-4 p-4">
                      <div className="w-48 h-32 flex-shrink-0 relative">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {/* Discount Badge */}
                        {course.appliedOffer && (
                          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
                            {course.appliedOffer.discountPercentage}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2 line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mb-1">
                            Created By{" "}
                            <span className="font-bold">
                              {course.instructorName}
                            </span>
                          </p>
                          <p className="text-[16px] text-gray-600 mb-2">
                            {`${course.curriculum?.length || 0} ${
                              course.curriculum?.length <= 1
                                ? "Lecture"
                                : "Lectures"
                            } - ${course.level.toUpperCase()} Level`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-teal-600">
                              ₹{course.discountedPrice || course.pricing}
                            </p>
                            {course.discountedPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ₹{course.pricing}
                              </p>
                            )}
                          </div>
                          {course.appliedOffer && (
                            <p className="text-xs text-green-600">
                              {course.appliedOffer.title} Applied
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <h1 className="font-extrabold text-4xl">No Courses Found</h1>
              )}
            </div>
          )}

          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem className="cursor-pointer">
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`cursor-pointer ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </PaginationItem>

              {Array.from(
                { length: coursesData?.data?.totalPages || 0 },
                (_, i) => (
                  <PaginationItem key={i} className="cursor-pointer">
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem className="cursor-pointer">
                <PaginationNext
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(coursesData?.data?.totalPages || 1, prev + 1)
                    )
                  }
                  disabled={page === coursesData?.data?.totalPages}
                  className={`cursor-pointer ${
                    page >= coursesData?.data?.totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </main>
      </div>
    </div>
  );
};

export default AllCourses;
