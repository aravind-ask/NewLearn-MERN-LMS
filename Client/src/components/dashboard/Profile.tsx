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

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    photoUrl: user?.photoUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile(formData).unwrap();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
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
      </div>

      {/* Name */}
      <div className="mb-4">
        <Label>Name</Label>
        <Input name="name" value={formData.name} onChange={handleChange} />
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label>Email</Label>
        <Input name="email" value={formData.email} onChange={handleChange} />
      </div>

      {/* Password */}
      <div className="mb-4">
        <Label>New Password</Label>
        <Input name="password" type="password" onChange={handleChange} />
      </div>

      {/* Save Button */}
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Updating..." : "Save Changes"}
      </Button>
    </Card>
  );
};

export default Profile;
