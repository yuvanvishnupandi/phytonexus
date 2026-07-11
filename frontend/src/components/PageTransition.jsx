import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8,
  }
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.25
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full h-full flex flex-col"
    >
      {children}
    </motion.div>
  );
}
