import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatWithTrainer() {
  const messages = [
    {
      id: 1,
      user: "Trainer",
      message: "Hi there! How can I help you today?",
    },
    {
      id: 2,
      user: "You",
      message: "I have a question about the last lecture.",
    },
    {
      id: 3,
      user: "Trainer",
      message: "Sure, what would you like to know?",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat with Trainer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.user === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.user === "You"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
