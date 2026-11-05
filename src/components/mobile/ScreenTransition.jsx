import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* A light horizontal slide when a main screen changes. The transform is cleared
   once the slide lands, so fixed-position children (composers, sheets) keep
   anchoring to the viewport instead of the wrapper. */
export default function ScreenTransition({ routeKey, children }) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
  }, [routeKey]);

  return (
    <motion.div
      key={routeKey}
      /* While the slide runs, this wrapper becomes the containing block for
         full-screen fixed children (the map). Without a height of its own a
         fixed child computes to zero height, so the map measured itself at
         0px and only ever painted a small patch of tiles afterwards. */
      className="min-h-screen"
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
      onAnimationComplete={() => setSettled(true)}
      style={settled ? { transform: "none" } : undefined}
    >
      {children}
    </motion.div>
  );
}