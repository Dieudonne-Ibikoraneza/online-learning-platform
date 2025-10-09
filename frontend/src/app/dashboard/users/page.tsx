// app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Mail,
  User,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminAPI } from "@/lib/api";
import { User as UserType } from "@/types";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(
        users.map((user) => (user._id === userId ? { ...user, role } : user))
      );
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const toggleUserActive = async (userId: string) => {
    try {
      await adminAPI.toggleUserActive(userId);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isActive: !user.isActive } : user
        )
      );
      toast.success("User status updated successfully");
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      student: "default",
      instructor: "secondary",
      admin: "destructive",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>
    );
  };

  const getStatusBadge = (user: UserType) => {
    if (user.deletedAt) {
      return (
        <Badge variant="outline" className="text-destructive">
          Deleted
        </Badge>
      );
    }
    return user.isActive ? (
      <Badge variant="outline" className="text-green-600">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-yellow-600">
        Inactive
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage platform users and permissions
          </p>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage platform users and permissions
          </p>
        </div>
        <Button>Export Users</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar?.url} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user)}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user._id, "student")}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Set as Student
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user._id, "instructor")}
                        className="flex items-center gap-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        Set as Instructor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user._id, "admin")}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleUserActive(user._id)}
                        className="flex items-center gap-2"
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            There are no users registered on the platform yet.
          </p>
        </div>
      )}
    </div>
  );
}
