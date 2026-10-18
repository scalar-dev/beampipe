import { gql, useQuery } from "urql";
import { ChevronsUpDownIcon } from "lucide-react";
import { Domain } from "../../interfaces";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-56 justify-between">
          <span className="truncate">{params.domain}</span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-56">
        <DropdownMenuRadioGroup
          value={params.domain}
          onValueChange={(domain) =>
            navigate(`/domain/${encodeURIComponent(domain)}`)
          }
        >
          {query.data?.domains.map((item) => (
            <DropdownMenuRadioItem key={item.domain} value={item.domain}>
              {item.domain}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
