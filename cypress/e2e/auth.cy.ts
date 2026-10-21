describe("Autenticacao", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("redireciona visitantes para a tela de login", () => {
    cy.visit("/");

    cy.location("pathname").should("eq", "/login");
    cy.contains("Acesso do personal").should("be.visible");
  });

  it("Validação de campo email", () => {
    cy.visit("/login");
    cy.contains("Acesso do personal").should("be.visible");
    cy.wait(500);
    cy.get('input[name="password"]').type("123456");
    cy.contains("button", "Entrar").click();

    cy.get('input[name="email"]').should(($input) => {
      expect($input[0].checkValidity()).to.eq(false);
      expect($input[0].validity.valueMissing).to.eq(true);
    });

    cy.contains("E-mail obrigatório.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("Validação de campo senha", () => {
    cy.visit("/login");
    cy.contains("Acesso do personal").should("be.visible");
    cy.wait(500);
    cy.get('input[name="email"]').type("admin@fitschedule.com");
    cy.contains("button", "Entrar").click();

    cy.get('input[name="password"]').should(($input) => {
      expect($input[0].checkValidity()).to.eq(false);
      expect($input[0].validity.valueMissing).to.eq(true);
    });
    cy.contains("Senha obrigatória.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("Validação de email com formato inválido", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("email-invalido");
    cy.get('input[name="password"]').type("123456");
    cy.contains("button", "Entrar").click();

    cy.contains("Insira um e-mail válido.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("Validação de credenciais inválidas", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: { message: "E-mail ou senha inválidos" },
    }).as("login");

    cy.visit("/login");
    cy.get('input[name="email"]').type("usuario@invalido.com");
    cy.get('input[name="password"]').type("senhaerrada");
    cy.contains("button", "Entrar").click();

    cy.wait("@login");
    cy.contains("E-mail ou senha inválidos").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("Validação de login realizado com sucesso", () => {
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
        students: 2,
        futureAppointments: 1,
        upcoming: [],
      },
    }).as("dashboard");

    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@fitschedule.com");
    cy.get('input[name="password"]').type("123456");
    cy.contains("button", "Entrar").click();

    cy.wait("@login");
    cy.location("pathname").should("eq", "/");
    cy.contains("Bom treino").should("be.visible");
    cy.contains("Alunos cadastrados").should("be.visible");
  });
});
