import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-r from-teal-50 to-purple-50 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or need assistance? We’re here to help you on your
          learning journey. Reach out to us today!
        </p>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 px-4 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <Mail className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Email Us</h3>
            <p className="text-gray-600 mb-2">
              Drop us a line, and we’ll get back to you soon.
            </p>
            <a
              href="mailto:support@newlearn.com"
              className="text-teal-600 hover:underline"
            >
              support@newlearn.com
            </a>
          </div>
          <div className="flex flex-col items-center text-center">
            <Phone className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Call Us</h3>
            <p className="text-gray-600 mb-2">
              Speak with our team directly for immediate support.
            </p>
            <a href="tel:+1234567890" className="text-teal-600 hover:underline">
              +1 (234) 567-890
            </a>
          </div>
          <div className="flex flex-col items-center text-center">
            <MapPin className="h-12 w-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Visit Us</h3>
            <p className="text-gray-600">
              123 Learning Lane, Education City, 45678
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 px-4 lg:px-8 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Send Us a Message
          </h2>
          <form className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Your Email"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Your Message"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white font-semibold py-3 rounded-full"
            >
              Send Message
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
