import { useState } from "react";
import { BaseMenu, MenuItem, MenuSection, MenuDivider, MenuText } from "../Menu";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../utils/auth";

export const Avatar = ({ user }: { user: User }) => {
  const [visible, setVisible] = useState(false);
  const initials = user.name
    ?.replace(
      /(?:^|\s|-)+([^\s-])[^\s-]*(?:(?:\s+)(?:the\s+)?(?:jr|sr|II|2nd|III|3rd|IV|4th)\.?$)?/gi,
      "$1"
    )
    .toLocaleUpperCase()
    .substring(0, 2);

  return (
    <BaseMenu
      element={
        <div
          className="flex flex-row items-center cursor-pointer hover:opacity-75"
          onClick={() => setVisible(!visible)}
        >
          <div>
            <div className="flex h-8 w-8 bg-green-600 rounded-full text-center align-middle text-white shadow-solid hover:opacity-75">
              <div className="font-bold align-middle m-auto">{initials}</div>
            </div>
          </div>
          <div>
            <a href="#">
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      }
      menuClassNames="lg:right-0"
      setVisible={setVisible}
      visible={visible}
    >
      <MenuSection>
        <MenuText>{user.email}</MenuText>
        <Link href="/settings">
          <MenuItem>
            <div className="w-8">
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faCog}
              />
            </div>
            Settings
          </MenuItem>
        </Link>
      </MenuSection>
      <MenuDivider />
      <Link href="/logout">
        <MenuItem>Logout</MenuItem>
      </Link>
    </BaseMenu>
  );
};
