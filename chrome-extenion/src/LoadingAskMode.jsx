
import { motion } from "framer-motion";

const LoadingAskMode = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      
      <motion.div
        className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      
      <motion.p
        className="mt-4 text-gray-700 text-sm font-medium"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Initializing Ask Mode... connecting with the model
      </motion.p>
    </div>
  );
};

export default LoadingAskMode;
