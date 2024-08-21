import React from "react";
import { Field, useFormState } from "react-final-form";
import { SelectInputProps } from "../../../../../types";
import { FieldWrapper } from "../FieldWrapper";

export const SelectInput = ({
  name,
  label,
  defaultValue,
  options,
  className
}: SelectInputProps) => {
  const { values } = useFormState();
  return (
    <FieldWrapper className={className}>
      <React.Fragment>
      {label && <label>{label}</label>}
        <Field name={name} component="select" defaultValue={defaultValue}>
            {options.map(({name, value}) => {
              return (
                <option key={name} value={value}>
                  {name}
                </option>
              );
            })}
        </Field>
      </React.Fragment>
    </FieldWrapper>
  );
};
