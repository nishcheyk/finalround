import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "../services/api";

const ROLES = ["user", "admin", "staff"];

// Reusable Table for each group
const UserTable = ({
  title,
  users,
  handleRoleChange,
  handleDeleteClick,
  isLastAdmin,
  updating,
  deleting,
}: any) => (
  <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        {title}
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "GREY" }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role || "user"}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    size="small"
                    disabled={
                      updating ||
                      user._id === "me" ||
                      (isLastAdmin && isLastAdmin(user._id))
                    }
                    sx={{ minWidth: 120 }}
                  >
                    {ROLES.map((role) => (
                      <MenuItem
                        key={role}
                        value={role}
                        disabled={
                          isLastAdmin &&
                          isLastAdmin(user._id) &&
                          role !== "admin"
                        }
                      >
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(user._id)}
                    disabled={
                      deleting ||
                      user._id === "me" ||
                      (isLastAdmin && isLastAdmin(user._id))
                    }
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

const AdminUsers: React.FC = () => {
  const { data, isLoading, refetch } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: updating }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const adminUsers = data?.users?.filter((u: any) => u.role === "admin") || [];
  const staffUsers = data?.users?.filter((u: any) => u.role === "staff") || [];
  const customerUsers =
    data?.users?.filter((u: any) => u.role === "user" || !u.role) || [];

  const isLastAdmin = (userId: string) =>
    adminUsers.length === 1 && adminUsers[0]._id === userId;

  const handleRoleChange = async (id: string, role: string) => {
    if (isLastAdmin(id) && role !== "admin") {
      alert("You cannot demote the last admin.");
      return;
    }
    await updateUserRole({ id, role });
    refetch();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      await deleteUser(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      refetch();
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        👥 User Management
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {adminUsers.length > 0 && (
            <UserTable
              title="Admins"
              users={adminUsers}
              handleRoleChange={handleRoleChange}
              handleDeleteClick={handleDeleteClick}
              isLastAdmin={isLastAdmin}
              updating={updating}
              deleting={deleting}
            />
          )}
          <UserTable
            title="Staff"
            users={staffUsers}
            handleRoleChange={handleRoleChange}
            handleDeleteClick={handleDeleteClick}
            updating={updating}
            deleting={deleting}
          />
          <UserTable
            title="Customers / Guests"
            users={customerUsers}
            handleRoleChange={handleRoleChange}
            handleDeleteClick={handleDeleteClick}
            updating={updating}
            deleting={deleting}
          />
        </>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>⚠️ Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
