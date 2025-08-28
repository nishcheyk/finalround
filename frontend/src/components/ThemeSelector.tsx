import React, { memo, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PopoverForm } from "./ui/PopOverfrom";
import styles from "../styles/ThemeStyle.module.css";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setMode } from "../store/themeSlice";
import { ThemeMode } from "../store/themeSlice";
/* This code defines a functional component called `StatsCards` in TypeScript React. The component
takes in props of type `StatsCardsProps`, which includes an optional `stats` object with `total`,
`global`, and `today` number properties, and a `loading` boolean property. */

export function ColorThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();

  const themes: ThemeMode[] = ["light", "dark", "system"];

  const changeTheme = (newMode: ThemeMode) => {
    dispatch(setMode(newMode));
    setOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={styles.button}
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <span>Choose theme</span>
        <motion.span
          className={`${styles.icon} ${open ? styles.iconOpen : ""}`}
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
/**
 * The `SignupForm` function in TypeScript React handles user registration with form validation and
 * submission logic.
 * @returns The `SignupForm` component is being returned. It is a functional component that renders a
 * signup form with input fields for name, email, phone number, password, and confirm password. The
 * form includes validation for each input field and a submit button for signing up a new user. The
 * form also includes a link to navigate to the login page if the user already has an account.
 */
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-60 rounded-xl bg-muted shadow-lg outline-none z-50"
            style={{ width: "200px", height: "195px" }}
          >
            <PopoverForm
              showSuccess={false}
              title="Choose theme"
              open={open}
              setOpen={setOpen}
              width="200px"
              height="195px"
              showCloseButton={true}
              openChild={
                <div className="p-2">
                  <h3 className="text-sm tracking-tight text-muted-foreground">
                    Theme
                  </h3>
                  <div className="pt-2 space-y-2">
                    {themes.map((t) => (
                      <button
                        key={t}
                        onClick={() => changeTheme(t)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                          mode === t
                            ? "bg-primary text-white"
                            : "bg-white text-black hover:bg-gray-100 dark:bg-transparent dark:text-white dark:hover:bg-gray-800"
                        }`}
                        aria-label={`Switch to ${t} theme`}
                      >
                        {t === "light" && <Sun className="mr-2 h-4 w-4" />}
                        {t === "dark" && <Moon className="mr-2 h-4 w-4" />}
                        {t === "system" && <Monitor className="mr-2 h-4 w-4" />}
                        <span className="capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Keep the memoized version for backward compatibility
const ThemeSelector = memo(ColorThemeSwitcher);
ThemeSelector.displayName = "ThemeSelector";

export { ThemeSelector };
