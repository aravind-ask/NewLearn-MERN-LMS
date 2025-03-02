import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useUpdateProfileMutation,
  useGetPresignedUrlMutation,
} from "@/redux/services/authApi";
import { PasswordChange } from "../PasswordChange";
import { Loader2, UploadCloud, Edit, Save } from "lucide-react";
import { format } from "date-fns";

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoUrl: user?.photoUrl || "",
    bio: user?.bio || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    education: user?.education || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

      setFormData({ ...formData, photoUrl: url });
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
      setIsEditing(false);
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
    <div className="max-w-auto mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Profile Settings
      </h2>
      {errors.general && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
          {errors.general}
        </div>
      )}

      {/* Display View */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <img
              src={formData.photoUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-600">Name</Label>
              <p className="text-gray-800 font-medium">{formData.name}</p>
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="text-gray-800 font-medium">{formData.email}</p>
            </div>
            <div>
              <Label className="text-gray-600">Phone Number</Label>
              <p className="text-gray-800 font-medium">
                {formData.phoneNumber}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Date of Birth</Label>
              <p className="text-gray-800 font-medium">
                {formData.dateOfBirth &&
                  format(new Date(formData?.dateOfBirth), "dd/ mm/ yyyy")}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Address</Label>
              <p className="text-gray-800 font-medium">{formData.address}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Education</Label>
              <p className="text-gray-800 font-medium">{formData.education}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Bio</Label>
              <p className="text-gray-800 font-medium">{formData.bio}</p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-between mt-6 ">
            <PasswordChange eMail={user?.email} />
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      )}

      {/* Edit View */}
      {isEditing && (
        <div className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={formData.photoUrl || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => document.getElementById("fileInput")?.click()}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="fileInput"
            />
            {errors.photoUrl && (
              <p className="text-red-500 text-sm mt-2">{errors.photoUrl}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-600">Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>
            <div>
              <Label className="text-gray-600">Phone Number</Label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`mt-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-600">Date of Birth</Label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`mt-1 ${errors.dateOfBirth ? "border-red-500" : ""}`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 ${errors.address ? "border-red-500" : ""}`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Education</Label>
              <Input
                name="education"
                value={formData.education}
                onChange={handleChange}
                className={`mt-1 ${errors.education ? "border-red-500" : ""}`}
              />
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">{errors.education}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Bio</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Save and Cancel Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
