/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/common/CustomBreadCrumbs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { QuestionSection } from "@/components/QuestionSection";
import Loading from "@/components/Loading";
import {
  useGetInterviewQuery,
  useUpdateInterviewMutation,
} from "@/redux/services/interviewApi";
import { useGetPresignedUrlMutation as useGetPresignedUploadUrl } from "@/redux/services/authApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { toast } from "sonner";

const InterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isWebCam, setIsWebCam] = useState(false);

  const {
    data: interview,
    isLoading,
    isError,
    error,
  } = useGetInterviewQuery(interviewId || "", { skip: !interviewId });

  const [getPresignedUploadUrl] = useGetPresignedUploadUrl();
  const [updateInterview] = useUpdateInterviewMutation();

  const startVideoRecording = () => {
    if (
      webcamRef.current &&
      webcamRef.current.stream &&
      isWebCam &&
      !isRecording
    ) {
      const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => {
            console.log("Chunk received, size:", event.data.size);
            return [...prev, event.data];
          });
        }
      };
      mediaRecorder.onstop = () => {
        console.log("Recording stopped, total chunks:", recordedChunks.length);
      };
      mediaRecorder.start();
      setIsRecording(true);
      console.log("Video recording started");
    } else {
      console.log("Cannot start recording:", {
        webcamRef: !!webcamRef.current,
        stream: !!webcamRef.current?.stream,
        isWebCam,
        isRecording,
      });
    }
  };

  const stopVideoRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      console.log("Video recording stopped");
    }
  };

  const saveInterviewVideo = async () => {
    console.log("saveInterviewVideo called, chunks:", recordedChunks.length);
    if (recordedChunks.length === 0) {
      console.log("No video recorded, skipping upload");
      return;
    }

    const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
    console.log("Video Blob created, size:", videoBlob.size);
    const fileName = `interview_${interviewId || "unknown"}_${Date.now()}.webm`;

    try {
      console.log("Requesting presigned URL for:", fileName);
      const { url, key } = await getPresignedUploadUrl({ fileName }).unwrap();
      console.log("Presigned URL received:", url);

      console.log("Uploading video to S3...");
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: videoBlob,
        headers: { "Content-Type": "video/webm" },
      });
      if (!uploadResponse.ok) throw new Error("S3 upload failed");

      console.log("Updating interview with videoUrl:", key);
      await updateInterview({
        _id: interviewId,
        videoUrl: key,
      }).unwrap();

      console.log("Video saved to S3 and DB with key:", key);
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error",
        description: "Failed to save interview video",
        variant: "destructive",
      });
    }
  };

  const handleCompleteInterview = () => {
    setIsCompleteDialogOpen(true);
  };

  const confirmCompleteInterview = async () => {
    console.log("Confirming complete interview...");
    stopVideoRecording();
    await saveInterviewVideo();
    setIsCompleteDialogOpen(false);
    setRecordedChunks([]);
    console.log("Navigating to feedback...");
    navigate(`/generate/feedback/${interviewId}`);
  };

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
              Press "Record Answer" to begin answering questions. Recording
              starts when the webcam is enabled and stops when you complete the
              interview.
              <br />
              <br />
              <strong>Note:</strong>{" "}
              <span className="font-medium">
                Your video is recorded only when the webcam is enabled.
              </span>{" "}
              You can disable the webcam anytime if preferred.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {isWebCam && (
        <div className="w-full max-w-md mx-auto">
          <Webcam
            ref={webcamRef}
            onUserMedia={() => {
              setIsWebCam(true);
              console.log("Webcam stream available, starting recording...");
              startVideoRecording(); // Start recording once stream is ready
            }}
            onUserMediaError={(err) => {
              setIsWebCam(false);
              console.error("Webcam error:", err);
              toast({
                title: "Webcam Error",
                description:
                  "Failed to access webcam. Please check permissions.",
                variant: "destructive",
              });
            }}
            className="w-full h-full object-cover rounded-md"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
      )}

      {interview?.questions && interview?.questions.length > 0 && (
        <div className="mt-4 w-full flex flex-col items-start gap-4">
          <QuestionSection
            questions={interview?.questions}
            interviewId={interviewId}
            isWebCam={isWebCam}
            setIsWebCam={setIsWebCam}
            isRecording={isRecording}
          />
        </div>
      )}

      <div className="w-full flex justify-end mt-6">
        <Button
          onClick={handleCompleteInterview}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={isRecording && recordedChunks.length === 0}
        >
          Complete Interview
        </Button>
      </div>

      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              End Interview
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to end the interview? This will stop the
              recording and save your video (if recorded).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCompleteInterview}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewPage;
