import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/VideoPlayer";
import { courseCurriculumInitialFormData } from "@/config/CourseConfigs";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import {
  setCourseCurriculumFormData,
  setUploadedVideoUrl,
  setMediaUploadProgress,
} from "@/redux/slices/instructorSlice";
import { RootState } from "@/redux/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Curriculum = () => {
  const dispatch = useDispatch();
  const { courseCurriculumFormData, mediaUploadProgress } = useSelector(
    (state: RootState) => state.instructor
  );
  const [getPresignedUrl, { isLoading: isPresigning }] =
    useGetPresignedUrlMutation();
  const [uploadingLectureIndex, setUploadingLectureIndex] = useState<
    number | null
  >(null);

  console.log(courseCurriculumFormData);

  const handleNewLecture = () => {
    dispatch(
      setCourseCurriculumFormData([
        ...courseCurriculumFormData,
        { ...courseCurriculumInitialFormData[0] },
      ])
    );
  };

  const handleCourseTitleChange = (e, currentIndex) => {
    const cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      title: e.target.value,
    };
    dispatch(setCourseCurriculumFormData(cpyCourseCurriculumFormData));
  };

  const handleFreePreviewChange = (value, currentIndex) => {
    const cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: value,
    };
    dispatch(setCourseCurriculumFormData(cpyCourseCurriculumFormData));
  };

  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return;
    setUploadingLectureIndex(index);
    dispatch(setMediaUploadProgress(true));

    try {
      const { url, key } = await getPresignedUrl({
        fileName: file.name,
      }).unwrap();

      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      console.log("Video upload response:", res);

      const videoUrl = url.split("?")[0];
      dispatch(setUploadedVideoUrl(videoUrl));

      // const updatedFormData = courseCurriculumFormData.map((item, idx) =>
      //   idx === index ? { ...item, videoUrl } : item
      // );
      const cpyCourseCurriculumFormData = [...courseCurriculumFormData];
      cpyCourseCurriculumFormData[index] = {
        ...cpyCourseCurriculumFormData[index],
        videoUrl,
        public_id: key,
      };

      dispatch(setCourseCurriculumFormData(cpyCourseCurriculumFormData));
    } catch (error) {
      console.error("Video upload failed:", error);
    }

    dispatch(setMediaUploadProgress(false));
    setUploadingLectureIndex(null);
  };

  const handleReplaceVideo = async (index: number) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      setUploadingLectureIndex(index);
      dispatch(setMediaUploadProgress(true));

      try {
        const oldPublicId = courseCurriculumFormData[index]?.public_id;

        if (oldPublicId) {
          await fetch(`/api/videos/${oldPublicId}`, {
            method: "DELETE",
          }).then((res) => {
            if (res.ok) {
              console.log("Video deleted successfully");
              const cpyCourseCurriculumFormData = [...courseCurriculumFormData];
              cpyCourseCurriculumFormData[index] = {
                ...cpyCourseCurriculumFormData[index],
                videoUrl: "",
                public_id: "",
              };

              dispatch(
                setCourseCurriculumFormData(cpyCourseCurriculumFormData)
              );
            }
          });
        }

        const { url, key } = await getPresignedUrl({
          fileName: file.name,
        }).unwrap();

        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        const videoUrl = url.split("?")[0];

        const cpyCourseCurriculumFormData = [...courseCurriculumFormData];
        cpyCourseCurriculumFormData[index] = {
          ...cpyCourseCurriculumFormData[index],
          videoUrl,
          public_id: key,
        };

        dispatch(setCourseCurriculumFormData(cpyCourseCurriculumFormData));
      } catch (error) {
        console.error("Video replacement failed:", error);
      }

      dispatch(setMediaUploadProgress(false));
      setUploadingLectureIndex(null);
    });

    fileInput.click();
  };

  const handleDeleteLecture = async (index: number) => {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentEditedVideoPublicId =
      cpyCourseCurriculumFormData[index]?.public_id;
    if (getCurrentEditedVideoPublicId) {
      await fetch(`/api/videos/${getCurrentEditedVideoPublicId}`, {
        method: "DELETE",
      }).then((res) => {
        if (res.ok) {
          console.log("Video deleted successfully");
          cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
            (_, idx) => idx !== index
          );
          dispatch(setCourseCurriculumFormData(cpyCourseCurriculumFormData));
        }
      });
    }
  };

  const isCourseCurriculumFormDatavalid = () => {
    return courseCurriculumFormData.every((item) => {
      return (
        item.title &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleNewLecture}
          disabled={!isCourseCurriculumFormDatavalid() || mediaUploadProgress}
        >
          Add Lecture
        </Button>
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div className="border p-5 rouded-md" key={index}>
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  type="text"
                  placeholder="Enter Lecture Title"
                  className="max-w-96"
                  value={courseCurriculumFormData[index]?.title}
                  onChange={(e) => handleCourseTitleChange(e, index)}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={courseCurriculumFormData[index]?.freePreview}
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    id={`freePreview-${index + 1}`}
                  />
                  <Label htmlFor={`freePreview-${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-6">
                {uploadingLectureIndex === index && (
                  <Skeleton className="h-40 w-full max-w-lg rounded-lg bg-gray-300 animate-pulse justify-center" />
                )}
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex gap-3">
                    <VideoPlayer
                      url={courseCurriculumFormData[index]?.videoUrl}
                      width="450px"
                      height="250px"
                    />
                    <Button onClick={() => handleReplaceVideo(index)}>
                      Change Video
                    </Button>
                    <Button
                      onClick={() => handleDeleteLecture(index)}
                      className="bg-red-900"
                    >
                      Delete Lecture
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    className="mb-4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, index);
                      }
                    }}
                  />
                )}

                {/* {curriculumItem.videoUrl && (
                  <div className="flex items-center justify-center gap-4">
                    <video controls className=" mt-2 w-full max-w-lg ">
                      <source src={curriculumItem.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Curriculum;
