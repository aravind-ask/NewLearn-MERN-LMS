import {
  useApplyForInstructorMutation,
  useGetInstructorApplicationQuery,
} from "@/redux/services/instructorApi";
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
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type InstructorFormData = {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  skills: string;
  bio: string;
  linkedinProfile?: string;
  profilePicture?: string;
  certificates: string[];
};

const InstructorRegistration = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [applyForInstructor, { isLoading }] = useApplyForInstructorMutation();
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InstructorFormData>();
  const { data: application, isLoading: isApplicationLoading } =
    useGetInstructorApplicationQuery();

  useEffect(() => {
    if (user) {
      setValue("fullName", user.name);
      setValue("email", user.email);
    }
    if (application?.data) {
      if (application.data.status === "approved") {
        navigate("/instructor/dashboard");
      } else if (application.data.status === "rejected") {
        setRejectionReason(application.data.rejectionReason);
        setIsModalOpen(true);
      }
    }
  }, [user, setValue, navigate, application]);

  const validateForm = (data: InstructorFormData) => {
    const errors: Record<string, string> = {};

    if (!data.fullName || data.fullName.length < 3) {
      errors.fullName = "Full name must be at least 3 characters.";
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format.";
    }
    if (!data.phone || data.phone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits.";
    }
    if (!data.qualification || data.qualification.length < 2) {
      errors.qualification = "Qualification is required.";
    }
    if (!data.experience || data.experience < 0) {
      errors.experience = "Experience must be a positive number.";
    }
    if (!data.skills || data.skills.length < 3) {
      errors.skills = "At least one skill is required.";
    }
    if (!data.bio || data.bio.length < 10) {
      errors.bio = "Bio must be at least 10 characters.";
    }
    if (
      data.linkedinProfile &&
      !/^https?:\/\/.+\..+$/.test(data.linkedinProfile)
    ) {
      errors.linkedinProfile = "Enter a valid LinkedIn profile URL.";
    }
    if (certificateFiles.length === 0) {
      errors.certificates = "At least one certificate is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCertificateFiles(files);
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const { url, key } = await getPresignedUrl({
            fileName: file.name,
          }).unwrap();
          await fetch(url, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          return key;
        })
      );
      setValue("certificates", uploadedUrls);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const { url, key } = await getPresignedUrl({
        fileName: file.name,
      }).unwrap();
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      setValue("profilePicture", key);
    }
  };

  const onSubmit = async (data: InstructorFormData) => {
    if (!validateForm(data)) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        qualification: data.qualification,
        experience: data.experience,
        skills: data.skills,
        bio: data.bio,
        linkedinProfile: data.linkedinProfile,
        profilePicture: data.profilePicture,
        certificates: data.certificates,
      };

      console.log("Payload:", payload);

      const response = await applyForInstructor(payload).unwrap();
      console.log("Backend Response:", response);

      toast.success("Application submitted successfully!");
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("Backend Error:", error); 
      toast.error(error?.data?.message || "Failed to submit application.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  if (isApplicationLoading || isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Apply to Become an Instructor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Profile Picture */}
        <div>
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            id="profilePicture"
          />
          {formErrors.profilePicture && (
            <p className="text-red-500 text-sm">{formErrors.profilePicture}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} placeholder="John Doe" />
          {formErrors.fullName && (
            <p className="text-red-500 text-sm">{formErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="johndoe@example.com"
            disabled={!!user?.email}
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm">{formErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label>Phone Number</Label>
          <Input type="tel" {...register("phone")} placeholder="9876543210" />
          {formErrors.phone && (
            <p className="text-red-500 text-sm">{formErrors.phone}</p>
          )}
        </div>

        {/* Qualification */}
        <div>
          <Label>Qualification</Label>
          <Input
            {...register("qualification")}
            placeholder="Bachelor's in Computer Science"
          />
          {formErrors.qualification && (
            <p className="text-red-500 text-sm">{formErrors.qualification}</p>
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
          {formErrors.experience && (
            <p className="text-red-500 text-sm">{formErrors.experience}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <Label>Skills (comma separated)</Label>
          <Input
            {...register("skills")}
            placeholder="React, TypeScript, Node.js"
          />
          {formErrors.skills && (
            <p className="text-red-500 text-sm">{formErrors.skills}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label>Bio</Label>
          <Textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
          />
          {formErrors.bio && (
            <p className="text-red-500 text-sm">{formErrors.bio}</p>
          )}
        </div>

        {/* LinkedIn Profile */}
        <div>
          <Label>LinkedIn Profile (optional)</Label>
          <Input
            {...register("linkedinProfile")}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {formErrors.linkedinProfile && (
            <p className="text-red-500 text-sm">{formErrors.linkedinProfile}</p>
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
          {formErrors.certificates && (
            <p className="text-red-500 text-sm">{formErrors.certificates}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading || isApplicationLoading}>
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>

      {/* Success Modal */}
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

      {/* Rejection Modal */}
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
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
