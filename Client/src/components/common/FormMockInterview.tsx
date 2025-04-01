import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Interview } from "@/types";
import { CustomBreadCrumb } from "./CustomBreadCrumbs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Headings } from "./Headings";
import { Button } from "../ui/button";
import { Loader, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { chatSession } from "@/scripts";
import {
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
} from "@/redux/services/interviewApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      position: "",
      description: "",
      experience: 0,
      techStack: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [createInterview] = useCreateInterviewMutation();
  const [updateInterview] = useUpdateInterviewMutation();

  const title = initialData
    ? initialData.position
    : "Create a new mock interview";
  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };


  const cleanAiResponse = (
    responseText: string
  ): { question: string; answer: string }[] => {
    console.log("Raw AI Response:", responseText);

    try {
      const cleanText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Text after markdown removal:", cleanText); 

      if (!cleanText.startsWith("[") || !cleanText.endsWith("]")) {
        throw new Error("No JSON array found in response content");
      }

      const parsed = JSON.parse(cleanText);
      if (!Array.isArray(parsed)) {
        throw new Error("Parsed content is not an array");
      }

      parsed.forEach((item: any) => {
        if (!item.question || !item.answer) {
          throw new Error("Invalid item format: missing question or answer");
        }
      });

      return parsed as { question: string; answer: string }[];
    } catch (error) {
      console.error("Clean AI Response Error:", error);
      throw new Error(
        "Failed to process AI response: " + (error as Error).message
      );
    }
  };

  const generateAiResponse = async (data: FormData) => {
    const prompt = `
    Return ONLY a JSON array with 5 objects, each containing "question" and "answer" fields. Do not include any additional text, explanations, or markdown. Example format:
    [{"question": "Q1", "answer": "A1"}, {"question": "Q2", "answer": "A2"}]
    
    Job Information:
    - Job Position: ${data?.position}
    - Job Description: ${data?.description}
    - Years of Experience Required: ${data?.experience}
    - Tech Stacks: ${data?.techStack}
  `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);
      const responseText = aiResult.response.text();
      const cleanResponse = cleanAiResponse(responseText);
      console.log("Cleaned AI Response:", cleanResponse);
      return cleanResponse;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  };


  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const aiResult = await generateAiResponse(data);

      if (initialData) {
        if (isValid) {
          await updateInterview({
            _id: initialData._id,
            ...data,
            questions: aiResult,
            updatedAt: new Date().toISOString(),
          }).unwrap();
          toast.success(toastMessage.title, {
            description: toastMessage.description,
          });
        }
      } else {
        if (isValid && user?.id) {
          await createInterview({
            ...data,
            userId: user.id,
            questions: aiResult,
            createdAt: new Date().toISOString(),
          }).unwrap();
          toast.success(toastMessage.title, {
            description: toastMessage.description,
          });
        }
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error generating interview questions", {
        description: "Failed to process AI response. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    } else {
      form.reset({
        position: "",
        description: "",
        experience: 0,
        techStack: "",
      });
    }
    toast.info("Form Reset", {
      description: "Form has been reset to initial values",
    });
  };

  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />

        {initialData && (
          <Button size={"icon"} variant={"ghost"}>
            <Trash2 className="min-w-4 min-h-4 text-red-500" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="my-6"></div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md "
        >
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Role / Job Position</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- Full Stack Developer"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Description</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- describe your job role"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Years of Experience</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- 5 Years"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Tech Stacks</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- React, Typescript..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full flex items-center justify-end gap-6">
            <Button
              type="button"
              size={"sm"}
              variant={"outline"}
              disabled={isSubmitting || loading}
              onClick={onReset}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size={"sm"}
              disabled={isSubmitting || !isValid || loading}
            >
              {loading ? (
                <Loader className="text-black animate-spin" />
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
