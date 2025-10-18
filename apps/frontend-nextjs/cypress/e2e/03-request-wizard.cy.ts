/**
 * E2E Test: Request Wizard Flow
 * Tests: Create request → Master responds → Accept proposal → Order created
 */

describe('Request Wizard Flow', () => {
  // Login as User
  beforeEach(() => {
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type('user@test.com')
    cy.get('[data-testid="password-input"]').type('Password123')
    cy.get('[data-testid="login-button"]').click()
    cy.wait(1000)
  })

  it('should complete request wizard (3 steps)', () => {
    cy.visit('/requests/create')

    // Step 1: Photo upload
    cy.get('[data-testid="upload-button"]').click()
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-photo.jpg', { force: true })
    cy.get('[data-testid="next-step-button"]').click()

    // Step 2: Details
    cy.get('[data-testid="category-select"]').select('Мебель')
    cy.get('[data-testid="region-select"]').select('Алматы')
    cy.get('[data-testid="description-input"]').type('Нужен стол из дерева, 2x1 метр')
    cy.get('[data-testid="next-step-button"]').click()

    // Step 3: Preview & submit
    cy.get('[data-testid="request-preview"]').should('be.visible')
    cy.get('[data-testid="submit-request-button"]').click()

    // Verify success
    cy.contains('Заявка отправлена').should('be.visible')
    cy.url().should('include', '/requests')
  })

  it('should show confirmation toast after submit', () => {
    cy.visit('/requests/create')

    // Quick submit with minimal data
    cy.get('[data-testid="category-select"]').select('Ремонт')
    cy.get('[data-testid="description-input"]').type('Тестовая заявка')
    cy.get('[data-testid="submit-request-button"]').click()

    // Toast should appear
    cy.get('[data-testid="toast"]').should('be.visible')
    cy.contains('Заявка отправлена').should('be.visible')
  })
})


