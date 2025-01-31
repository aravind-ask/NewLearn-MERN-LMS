import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { useGoogleAuthMutation } from "../redux/services/authApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function GoogleAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("No credentials received from Google");
      return;
    }

    try {
      const result = await googleAuth({ token: response.credential }).unwrap();

      dispatch(
        setCredentials({
          user: {
            id: result.data.user.id,
            name: result.data.user.name,
            email: result.data.user.email,
            role: result.data.user.role as "student" | "instructor" | "admin",
            photoUrl: result.data.user.photoUrl,
          },
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );

      toast.success("Successfully logged in with Google!");
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { message?: string } };
        toast.error(errorData.data?.message || "Failed to login with Google");
      } else {
        toast.error("Failed to login with Google");
      }
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    toast.error("Google login failed. Please try again.");
  };

  return (
    <div className="flex justify-center w-full">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full mt-2">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      )}
    </div>
  );
}
