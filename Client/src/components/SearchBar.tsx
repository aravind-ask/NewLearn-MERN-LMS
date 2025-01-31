import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };
  return (
    <div className="relative w-full max-w-xs">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-100 py-2 h-10 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Search"
      />
      <Button
        type="submit"
        className="absolute -right-20 -top-2 mt-2 mr-2 p-3 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Perform search"
      >
        <Search onClick={handleSubmit} className="w-5 h-5" />
      </Button>
    </div>
  );
}
