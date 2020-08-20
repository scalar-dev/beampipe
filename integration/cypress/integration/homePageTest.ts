describe("The Home Page", () => {
  it("successfully loads", () => {
    cy.visit("http://localhost:3000");
    cy.screenshot();
  });

  it("can click signup", () => {
    cy.visit("http://localhost:3000");
    const signUpButton = cy.contains("button", "Sign up free");
    signUpButton.click();
    cy.url().should("eq", "http://localhost:3000/sign-up");
  });

  it("can click live demo", () => {
    cy.visit("http://localhost:3000");
    const button = cy.contains("button", "Live demo");
    button.click();
    cy.url().should("eq", "http://localhost:3000/domain/beampipe.io");
  });
});
