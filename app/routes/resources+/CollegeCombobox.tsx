import { Combobox, InputBase, Loader, useCombobox, Text } from "@mantine/core";
import { useDebouncedValue, useIntersection } from "@mantine/hooks";
import { useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { useEffect, useRef, useState } from "react";
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
      .get("colleges", {
        searchParams,
      })
      .json<BaseResponse & WithPaginationMeta>();

    return json({ response: colleges });
  } catch (e) {
    console.log({ e });
    return null;
  }
};

const SEE_MORE = "SEE_MORE";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return fetchColleges(request);
};

interface CollegeComboboxProps {
  name: string;
  onChange: (collegeData: CollegeData) => void;
  error?: string;
}

export function CollegeCombobox({
  name,
  onChange,
  error,
}: CollegeComboboxProps) {
  const collegeFetcher = useFetcher<typeof loader>();
  const firstOpen = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: containerRef.current,
    threshold: 1,
  });
  const [_searchValue, setSearchValue] = useState("");
  const [searchValue] = useDebouncedValue(_searchValue, 200);

  useEffect(() => {
    if (!collegeFetcher.data || collegeFetcher.state === "loading") {
      return;
    }
    // If we have new data - append it
    if (collegeFetcher.data) {
      const newColleges = collegeFetcher.data.response.colleges;

      setColleges((prevColleges) => [...prevColleges, ...newColleges]);
    }
  }, [collegeFetcher.state]);

  const [page, setPage] = useState(1);

  const [selectedCollege, setSelectedCollege] = useState<string | undefined>();
  const [colleges, setColleges] = useState<CollegeData[]>([]);

  const cb = useCombobox({
    onDropdownOpen: () => {
      const hasBeenOpened = firstOpen.current;
      if (!hasBeenOpened) {
        firstOpen.current = true;

        collegeFetcher.load(`/resources/CollegeCombobox?page=1&limit=50`);
      }
    },
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setPage((prev) => prev + 1);

      collegeFetcher.load(
        `/resources/CollegeCombobox?page=${page + 1}&limit=50`
      );
    }
  }, [entry?.isIntersecting]);

  const loading = collegeFetcher.state !== "idle";

  const showSpinner = useSpinDelay(loading, {
    delay: 150,
    minDuration: 300,
  });

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
        keepMounted={true}
        withinPortal={false}
        onOptionSubmit={(val) => {
          const collegeData = colleges.find((college) => college.name === val)!;

          onChange(collegeData);

          setSearchValue(val);
          setSelectedCollege(val);
          cb.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            rightSection={
              showSpinner ? <Loader size={18} /> : <Combobox.Chevron />
            }
            error={error}
            onClick={() => {
              cb.openDropdown();
            }}
            onChange={({ target: { value } }) => {
              cb.openDropdown();
              // Don't show filtered colleges
              // setSearchValue(value);
              // setSelectedCollege("");
            }}
            onFocus={() => cb.openDropdown()}
            onBlur={() => {
              cb.closeDropdown();
            }}
            rightSectionPointerEvents="none"
            value={selectedCollege || ""}
            label="College"
            placeholder="Select your college"
          />
        </Combobox.Target>
        <Combobox.Dropdown ref={containerRef}>
          <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
            {showSpinner ? (
              <Combobox.Empty>Loading....</Combobox.Empty>
            ) : (
              <>
                {colleges.map((college, index) => (
                  <Combobox.Option
                    key={college.name}
                    value={college.name}
                    // Give at least 3 options before fetching
                    ref={index === colleges.length - 3 ? ref : undefined}
                  >
                    {college.name}
                  </Combobox.Option>
                ))}
                {collegeFetcher.data?.response.pagination.totalCount &&
                  collegeFetcher.data?.response.pagination.totalCount > 0 && (
                    <Combobox.Option value={SEE_MORE}>
                      <Text c="dimmed" display="inline-block">
                        {`...and ${
                          collegeFetcher.data!.response.pagination?.totalCount -
                          colleges.length
                        } more. `}
                      </Text>
                    </Combobox.Option>
                  )}
              </>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}
