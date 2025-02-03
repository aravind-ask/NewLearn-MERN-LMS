import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useUpdateProfileMutation,
  useGetPresignedUrlMutation,
} from "@/redux/services/authApi";
import { PasswordChange } from "../PasswordChange";

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoUrl: user?.photoUrl || "",
  });
  const [change, setChange] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChange(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setFormData({ ...formData, photoUrl: key });
      setChange(true);
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading file", error);
      setErrors({ ...errors, photoUrl: "Error uploading file" });
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name) {
        newErrors.name = "Name is required";
      }
      if (!formData.email) {
        newErrors.email = "Email is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      await updateProfile(formData).unwrap();
      alert("Profile updated successfully!");
      setChange(false);
    } catch (error) {
      console.error("Update failed", error);
      if (error?.data && error.data?.errors) {
        setErrors(error?.data?.errors);
      } else {
        setErrors({ general: "Error updating profile" });
      }
      alert("Profile update failed");
    }
  };

  return (
    <Card className="p-6 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
      {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}

      <div className="flex items-center justify-center space-x-4 mb-4 relative">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <div className="relative">
          <img
            src={formData.photoUrl || "/default-avatar.png"}
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
        {errors.photoUrl && <p className="text-red-500">{errors.photoUrl}</p>}
      </div>

      {/* Name */}
      <div className="mb-4">
        <Label>Name</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label>Email</Label>
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}
      </div>

      {/* Save Button */}
      <div className="flex justify-between">
        <PasswordChange eMail={user?.email} />
        <Button onClick={handleSubmit} disabled={isLoading || !change}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </Card>
  );
};

export default Profile;
