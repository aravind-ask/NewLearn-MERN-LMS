import {
  useApplyForInstructorMutation,
  useGetInstructorApplicationQuery,
  useUpdateInstructorApplicationMutation,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

type InstructorFormData = {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  skills: string;
  bio: string;
  linkedinProfile?: string;
  certificates: string[];
};

const InstructorRegistration = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [applyForInstructor, { isLoading: isApplying }] =
    useApplyForInstructorMutation();
  const [updateInstructorApplication, { isLoading: isUpdating }] =
    useUpdateInstructorApplicationMutation();
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setStatusIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InstructorFormData>({
    defaultValues: {
      skills: "",
    },
  });
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
      } else if (
        application.data.status === "rejected" ||
        application.data.status === "pending"
      ) {
        setRejectionReason(application.data.rejectionReason);
        setStatusIsModalOpen(true);
        // Convert skills array to comma-separated string
        const skillsString = Array.isArray(application.data.skills)
          ? application.data.skills.join(", ")
          : application.data.skills || "";
        reset({
          fullName: application.data.fullName,
          email: application.data.email,
          phone: application.data.phone,
          qualification: application.data.qualification,
          experience: application.data.experience,
          skills: skillsString,
          bio: application.data.bio,
          linkedinProfile: application.data.linkedinProfile,
          certificates: application.data.certificates,
        });
      }
    }
  }, [user, setValue, navigate, application, reset]);

  const validateForm = (data: InstructorFormData) => {
    const errors: Record<string, string> = {};
    if (!data.fullName || data.fullName.length < 3)
      errors.fullName = "Full name must be at least 3 characters.";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Invalid email format.";
    if (!data.phone || data.phone.length < 10)
      errors.phone = "Phone number must be at least 10 digits.";
    if (!data.qualification || data.qualification.length < 2)
      errors.qualification = "Qualification is required.";
    if (!data.experience || data.experience < 0)
      errors.experience = "Experience must be a positive number.";
    if (!data.skills || data.skills.trim().length < 3)
      errors.skills = "At least one skill is required.";
    if (!data.bio || data.bio.length < 10)
      errors.bio = "Bio must be at least 10 characters.";
    if (
      data.linkedinProfile &&
      !/^https?:\/\/.+\..+$/.test(data.linkedinProfile)
    )
      errors.linkedinProfile = "Enter a valid LinkedIn profile URL.";
    if (certificateFiles.length === 0 && !data.certificates?.length)
      errors.certificates = "At least one certificate is required.";
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

  const onSubmit = async (data: InstructorFormData) => {
    if (!validateForm(data)) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      // Convert comma-separated skills string to array for backend
      const skillsArray = data.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const payload = {
        ...data,
        skills: skillsArray,
      };

      const isReapplying = application?.data?.status === "rejected";

      if (isReapplying) {
        await updateInstructorApplication({
          applicationId: application?.data?._id,
          data: payload,
        }).unwrap();
        toast.success("Application updated successfully!");
      } else {
        await applyForInstructor(payload).unwrap();
        toast.success("Application submitted successfully!");
      }
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit application.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleReapply = () => {
    setStatusIsModalOpen(false);
  };

  // Prevent modal from closing on outside click or escape key
  const preventModalClose = () => {
    // Do nothing to keep modal open
  };

  if (isApplicationLoading || isApplying || isUpdating) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Apply to Become an Instructor</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} placeholder="John Doe" />
          {formErrors.fullName && (
            <p className="text-red-500 text-sm">{formErrors.fullName}</p>
          )}
        </div>
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
        <div>
          <Label>Phone Number</Label>
          <Input type="tel" {...register("phone")} placeholder="9876543210" />
          {formErrors.phone && (
            <p className="text-red-500 text-sm">{formErrors.phone}</p>
          )}
        </div>
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
        <Button type="submit" disabled={isApplying || isUpdating}>
          {isApplying || isUpdating
            ? "Submitting..."
            : application?.data?.status === "rejected"
            ? "Reapply"
            : "Submit Application"}
        </Button>
      </form>

      <Dialog open={isModalOpen} onOpenChange={preventModalClose}>
        <DialogContent className="text-center bg-white" showCloseButton={false}>
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

      <Dialog open={isStatusModalOpen} onOpenChange={preventModalClose}>
        <DialogContent className="text-center bg-white" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Application {application?.data?.status}</DialogTitle>
          </DialogHeader>
          {application?.data?.status === "rejected" ? (
            <>
              <p>
                Your application has been rejected due to the following reasons:
              </p>
              <p>{rejectionReason}</p>
              <DialogFooter className="gap-4">
                <Button onClick={handleReapply}>Reapply</Button>
                <Button onClick={() => navigate("/")}>Go to Home</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <p>
                Your application is under review. You will be notified once it
                is approved.
              </p>
              <DialogFooter>
                <Button onClick={() => navigate("/")}>Go to Home</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorRegistration;
