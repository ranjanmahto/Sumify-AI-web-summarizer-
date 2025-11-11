
import { motion } from "framer-motion";

const LoadingSummary = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      {/* Animated circular loader */}
      <motion.div
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

    
      <motion.p
        className="mt-4 text-gray-700 text-sm font-medium"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Generating summary, please wait...
      </motion.p>
    </div>
  );
};

export default LoadingSummary;
