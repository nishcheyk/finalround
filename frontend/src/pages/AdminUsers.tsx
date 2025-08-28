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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "../services/api";

const ROLES = ["user", "admin", "staff"];

const AdminUsers: React.FC = () => {
  const { data, isLoading, refetch } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: updating }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  // Helper: is this user the last admin?
  const isLastAdmin = (userId: string) => {
    return adminUsers.length === 1 && adminUsers[0]._id === userId;
  };

  const handleRoleChange = async (id: string, role: string) => {
    // Prevent demoting last admin
    if (
      adminUsers.length === 1 &&
      adminUsers[0]._id === id &&
      role !== "admin"
    ) {
      alert("You cannot demote the last admin.");
      return;
    }
    await updateUserRole({ id, role });
    refetch();
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      await deleteUser(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      refetch();
    }
  };

  // Separate users by role
  const staffUsers = data?.users?.filter((u: any) => u.role === "staff") || [];
  const customerUsers =
    data?.users?.filter((u: any) => u.role === "user" || !u.role) || [];
  const adminUsers = data?.users?.filter((u: any) => u.role === "admin") || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management (Admin)
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Admins Table */}
          {adminUsers.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Admins
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminUsers.map((user: any) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role || "user"}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            size="small"
                            disabled={
                              updating ||
                              user._id === "me" ||
                              isLastAdmin(user._id)
                            }
                          >
                            {ROLES.map((role) => (
                              <MenuItem
                                key={role}
                                value={role}
                                disabled={
                                  isLastAdmin(user._id) && role !== "admin"
                                }
                              >
                                {role}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() =>
                              setDeleteDialog({ open: true, id: user._id })
                            }
                            disabled={
                              deleting ||
                              user._id === "me" ||
                              isLastAdmin(user._id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Staff Table */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Staff
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffUsers.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "user"}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        size="small"
                        disabled={updating || user._id === "me"}
                      >
                        {ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setDeleteDialog({ open: true, id: user._id })
                        }
                        disabled={deleting || user._id === "me"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Customers Table */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Customers / Guests
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerUsers.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "user"}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        size="small"
                        disabled={updating || user._id === "me"}
                      >
                        {ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setDeleteDialog({ open: true, id: user._id })
                        }
                        disabled={deleting || user._id === "me"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Delete User</DialogTitle>
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
