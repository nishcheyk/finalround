import { Box, Typography } from "@mui/material";
import { CardCarousel } from "../components/ui/card-carousel";
import ManualRefreshButton from "../components/ManualRefreshButton";
import { withUserAccess } from "../components/hocs";
import MyAppointmentsPage from "./MyAppointmentsPage";
import AppointmentBookingPage from "./AppointmentBookingPage";

const images = [
  { src: "/card/1.png", alt: "Image 1" },
  { src: "/card/3.png", alt: "Image 2" },
  { src: "/card/4.png", alt: "Image 3" },
];

const HomeComponent = () => {
  return (
    <>
      <div className="pt-40">
        <CardCarousel
          images={images}
          autoplayDelay={2000}
          showPagination={true}
          showNavigation={true}
        />
      </div>
      <Box>
        <Typography textAlign="center" m={10} variant="h6">
          Homepageeeee
        </Typography>
      </Box>
      <ManualRefreshButton />
      <Box sx={{ mt: 6 }}>
        <AppointmentBookingPage />
      </Box>
      <Box sx={{ mt: 6 }}>
        <MyAppointmentsPage />
      </Box>
    </>
  );
};

// Apply withUserAccess HOC to ensure only authenticated users can access
const Home = withUserAccess(HomeComponent);

export default Home;
