import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState } from "react";
import { Menu, MenuSection, MenuItem } from "../Menu";
import { Tick } from "../marketing/Tick";
import { Domain } from "../../interfaces";

export const DomainPicker = ({}) => {
  const router = useRouter();

  const [query] = useQuery<{ domains: Domain[] }>({
    query: gql`
      query domains {
        domains {
          id
          domain
          hasData
        }
      }
    `,
  });

  const [visible, setVisible] = useState(false);

  return (
    <Menu
      value={router.query.domain}
      visible={visible}
      setVisible={setVisible}
      menuClassNames="left-0"
      classNames="w-40 md:w-auto"
    >
      <MenuSection>
        {query.data?.domains.map((item) => (
          <MenuItem
            key={item.domain}
            onClick={() => {
              router.push(
                "/domain/[domain]",
                `/domain/${encodeURIComponent(item.domain)}`,
                {
                  shallow: true,
                }
              );
              setVisible(false);
            }}
          >
            <div className="w-8">
              {router.query.domain === item.domain && <Tick />}
            </div>
            {item.domain}
          </MenuItem>
        ))}
      </MenuSection>
    </Menu>
  );
};