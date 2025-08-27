import React from "react";
import Lottie from "lottie-react";
import { useTheme } from "@mui/material/styles";
import loadingAnimationLight from "../../Sandy Loading.json";
import loadingAnimationDark from "../../BLack.json";

const LottieLoader: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode; // 'light' | 'dark'

  const animationData =
    mode === "dark" ? loadingAnimationDark : loadingAnimationLight;

  return (
    <div
      style={{
        width: 300,
        height: 300,
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "5vh",
        backgroundColor: mode === "dark" ? "#121212" : "#f0f0f0",
        borderRadius: 12,
        boxShadow:
          mode === "dark"
            ? "0 4px 12px rgba(255,255,255,0.1)"
            : "0 4px 12px rgba(0,0,0,0.1)",
        padding: 20,
      }}
      aria-label="Loading animation"
      role="img"
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
        aria-hidden="true"
      />
    </div>
  );
};

export default LottieLoader;
