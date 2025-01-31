import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          Welcome to{" "}
          <span className="text-blue-600 dark:text-blue-400">Your LMS</span>
        </h1>
        <p className="text-lg text-black mt-3">
          Learn, Explore, and Grow with our powerful learning management system.
        </p>
      </motion.div>

      {/* Banner Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden shadow-lg rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600"
            alt="Banner"
            className="w-full h-64 object-cover"
          />
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold">
              Start Your Learning Journey
            </h2>
            <p className="text-gray-600 mt-2">
              Discover top courses, interact with experienced instructors, and
              achieve your learning goals with ease.
            </p>
            <div className="flex justify-center mt-4">
              <Button className="text-lg px-6 py-3">Get Started</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
