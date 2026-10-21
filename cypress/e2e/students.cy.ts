describe("Alunos", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Administrador",
        email: "admin@fitschedule.com",
        canManageStudents: true,
        canManageAppointments: true,
        admin: true,
      },
    }).as("login");
    cy.intercept("GET", "**/api/dashboard", {
      statusCode: 200,
      body: {
        students: 0,
        futureAppointments: 0,
        upcoming: [],
      },
    }).as("dashboard");
    cy.intercept("GET", "**/api/alunos", {
      statusCode: 200,
      body: [],
    }).as("listStudents");
  });

  it("exibe a tela de cadastro para usuario autenticado", () => {
    cy.visit("/login");
    cy.contains("Acesso do personal").should("be.visible");
    cy.get('input[name="email"]').type("admin@fitschedule.com");
    cy.get('input[name="password"]').type("123456");
    cy.contains("button", "Entrar").should("be.enabled");
    cy.wait(500);
    cy.contains("button", "Entrar").click();

    cy.wait("@login");
    cy.get('a[href="/alunos"]').first().click();

    cy.wait("@listStudents");
    cy.contains("h1", "Alunos").should("be.visible");
    cy.contains("Novo aluno").should("be.visible");
    cy.contains("Nenhum aluno cadastrado").should("be.visible");
  });
});
