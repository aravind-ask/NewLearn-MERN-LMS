/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/common/CustomBreadCrumbs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { QuestionSection } from "@/components/QuestionSection";
import Loading from "@/components/Loading";
import { useGetInterviewQuery } from "@/redux/services/interviewApi";

const InterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  // Use RTK Query to fetch the interview
  const {
    data: interview,
    isLoading,
    isError,
    error,
  } = useGetInterviewQuery(interviewId || "", {
    skip: !interviewId, // Skip query if no interviewId
  });

  // Handle loading state
  if (isLoading) {
    return <Loading />;
  }

  // Handle error or no interview cases
  if (isError || !interviewId || !interview) {
    if (isError) {
      console.log("Error fetching interview:", error);
    }
    navigate("/generate", { replace: true });
    return null; // Return null since navigation will occur
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <CustomBreadCrumb
        breadCrumbPage="Start"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?._id}`,
          },
        ]}
      />

      <div className="w-full">
        <Alert className="bg-sky-100 border border-sky-200 p-4 rounded-lg flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-sky-600" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold">
              Important Note
            </AlertTitle>
            <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
              Press "Record Answer" to begin answering the question. Once you
              finish the interview, you'll receive feedback comparing your
              responses with the ideal answers.
              <br />
              <br />
              <strong>Note:</strong>{" "}
              <span className="font-medium">Your video is never recorded.</span>{" "}
              You can disable the webcam anytime if preferred.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {interview?.questions && interview?.questions.length > 0 && (
        <div className="mt-4 w-full flex flex-col items-start gap-4">
          <QuestionSection questions={interview?.questions} />
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
