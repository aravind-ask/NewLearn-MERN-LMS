// src/components/Instructor/Add-New-Course/Curriculum.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  console.log("courseCurriculumFormData", courseCurriculumFormData);

  const [getPresignedUrl, { isLoading: isPresigning }] =
    useGetPresignedUrlMutation();
  const [uploadingLectureIndex, setUploadingLectureIndex] = useState<{
    sectionIndex: number;
    lectureIndex: number;
  } | null>(null);

  // Handle case where courseCurriculumFormData might not be initialized
  if (!courseCurriculumFormData) {
    return <Skeleton className="h-40 w-full" />;
  }

  const handleNewSection = () => {
    dispatch(
      setCourseCurriculumFormData([
        ...courseCurriculumFormData,
        {
          title: "New Section",
          lectures: [{ ...courseCurriculumInitialFormData[0].lectures[0] }],
        },
      ])
    );
  };

  const handleNewLecture = (sectionIndex: number) => {
    const newLecture = { ...courseCurriculumInitialFormData[0].lectures[0] };
    const updatedSections = courseCurriculumFormData.map((section, idx) => {
      if (idx === sectionIndex) {
        return {
          ...section,
          lectures: [...section.lectures, newLecture],
        };
      }
      return section;
    });
    dispatch(setCourseCurriculumFormData(updatedSections));
  };

  const handleSectionTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionIndex: number
  ) => {
    const updatedSections = courseCurriculumFormData.map((section, idx) => {
      if (idx === sectionIndex) {
        return { ...section, title: e.target.value };
      }
      return section;
    });
    dispatch(setCourseCurriculumFormData(updatedSections));
  };
  const handleSectionDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionIndex: number
  ) => {
    const updatedSections = courseCurriculumFormData.map((section, idx) => {
      if (idx === sectionIndex) {
        return { ...section, description: e.target.value };
      }
      return section;
    });
    dispatch(setCourseCurriculumFormData(updatedSections));
  };

  const handleCourseTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    lectureIndex: number
  ) => {
    const updatedSections = courseCurriculumFormData.map((section, idx) => {
      if (idx === sectionIndex) {
        return {
          ...section,
          lectures: section.lectures.map((lecture, lIdx) => {
            if (lIdx === lectureIndex) {
              return { ...lecture, title: e.target.value };
            }
            return lecture;
          }),
        };
      }
      return section;
    });
    dispatch(setCourseCurriculumFormData(updatedSections));
  };

  const handleFreePreviewChange = (
    value: boolean,
    sectionIndex: number,
    lectureIndex: number
  ) => {
    const updatedSections = courseCurriculumFormData.map((section, idx) => {
      if (idx === sectionIndex) {
        return {
          ...section,
          lectures: section.lectures.map((lecture, lIdx) => {
            if (lIdx === lectureIndex) {
              return { ...lecture, freePreview: value };
            }
            return lecture;
          }),
        };
      }
      return section;
    });
    dispatch(setCourseCurriculumFormData(updatedSections));
  };

  const handleFileUpload = async (
    file: File,
    sectionIndex: number,
    lectureIndex: number
  ) => {
    if (!file) return;
    setUploadingLectureIndex({ sectionIndex, lectureIndex });
    dispatch(setMediaUploadProgress(true));

    try {
      const { url, key } = await getPresignedUrl({
        fileName: file.name,
      }).unwrap();
      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      console.log("Video upload response:", res);
      console.log(url);

      const videoUrl = url.split("?")[0];
      dispatch(setUploadedVideoUrl(videoUrl));

      const updatedSections = courseCurriculumFormData.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            lectures: section.lectures.map((lecture, lIdx) => {
              if (lIdx === lectureIndex) {
                return { ...lecture, videoUrl, public_id: key };
              }
              return lecture;
            }),
          };
        }
        return section;
      });
      dispatch(setCourseCurriculumFormData(updatedSections));
    } catch (error) {
      console.error("Video upload failed:", error);
    }

    dispatch(setMediaUploadProgress(false));
    setUploadingLectureIndex(null);
  };

  const handleReplaceVideo = async (
    sectionIndex: number,
    lectureIndex: number
  ) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      setUploadingLectureIndex({ sectionIndex, lectureIndex });
      dispatch(setMediaUploadProgress(true));

      try {
        const oldPublicId =
          courseCurriculumFormData[sectionIndex]?.lectures[lectureIndex]
            ?.public_id;
        if (oldPublicId) {
          await fetch(`/api/videos/${oldPublicId}`, { method: "DELETE" }).then(
            (res) => {
              if (res.ok) {
                console.log("Video deleted successfully");
                const updatedSections = courseCurriculumFormData.map(
                  (section, idx) => {
                    if (idx === sectionIndex) {
                      return {
                        ...section,
                        lectures: section.lectures.map((lecture, lIdx) => {
                          if (lIdx === lectureIndex) {
                            return { ...lecture, videoUrl: "", public_id: "" };
                          }
                          return lecture;
                        }),
                      };
                    }
                    return section;
                  }
                );
                dispatch(setCourseCurriculumFormData(updatedSections));
              }
            }
          );
        }

        const { url, key } = await getPresignedUrl({
          fileName: file.name,
        }).unwrap();
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        const videoUrl = url.split("?")[0];
        const updatedSections = courseCurriculumFormData.map((section, idx) => {
          if (idx === sectionIndex) {
            return {
              ...section,
              lectures: section.lectures.map((lecture, lIdx) => {
                if (lIdx === lectureIndex) {
                  return { ...lecture, videoUrl, public_id: key };
                }
                return lecture;
              }),
            };
          }
          return section;
        });
        dispatch(setCourseCurriculumFormData(updatedSections));
      } catch (error) {
        console.error("Video replacement failed:", error);
      }

      dispatch(setMediaUploadProgress(false));
      setUploadingLectureIndex(null);
    });

    fileInput.click();
  };

  const handleDeleteLecture = async (
    sectionIndex: number,
    lectureIndex: number
  ) => {
    const updatedSections = [...courseCurriculumFormData];
    const publicId =
      updatedSections[sectionIndex]?.lectures[lectureIndex]?.public_id;

    if (publicId) {
      try {
        const res = await fetch(`/api/videos/${publicId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          console.log("Video deleted successfully");
          updatedSections[sectionIndex].lectures = updatedSections[
            sectionIndex
          ].lectures.filter((_, idx) => idx !== lectureIndex);
          dispatch(setCourseCurriculumFormData(updatedSections));
        }
      } catch (error) {
        console.error("Error deleting lecture video:", error);
      }
    } else {
      updatedSections[sectionIndex].lectures = updatedSections[
        sectionIndex
      ].lectures.filter((_, idx) => idx !== lectureIndex);
      dispatch(setCourseCurriculumFormData(updatedSections));
    }
  };

  const isCourseCurriculumFormDatavalid = () => {
    if (!courseCurriculumFormData || courseCurriculumFormData.length === 0) {
      return false;
    }

    return courseCurriculumFormData.every((section) => {
      return (
        section.title.trim() !== "" &&
        section.lectures.every((lecture) => {
          return (
            lecture.title &&
            typeof lecture === "object" &&
            lecture.title.trim() !== "" &&
            lecture.videoUrl.trim() !== ""
          );
        })
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
          onClick={handleNewSection}
          disabled={!isCourseCurriculumFormDatavalid() || mediaUploadProgress}
        >
          Add New Section
        </Button>
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((section, sectionIndex) => (
            <div className="border p-5 rounded-md" key={sectionIndex}>
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Section {sectionIndex + 1}</h3>
                <Input
                  name={`section-title-${sectionIndex + 1}`}
                  type="text"
                  placeholder="Enter Section Title"
                  className="max-w-96"
                  value={section.title}
                  onChange={(e) => handleSectionTitleChange(e, sectionIndex)}
                />
                <Button
                  onClick={() => handleNewLecture(sectionIndex)}
                  disabled={
                    !isCourseCurriculumFormDatavalid() || mediaUploadProgress
                  }
                >
                  Add Lecture
                </Button>
              </div>
              <div className="flex gap-5 items-center mt-5">
                <h3 className="font-semibold">Section Description</h3>
                <Textarea
                  name={`section-description-${sectionIndex + 1}`}
                  // type="text"
                  placeholder="Enter Section Description"
                  className="max-w-96"
                  value={section.description}
                  onChange={(e) =>
                    handleSectionDescriptionChange(e, sectionIndex)
                  }
                />
              </div>
              <div className="mt-6 space-y-4">
                {section.lectures.map((lecture, lectureIndex) => (
                  <div className="border p-5 rounded-md" key={lectureIndex}>
                    <div className="flex gap-5 items-center">
                      <h3 className="font-semibold">
                        Lecture {lectureIndex + 1}
                      </h3>
                      <Input
                        name={`title-${sectionIndex + 1}-${lectureIndex + 1}`}
                        type="text"
                        placeholder="Enter Lecture Title"
                        className="max-w-96"
                        value={lecture.title}
                        onChange={(e) =>
                          handleCourseTitleChange(e, sectionIndex, lectureIndex)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={lecture.freePreview}
                          onCheckedChange={(value) =>
                            handleFreePreviewChange(
                              value,
                              sectionIndex,
                              lectureIndex
                            )
                          }
                          id={`freePreview-${sectionIndex + 1}-${
                            lectureIndex + 1
                          }`}
                          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 data-[state=checked]:bg-indigo-600"
                        >
                          <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-5" />
                        </Switch>
                        <Label
                          htmlFor={`freePreview-${sectionIndex + 1}-${
                            lectureIndex + 1
                          }`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Free Preview
                        </Label>
                      </div>
                    </div>
                    <div className="mt-6">
                      {uploadingLectureIndex?.sectionIndex === sectionIndex &&
                      uploadingLectureIndex?.lectureIndex === lectureIndex ? (
                        <Skeleton className="h-40 w-full max-w-lg rounded-lg bg-gray-300 animate-pulse" />
                      ) : lecture.videoUrl ? (
                        <div className="flex gap-3">
                          <VideoPlayer
                            url={lecture.videoUrl}
                            width="450px"
                            height="250px"
                          />
                          <Button
                            onClick={() =>
                              handleReplaceVideo(sectionIndex, lectureIndex)
                            }
                          >
                            Change Video
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteLecture(sectionIndex, lectureIndex)
                            }
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
                              handleFileUpload(
                                file,
                                sectionIndex,
                                lectureIndex
                              );
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Curriculum;
