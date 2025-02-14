import CourseLandingPage from "@/components/Instructor/Add-New-Course/CourseLandingPage";
import CourseSettingsPage from "@/components/Instructor/Add-New-Course/CourseSettingsPage";
import Curriculum from "@/components/Instructor/Add-New-Course/Curriculum";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const AddNewCourse = () => {
  const { courseCurriculumFormData, courseLandingFormData } = useSelector(
    (state: RootState) => state.instructor
  );

  const handleCreateCourse = () => {
    console.log("CreateCourse");
    console.log("courseCurriculumFormData", courseCurriculumFormData);
    console.log("courseLandingFormData", courseLandingFormData);
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">Create a Course</h1>
        <Button
          className="text-sm tracking-wider font-bold px-8"
          onClick={handleCreateCourse}
        >
          CREATE COURSE
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
