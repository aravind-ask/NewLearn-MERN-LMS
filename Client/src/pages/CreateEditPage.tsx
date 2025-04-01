import { FormMockInterview } from "@/components/common/FormMockInterview";
import { useGetInterviewQuery } from "@/redux/services/interviewApi";
import { useParams } from "react-router-dom";

const CreateEditPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { data: interview, isLoading } = useGetInterviewQuery(interviewId!, {
    skip: !interviewId,
  });

  if (isLoading && interviewId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-4 flex-col w-full">
      <FormMockInterview initialData={interview || null} />
    </div>
  );
};

export default CreateEditPage;
