// CourseDetails.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseDetailsQuery } from "@/redux/services/courseApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseDetailsQuery(courseId);

  const [displayCurrentFreePreview, setDisplayCurrentFreePreview] =
    useState(null);
  const [showFreePreview, setShowFreePreview] = useState(false);

  const getIndexOfFreePreviewUrl =
    course !== null
      ? course?.data?.curriculum?.findIndex((item) => item.freePreview)
      : -1;

  function handleSetFreePreview(getCurrentVideoInfo) {
    setDisplayCurrentFreePreview(getCurrentVideoInfo.videoUrl);
  }

  useEffect(() => {
    if (displayCurrentFreePreview !== null) {
      setShowFreePreview(true);
    }
  }, [displayCurrentFreePreview]);

  if (isLoading) return <Skeleton />;
  if (isError) return <p>Failed to load course details</p>;

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
            {/* <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components">
                Components
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator /> */}
            <BreadcrumbItem>
              <BreadcrumbPage>{course?.data?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          Go Back
        </Button>
      </div>
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">{course?.data?.title}</h1>
        <p className="text-xl mb-4">{course?.data?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span className="">Created By {course?.data?.instructorName}</span>
          <span>Created On {course?.data?.date.split("T")[0]}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {course?.data?.primaryLanguage}
          </span>
          <span>
            {course?.data?.students.length}{" "}
            {course?.data?.students.length <= 1 ? "Student" : "Students"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{course?.data?.description}</CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course?.data?.objectives
                  ?.split(",")
                  .map((objective, index) => (
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
              {course?.data?.curriculum.map((item, index) => (
                <li
                  className={`${
                    item?.freePreview ? " cursor-pointer" : "cursor-not-allowed"
                  } flex items-center mb-4 rounded-lg`}
                  key={index}
                  onClick={
                    item?.freePreview ? () => handleSetFreePreview(item) : null
                  }
                >
                  {item?.freePreview ? (
                    <PlayCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Lock className="mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span>{item.title}</span>
                </li>
              ))}
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
                      ? course?.data?.curriculum[getIndexOfFreePreviewUrl]
                          .videoUrl
                      : ""
                  }
                  width="450px"
                  height="250px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ₹ {course?.data?.pricing}
                </span>
              </div>
              <Button className="w-full">Enroll Now</Button>
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
            {/* <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription> */}
          </DialogHeader>
          <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentFreePreview}
              width="450px"
              height="250px"
            />
          </div>
          <div className="flex flex-col gap-2">
            {course?.data?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem) => (
                <p
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
