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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "../services/api";

const AdminServices: React.FC = () => {
  const { data, isLoading, refetch } = useGetServicesQuery();
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleOpen = (service?: any) => {
    if (service) {
      setEditService(service);
      setForm({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
      });
    } else {
      setEditService(null);
      setForm({ name: "", description: "", duration: 30, price: 0 });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditService(null);
  };

 /**
  * The handleChange function updates the form state with the value of the input field that triggered
  * the change event.
  * @param e - The parameter `e` in the `handleChange` function is of type
  * `React.ChangeEvent<HTMLInputElement>`. This means it is an event object that is triggered when the
  * value of an input element changes in a React component.
  */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 /**
  * The `handleSubmit` function in TypeScript React handles the submission of a form, either updating
  * or creating a service, and then refetches data and closes a modal.
  */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editService) {
        await updateService({ id: editService._id, ...form });
      } else {
        await createService(form);
      }
      refetch();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * The function `handleDelete` asynchronously deletes a resource by its ID, triggers a refetch, and
   * manages loading state.
   * @param {string} id - The `id` parameter in the `handleDelete` function is a string that represents
   * the unique identifier of the item that needs to be deleted.
   */
  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteService(id);
    refetch();
    setLoading(false);
  };

 /* This portion of code in the `AdminServices` component is responsible for rendering the UI elements
 related to managing services. Here's a breakdown of what it does: */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Services
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Service
      </Button>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No services found.
                  </TableCell>
                </TableRow>
              )}
              {data?.data?.map((service: any) => (
                <TableRow key={service._id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(service)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>
          {editService ? "Edit Service" : "Add Service"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} variant="contained">
            {editService ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminServices;
