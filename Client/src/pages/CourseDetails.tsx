import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useGetCourseDetailsQuery } from "@/redux/services/courseApi";
import { useGetInstructorCoursesQuery } from "@/redux/services/instructorApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Globe,
  Lock,
  PlayCircle,
  Heart,
  ShoppingCart,
  Book,
  LinkIcon,
  Star,
  User2,
  BookIcon,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useDispatch, useSelector } from "react-redux";
import {
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetCartQuery,
  useGetWishlistQuery,
} from "@/redux/services/courseApi";
import {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/userSlice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetReviewsByCourseIdQuery } from "@/redux/services/ratingsApi";
import { format } from "date-fns";
import Loading from "@/components/Loading";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, isLoading, isError, error } =
    useGetCourseDetailsQuery(courseId);

  const course = data?.data?.courseDetails;

  console.log("course", course);

  const [displayCurrentFreePreview, setDisplayCurrentFreePreview] =
    useState(null);
  const [showFreePreview, setShowFreePreview] = useState(false);

  const [addToCartApi] = useAddToCartMutation();
  const [removeFromCartApi] = useRemoveFromCartMutation();
  const [addToWishlistApi] = useAddToWishlistMutation();
  const [removeFromWishlistApi] = useRemoveFromWishlistMutation();

  const { data: cart } = useGetCartQuery();
  const { data: wishlist } = useGetWishlistQuery();

  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState<string | null>(null);

  const {
    data: instructorCourses,
    isLoading: isInstructorCoursesLoading,
    isError: isInstructorCoursesError,
  } = useGetInstructorCoursesQuery({
    instructorId: course?.data?.instructorId,
    page: 1,
    limit: 5,
  });

  const getIndexOfFreePreviewUrl =
    course !== null
      ? course?.curriculum?.findIndex((section) =>
          section.lectures.some((lecture) => lecture.freePreview)
        )
      : -1;

  function handleSetFreePreview(getCurrentVideoInfo) {
    setDisplayCurrentFreePreview(getCurrentVideoInfo.videoUrl);
  }

  const {
    data: ratingsData,
    isLoading: isRatingsLoading,
    isError: isRatingsError,
  } = useGetReviewsByCourseIdQuery(courseId);
  console.log("ratingsData", ratingsData);

  useEffect(() => {
    // const ratings = ratingsData?.data || [];
    setRatings(ratingsData || []);
    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, review) => sum + review.rating, 0) /
            ratings.length
          ).toFixed(1)
        : null;
    setAverageRating(averageRating);
    console.log("ratings", ratings);
    console.log("averageRating", averageRating);
  }, [ratingsData, courseId, data]);

  const handleAddToCart = async () => {
    try {
      await addToCartApi(courseId).unwrap();
      dispatch(addToCart(course));
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      await removeFromCartApi(courseId).unwrap();
      dispatch(removeFromCart(courseId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlistApi(courseId).unwrap();
      dispatch(addToWishlist(course));
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      await removeFromWishlistApi(courseId).unwrap();
      dispatch(removeFromWishlist(courseId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  useEffect(() => {
    if (displayCurrentFreePreview !== null) {
      setShowFreePreview(true);
    }
  }, [displayCurrentFreePreview]);

  const handleEnrollNow = () => {
    navigate("/checkout", { state: { courseDetails: course } });
  };

  if (isLoading || isRatingsLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-600 flex justify-center items-center">
        Failed to load course details {error?.data?.message}
      </p>
    );

  if (data?.data?.isEnrolled) {
    const isEnrolled = data?.data?.isEnrolled.courseId.toString();
    return <Navigate to={`/course/${isEnrolled}/learn`} />;
    // navigate(`/course/${isEnrolled}/learn`);
  }

  const isInCart = cart?.data?.some((item) => item._id === courseId);
  const isInWishlist = wishlist?.data?.some((item) => item._id === courseId);

  return (
    <div className="container mx-auto p-4">
      <div className="w-full flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/all-courses">All Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course?.data?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-4 cursor-pointer hover:bg-black hover:text-white hover:font-bold"
        >
          Go Back
        </Button>
      </div>
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">{course?.title}</h1>
        <p className="text-xl mb-4">{course?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span className="flex">
            Created By {course?.instructorName}
            <Link
              to={`/instructor/profile/${course?.instructorId}`}
              className="ml-2 text-blue-500 hover:underline"
            >
              <LinkIcon className="mr-1 h-4 w-4" />
            </Link>
          </span>
          <span className="flex items-center">
            <BookIcon className="mr-1 h-4 w-4" />
            {course?.category.name}
          </span>
          <span>
            Created On {format(new Date(course.date), "MMM dd, yyyy")}
          </span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {course?.primaryLanguage}
          </span>
          <span className="flex items-center">
            <User2 className="mr-1 h-4 w-4" />
            {course?.students.length}{" "}
            {course?.students.length <= 1 ? "Student" : "Students"}
          </span>
          {averageRating ? (
            <span className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-500" />
              {averageRating} ({ratings.length} Reviews)
            </span>
          ) : (
            <span className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-gray-500" />
              No ratings yet
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{course?.description}</CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course?.objectives?.split(",").map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {course?.curriculum.map((section, sectionIndex) => (
                  <AccordionItem
                    key={sectionIndex}
                    value={`section-${sectionIndex}`}
                  >
                    <AccordionTrigger className="text-lg font-semibold">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {section.lectures.map((lecture, lectureIndex) => (
                          <li
                            key={lectureIndex}
                            className={`${
                              lecture?.freePreview
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            } flex items-center mb-4 rounded-lg`}
                            onClick={
                              lecture?.freePreview
                                ? () => handleSetFreePreview(lecture)
                                : null
                            }
                          >
                            {lecture?.freePreview ? (
                              <PlayCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Lock className="mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                            <span>{lecture.title}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          {/* Display other courses by the same instructor */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Courses by the same instructor</CardTitle>
            </CardHeader>
            <CardContent>
              {isInstructorCoursesLoading ? (
                <Skeleton />
              ) : isInstructorCoursesError ? (
                <p className="text-red-600">
                  Failed to load instructor courses
                </p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {instructorCourses?.data?.courses?.map((course) => (
                    <li key={course._id} className="flex items-start">
                      <Link
                        to={`/course/${course._id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {course.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-22">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? course?.curriculum[
                          getIndexOfFreePreviewUrl
                        ]?.lectures.find(
                          (lecture: { freePreview: boolean }) =>
                            lecture.freePreview
                        ).videoUrl
                      : ""
                  }
                  width="450px"
                  height="250px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹ {course?.pricing}</span>
              </div>
              <Button
                className="w-full mb-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold"
                onClick={handleEnrollNow}
              >
                <Book className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
              <Button
                className="w-full mb-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold"
                onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isInCart ? "Remove from Cart" : "Add to Cart"}
              </Button>
              <Button
                className="w-full cursor-pointer hover:bg-black hover:text-white hover:font-bold"
                onClick={
                  isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist
                }
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    isInWishlist ? "text-red-600 font-bold" : ""
                  }`}
                />
                {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Dialog
        open={showFreePreview}
        onOpenChange={() => {
          setShowFreePreview(false);
          setDisplayCurrentFreePreview(null);
        }}
      >
        <DialogContent className="w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentFreePreview}
              width="450px"
              height="250px"
            />
          </div>
          <div className="flex flex-col gap-2">
            {course?.curriculum
              ?.flatMap((section) => section.lectures)
              ?.filter((lecture) => lecture.freePreview)
              .map((filteredItem) => (
                <p
                  key={filteredItem.videoUrl}
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-[16px] font-medium"
                >
                  {filteredItem.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails;
