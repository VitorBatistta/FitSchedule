const sessionKey = "fitschedule.personalSession";

Cypress.Commands.add("loginAsAdmin", () => {
  window.localStorage.setItem(
    sessionKey,
    JSON.stringify({
      id: "11111111-1111-1111-1111-111111111111",
      name: "Administrador",
      email: "admin@fitschedule.com",
      canManageStudents: true,
      canManageAppointments: true,
      admin: true,
    }),
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
    }
  }
}

export {};
