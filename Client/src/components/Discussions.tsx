import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Discussions() {
  const discussions = [
    {
      id: 1,
      user: "John Doe",
      topic: "Question about Lecture 5",
      comments: 3,
    },
    {
      id: 2,
      user: "Jane Smith",
      topic: "Discussion on Project Assignment",
      comments: 5,
    },
    {
      id: 3,
      user: "Alice Johnson",
      topic: "Clarification on Quiz 2",
      comments: 2,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="border-b pb-4">
              <div className="font-bold">{discussion.topic}</div>
              <div className="text-gray-600">
                Started by {discussion.user} • {discussion.comments} comments
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
