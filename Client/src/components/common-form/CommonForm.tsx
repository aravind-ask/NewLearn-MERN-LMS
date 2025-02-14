import { Button } from "../ui/button";
import FormControls from "./Form-Controls";
import { FormControl } from "./Form-Controls";


interface CommonFormProps {
  handleSubmit: (event: React.FormEvent) => void;
  buttonText: string;
  formControls: FormControl[];
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  isButtonDisabled?: boolean;
}

function CommonForm({
  handleSubmit,
  buttonText,
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled = false,
}: CommonFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <FormControls
        formControls={formControls}
        formData={formData}
        setFormData={setFormData}
      />
      <Button disabled={isButtonDisabled} type="submit" className="mt-5 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
