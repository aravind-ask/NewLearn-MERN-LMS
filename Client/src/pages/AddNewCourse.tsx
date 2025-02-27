import CourseLandingPage from "@/components/Instructor/Add-New-Course/CourseLandingPage";
import CourseSettingsPage from "@/components/Instructor/Add-New-Course/CourseSettingsPage";
import Curriculum from "@/components/Instructor/Add-New-Course/Curriculum";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateCourseMutation,
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
} from "@/redux/services/courseApi";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  resetCourseFormData,
  setCourseCurriculumFormData,
  setCourseLandingFormData,
  setCurrentEditedCourseId,
} from "@/redux/slices/instructorSlice";
import { useEffect, useRef } from "react";
import { courseLandingInitialFormData } from "@/config/CourseConfigs";

const AddNewCourse = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    courseCurriculumFormData,
    courseLandingFormData,
    currentEditedCourseId,
  } = useSelector((state: RootState) => state.instructor);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (params.courseId) {
      dispatch(setCurrentEditedCourseId(params.courseId));
    }
  }, [params.courseId, dispatch]);

  const { data: courseDetails } = useGetCourseDetailsQuery(
    currentEditedCourseId,
    {
      skip: !currentEditedCourseId,
    }
  );

  useEffect(() => {
    if (courseDetails && initialLoad.current) {
      const setCourseFormData = Object.keys(
        courseLandingInitialFormData
      ).reduce((acc, key) => {
        acc[key] = courseDetails.data[key] || courseLandingInitialFormData[key];
        return acc;
      }, {});

      dispatch(setCourseLandingFormData(setCourseFormData));
      dispatch(setCourseCurriculumFormData(courseDetails.data.curriculum));
      initialLoad.current = false; 
    }
  }, [courseDetails, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetCourseFormData()); 
    };
  }, [dispatch]);

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        ...courseLandingFormData,
        instructorId: user?.id,
        instructorName: user?.name,
        curriculum: courseCurriculumFormData,
        pricing: Number(courseLandingFormData.pricing),
      };

      let response;
      if (currentEditedCourseId) {
        const courseEditData = {
          courseId: currentEditedCourseId,
          ...courseData,
        };
        console.log("Updating course", courseEditData);
        response = await updateCourse(courseEditData).unwrap();
        console.log("Course Updated Successfully", response);
        toast({
          title: "Success",
          description: "Course updated successfully!",
          variant: "default",
        });
      } else {
        console.log("Creating course", courseData);
        response = await createCourse(courseData).unwrap();
        console.log("Course Created Successfully", response);
        toast({
          title: "Success",
          description: "Course created successfully!",
          variant: "default",
        });
      }

      navigate("/instructor/dashboard");
    } catch (error) {
      console.error("Failed to save course", error);
       toast({
         title: "Error",
         description: "Failed to save course",
         variant: "destructive",
       });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">Create a Course</h1>
        <Button
          className="text-sm tracking-wider font-bold px-8"
          onClick={handleCreateCourse}
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? "Saving..."
            : currentEditedCourseId
            ? "UPDATE COURSE"
            : "CREATE COURSE"}
        </Button>
      </div>
      <Card>
        <CardContent>
          <div className="container mx-auto p-4">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum">
                <Curriculum />
              </TabsContent>
              <TabsContent value="course-landing-page">
                <CourseLandingPage />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettingsPage />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewCourse;
