import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Reviews from "@/components/Reviews";
import Discussions from "@/components/Discussions";
import ChatWithTrainer from "@/components/ChatWithTrainer";

function EnrolledCourseDetailsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false); // Closed by default on mobile
  const { courseId } = useParams();

  const { data: courseProgressData, refetch: refetchCourseProgress } =
    useGetCourseProgressQuery({ courseId });
  const [markLectureAsViewed] = useMarkLectureAsViewedMutation();
  const [resetCourseProgress] = useResetCourseProgressMutation();

  const totalLectures =
    courseProgressData?.data?.courseDetails?.curriculum.flatMap(
      (section) => section.lectures
    ).length || 0;
  const viewedLectures = courseProgressData?.data?.progress?.length || 0;
  const progressPercentage =
    totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 0;
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

  const handleProgressUpdate = async (lecture) => {
    if (lecture) {
      await markLectureAsViewed({ courseId, lectureId: lecture._id }).unwrap();
      refetchCourseProgress();
    }
  };

  async function handleRewatchCourse() {
    await resetCourseProgress({ courseId }).unwrap();
    setCurrentLecture(null);
    setShowConfetti(false);
    setShowCourseCompleteDialog(false);
    refetchCourseProgress();
  }

  useEffect(() => {
    refetchCourseProgress();
  }, [courseId]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {showConfetti && <Confetti />}
      {/* Fixed Header */}
      <header className="fixed top-15 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate("/profile/my-courses")}
            variant="ghost"
            size="icon"
            className="text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 truncate max-w-[calc(100vw-10rem)] lg:max-w-[calc(100vw-24rem)]">
            {courseProgressData?.data?.courseDetails?.title}
          </h1>
        </div>
        <Button
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-700 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-10">
        {/* Main Content (Left) */}
        <main className="flex-1 w-full lg:w-[calc(100%-20rem)] p-4 lg:p-6 bg-gray-50">
          {/* Video Player */}
          <section className="mb-6 p-10">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              <VideoPlayer
                width="100%"
                height="clamp(240px, 50vh, 600px)"
                url={currentLecture?.videoUrl}
                onProgressUpdate={handleProgressUpdate}
                progressData={currentLecture}
              />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentLecture?.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {viewedLectures} / {totalLectures} Lectures •{" "}
                {progressPercentage}% Complete
              </p>
            </div>
          </section>

          <Tabs
            defaultValue="reviews"
            className="bg-white rounded-lg shadow-sm"
          >
            <TabsList className="flex bg-gray-50 border-b border-gray-200">
              <TabsTrigger
                value="reviews"
                className="flex-1 py-3 text-gray-700 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-t-md"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="discussions"
                className="flex-1 py-3 text-gray-700 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-t-md"
              >
                Discussions
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="flex-1 py-3 text-gray-700 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-t-md"
              >
                Chat with Trainer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="p-4">
              <Reviews
                courseId={courseProgressData?.data?.courseDetails?._id}
              />
            </TabsContent>
            <TabsContent value="discussions" className="p-4">
              <Discussions lectureId={currentLecture?._id} />{" "}
            </TabsContent>
            <TabsContent value="chat" className="p-4">
              <ChatWithTrainer
                courseId={courseId}
                trainerId={
                  courseProgressData?.data?.courseDetails?.instructorId
                }
                courseTitle={courseProgressData?.data?.courseDetails?.title}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar (Right) */}
        <aside
          className={`fixed lg:static top-14 right-0 w-full lg:w-80 h-[calc(100vh-3.5rem)] lg:h-auto bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 z-40 ${
            isSideBarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Course Content
            </h3>
            <Button
              onClick={() => setIsSideBarOpen(false)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-700 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {progressPercentage}% Complete • {viewedLectures}/
                {totalLectures} Lectures
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-16rem)]">
              <Accordion type="single" collapsible className="space-y-3">
                {courseProgressData?.data?.courseDetails?.curriculum.map(
                  (section, index) => (
                    <AccordionItem
                      key={section._id}
                      value={`item-${index}`}
                      className="border border-gray-200 rounded-md"
                    >
                      <AccordionTrigger className="text-gray-800 font-semibold bg-gray-50 hover:bg-gray-100 p-4 text-base">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="p-2">
                        {section.lectures.map((lecture) => (
                          <div
                            key={lecture._id}
                            onClick={() => setCurrentLecture(lecture)}
                            className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer text-sm ${
                              currentLecture?._id === lecture._id
                                ? "bg-teal-50 text-teal-900 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {courseProgressData?.data?.progress?.find(
                              (p) => p.lectureId === lecture._id
                            )?.viewed ? (
                              <Check className="h-5 w-5 text-teal-500 flex-shrink-0" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                            <span className="truncate">{lecture.title}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
              {/* Overview Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Overview
                </h4>
                <div className="space-y-4 text-gray-600 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>
                      Instructor:{" "}
                      {courseProgressData?.data?.courseDetails?.instructorName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      Category:{" "}
                      {courseProgressData?.data?.courseDetails?.category?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4" />
                    <span>
                      Level: {courseProgressData?.data?.courseDetails?.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>
                      Language:{" "}
                      {courseProgressData?.data?.courseDetails?.primaryLanguage}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      Welcome:{" "}
                      {courseProgressData?.data?.courseDetails?.welcomeMessage}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Students:{" "}
                      {
                        courseProgressData?.data?.courseDetails?.students
                          ?.length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </aside>
      </div>

      {/* Dialogs */}
      <Dialog open={lockCourse}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Access Restricted</DialogTitle>
            <DialogDescription>
              You need to purchase this course to view its content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => navigate("/all-courses")}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Browse Courses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-teal-500">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p>You’ve successfully completed the course!</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/profile/my-courses")}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  My Courses
                </Button>
                <Button
                  onClick={handleRewatchCourse}
                  variant="outline"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Rewatch Course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnrolledCourseDetailsPage;
