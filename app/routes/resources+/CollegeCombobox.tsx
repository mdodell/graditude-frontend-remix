import { Combobox, InputBase, Loader, useCombobox } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { useState } from "react";
import { useField, useFormContext } from "remix-validated-form";
import { useSpinDelay } from "spin-delay";
import { http } from "~/utils/api";

type CollegeData = {
  name: string;
  domains: string[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  try {
    const colleges = await http
      .get("colleges/college_names_with_domains", {
        searchParams: url.searchParams,
      })
      .json<Record<CollegeData["name"], CollegeData["domains"]>>();

    return json({ colleges });
  } catch (e) {
    console.log({ e });
  }
};

interface CollegeComboboxProps {
  name: string;
  countryCode: string;
  onChange: (collegeData: CollegeData) => void;
}

export function CollegeCombobox({
  name,
  onChange,
  countryCode,
}: CollegeComboboxProps) {
  const countryFetcher = useFetcher<typeof loader>();

  const colleges = countryFetcher.data?.colleges || {};

  const [selectedCollege, setSelectedCollege] = useState<string | undefined>();
  const { error, getInputProps } = useField(name);

  const { validateField } = useFormContext("myForm");

  const cb = useCombobox({
    onDropdownOpen: () => {
      countryFetcher.submit(
        { country_code: countryCode },
        { method: "get", action: "/resources/CollegeCombobox" }
      );
    },
  });

  const loading = countryFetcher.state !== "idle";

  const showSpinner = useSpinDelay(loading, {
    delay: 150,
    minDuration: 300,
  });

  return (
    <Combobox
      store={cb}
      position="bottom"
      onOptionSubmit={(val) => {
        setSelectedCollege(val);
        validateField(val).then((res) => console.log({ res }));
        onChange({
          name: val,
          domains: colleges[val],
        });
        cb.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={
            showSpinner ? <Loader size={18} /> : <Combobox.Chevron />
          }
          error={error}
          onClick={() => cb.toggleDropdown()}
          rightSectionPointerEvents="none"
          id={name}
          value={selectedCollege || ""}
          {...getInputProps({
            type: "select",
          })}
          label="Select college"
          placeholder="Select your college"
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
          {showSpinner ? (
            <Combobox.Empty>Loading....</Combobox.Empty>
          ) : (
            Object.keys(colleges).map((college) => (
              <Combobox.Option key={college} value={college}>
                {college}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
