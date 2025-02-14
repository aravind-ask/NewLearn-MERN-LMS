import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCourseLandingFormData } from "@/redux/slices/instructorSlice";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";

const CourseSettingsPage = () => {
  const dispatch = useDispatch();
  const { courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );
  const [getPresignedUrl, { isLoading: isPresigning }] =
    useGetPresignedUrlMutation();

  const handleImageUploadChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedImage = e.target.files?.[0];
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      dispatch(setCourseLandingFormData(formData));

      try {
        const { url, key } = await getPresignedUrl({
          fileName: selectedImage.name,
        }).unwrap();

        await fetch(url, {
          method: "PUT",
          body: selectedImage,
          headers: {
            "Content-Type": selectedImage.type,
          },
        });
        const imageUrl = url.split("?")[0];

        dispatch(
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: imageUrl,
          })
        );
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Label>Upload Course Image</Label>
          <Input
            type="file"
            accept="image/*"
            className="mb-4"
            onChange={handleImageUploadChange}
          />
          {courseLandingFormData.image && (
            <img
              src={courseLandingFormData.image as string}
              alt="Course Preview"
              className="mt-4 max-w-xs rounded-md"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSettingsPage;
