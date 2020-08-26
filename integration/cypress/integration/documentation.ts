const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

describe("Documentation", () => {
  it("login", () => {
    cy.visit("http://localhost:3000");

    cy.contains("a", "Sign up free").click();
    cy.url().should("eq", "http://localhost:3000/sign-up");

    cy.screenshot("signup");

    cy.get("[data-cy=email]").type(`${genRanHex(10)}@foo.com`);
    cy.get("[data-cy=password]").type(`${genRanHex(10)}`);
    cy.screenshot("signup_filled");

    cy.get("[data-cy=submit]").click();

    cy.get("[data-cy=add-domain").should("exist");
    cy.screenshot("zero_state");
    cy.get("[data-cy=add-domain]").click();

    cy.get("[data-cy=input-domain-name]").type("example.com");
    cy.screenshot("create_domain");

    cy.get("[data-cy=button-save-domain]").click();
    cy.get("[data-cy=a-domain]").should("exist");
    cy.screenshot("domain_list_view");

    cy.get("[data-cy=a-domain]").should("exist");
    cy.get("[data-cy=a-domain]").click();

    cy.get("[data-cy=button-create-goal]").should("exist");
    cy.get("[data-cy=goals-card]").screenshot("goals_card", {
      padding: 50,
    });

    cy.get("[data-cy=button-create-goal]").click();
    cy.get("[data-cy=modal-create-goal]").screenshot("create_goal", {
      padding: 50,
    });
    cy.get("[data-cy=input-goal-name]").type("User signup");
    cy.get("[data-cy=input-goal-description]").type(
      "Occurs when a user signs up"
    );
    cy.get("[data-cy=input-goal-event-type]").type("signup");
    cy.get("[data-cy=modal-create-goal]").screenshot("create_goal_filled", {
      padding: 50,
    });

    cy.go("back");

    cy.get("[data-cy=button-domain-settings").click();
    cy.get("[data-cy=button-domain-delete").should("exist");
    cy.screenshot("domain_settings");
    cy.get("[data-cy=button-domain-delete").click();
  });
});
