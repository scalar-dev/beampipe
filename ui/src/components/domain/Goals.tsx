import { DashboardCard } from "./DashboardCard";
import { NonIdealState } from "../NonIdealState";
import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";
import { onApiError } from "../../utils/errors";
import { Table } from "../Table";
import { ConfirmButton } from "../ConfirmButton";
import { AlertCircleIcon, PlusIcon, TargetIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface Goal {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  path: string;
  count: number;
}

const EditGoalModal: React.FunctionComponent<{
  goal?: Goal;
  domain: string;
  onComplete: () => void;
  onCancel: () => void;
}> = ({ goal, domain, onCancel, onComplete }) => {
  const [name, setName] = useState(goal ? goal.name : "");
  const [description, setDescription] = useState(goal ? goal.description : "");
  const [eventType, setEventType] = useState(goal ? goal.eventType : "");
  const [path, setPath] = useState(goal ? goal.path : "");
  const [error, setError] = useState<string | null>(null);

  const [query] = useQuery({
    query: gql`
      query getEventTypes($domain: String!) {
        domain(domain: $domain) {
          eventTypes
          id
        }
      }
    `,
    variables: {
      domain,
    },
  });

  const [, createGoal] = useMutation(gql`
    mutation createGoal(
      $domainId: UUID!
      $name: String!
      $description: String
      $eventType: String!
      $path: String
    ) {
      addGoal(
        domainId: $domainId
        name: $name
        description: $description
        eventType: $eventType
        path: $path
      )
    }
  `);

  const [, deleteGoal] = useMutation(gql`
    mutation deleteGoal($id: UUID!) {
      deleteGoal(id: $id)
    }
  `);

  const readOnly = goal != null;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent data-cy="modal-create-goal">
        <DialogHeader>
          <DialogTitle>{readOnly ? goal!.name : "Create a goal"}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? "Goals can't be edited. Delete this goal and create a new one to change it."
              : "Count events of a given type, optionally restricted to a path."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="goal-name">Name</FieldLabel>
              <Input
                id="goal-name"
                data-cy="input-goal-name"
                placeholder="e.g. signup event"
                value={name}
                readOnly={readOnly}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="goal-description">Description</FieldLabel>
              <Input
                id="goal-description"
                data-cy="input-goal-description"
                placeholder="Optional"
                value={description}
                readOnly={readOnly}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="goal-event-type">Event type</FieldLabel>
              <datalist id="event-types">
                {query.data?.domain?.eventTypes?.map((e: string) => (
                  <option key={e}>{e}</option>
                ))}
              </datalist>
              <Input
                id="goal-event-type"
                list="event-types"
                data-cy="input-goal-event-type"
                placeholder="e.g. signup"
                value={eventType}
                readOnly={readOnly}
                onChange={(e) => setEventType(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="goal-path">Path</FieldLabel>
              <Input
                id="goal-path"
                data-cy="input-goal-path"
                placeholder="e.g. /"
                value={path}
                readOnly={readOnly}
                onChange={(e) => setPath(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {readOnly ? (
            <ConfirmButton
              trigger={<Button variant="destructive">Delete</Button>}
              title="Delete this goal?"
              description="You will be able to recreate it later."
              confirmLabel="Delete goal"
              onConfirm={async () => {
                const result = await deleteGoal({ id: goal!!.id });

                if (
                  !onApiError(
                    result.error,
                    "An unspecified error occurred",
                    setError
                  )
                ) {
                  onComplete();
                }
              }}
            />
          ) : (
            <Button
              onClick={async () => {
                const result = await createGoal({
                  domainId: query.data.domain.id,
                  name,
                  description,
                  eventType,
                  path,
                });

                if (
                  !onApiError(
                    result.error,
                    "An unspecified error occurred",
                    setError
                  )
                ) {
                  onComplete();
                }
              }}
            >
              Create goal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const GoalsCard = ({
  domain,
  stats,
  refetch,
}: {
  domain: string;
  stats: any;
  refetch: () => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [goal, setGoal] = useState<Goal|null>(null);

  const createGoal = () => {
    setModalVisible(true);
  };

  const isEditable = stats.data?.events.isEditable || false;

  return (
    <DashboardCard
      span={2}
      data-cy="goals-card"
      title="Goals"
      action={
        isEditable ? (
          <Button variant="ghost" size="sm" onClick={createGoal}>
            <PlusIcon />
            Add goal
          </Button>
        ) : null
      }
    >
      {modalVisible && (
        <EditGoalModal
          goal={goal!!}
          domain={domain}
          onCancel={() => {
            setModalVisible(false);
            setGoal(null);
          }}
          onComplete={() => {
            setModalVisible(false);
            setGoal(null);
            refetch();
          }}
        />
      )}
      <NonIdealState
        isLoading={stats.fetching}
        isIdeal={(stats.data?.events?.goals?.length ?? 0) > 0}
        nonIdeal={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TargetIcon />
              </EmptyMedia>
              <EmptyTitle>No goals yet</EmptyTitle>
              <EmptyDescription>
                Goals count custom events such as sign ups or purchases.
              </EmptyDescription>
            </EmptyHeader>
            {isEditable ? (
              <EmptyContent>
                <Button data-cy="button-create-goal" onClick={createGoal}>
                  Create a goal
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        }
      >
        <Table
          columnHeadings={["Goals", "Count"]}
          data={stats.data?.events?.goals?.map((goal: Goal) => ({
            key: goal.id,
            label: goal.name,
            count: goal.count,
          }))}
          onClick={
            isEditable
              ? (id) => {
                  setGoal(
                    stats.data?.events?.goals?.find((goal: Goal) => goal.id === id)
                  );
                  setModalVisible(true);
                }
              : undefined
          }
          showPercentages="max"
        />
      </NonIdealState>
    </DashboardCard>
  );
};
