import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import BookingForm from "../components/BookingForm";
import {
  Cloud,
  Star,
  Favorite,
  FlashOn,
  EmojiEmotions,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

const floatingIcons = [
  { icon: <Cloud />, size: 40, initX: 10, initY: 20, delay: 0 },
  { icon: <Star />, size: 25, initX: 70, initY: 10, delay: 2 },
  { icon: <Favorite />, size: 30, initX: 40, initY: 80, delay: 1 },
  { icon: <FlashOn />, size: 35, initX: 80, initY: 50, delay: 3 },
  { icon: <EmojiEmotions />, size: 28, initX: 25, initY: 60, delay: 4 },
];

const getRandomMovement = () => ({
  x: [0, -10, 10, 0],
  y: [0, 10, -10, 0],
});

const FloatingIcon: React.FC<{
  initX: number;
  initY: number;
  size: number;
  delay: number;
  color: string;
  children: React.ReactNode;
}> = ({ initX, initY, size, delay, color, children }) => {
  const movement = getRandomMovement();

  return (
    <motion.div
      animate={{
        x: movement.x,
        y: movement.y,
        transition: {
          repeat: Infinity,
          duration: 10,
          delay,
          ease: "easeInOut",
        },
      }}
      style={{
        position: "fixed",
        top: `${initY}vh`,
        left: `${initX}vw`,
        fontSize: size,
        color,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedBackground: React.FC<{ blurAmount: number }> = ({
  blurAmount,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        background: `linear-gradient(270deg, #6a11cb 0%, #2575fc 100%)`,
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 15s ease infinite",
        filter: `blur(${blurAmount}px)`,
        transition: "filter 0.3s ease",
        overflow: "hidden",
      }}
    />
  );
};

const BookingPage: React.FC = () => {
  const theme = useTheme();
  const [blur, setBlur] = useState(2);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = () => setBlur((prev) => Math.min(prev + 0.1, 8));
    const handleMouseLeave = () => setBlur(2);

    const reduceBlurSmoothly = () => {
      setBlur((prev) => (prev > 2 ? prev - 0.05 : prev));
      animationFrameId = requestAnimationFrame(reduceBlurSmoothly);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId = requestAnimationFrame(reduceBlurSmoothly);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        p: 2,
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(135deg, #7da2ff 0%, #b9d2ff 100%)" // lighter blue gradient for light mode
            : "linear-gradient(135deg, #1f1c2c 0%, #928DAB 100%)",
        backgroundSize: "600% 600%",
        animation: "gradientAnimation 15s ease infinite",
      }}
    >
      <AnimatedBackground blurAmount={blur} />
      {floatingIcons.map(({ icon, initX, initY, size, delay }, idx) => (
        <FloatingIcon
          key={idx}
          initX={initX}
          initY={initY}
          size={size}
          delay={delay}
          color={
            theme.palette.mode === "light"
              ? "rgba(100, 150, 255, 0.8)" // pastel bluish color for light mode
              : "rgba(200, 200, 255, 0.6)"
          }
        >
          {icon}
        </FloatingIcon>
      ))}
      <BookingForm />
      <style>
        {`
          @keyframes gradientAnimation {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
    </Box>
  );
};

export default BookingPage;
