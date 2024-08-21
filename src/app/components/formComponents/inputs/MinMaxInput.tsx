import { Fragment } from "react";
import { MinMaxDateInputProps, MinMaxNumberInputProps } from "../../../../../types";
import { BoldUppercase } from "../../BoldUppercase";
import { DateInput } from "./DateInput";
import { NumberInput } from "./NumberInput";
import { useFormState } from "react-final-form";

export const MinMaxInput = ({
    label,
    defaultValues,
    name,
    Component,
    disabled,
    className,
    rangeClassName
  }: MinMaxDateInputProps & { Component: (props: any) => JSX.Element; rangeClassName?: string; }) => {
    const { errors = {} } = useFormState();
    const inputErrors = [errors[`${name}Min`], errors[`${name}Max`]].filter(s => s)
    return (
      <div className={className}>
        <h2 className="text-lg ml-2 mt-4">{label}</h2>
        {inputErrors.length > 0 && 
        (<span className="ml-2 mt-2 text-red-400 flex flex-col">
          {inputErrors.map((s, i) => <small><sup>*</sup>{s}</small>)}
          </span>)}
        <div className={`flex flex-wrap w-full ${rangeClassName}`}>
          <Component
            name={`${name}Min`}
            disabled={disabled}
            label={
              <Fragment>
                <BoldUppercase>Min</BoldUppercase>
              </Fragment>
            }
            defaultValue={defaultValues[0]}
          />
          <Component
            name={`${name}Max`}
            disabled={disabled}
            label={
              <Fragment>
                <BoldUppercase>Max</BoldUppercase>
              </Fragment>
            }
            defaultValue={defaultValues[1]}
          />
        </div>
      </div>
    );
  };
  
  export const MinMaxDateInput = (props: MinMaxDateInputProps) => {
    return <MinMaxInput {...props} Component={DateInput} />;
  };
  export const MinMaxNumberInput = (props: MinMaxNumberInputProps) => {
    return <MinMaxInput {...props} Component={NumberInput} />;
  };