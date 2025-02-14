import FormControls from "@/components/common-form/Form-Controls";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config/CourseConfigs";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCourseLandingFormData } from "@/redux/slices/instructorSlice";

const CourseLandingPage = () => {
  const dispatch = useDispatch();

  const { courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );
  const handleSetFormData = (data: Record<string, string>) => {
    dispatch(setCourseLandingFormData(data));
  };
  return (
    <Card>
      <CardHeader>Course Landing Page</CardHeader>
      <CardContent>
        <FormControls
          formControls={courseLandingPageFormControls}
          formData={courseLandingFormData}
          setFormData={handleSetFormData}
        />
      </CardContent>
    </Card>
  );
};

export default CourseLandingPage;
