import { useState } from "react";
import { useGetUsersQuery } from "@/redux/services/userApi";
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
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const limit = 5; // Users per page

  const { data, isLoading, error } = useGetUsersQuery({ page, limit });
  console.log(data?.data.users);

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
            <TableRow key={user.id}>
              <TableCell>
                <img
                  src={user.profilePic || "/default-avatar.png"}
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
                <Button variant="outline">Edit</Button>
                <Button variant="destructive">Block</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            />
          </PaginationItem>
          <PaginationItem>
            Page {page} of {data?.totalPages}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, data?.totalPages))
              }
              disabled={page === data?.totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
