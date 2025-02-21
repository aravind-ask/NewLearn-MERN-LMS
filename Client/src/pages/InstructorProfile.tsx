import { useParams, useNavigate } from "react-router-dom";
import { useGetInstructorDetailsQuery } from "@/redux/services/instructorApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Book,
  Users,
  Globe,
  Clock,
  Briefcase,
  Linkedin,
} from "lucide-react";

const InstructorProfile = () => {
    const navigate = useNavigate();
  const { instructorId } = useParams();
  const {
    data: instructor,
    isLoading,
    isError,
    error,
  } = useGetInstructorDetailsQuery(instructorId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-600 text-center">
          Failed to load instructor details: {error?.data?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Instructor Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={instructor?.data?.profilePicture || "/default-avatar.png"}
            alt={instructor?.data?.fullName}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{instructor?.data?.fullName}</h1>
            <p className="text-lg mt-2">{instructor?.data?.bio}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <span className="flex items-center">
                <Briefcase className="w-5 h-5 mr-1" />
                {instructor?.data?.experience} years of experience
              </span>
              <span className="flex items-center">
                <Book className="w-5 h-5 mr-1" />
                {instructor?.data?.qualification}
              </span>
              <a
                href={instructor?.data?.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-300"
              >
                <Linkedin className="w-5 h-5 mr-1" />
                LinkedIn
              </a>
            </div>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 cursor-pointer fixed right-40  hover:bg-black hover:text-white hover:font-bold"
          >
            Go Back
          </Button>
        </div>
      </div>

      {/* Instructor Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Bio and Skills */}
        <div className="col-span-1">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{instructor?.data?.bio}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {instructor?.data?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Certificates */}
        <div className="col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {instructor?.data?.certificates?.map((certificate, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold">{certificate.name}</h3>
                  <p className="text-sm text-gray-600">
                    Issued by: {certificate.issuer}
                  </p>
                  <p className="text-sm text-gray-600">
                    Issued on: {new Date(certificate.issuedDate).toDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;
