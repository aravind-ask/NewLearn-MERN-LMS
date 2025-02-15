import CourseLandingPage from "@/components/Instructor/Add-New-Course/CourseLandingPage";
import CourseSettingsPage from "@/components/Instructor/Add-New-Course/CourseSettingsPage";
import Curriculum from "@/components/Instructor/Add-New-Course/Curriculum";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useCreateCourseMutation } from "@/redux/services/courseApi";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddNewCourse = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { courseCurriculumFormData, courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );
  const navigate = useNavigate();

  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const handleCreateCourse = async () => {
    console.log("CreateCourse");
    console.log("courseCurriculumFormData", courseCurriculumFormData);
    console.log("courseLandingFormData", courseLandingFormData);
    try {
      const courseData = {
        ...courseLandingFormData,
        instructorId: user?.id,
        instructorName: user?.name,
        curriculum: courseCurriculumFormData,
        pricing: Number(courseLandingFormData.pricing),
      };

      const response = await createCourse(courseData).unwrap();
      console.log("Course Created Successfully", response);
      toast({
        title: "Success",
        description: "Course created successfully!",
        status: "success",
      });
      navigate("/instructor/dashboard");
    } catch (error) {
      console.error("Failed to create course", error);
      toast({
        title: "Error",
        description: "Failed to create course",
        status: "error",
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
        >
          {isLoading ? "Creating..." : "CREATE COURSE"}
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
