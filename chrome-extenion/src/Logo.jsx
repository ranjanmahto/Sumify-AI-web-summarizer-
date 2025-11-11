
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center my-3">
   
      <motion.h1
        className="relative text-4xl font-extrabold text-transparent bg-clip-text 
                   bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 
                   drop-shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <span className="inline-block animate-shimmer bg-linear-to-r from-indigo-400 via-white to-pink-400 bg-size-[200%_100%] bg-clip-text text-transparent">
          Sumify
        </span>
      </motion.h1>

      
      <motion.p
        className="text-xs text-gray-600 mt-1 tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span className="text-purple-600 font-semibold">
          Summarize. Simplify. Smartly.
        </span>
      </motion.p>

      
      <motion.div
        className="h-1 w-20 mt-2 rounded-full bg-linear-to-r from-indigo-400 via-purple-500 to-pink-400 shadow-lg"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.05, 1] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
