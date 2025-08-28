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

  const adminUsers = data?.users?.filter((u: any) => u.role === "admin") || [];
  const staffUsers = data?.users?.filter((u: any) => u.role === "staff") || [];
  const customerUsers =
    data?.users?.filter((u: any) => u.role === "user" || !u.role) || [];

  // Helper: is this user the last admin?
  const isLastAdmin = (userId: string) => {
    return adminUsers.length === 1 && adminUsers[0]._id === userId;
  };

 /**
  * The function `handleRoleChange` updates a user's role, but prevents demoting the last admin.
  * @param {string} id - The `id` parameter is a string that represents the unique identifier of a
  * user.
  * @param {string} role - The `role` parameter in the `handleRoleChange` function represents the new
  * role that you want to assign to a user with the specified `id`. It is a string value that can be
  * "admin" or any other role that you want to assign to the user.
  * @returns If the condition `isLastAdmin(id) && role !== "admin"` is met, an alert message "You
  * cannot demote the last admin." will be displayed and the function will return without further
  * execution. Otherwise, the function will update the user role using `updateUserRole({ id, role })`
  * and then call `refetch()`.
  */
  const handleRoleChange = async (id: string, role: string) => {
    if (isLastAdmin(id) && role !== "admin") {
      alert("You cannot demote the last admin.");
      return;
    }
    await updateUserRole({ id, role });
    refetch();
  };

 /**
  * The function `handleDelete` deletes a user with a specific ID, closes a delete dialog, and then
  * refetches data.
  */
  const handleDelete = async () => {
    if (deleteDialog.id) {
      await deleteUser(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      refetch();
    }
  };

/* The above code is a TypeScript React component that displays a user management interface for an
admin. It includes tables for displaying and managing different types of users - admins, staff, and
customers/guests. */
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        User Management (Admin)
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Admins Table */}
          {adminUsers.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Admins
              </Typography>
              <TableContainer component={Paper} sx={{ width: "100%" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="center">Actions</TableCell>
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
                            sx={{ minWidth: 100 }}
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
                        <TableCell align="center">
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
            </Box>
          )}

          {/* Staff Table */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Staff
            </Typography>
            <TableContainer component={Paper} sx={{ width: "100%" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
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
                          sx={{ minWidth: 100 }}
                        >
                          {ROLES.map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: user._id })
                          }
                          disabled={deleting || user._id === "me"}
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
          </Box>

          {/* Customers Table */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Customers / Guests
            </Typography>
            <TableContainer component={Paper} sx={{ width: "100%" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
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
                          sx={{ minWidth: 100 }}
                        >
                          {ROLES.map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: user._id })
                          }
                          disabled={deleting || user._id === "me"}
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
          </Box>
        </>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
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
