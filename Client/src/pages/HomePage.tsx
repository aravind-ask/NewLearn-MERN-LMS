import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import banner from "@/assets/images/banner-img.png";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi"; // Import the query

export default function Homepage() {
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    //   {/* Hero Section */}
    //   <motion.div
    //     initial={{ opacity: 0, y: -20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.8 }}
    //     className="text-center mb-10"
    //   >
    //     <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
    //       Welcome to{" "}
    //       <span className="text-blue-600 dark:text-blue-400">Your LMS</span>
    //     </h1>
    //     <p className="text-lg text-black mt-3">
    //       Learn, Explore, and Grow with our powerful learning management system.
    //     </p>
    //   </motion.div>

    //   {/* Banner Section */}
    //   <motion.div
    //     initial={{ opacity: 0, scale: 0.9 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 1 }}
    //     className="w-full max-w-4xl"
    //   >
    //     <Card className="overflow-hidden shadow-lg rounded-2xl">
    //       <img
    //         src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600"
    //         alt="Banner"
    //         className="w-full h-64 object-cover"
    //       />
    //       <CardContent className="p-6">
    //         <h2 className="text-2xl font-semibold">
    //           Start Your Learning Journey
    //         </h2>
    //         <p className="text-gray-600 mt-2">
    //           Discover top courses, interact with experienced instructors, and
    //           achieve your learning goals with ease.
    //         </p>
    //         <div className="flex justify-center mt-4">
    //           <Button className="text-lg px-6 py-3">Get Started</Button>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </motion.div>
    // </div>
    <div className="min-h-screen bg-white">
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4 lg:text-5xl">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">Your LMS</span>
          </h1>
          <p className="text-xl text-gray-700 mt-3">
            Welcome students! We are excited to have you on board. Dive into our
            extensive library of courses and start your learning journey today.
          </p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <img
            src={banner}
            alt="banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categoriesData?.data.map((categoryItem) => (
            <Button
              className="justify-start"
              variant="outline"
              key={categoryItem._id}
            >
              {categoryItem.name}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
