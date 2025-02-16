import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Debounced search handler
  const handleSearch = debounce((searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  }, 500); // 500ms debounce delay

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value); // Trigger debounced search
  };

  // Handle search button click
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/courses?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-xs">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
          className="w-100 py-2 h-10 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search"
        />
        <button
          type="submit"
          className="absolute -right-20 -top-1 mt-2 mr-2 p-1 rounded-full text-gray-500 hover:text-gray-700"
          aria-label="Perform search"
        >
          <Search className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
