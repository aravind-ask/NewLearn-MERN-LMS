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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     navigate(`/courses?search=${encodeURIComponent(query)}`);
  //   }
  // };

  return (
    <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
          className="pl-10 py-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-full"
          aria-label="Search"
        />
        <button
          type="submit"
          className="absolute -right-20 -top-1 mt-2 mr-2 p-1 rounded-full text-gray-500 hover:text-gray-700"
          aria-label="Perform search"
        >
        </button>
      </div>
    </div>
  );
}
