import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming shadcn/ui Skeleton

const Loading = () => {
  // Animation variants for the spinning loader
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-75">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col items-center justify-center">
        {/* Spinning Loader */}
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="w-16 h-16 border-4 border-t-teal-600 border-gray-300 rounded-full mb-8"
        />

        {/* Skeleton Layout */}
        <div className="w-full space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/3 mx-auto bg-gray-300" />
            <Skeleton className="h-4 w-2/3 mx-auto bg-gray-300" />
          </div>

          {/* Card/List Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-4">
                <Skeleton className="h-48 w-full bg-gray-300 rounded-lg" />
                <Skeleton className="h-6 w-3/4 bg-gray-300" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
