import React from "react";

interface ErrorMessageProps {
  children: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ children }) => {
  return <p className="text-red-500 text-sm mt-1">{children}</p>;
};

export default ErrorMessage;
