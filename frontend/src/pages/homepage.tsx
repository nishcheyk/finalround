import { Box, Typography } from "@mui/material";

import { CardCarousel } from "../components/ui/card-carousel";
const images = [
  { src: "/card/1.png", alt: "Image 1" },
  { src: "/card/3.png", alt: "Image 2" },
  { src: "/card/4.png", alt: "Image 3" },
];
import ManualRefreshButton from "../components/ManualRefreshButton";
const Home = () => {
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
    </>
  );
};

export default Home;
