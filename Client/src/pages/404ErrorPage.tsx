import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* 404 Text with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="text-9xl font-bold text-gray-900 mb-4"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-2xl text-gray-700 mb-8"
        >
          Oops! The page you're looking for doesn't exist.
        </motion.p>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <Button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Go Back Home
        </Button>
      </motion.div>

      {/* Optional: Subtle Background Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse -ml-64" />
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
