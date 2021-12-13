import { DashboardCard } from "./DashboardCard";
import { CardTitle } from "../Card";
import { NonIdealState } from "../NonIdealState";
import { useState } from "react";
import { Button } from "../Buttons";
import { useQuery, useMutation, gql } from "urql";
import { onApiError } from "../../utils/errors";
import { Table } from "../Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface Goal {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  path: string;
  count: number;
}

const ModalBody: React.FunctionComponent = ({ children }) => (
  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
);

const ModalFooter: React.FunctionComponent = ({ children }) => (
  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
    {children}
  </div>
);

const Modal: React.FunctionComponent = ({ children, ...otherProps }) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* <!--
      Background overlay, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    --> */}
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        {/* <!-- This element is to trick the browser into centering the modal contents. --> */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        &#8203;
        {/* <!--
      Modal panel, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        To: "opacity-100 translate-y-0 sm:scale-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100 translate-y-0 sm:scale-100"
        To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    --> */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          {...otherProps}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

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
    <>
      <Modal data-cy="modal-create-goal">
        <ModalBody>
          <form className="w-full" onSubmit={(e) => e.preventDefault()}>
            <div className="md:flex md:items-center mb-6">
              <div className="w-24">
                <label
                  className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                  htmlFor="name"
                >
                  Name
                </label>
              </div>
              <div className="flex-1">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="name"
                  data-cy="input-goal-name"
                  type="text"
                  placeholder="e.g. signup event"
                  value={name}
                  readOnly={readOnly}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="md:flex md:items-center mb-6">
              <div className="w-32">
                <label
                  className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                  htmlFor="description"
                >
                  Description
                </label>
              </div>
              <div className="flex-1">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="description"
                  type="text"
                  data-cy="input-goal-description"
                  placeholder="optional description"
                  value={description}
                  readOnly={readOnly}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="md:flex md:items-center mb-6">
              <div className="w-32">
                <label
                  className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                  htmlFor="domain"
                >
                  Event type
                </label>
              </div>
              <div className="flex-1">
                <datalist id="event-types">
                  {query.data?.domain?.eventTypes?.map((e: string) => (
                    <option key={e}>{e}</option>
                  ))}
                </datalist>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="event_type"
                  type="text"
                  list="event-types"
                  data-cy="input-goal-event-type"
                  placeholder="e.g. signup"
                  value={eventType}
                  readOnly={readOnly}
                  onChange={(e) => {
                    setEventType(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="md:flex md:items-center mb-6">
              <div className="w-48">
                <label
                  className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                  htmlFor="domain"
                >
                  Path
                </label>
              </div>
              <div className="flex-1">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="name"
                  type="text"
                  placeholder="e.g. /"
                  value={path}
                  readOnly={readOnly}
                  data-cy="input-goal-path"
                  onChange={(e) => {
                    setPath(e.target.value);
                  }}
                />
              </div>
            </div>
            {error && <p className="text-red-500 pb-4 italic">{error}</p>}
          </form>
        </ModalBody>
        <ModalFooter>
          <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
            {readOnly ? (
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-green-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to remove this goal? You will be able to recreate it."
                    )
                  ) {
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
                  }
                }
              }
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
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
                Create
              </button>
            )}
          </span>
          <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
              onClick={onCancel}
            >
              Cancel
            </button>
          </span>
        </ModalFooter>
      </Modal>
    </>
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
    <DashboardCard position="full" data-cy="goals-card">
      <CardTitle>
        <div className="flex">
          <div className="flex-auto overflow-auto">Goals</div>

          {isEditable ? (
            <div className="flex-none">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-500"
                onClick={(e) => {
                  createGoal();
                  e.preventDefault();
                }}
              >
                <FontAwesomeIcon
                  size="sm"
                  className="fill-current w-4 h-4 mr-2"
                  icon={faPlus}
                />
              </a>
            </div>
          ) : null}
        </div>
      </CardTitle>
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
        isIdeal={stats.data?.events.goals.length > 0}
        nonIdeal={
          <div className="text-md text-gray-600 text-center">
            You haven't configured any goals yet.
            {isEditable ? (
              <div className="pt-4">
                <Button data-cy="button-create-goal" onClick={createGoal}>
                  Create a goal
                </Button>
              </div>
            ) : null}
          </div>
        }
      >
        <Table
          columnHeadings={["Goals", "Count"]}
          data={stats.data?.events.goals.map((goal: Goal) => ({
            key: goal.id,
            label: goal.name,
            count: goal.count,
          }))}
          onClick={
            isEditable
              ? (id) => {
                  setGoal(
                    stats.data.events.goals.find((goal: Goal) => goal.id === id)
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
