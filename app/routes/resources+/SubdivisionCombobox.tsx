import { Combobox, InputBase, Loader, useCombobox } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { useState } from "react";
import { useField, useFormContext } from "remix-validated-form";
import { useSpinDelay } from "spin-delay";
import { http } from "~/utils/api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;
  try {
    const subdivisions = await http
      .get("geography/subdivisions", {
        searchParams: query,
      })
      .json<string[]>();

    return json({ subdivisions });
  } catch (e) {
    return null;
  }
};

interface SubdivisionComboboxProps {
  name: string;
  country: string;
}

export function SubdivisionCombobox({
  name,
  country,
}: SubdivisionComboboxProps) {
  const subdivisionFetcher = useFetcher<typeof loader>();

  const subdivisions = subdivisionFetcher.data?.subdivisions || [];

  const { error, getInputProps } = useField(name);
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>();

  const cb = useCombobox({
    onDropdownOpen: () => {
      subdivisionFetcher.submit(
        { country_code: country },
        { method: "get", action: "/resources/SubdivisionCombobox" }
      );
    },
  });

  const loading = subdivisionFetcher.state !== "idle";

  const showSpinner = useSpinDelay(loading, {
    delay: 150,
    minDuration: 300,
  });

  const { validateField } = useFormContext("myForm");

  return (
    <Combobox
      store={cb}
      position="bottom"
      onOptionSubmit={(val) => {
        setSelectedSubdivision(val);
        validateField(val);
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
          value={selectedSubdivision || ""}
          {...getInputProps({
            type: "select",
          })}
          label="Select state/province"
          placeholder="Pick state/province"
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
          {showSpinner ? (
            <Combobox.Empty>Loading....</Combobox.Empty>
          ) : (
            subdivisions.map((subdivision) => (
              <Combobox.Option key={subdivision} value={subdivision}>
                {subdivision}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
