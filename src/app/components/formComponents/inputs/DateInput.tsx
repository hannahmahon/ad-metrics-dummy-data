import { Field, useFormState } from "react-final-form";
import { InputProps } from "../../../../../types";
import { FieldWrapper } from "../FieldWrapper";


export const DateInput = ({ name, label, defaultValue }: InputProps) => {
    const { values } = useFormState();
    return (
      <FieldWrapper>
        <>
          <label>{label}</label>
          <Field
            className={`my-2 ml-2 py-1 px-2 w-full rounded-lg`}
            name={name}
            defaultValue={defaultValue}
            component="input"
            type="date"
          />
        </>
      </FieldWrapper>
    );
  };