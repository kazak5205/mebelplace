/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login helper
       * @example cy.login('user@test.com', 'Password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Tab to next element
       */
      tab(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.wait(1000)
})

Cypress.Commands.add('tab', () => {
  cy.focused().type('{tab}')
})

export {}


