import React, { ChangeEvent, useCallback, useMemo } from "react";
import { Column } from "@tanstack/react-table";
import { css } from "@emotion/react";

import { Dropdown, Flex, Icon, Icons, View } from "@arizeai/components";

import { useTracingContext } from "@phoenix/contexts/TracingContext";

const UN_HIDABLE_COLUMN_IDS = ["spanKind", "name"];

type SpanColumnSelectorProps = {
  /**
   * The columns that can be displayed in the span table
   * This could be made more generic to support other tables
   * but for now working on the span tables to figure out the right interface
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Column<any>[];
};

export function SpanColumnSelector(props: SpanColumnSelectorProps) {
  return (
    <Dropdown
      menu={<ColumnSelectorMenu {...props} />}
      triggerProps={{
        placement: "bottom end",
      }}
    >
      <Flex direction="row" alignItems="center" gap="size-100">
        <Icon svg={<Icons.Column />} />
        Columns
      </Flex>
    </Dropdown>
  );
}

const columCheckboxItemCSS = css`
  padding: var(--ac-global-dimension-static-size-50)
    var(--ac-global-dimension-static-size-100);
  label {
    display: flex;
    align-items: center;
    gap: var(--ac-global-dimension-static-size-100);
  }
`;

function ColumnSelectorMenu(props: SpanColumnSelectorProps) {
  const { columns: propsColumns } = props;

  const columnVisibility = useTracingContext((state) => state.columnVisibility);
  const setColumnVisibility = useTracingContext(
    (state) => state.setColumnVisibility
  );
  const columns = useMemo(() => {
    return propsColumns.filter((column) => {
      return !UN_HIDABLE_COLUMN_IDS.includes(column.id);
    });
  }, [propsColumns]);

  const allVisible = useMemo(() => {
    return columns.every((column) => {
      const stateValue = columnVisibility[column.id];
      const isVisible = stateValue == null ? true : stateValue;
      return isVisible;
    });
  }, [columns, columnVisibility]);

  const onCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = event.target;
      setColumnVisibility({ ...columnVisibility, [name]: checked });
    },
    [columnVisibility, setColumnVisibility]
  );

  const onToggleAll = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      const newVisibilityState = columns.reduce((acc, column) => {
        return { ...acc, [column.id]: checked };
      }, {});
      setColumnVisibility(newVisibilityState);
    },
    [columns, setColumnVisibility]
  );

  return (
    <View paddingTop="size-50" paddingBottom="size-50">
      <View
        borderBottomColor="dark"
        borderBottomWidth="thin"
        paddingBottom="size-50"
      >
        <div css={columCheckboxItemCSS}>
          <label>
            <input
              type="checkbox"
              name={"toggle-all"}
              checked={allVisible}
              onChange={onToggleAll}
            />
            toggle all
          </label>
        </div>
      </View>

      <ul>
        {columns.map((column) => {
          const stateValue = columnVisibility[column.id];
          const isVisible = stateValue == null ? true : stateValue;
          const name =
            typeof column.columnDef.header == "string"
              ? column.columnDef.header
              : column.id;
          return (
            <li key={column.id} css={columCheckboxItemCSS}>
              <label>
                <input
                  type="checkbox"
                  name={column.id}
                  checked={isVisible}
                  onChange={onCheckboxChange}
                />
                {name}
              </label>
            </li>
          );
        })}
      </ul>
    </View>
  );
}
