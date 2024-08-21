import React from "react";
import { Field, useFormState } from "react-final-form";
import { InputProps } from "../../../../../types";
import { FieldWrapper } from "../FieldWrapper";


export const TextInput = ({ name, label, defaultValue, className, disabled }: InputProps) => {
    const { values } = useFormState();
    return (
      <FieldWrapper className={className}>
        <React.Fragment>
          {label && <label>{label}</label>}
          <Field
            className={"my-2 ml-2 mr-4 py-1 px-2 rounded-lg w-full min-w-[100px]"}
            name={name}
            component="input"
            type="text"
            defaultValue={defaultValue}
            disabled={disabled}
          />
        </React.Fragment>
      </FieldWrapper>
    );
  };