import FormControls from "@/components/common-form/Form-Controls";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config/CourseConfigs";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCourseLandingFormData } from "@/redux/slices/instructorSlice";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi"; 
import { useEffect, useState } from "react";

const CourseLandingPage = () => {
  const dispatch = useDispatch();
  const { courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  // State to hold dynamic form controls
  const [dynamicFormControls, setDynamicFormControls] = useState<
    typeof courseLandingPageFormControls
  >(courseLandingPageFormControls);

  // Transform categories into the required format
  useEffect(() => {
    if (categoriesData) {
      const transformedCategories = categoriesData.data.map((category) => ({
        id: category._id, // Assuming the backend returns `_id`
        label: category.name, // Assuming the backend returns `name`
      }));

      // Update the "category" control with dynamic options
      const updatedFormControls = courseLandingPageFormControls.map(
        (control) => {
          if (control.name === "category") {
            return {
              ...control,
              options: transformedCategories,
            };
          }
          return control;
        }
      );

      setDynamicFormControls(updatedFormControls);
    }
  }, [categoriesData]);

  const handleSetFormData = (data: Record<string, string>) => {
    dispatch(setCourseLandingFormData(data));
  };

  if (isCategoriesLoading) {
    return <p>Loading categories...</p>;
  }

  return (
    <Card>
      <CardHeader>Course Landing Page</CardHeader>
      <CardContent>
        <FormControls
          formControls={dynamicFormControls}
          formData={courseLandingFormData}
          setFormData={handleSetFormData}
        />
      </CardContent>
    </Card>
  );
};

export default CourseLandingPage;
