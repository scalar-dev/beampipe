import { gql, useQuery } from "urql";
import { useState } from "react";
import { Menu, MenuSection, MenuItem } from "../Menu";
import { Tick } from "../marketing/Tick";
import { Domain } from "../../interfaces";
import { useParams, useNavigate } from "react-router-dom";

export const DomainPicker = () => {
  const params = useParams();
  const navigate = useNavigate();

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
      value={params.domain}
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
              navigate(`/domain/${encodeURIComponent(item.domain)}`);
              setVisible(false);
            }}
          >
            <div className="w-8">
              {params.domain === item.domain && <Tick />}
            </div>
            {item.domain}
          </MenuItem>
        ))}
      </MenuSection>
    </Menu>
  );
};
