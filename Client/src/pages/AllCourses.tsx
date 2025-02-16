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
import { useGetCoursesQuery } from "@/redux/services/courseApi";
import debounce from "lodash.debounce";

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

  const { data, isLoading, isError } = useGetCoursesQuery({
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

        <Select onValueChange={(value) => setCategory(value)} value={category}>
          <SelectTrigger className="w-full sm:w-1/4">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="web development">Web Development</SelectItem>
            <SelectItem value="data science">Data Science</SelectItem>
            <SelectItem value="machine learning">Machine Learning</SelectItem>
          </SelectContent>
        </Select>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.data.courses?.length > 0 ? (
          data?.data.courses?.map((course) => (
            <Card key={course.id} className="shadow-lg">
              <CardHeader>
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md"
                />
                <CardTitle className="mt-3">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Instructor: {course.instructorName}
                </p>
                <p className="text-lg font-semibold">₹{course.pricing}</p>
                <Button className="mt-3 w-full">View Course</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center">No courses found</div>
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
          disabled={page >= data?.data?.totalCourses / limit}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AllCourses;
