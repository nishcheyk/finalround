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
  Tooltip,
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
  const [formErrors, setFormErrors] = useState({
    name: "",
    duration: "",
    price: "",
  });

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
    setFormErrors({ name: "", duration: "", price: "" });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditService(null);
    setFormErrors({ name: "", duration: "", price: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate fields inline
    let error = "";
    if (name === "name" && !value.trim()) {
      error = "Name is required";
    }
    if (name === "duration" && (Number(value) <= 0 || isNaN(Number(value)))) {
      error = "Duration must be a positive number";
    }
    if (name === "price" && (Number(value) < 0 || isNaN(Number(value)))) {
      error = "Price must be zero or positive number";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    setForm((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const isFormValid = () =>
    !!form.name.trim() &&
    !formErrors.name &&
    !formErrors.duration &&
    !formErrors.price;

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      if (editService) {
        await updateService({ id: editService._id, ...form });
      } else {
        await createService(form);
      }
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteService(id);
      refetch();
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 4, p: 10, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Manage Services
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Service
      </Button>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Service management table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((service: any) => (
                  <TableRow key={service._id} hover>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>${service.price.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Service">
                        <IconButton
                          onClick={() => handleOpen(service)}
                          aria-label={`Edit ${service.name}`}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Service">
                        <IconButton
                          onClick={() => handleDelete(service._id)}
                          aria-label={`Delete ${service.name}`}
                          color="error"
                          size="small"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editService ? "Edit Service" : "Add Service"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            autoFocus
          />
          <TextField
            margin="normal"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            margin="normal"
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            fullWidth
            required
            error={!!formErrors.duration}
            helperText={formErrors.duration}
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="normal"
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
            error={!!formErrors.price}
            helperText={formErrors.price}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editService ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminServices;
