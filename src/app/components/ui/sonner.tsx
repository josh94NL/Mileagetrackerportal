"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#151524",
          "--normal-text": "#f0f0f5",
          "--normal-border": "rgba(255, 255, 255, 0.08)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
