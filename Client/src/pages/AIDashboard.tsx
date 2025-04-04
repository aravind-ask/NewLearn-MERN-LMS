import { Headings } from "@/components/common/Headings";
import { InterviewPin } from "@/components/common/pin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useGetInterviewsByUserQuery } from "@/redux/services/interviewApi";
import notfound from "../assets/images/not-found.svg";

const AIDashboard = () => {
  const {
    data: interviews = [],
    isLoading,
    isError,
    error,
  } = useGetInterviewsByUserQuery("", {
    pollingInterval: 5000,
  });

  // Handle error state
  if (isError) {
    console.log("Error fetching interviews:", error);
    toast.error("Error..", {
      description: "Something went wrong. Please try again later.",
    });
  }

  return (
    <>
      <div className="flex w-full h-full items-center justify-between">
        {/* headings */}
        <Headings
          title="Dashboard"
          description="Create and start your AI Mock interview"
        />
        <Link to={"/generate/create"}>
          <Button size={"sm"}>
            <Plus /> Add New
          </Button>
        </Link>
      </div>

      <Separator className="my-8" />
      {/* content section */}

      <div className="md:grid md:grid-cols-3 gap-3 py-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 md:h-32 rounded-md" />
          ))
        ) : interviews.length > 0 ? (
          interviews.map((interview) => (
            <InterviewPin key={interview._id} interview={interview} />
          ))
        ) : (
          <div className="md:col-span-3 w-full flex flex-grow items-center justify-center h-96 flex-col">
            <img src={notfound} className="w-44 h-44 object-contain" alt="" />

            <h2 className="text-lg font-semibold text-muted-foreground">
              No Data Found
            </h2>

            <p className="w-full md:w-96 text-center text-sm text-neutral-400 mt-4">
              There is no available data to show. Please add some new mock
              interviews
            </p>

            <Link to={"/generate/create"} className="mt-4">
              <Button size={"sm"}>
                <Plus className="min-w-5 min-h-5 mr-1" />
                Add New
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default AIDashboard;
