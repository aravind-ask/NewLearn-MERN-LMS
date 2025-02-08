import {
  useApplyForInstructorMutation,
  useGetInstructorApplicationQuery,
} from "@/redux/services/instructorApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const instructorSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Invalid email format."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  qualification: z.string().min(2, "Qualification is required."),
  experience: z.number().min(0, "Experience must be a positive number."),
  skills: z.string().min(3, "At least one skill is required."),
  bio: z.string().min(10, "Bio must be at least 10 characters."),
  linkedinProfile: z
    .string()
    .url("Enter a valid LinkedIn profile URL.")
    .optional(),
  profilePicture: z.string().optional(),
  certificates: z
    .array(z.string().url("Invalid certificate URL"))
    .min(1, "At least one certificate is required."),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

const InstructorRegistration = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [applyForInstructor, { isLoading }] = useApplyForInstructorMutation();
  const [certificateFiles, setCertificateFiles] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | string | null>(
    null
  );
  const [getPresignedUrl, { isLoading: isPresigning }] =
    useGetPresignedUrlMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // const { data, isError, refetch } = useGetInstructorApplicationQuery(user?.id);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
  });
  const { data: application, isLoading: isApplicationLoading } =
    useGetInstructorApplicationQuery();

  useEffect(() => {
    if (user) {
      setValue("fullName", user.name);
      setValue("email", user.email);
      setProfilePicture(user.photoUrl);
    }
    if (application?.data) {
      if (application.data.status === "approved") {
        navigate("/instructor/dashboard");
      } else if (application.data.status === "rejected") {
        setRejectionReason(application.data.rejectionReason);
        setIsResModalOpen(true);
      }
    }
  }, [user, setValue, navigate, application]);

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const { url, key } = await getPresignedUrl({
          fileName: file.name,
        }).unwrap();
        console.log("File", url, key);
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        uploadedUrls.push(key);
      }
      console.log("Uploaded URLs", uploadedUrls);
      setValue("certificates", uploadedUrls);
      console.log("Uploaded Certificates", [
        ...certificateFiles,
        ...uploadedUrls,
      ]);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // setIsUploading(true);
    // if (e.target.files?.[0]) {
    //   const file = e.target.files[0];
    //   const uploadResult = await uploadToS3(file);
    //   setProfilePicture(uploadResult);
    //   setIsUploading(false);
    // }
  };

  const onSubmit = async (data: InstructorFormData) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("qualification", data.qualification);
      formData.append("experience", String(data.experience));
      formData.append("skills", data.skills);
      formData.append("bio", data.bio);
      if (data.linkedinProfile)
        formData.append("linkedinProfile", data.linkedinProfile);

      if (profilePicture) formData.append("profilePicture", profilePicture);
      console.log("Certificates", certificateFiles);
      data.certificates.forEach((file, index) => {
        formData.append(`certificates[${index}]`, file);
      });
      await applyForInstructor(formData).unwrap();
      toast.success("Application submitted successfully!");
      toast.success("Application submitted successfully!");
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit application.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  if (isApplicationLoading || isLoading || isPresigning || isUploading) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Apply to Become an Instructor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <div className="flex items-center justify-center space-x-4 mb-4 relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              style={{ display: "none" }}
              id="profilePicture"
            />
            <div className="relative">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full border cursor-pointer"
                onClick={() => document.getElementById("fileInput")?.click()}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {errors.profilePicture && (
              <p className="text-red-500 text-sm">
                {errors.profilePicture.message}
              </p>
            )}
          </div>
        </div>
        {/* Full Name */}
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} placeholder="John Doe" />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="johndoe@example.com"
            disabled={user?.email ? true : false}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label>Phone Number</Label>
          <Input type="tel" {...register("phone")} placeholder="9876543210" />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Qualification */}
        <div>
          <Label>Qualification</Label>
          <Input
            {...register("qualification")}
            placeholder="Bachelor's in Computer Science"
          />
          {errors.qualification && (
            <p className="text-red-500 text-sm">
              {errors.qualification.message}
            </p>
          )}
        </div>

        {/* Experience */}
        <div>
          <Label>Years of Experience</Label>
          <Input
            type="number"
            {...register("experience", { valueAsNumber: true })}
            placeholder="3"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience.message}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <Label>Skills (comma separated)</Label>
          <Input
            {...register("skills")}
            placeholder="React, TypeScript, Node.js"
          />
          {errors.skills && (
            <p className="text-red-500 text-sm">{errors.skills.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label>Bio</Label>
          <Textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
          />
          {errors.bio && (
            <p className="text-red-500 text-sm">{errors.bio.message}</p>
          )}
        </div>

        {/* LinkedIn Profile */}
        <div>
          <Label>LinkedIn Profile (optional)</Label>
          <Input
            {...register("linkedinProfile")}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {errors.linkedinProfile && (
            <p className="text-red-500 text-sm">
              {errors.linkedinProfile.message}
            </p>
          )}
        </div>
        {/* Certificates Upload */}
        <div>
          <Label>Upload Certificates</Label>
          <Input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleCertificateUpload}
          />
          {errors.certificates && (
            <p className="text-red-500 text-sm">
              {errors.certificates.message}
            </p>
          )}
        </div>
        {error && <p className="text-red-500">{error}</p>}

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="text-center bg-white">
          <DialogHeader>
            <DialogTitle>
              <AiOutlineCheckCircle className="text-green-500 w-8 h-8 inline-block mr-2" />
              Application Submitted
            </DialogTitle>
          </DialogHeader>
          <p>Your application has been submitted successfully!</p>
          <DialogFooter>
            <Button onClick={handleCloseModal}>Go to Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isResModalOpen}
        onOpenChange={() => setIsResModalOpen(false)}
      >
        <DialogContent className="text-center bg-white">
          <DialogHeader>
            <DialogTitle>Application {application?.data?.status}</DialogTitle>
          </DialogHeader>
          {application?.data?.status === "rejected" ? (
            <>
              <p>
                Your application has been rejected due to the following reasons.
              </p>
              <p>{rejectionReason}</p>
            </>
          ) : (
            <p>
              Your application is under review. You will be notified once it is
              approved.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorRegistration;
