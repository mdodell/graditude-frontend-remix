import {
  Combobox,
  InputBase,
  Loader,
  useCombobox,
  TextInput,
  ScrollArea,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { useState } from "react";
import { useSpinDelay } from "spin-delay";
import { http } from "~/utils/api";
import type { WithPaginationMeta } from "~/utils/types";

type CollegeData = {
  name: string;
  domains: string[];
};

type BaseResponse = {
  colleges: Array<CollegeData>;
};

const fetchColleges = async (request: Request) => {
  const url = new URL(request.url);

  const searchParams = url.searchParams;

  try {
    const colleges = await http
      .get("colleges/search", {
        searchParams,
      })
      .json<BaseResponse & WithPaginationMeta>();

    return json({ response: colleges });
  } catch (e) {
    console.log({ e });
    return null;
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return fetchColleges(request);
};

interface CollegeComboboxProps {
  name: string;
  error?: string;
  onChange: (data: CollegeData) => void;
}

export function CollegeCombobox({
  name,
  error,
  onChange,
}: CollegeComboboxProps) {
  const [searchInput, setSearchInput] = useState("");

  const collegeFetcher = useFetcher<typeof loader>({ key: searchInput });
  const colleges = collegeFetcher.data?.response.colleges ?? [];
  const busy = collegeFetcher.state !== "idle";
  const [selectedCollege, setSelectedCollege] = useState("");
  const showSpinner = useSpinDelay(busy, {
    delay: 0,
    minDuration: 300,
  });

  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (query.length > 0) {
      collegeFetcher.submit(
        { query },
        { method: "GET", action: "/resources/CollegeCombobox" }
      );
    }
  }, 150);

  const cb = useCombobox();

  const options = colleges.map((college) => (
    <Combobox.Option value={college.name} key={college.name}>
      {college.name}
    </Combobox.Option>
  ));

  return (
    <>
      <InputBase
        type="hidden"
        id={name}
        name={name}
        value={selectedCollege || ""}
      />
      <Combobox
        store={cb}
        position="bottom"
        onOptionSubmit={(val) => {
          setSelectedCollege(val);
          const college = colleges.find((college) => college.name === val)!;
          onChange(college);
          cb.closeDropdown();
        }}
      >
        <Combobox.Target>
          <TextInput
            required={true}
            error={error}
            label="College"
            placeholder="Select your college"
            value={selectedCollege || searchInput}
            rightSection={showSpinner && <Loader size={18} />}
            onChange={({ currentTarget: { value } }) => {
              if (selectedCollege.length > 0) {
                setSelectedCollege("");
              }
              if (value.length === 0) {
                cb.closeDropdown();
              }
              cb.openDropdown();
              setSearchInput(value);
              handleSearch(value);
            }}
          />
        </Combobox.Target>
        <Combobox.Dropdown>
          {showSpinner ? (
            <Combobox.Empty>Loading...</Combobox.Empty>
          ) : (
            <ScrollArea.Autosize mah={200} type="scroll">
              {colleges.length === 0 && collegeFetcher.state === "idle" ? (
                <Combobox.Empty>No colleges found.</Combobox.Empty>
              ) : (
                <Combobox.Options>{options}</Combobox.Options>
              )}
            </ScrollArea.Autosize>
          )}
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}
