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

interface User {
  id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
}

const users: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "student",
  },
  { id: "2", name: "John Doe", email: "john@example.com", role: "instructor" },
  { id: "3", name: "Mary Smith", email: "mary@example.com", role: "student" },
];

export default function Users() {
  const handleEdit = (userId: string) => {
    console.log(`Editing user ${userId}`);
  };

  const handleBlock = (userId: string) => {
    console.log(`Blocking user ${userId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
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
                <Button variant="outline" onClick={() => handleEdit(user.id)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleBlock(user.id)}
                >
                  Block
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
