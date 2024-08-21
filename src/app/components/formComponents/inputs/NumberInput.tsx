import React from "react";
import { Field } from "react-final-form";
import { InputProps } from "../../../../../types";
import { FieldWrapper } from "../FieldWrapper";


export const NumberInput = ({ name, label, defaultValue, disabled }: InputProps) => {
    return (
      <FieldWrapper>
        <React.Fragment>
          {label && <label>{label}</label>}
          <Field
            className={"my-2 ml-2 py-1 px-2 rounded-lg w-full min-w-[100px]"}
            name={name}
            component="input"
            type="number"
            defaultValue={defaultValue}
            disabled={disabled}
          />
        </React.Fragment>
      </FieldWrapper>
    );
  };