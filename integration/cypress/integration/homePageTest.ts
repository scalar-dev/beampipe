describe("The Home Page", () => {
  it("successfully loads", () => {
    cy.visit("http://localhost:3000");
    cy.screenshot();
  });

  it("shows the right things", () => {
    cy.visit("http://localhost:3000");
    cy.contains("a", "Sign up free").should("exist");
    cy.contains("a", "Dashboard").should("not.exist");
    cy.contains("a", "Go to app").should("not.exist");
  });

  it("can click signup", () => {
    cy.visit("http://localhost:3000");
    const signUpButton = cy.contains("a", "Sign up free");
    signUpButton.click();
    cy.url().should("eq", "http://localhost:3000/sign-up");
  });

  it("can click live demo", () => {
    cy.visit("http://localhost:3000");
    const button = cy.contains("a", "Live demo");
    button.click();
    cy.url().should("eq", "http://localhost:3000/domain/beampipe.io");
  });
});
