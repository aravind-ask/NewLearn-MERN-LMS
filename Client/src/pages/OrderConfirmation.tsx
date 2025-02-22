import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OrderConfirmationPage = () => {
    const navigate = useNavigate();
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your purchase. Your order is being processed.
      </p>
      <Button onClick={() => navigate("/")}>Continue Shopping</Button>
    </div>
  );
};
