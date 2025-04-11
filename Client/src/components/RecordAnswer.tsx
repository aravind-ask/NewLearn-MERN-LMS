import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
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
  interviewId: string;
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
  isRecording: boolean;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  interviewId,
  isWebCam,
  setIsWebCam,
  isRecording: pageIsRecording,
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
    if (isRecording) {
      stopSpeechToText();
      if (userAnswer?.length < 30) {
        toast({
          title: "Error",
          description: "Your answer should be more than 30 characters",
          variant: "destructive",
        });
        return;
      }
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );
      setAiResult(aiResult);
    } else {
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
    try {
      const aiResult = await chatSession.sendMessage(prompt);
      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
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
    const cleanText = responseText.trim().replace(/(json|```|`)/g, "");
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
        description: `Missing required data: aiResult=${!!aiResult}, userId=${!!userId}, interviewId=${!!interviewId}`,
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
        {pageIsRecording && (
          <p className="text-sm text-green-500 mt-2">
            <strong>Interview Recording:</strong> In progress...
          </p>
        )}
      </div>
    </div>
  );
};
