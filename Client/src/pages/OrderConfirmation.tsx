import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-3xl font-bold mb-4">Enrollment Successfull</h1>
      <p className="text-lg text-gray-600 mb-8">
        You have successfully enrolled in the course. Start Learning, All the
        best!
      </p>
      <Button onClick={() => navigate("/profile/my-courses")}>
        Go to Enrolled Courses
      </Button>
    </div>
  );
};
