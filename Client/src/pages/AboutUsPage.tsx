import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award } from "lucide-react";
import banner from "@/assets/images/about-banner.png"; // Replace with your image path
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between py-16 px-4 lg:px-8 bg-gradient-to-r from-teal-50 to-purple-50">
        <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            About NewLearn
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            NewLearn is a cutting-edge Learning Management System designed to
            empower learners and educators alike. Our mission is to provide
            accessible, high-quality education to unlock your full potential.
          </p>
          <Button
            onClick={() => navigate("/all-courses")}
            className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-full"
          >
            Start Learning
          </Button>
        </div>
        {/* <div className="lg:w-1/2">
          <img
            src={banner}
            alt="About NewLearn"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
          />
        </div> */}
      </section>

      {/* Our Mission Section */}
      <section className="py-12 px-4 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8">
            At NewLearn, we believe education is the key to personal and
            professional growth. We strive to create an inclusive platform where
            knowledge is shared, skills are honed, and dreams are realized.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <BookOpen className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">
                Quality Education
              </h3>
              <p className="text-gray-600">
                Curated courses from industry experts to ensure top-tier
                learning experiences.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Join a vibrant community of learners and educators worldwide.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">
                Achieve Excellence
              </h3>
              <p className="text-gray-600">
                Unlock certifications and skills to stand out in your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-12 px-4 lg:px-8 bg-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Team</h2>
          <p className="text-lg text-gray-600 mb-8">
            Meet the passionate individuals behind NewLearn, dedicated to
            revolutionizing online education.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Member 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://via.placeholder.com/150" // Replace with team member photo
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">John Doe</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            {/* Team Member 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                Jane Smith
              </h3>
              <p className="text-gray-600">Head of Education</p>
            </div>
            {/* Team Member 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">Alex Lee</h3>
              <p className="text-gray-600">Tech Lead</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
