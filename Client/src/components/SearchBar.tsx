import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = debounce(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        navigate(`/all-courses?search=${encodeURIComponent(searchQuery)}`);
      }
    },
    500,
    { leading: true }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        value={query}
        onChange={handleInputChange}
        placeholder="Search courses..."
        className="pl-10 py-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-full w-full"
        aria-label="Search courses"
      />
    </div>
  );
}
