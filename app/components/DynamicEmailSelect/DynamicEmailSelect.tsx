import { useMemo, useState } from "react";
import type {
  ComboboxProps,
  PillsInputFieldProps,
  PillsInputProps,
} from "@mantine/core";
import {
  CheckIcon,
  Combobox,
  Group,
  Input,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";

interface EmailOptionProps {
  email: string;
  active: boolean;
}

function EmailOption({ email, active }: EmailOptionProps) {
  return (
    <Combobox.Option value={email} key={email} active={active}>
      <Group gap="sm">
        {active && <CheckIcon size={12} />}
        <span>{email}</span>
      </Group>
    </Combobox.Option>
  );
}

interface DynamicEmailSelectProps {
  additionalEmails?: string[];
  baseEmails?: string[];
  comboboxProps?: ComboboxProps;
  pillsInputFieldProps?: Omit<PillsInputFieldProps, "name">;
  pillsInputProps?: PillsInputProps;
  name: string;
  errors?: string[];
}

export function DynamicEmailSelect({
  baseEmails = ["gmail.com", "outlook.com"],
  additionalEmails,
  comboboxProps,
  pillsInputFieldProps,
  pillsInputProps,
  name,
  errors,
}: DynamicEmailSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");
  const [value, setValue] = useState<string[]>([]);

  const handleValueSelect = (val: string) => {
    setSearch("");
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );
  };

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  const values = value.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  const withSpecificEmail = useMemo(() => {
    return (
      <EmailOption
        key={search}
        active={value.includes(search)}
        email={search}
      />
    );
  }, [search]);

  const options = [...(additionalEmails ?? []), ...baseEmails].map((suffix) => {
    const strippedEmail = search.split("@")[0];
    const email = `${strippedEmail}@${suffix}`;

    return (
      <EmailOption key={email} email={email} active={value.includes(email)} />
    );
  });

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Combobox
        store={combobox}
        onOptionSubmit={handleValueSelect}
        withinPortal={false}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            onClick={() => combobox.openDropdown()}
            error={errors && errors.length > 0}
            {...pillsInputProps}
          >
            <Pill.Group>
              {values}

              <Combobox.EventsTarget>
                <PillsInput.Field
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  value={search}
                  placeholder="Search values"
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && search.length === 0) {
                      event.preventDefault();
                      handleValueRemove(value[value.length - 1]);
                    }
                  }}
                  {...pillsInputFieldProps}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown hidden={search.trim().length === 0}>
          <Combobox.Options>
            {options.length === 0 ? (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            ) : search.includes("@") ? (
              [withSpecificEmail, options]
            ) : (
              options
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
        {errors?.map((error) => (
          <Input.Error key={error}>{error}</Input.Error>
        ))}
      </Combobox>
    </>
  );
}
