import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./common/tooltip-button";
import { useToast } from "@/hooks/use-toast";
import { chatSession } from "@/scripts";
import { SaveModal } from "./SaveModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateUserAnswerMutation,
  useGetUserAnswerQuery,
} from "@/redux/services/interviewApi";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const { interviewId } = useParams<{ interviewId: string }>();

  const [createUserAnswer] = useCreateUserAnswerMutation();
  const { data: existingAnswer, isLoading: isCheckingAnswer } =
    useGetUserAnswerQuery(
      {
        userId: userId || "",
        question: question.question,
        mockIdRef: interviewId || "",
      },
      { skip: !userId || !interviewId }
    );

  const recordUserAnswer = async () => {
    console.log("recordUserAnswer called, isRecording:", isRecording); // Debug
    if (isRecording) {
      stopSpeechToText();

      console.log("Stopped recording, userAnswer length:", userAnswer?.length); // Debug
      if (userAnswer?.length < 30) {
        toast({
          title: "Error",
          description: "Your answer should be more than 30 characters",
          variant: "destructive",
        });
        return;
      }

      console.log("Generating AI result for:", {
        question: question.question,
        userAnswer,
      }); // Debug
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );
      console.log("AI result generated:", aiResult); // Debug
      setAiResult(aiResult);
    } else {
      console.log("Starting speech-to-text"); // Debug
      startSpeechToText();
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
    Question: "${qst}"
    User Answer: "${userAns}"
    Correct Answer: "${qstAns}"
    Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
    Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
  `;

    console.log("Sending prompt to AI:", prompt); // Debug
    try {
      const aiResult = await chatSession.sendMessage(prompt);
      console.log("Raw AI response:", aiResult.response.text()); // Debug
      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      console.log("Parsed AI result:", parsedResult); // Debug
      return parsedResult;
    } catch (error) {
      console.log("Error in generateResult:", error); // Debug
      toast({
        title: "Error",
        description: "An error occurred while generating feedback",
        variant: "destructive",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|```|`)/g, "");
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult || !userId || !interviewId) {
      toast({
        title: "Error",
        description: `Missing required data to save answer: aiResult=${!!aiResult}, userId=${!!userId}, interviewId=${!!interviewId}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (existingAnswer) {
        toast({
          title: "Already Answered",
          description: "You have already answered this question",
        });
        return;
      }

      console.log("Attempting to create user answer with data:", {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        userId,
        createdAt: new Date().toISOString(),
      });

      const result = await createUserAnswer({
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        userId,
        createdAt: new Date().toISOString(),
      }).unwrap();

      console.log("Mutation result:", result);
      toast({
        title: "Saved",
        description: "Your answer has been saved",
      });
      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving your answer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");
    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading || isCheckingAnswer}
      />

      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating || loading ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disabled={!aiResult || isCheckingAnswer}
        />
      </div>

      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>
        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>
        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong> {interimResult}
          </p>
        )}
      </div>
    </div>
  );
};
