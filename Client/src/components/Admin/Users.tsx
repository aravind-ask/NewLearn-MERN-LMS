// pages/AdminUsers.tsx
import { useState, useEffect } from "react";
import {
  useBlockUserMutation,
  useGetUsersQuery,
} from "@/redux/services/userApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import  default_avatar from "/default-avatar.png";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
  photoUrl?: string;
  isBlocked: boolean;
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    action: "block" | "unblock";
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();


  const limit = 2;
  const [blockUser] = useBlockUserMutation();
  const { data, isLoading, error } = useGetUsersQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  useEffect(() => {
    if (data?.data?.users) {
      setUsers(data.data.users);
    }
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    setSelectedUser({ id: userId, action: isBlocked ? "unblock" : "block" });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    const userId = selectedUser.id;
    const newIsBlocked = selectedUser.action === "block";

    const originalUsers = [...users];
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, isBlocked: newIsBlocked } : user
      )
    );

    try {
      await blockUser({ userId, isBlocked: newIsBlocked }).unwrap();
      toast({
        title: "Success",
        description: `User ${
          newIsBlocked ? "blocked" : "unblocked"
        } successfully.`,
      });
    } catch (err: any) {
      setUsers(originalUsers);
      console.error("Block/Unblock Error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err.data?.message || `Failed to ${selectedUser.action} user.`,
      });
    }

    setShowConfirm(false);
    setSelectedUser(null);
  };

  if (error) {
    return <p className="text-center text-red-500">Failed to load users</p>;
  }

  const columns = [
    {
      header: "Profile",
      accessor: (user: User) => (
        <img
          src={user.photoUrl || default_avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Role",
      accessor: (user: User) => (
        <Badge variant={user.role === "instructor" ? "default" : "outline"}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div className="flex justify-end gap-2">
          <Button
            variant={user.isBlocked ? "outline" : "destructive"}
            onClick={() => handleBlock(user._id, user.isBlocked)}
          >
            {user.isBlocked ? "Unblock" : "Block"}
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users || []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.data?.totalPages}
        onPageChange={setPage}
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {selectedUser?.action === "block" ? "block" : "unblock"} this
              user? This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
