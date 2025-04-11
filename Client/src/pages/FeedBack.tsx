import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CustomBreadCrumb } from "@/components/common/CustomBreadCrumbs";
import { Headings } from "@/components/common/Headings";
import { InterviewPin } from "@/components/common/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetInterviewQuery,
  useGetUserAnswersByInterviewQuery,
} from "@/redux/services/interviewApi";
import { useGetPresignedUrlMutation, useGetPresignedDownloadUrlMutation } from "@/redux/services/authApi";
import Loading from "@/components/Loading";

const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const [activeFeed, setActiveFeed] = useState("");
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [getPresignedDownloadUrl] = useGetPresignedDownloadUrlMutation();

  const {
    data: interview,
    error: interviewError,
    isLoading: isInterviewLoading,
  } = useGetInterviewQuery(interviewId || "", { skip: !interviewId });

  const {
    data: feedbacks,
    error: feedbacksError,
    isLoading: isFeedbacksLoading,
  } = useGetUserAnswersByInterviewQuery(
    { userId: userId || "", mockIdRef: interviewId || "" },
    { skip: !userId || !interviewId }
  );

 useEffect(() => {
   const fetchVideoUrl = async () => {
     if (interview?.videoUrl) {
       try {
         const { url } = await getPresignedDownloadUrl({
           key: interview.videoUrl,
         }).unwrap();
         console.log("Fetched video URL:", url);
         setVideoUrl(url);
       } catch (error) {
         console.error("Error fetching video URL:", error);
         toast("Error", {
           description: "Failed to load interview video",
         });
       }
     }
   };
   fetchVideoUrl();
 }, [interview, getPresignedDownloadUrl]);

  useEffect(() => {
    if (!interviewId) {
      navigate("/generate", { replace: true });
    }
  }, [interviewId, navigate]);

  useEffect(() => {
    if (interviewError) {
      console.log("Interview fetch error:", interviewError);
      toast("Error", {
        description:
          "Failed to fetch interview details. Please try again later.",
      });
    }
    if (feedbacksError) {
      console.log("Feedbacks fetch error:", feedbacksError);
      toast("Error", {
        description: "Failed to fetch feedbacks. Please try again later.",
      });
    }
  }, [interviewError, feedbacksError]);

  const overAllRating = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) return "0.0";
    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isInterviewLoading || isFeedbacksLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage="Feedback"
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position || "Interview"}`,
              link: `/generate/interview/${interview?._id}`,
            },
          ]}
        />
      </div>

      <Headings
        title="Congratulations!"
        description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
      />

      <p className="text-base text-muted-foreground">
        Your overall interview ratings:{" "}
        <span className="text-emerald-500 font-semibold text-xl">
          {overAllRating} / 10
        </span>
      </p>

      {interview && <InterviewPin interview={interview} onMockPage />}

      {videoUrl && (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">Interview Recording</h2>
          <video controls src={videoUrl} className="w-full rounded-md">
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks && feedbacks.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed._id}
              value={feed._id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed._id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed._id
                    ? "bg-gradient-to-r from-purple-50 to-blue-50"
                    : "hover:bg-gray-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                <div className="text-lg font-semibold text-gray-700">
                  <Star className="inline mr-2 text-yellow-400" />
                  Rating: {feed.rating}
                </div>

                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-yellow-600" />
                    Your Answer
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No feedback available for this interview.</p>
      )}
    </div>
  );
};

export default Feedback;
