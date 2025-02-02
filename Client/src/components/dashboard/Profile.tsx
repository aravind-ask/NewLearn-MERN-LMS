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
      const { url, key } = await getPresignedUrl({ fileName }).unwrap();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setFormData({ ...formData, photoUrl: key });
      setChange(true);
    } catch (error) {
      console.error("Error uploading file", error);
      setErrors({ ...errors, photoUrl: "Error uploading file" });
    }
  };

  const handleSubmit = async () => {
    try {
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

      <div className="flex items-center space-x-4 mb-4">
        <img
          src={formData.photoUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-16 h-16 rounded-full border"
        />
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        {errors.photoUrl && <p className="text-red-500">{errors.photoUrl}</p>}
      </div>

      {/* Name */}
      <div className="mb-4">
        <Label>Name</Label>
        <Input name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label>Email</Label>
        <Input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-red-500">{errors.email}</p>}
      </div>

      {errors.general && <p className="text-red-500">{errors.general}</p>}
      {/* Save Button */}
      <Button onClick={handleSubmit} disabled={isLoading || !change}>
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
      <PasswordChange eMail = {user?.email}/>
    </Card>
  );
};

export default Profile;
