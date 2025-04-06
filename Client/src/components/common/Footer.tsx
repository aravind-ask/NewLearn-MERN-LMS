import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-4 lg:px-8 mt-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
            NewLearn
          </h3>
          <p className="text-sm text-gray-400">
            Empowering lifelong learners with world-class education. Join us to
            unlock your potential and shape your future.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-100">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/all-courses")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Courses
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/profile/my-courses")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                My Learnings
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/about")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/contact")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>
        </div>

        {/* Course Categories */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-100">
            Popular Categories
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() =>
                  navigate("/all-courses?category=67b354b5f628392589d37a5f")
                }
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Web Development
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  navigate("/all-courses?category=67b354c0f628392589d37a62")
                }
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Backend Development
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  navigate("/all-courses?category=67b354cff628392589d37a65")
                }
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Frontend Development
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  navigate("/all-courses?category=67b354d7f628392589d37a68")
                }
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Data Science
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/all-courses")}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                View All
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-100">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-teal-400" />
              <a
                href="mailto:support@newlearn.com"
                className="hover:text-teal-400 transition-colors"
              >
                support@newlearn.com
              </a>
            </li>
            <li className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-teal-400" />
              <a
                href="tel:+1234567890"
                className="hover:text-teal-400 transition-colors"
              >
                +1 (234) 567-890
              </a>
            </li>
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-teal-400 mt-1" />
              <span>
                123 Learning Street,
                <br />
                Education City, EL 45678
              </span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="mt-2 bg-transparent border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-gray-900 transition-all"
            onClick={() => navigate("/contact-us")}
          >
            Get in Touch
          </Button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} NewLearn. All rights reserved.{" "}
          <a
            href="/privacy"
            className="hover:text-teal-400 transition-colors mx-2"
          >
            Privacy Policy
          </a>
          |
          <a
            href="/terms"
            className="hover:text-teal-400 transition-colors mx-2"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
