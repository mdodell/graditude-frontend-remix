import { Combobox, InputBase, Loader, useCombobox } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { useState } from "react";
import { useField, useFormContext } from "remix-validated-form";
import { useSpinDelay } from "spin-delay";
import { http } from "~/utils/api";

type CountryData = {
  alpha_code: string;
  flag: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const countries = await http
      .get("geography")
      .json<Record<string, CountryData>>();

    return json({ countries });
  } catch (e) {
    console.log({ e });
  }
};

interface CountryComboboxProps {
  name: string;
  onChange: (countryData: CountryData) => void;
}

export function CountryCombobox({ name, onChange }: CountryComboboxProps) {
  const countryFetcher = useFetcher<typeof loader>();

  const countries = countryFetcher.data?.countries || {};

  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const { error, getInputProps } = useField(name);

  const { validateField } = useFormContext("myForm");

  const cb = useCombobox({
    onDropdownOpen: () => {
      countryFetcher.submit(
        {},
        {
          method: "get",
          action: "/resources/CountryCombobox",
        }
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
        setSelectedCountry(val);
        validateField(val).then((res) => console.log({ res }));
        onChange(countries[val]);
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
          value={selectedCountry || ""}
          {...getInputProps({
            type: "select",
          })}
          label="Select country"
          placeholder="Pick country"
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
          {showSpinner ? (
            <Combobox.Empty>Loading....</Combobox.Empty>
          ) : (
            Object.keys(countries).map((country) => (
              <Combobox.Option
                key={country}
                value={country}
              >{`${countries[country].flag} ${country}`}</Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
