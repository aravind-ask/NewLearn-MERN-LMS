import { useState } from "react";
import {
  useBlockUserMutation,
  useGetUsersQuery,
} from "@/redux/services/userApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
  profilePic?: string;
  isBlocked: boolean;
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const limit = 2;
  const [blockUser] = useBlockUserMutation();
  const { data, isLoading, error, refetch } = useGetUsersQuery({ page, limit });
  console.log(data?.data.users);

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    await blockUser({ userId, isBlocked });
    refetch();
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error)
    return <p className="text-center text-red-500">Failed to load users</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <img
                  src={user.photoUrl || "/default-avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "instructor" ? "default" : "outline"}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <div className="flex justify-end gap-5">
                  <Button variant="outline">Edit</Button>
                  <Button
                    variant={user.blocked ? "outline" : "destructive"}
                    onClick={() => handleBlock(user._id, !user.isBlocked)}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination className="mt-4 cursor-pointer">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={page === 1 ? "disabled-class" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            Page {page} of {data?.data?.totalPages}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, data?.data?.totalPages))
              }
              className={page === data?.data?.totalPages ? "disabled-class" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
