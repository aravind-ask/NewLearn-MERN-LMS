import FormControls from "@/components/common/Form-Controls";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config/CourseConfigs";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCourseLandingFormData } from "@/redux/slices/instructorSlice";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";

// const schema = yup.object().shape({
//   title: yup.string().required("Title is required"),
//   description: yup.string().required("Description is required"),
//   category: yup.string().required("Category is required"),
//   pricing: yup.number().required("Pricing is required"),
//   subtitle: yup.string().required("Subtitle is required"),
//   level: yup.string().required("Difficulty is required"),
//   primaryLanguage: yup.string().required("Primary Language is required"),
//   objectives: yup.string().required("Objectives is required"),
//   welcomeMessage: yup.string().required("Welcome Message is required"),
// });

const CourseLandingPage = () => {
  const dispatch = useDispatch();
  const { courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({});

  const [dynamicFormControls, setDynamicFormControls] = useState<
    typeof courseLandingPageFormControls
  >(courseLandingPageFormControls);

  useEffect(() => {
    if (categoriesData) {
      const transformedCategories = categoriesData.data.data.map(
        (category) => ({
          id: category._id,
          label: category.name,
        })
      );

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
    return <Skeleton />;
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
