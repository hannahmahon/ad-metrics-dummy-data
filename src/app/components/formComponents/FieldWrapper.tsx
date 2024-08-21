export const FieldWrapper = (props: { className?: string; children: React.ReactNode }) => {
  return <div className={`${props.className || "flex m-2 items-center w-full"}`}>{props.children}</div>;
};
