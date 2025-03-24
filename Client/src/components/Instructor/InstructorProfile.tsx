import {
  useGetInstructorDetailsQuery,
  useUpdateInstructorApplicationMutation,
} from "@/redux/services/instructorApi";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Book,
  Briefcase,
  Linkedin,
  Calendar,
  Pencil,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const InstructorProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const instructorId = user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: instructor,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInstructorDetailsQuery(instructorId);
  const [updateInstructor, { isLoading: isUpdating }] =
    useUpdateInstructorApplicationMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    experience: 0,
    qualification: "",
    skills: [],
    linkedinProfile: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (instructor?.data) {
      setFormData({
        fullName: instructor.data.fullName,
        bio: instructor.data.bio,
        experience: instructor.data.experience,
        qualification: instructor.data.qualification,
        skills: instructor.data.skills || [],
        linkedinProfile: instructor.data.linkedinProfile,
        profilePicture: instructor.data.profilePicture || "",
      });
    }
  }, [instructor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(",").map((skill) => skill.trim());
    setFormData((prev) => ({ ...prev, skills: skillsArray }));
  };

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileName = `${user?.id}-${Date.now()}-${file.name}`;

    try {
      setIsUploading(true);
      const { url, key } = await getPresignedUrl({ fileName }).unwrap();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const cleanUrl = url.split("?")[0];
      setFormData((prev) => ({ ...prev, profilePicture: cleanUrl }));
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading file", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateInstructor({
        applicationId: instructor.data._id,
        data: formData,
      }).unwrap();

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
      setIsEditing(false);
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center font-medium">
              Failed to load profile:{" "}
              {error?.data?.message || "Please try again later"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const instructorData = instructor?.data;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={formData.profilePicture || "/default-avatar.png"}
                  alt={instructorData?.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2">
                    <label
                      htmlFor="profilePictureInput"
                      className="cursor-pointer flex items-center gap-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors text-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Change Profile Picture
                    </label>
                    <Input
                      id="profilePictureInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div className="text-white text-center md:text-left">
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="text-3xl font-bold mb-2 text-black"
                  />
                ) : (
                  <h1 className="text-3xl font-bold mb-2">
                    {instructorData?.fullName}
                  </h1>
                )}
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="text-black mt-2 max-w-md"
                  />
                ) : (
                  <p className="text-blue-100 text-lg mb-4 max-w-2xl">
                    {instructorData?.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleSubmit}
                  disabled={isUpdating || isUploading}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
            <div className="flex items-center gap-2 text-white">
              <Briefcase className="w-5 h-5" />
              {isEditing ? (
                <Input
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-20 text-black"
                />
              ) : (
                <span>{instructorData?.experience} Years Experience</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-white">
              <Book className="w-5 h-5" />
              {isEditing ? (
                <Input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="text-black"
                />
              ) : (
                <span>{instructorData?.qualification}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-white">
              <Linkedin className="w-5 h-5" />
              {isEditing ? (
                <Input
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleInputChange}
                  className="text-black"
                />
              ) : (
                <a
                  href={instructorData?.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-200 transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* About Section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">About Me</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {instructorData?.bio || "No bio available"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Expertise</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditing ? (
                <Input
                  value={formData.skills.join(", ")}
                  onChange={handleSkillsChange}
                  placeholder="Enter skills separated by commas"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {instructorData?.skills?.length > 0 ? (
                    instructorData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Certificates */}
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {instructorData?.certificates?.length > 0 ? (
                <div className="space-y-4">
                  {instructorData.certificates.map((certificate, index) => {
                    const certName =
                      certificate
                        .split("/")
                        .pop()
                        ?.split("-")
                        .slice(1)
                        .join("-") || certificate;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {certName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Issued on:{" "}
                            {instructorData.createdAt
                              ? new Date(
                                  instructorData.createdAt
                                ).toLocaleDateString()
                              : "Date not available"}
                          </p>
                          <a
                            href={certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            View Certificate
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center">
                  No certificates available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;
