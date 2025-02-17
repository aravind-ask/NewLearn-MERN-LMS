import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useGetCoursesQuery } from "@/redux/services/courseApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";

import debounce from "lodash.debounce";
import { ChevronDownIcon } from "lucide-react";

const AllCourses = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 6;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  if (searchQuery !== search) {
    setSearch(searchQuery);
  }

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

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

  const handleSearch = debounce((value) => setSearch(value), 500);

  useEffect(() => {
    return () => handleSearch.cancel();
  }, []);

  if (isLoading) return <p>Loading courses...</p>;
  if (isError) return <p>Failed to load courses</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Explore Courses</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search courses..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-1/3"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-1/4">
              {category || "Select Category"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-64 overflow-y-auto bg-white shadow-md">
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={(value) => setCategory(value)}
            >
              <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
              {categoriesData?.data.map((cat) => (
                <DropdownMenuRadioItem key={cat._id} value={cat.name}>
                  {cat.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          onValueChange={(value) => setDifficulty(value)}
          value={difficulty}
        >
          <SelectTrigger className="w-full sm:w-1/4">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setSortBy(value)} value={sortBy}>
          <SelectTrigger className="w-full sm:w-1/4">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md">
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="createdAt">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setSortOrder(value)}
          value={sortOrder}
        >
          <SelectTrigger className="w-full sm:w-1/4">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md">
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {coursesData?.data?.courses?.length > 0 ? (
          coursesData.data.courses.map((course) => (
            <Card key={course._id} className="cursor-pointer">
              <CardContent className="flex gap-4 p-4">
                <div className="w-48 h-32 flex-shrink-0">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-1">
                    Created By{" "}
                    <span className="font-bold">{course.instructorName}</span>
                  </p>
                  <p className="text-[16px] text-gray-600 mt-3 mb-2">
                    {`${course.curriculum?.length || 0} ${
                      course.curriculum?.length <= 1 ? "Lecture" : "Lectures"
                    } - ${course.level.toUpperCase()} Level`}
                  </p>
                  <p className="font-bold text-lg">₹{course.pricing}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <h1 className="font-extrabold text-4xl">No Courses Found</h1>
        )}
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-lg font-semibold">{page}</span>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= coursesData?.data?.totalCourses / limit}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AllCourses;
