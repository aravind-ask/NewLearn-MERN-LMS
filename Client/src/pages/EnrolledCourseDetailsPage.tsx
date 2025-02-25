import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import VideoPlayer from "@/components/VideoPlayer";
import {
  useMarkLectureAsViewedMutation,
  useGetCourseProgressQuery,
  useResetCourseProgressMutation,
} from "@/redux/services/courseProgressApi";
import { RootState } from "@/redux/store";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  User,
  BookOpen,
  Globe,
  BarChart,
  Users,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function EnrolledCourseDetailsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const { courseId } = useParams();

  const userId = user?.id;

  const { data: courseProgressData, refetch: refetchCourseProgress } =
    useGetCourseProgressQuery({
      courseId,
    });
  const [markLectureAsViewed] = useMarkLectureAsViewedMutation();
  const [resetCourseProgress] = useResetCourseProgressMutation();

  // Calculate total lectures and viewed lectures
  const totalLectures =
    courseProgressData?.data?.courseDetails?.curriculum.flatMap(
      (section) => section.lectures
    ).length || 0;
  const viewedLectures = courseProgressData?.data?.progress?.length || 0;
  const progressPercentage =
    totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 0;

  // Check if all lectures are viewed
  const allLecturesViewed =
    totalLectures > 0 && viewedLectures === totalLectures;

  useEffect(() => {
    if (courseProgressData) {
      if (!courseProgressData?.data.isPurchased) {
        setLockCourse(true);
      } else {
        if (allLecturesViewed) {
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }

        if (courseProgressData?.data?.progress?.length === 0) {
          setCurrentLecture(
            courseProgressData?.data?.courseDetails?.curriculum[0]?.lectures[0]
          );
        } else {
          const lastViewedLectureId =
            courseProgressData?.data?.progress.findLast(
              (item) => item.viewed
            )?.lectureId;

          if (lastViewedLectureId) {
            const nextLecture =
              courseProgressData?.data?.courseDetails?.curriculum
                .flatMap((section) => section.lectures)
                .find((lecture) => lecture._id === lastViewedLectureId);

            setCurrentLecture(nextLecture);
          }
        }
      }
    }
  }, [courseProgressData, allLecturesViewed]);

  async function updateCourseProgress() {
    if (currentLecture) {
      await markLectureAsViewed({
        courseId,
        lectureId: currentLecture._id,
      }).unwrap();

      refetchCourseProgress();
    }
  }

  async function handleRewatchCourse() {
    await resetCourseProgress({
      courseId,
    }).unwrap();

    setCurrentLecture(null);
    setShowConfetti(false);
    setShowCourseCompleteDialog(false);
    refetchCourseProgress();
  }

  useEffect(() => {
    refetchCourseProgress();
  }, [courseId]);

  useEffect(() => {
    if (currentLecture) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/profile/my-courses")}
            className="bg-white text-black hover:bg-gray-100"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go to My Courses Page
          </Button>
          <h1 className="text-lg font-bold hidden md:block">
            {courseProgressData?.data?.courseDetails?.title}
          </h1>
        </div>
        <Button
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          className="bg-white hover:bg-gray-100"
        >
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-[#1c1d1f]">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col mt-6">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className="text-white rounded-none h-full hover:bg-gray-700"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="text-white rounded-none h-full hover:bg-gray-700"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <Accordion type="single" collapsible>
                    {courseProgressData?.data?.courseDetails?.curriculum.map(
                      (section, index) => (
                        <AccordionItem
                          key={section._id}
                          value={`item-${index}`}
                        >
                          <AccordionTrigger className="text-white font-bold hover:bg-gray-700 p-2 rounded-lg">
                            {section.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            {section.lectures.map((lecture) => (
                              <div
                                className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                                key={lecture._id}
                                onClick={() => setCurrentLecture(lecture)}
                              >
                                {courseProgressData?.data?.progress?.find(
                                  (progressItem) =>
                                    progressItem.lectureId === lecture._id
                                )?.viewed ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                                <span>{lecture?.title}</span>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {courseProgressData?.data?.courseDetails?.description}
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Instructor:{" "}
                        {
                          courseProgressData?.data?.courseDetails
                            ?.instructorName
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Category:{" "}
                        {courseProgressData?.data?.courseDetails?.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Level: {courseProgressData?.data?.courseDetails?.level}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Language:{" "}
                        {
                          courseProgressData?.data?.courseDetails
                            ?.primaryLanguage
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Welcome Message:{" "}
                        {
                          courseProgressData?.data?.courseDetails
                            ?.welcomeMessage
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">
                        Students Enrolled:{" "}
                        {
                          courseProgressData?.data?.courseDetails?.students
                            ?.length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate("/All-courses")}>
              Browse Courses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/profile/my-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnrolledCourseDetailsPage;
