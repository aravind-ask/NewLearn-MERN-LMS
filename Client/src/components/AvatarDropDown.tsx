import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/services/authApi";

export function AvatarDropdown() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (!user) {
        throw new Error('No user found');
      }
      await logoutMutation({ userId: user.id });
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <Avatar>
            <AvatarImage
              src={user.photoUrl || "https://github.com/shadcn.png"}
              alt={user.name}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="flex items-center space-x-4 p-4">
          <Avatar>
            <AvatarImage
              src={user.photoUrl || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{user.name}</h4>
            <p className="text-sm text-gray-500">
              {user.role === "admin" ? "Admin" : "Student"}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 mt-2">
          <Link to="/profile">
            <Button variant="outline" className="w-full">
              Profile
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
