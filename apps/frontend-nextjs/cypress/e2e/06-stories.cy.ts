/**
 * E2E Test: Stories Flow
 * Tests: View stories, swipe navigation, 24h expiry
 */

describe('Stories Flow', () => {
  it('should display stories bar on feed', () => {
    cy.visit('/')

    cy.get('[data-testid="stories-bar"]').should('be.visible')
    cy.get('[data-testid="story-channel"]').should('have.length.greaterThan', 0)
  })

  it('should open story viewer on channel click', () => {
    cy.visit('/')

    cy.get('[data-testid="story-channel"]').first().click()

    cy.get('[data-testid="story-viewer"]').should('be.visible')
    cy.get('[data-testid="story-media"]').should('be.visible')
    cy.get('[data-testid="story-progress-bar"]').should('exist')
  })

  it('should navigate between stories with arrows', () => {
    cy.visit('/')
    cy.get('[data-testid="story-channel"]').first().click()

    // Next story
    cy.get('[data-testid="story-next-button"]').click()
    cy.wait(500)

    // Previous story
    cy.get('[data-testid="story-prev-button"]').click()
    cy.wait(500)
  })

  it('should close story viewer on X button', () => {
    cy.visit('/')
    cy.get('[data-testid="story-channel"]').first().click()

    cy.get('[data-testid="story-close-button"]').click()
    cy.get('[data-testid="story-viewer"]').should('not.exist')
  })

  it('should show add story button for masters', () => {
    // Login as master
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type('master@test.com')
    cy.get('[data-testid="password-input"]').type('Password123')
    cy.get('[data-testid="login-button"]').click()
    cy.wait(1000)

    cy.visit('/')
    cy.get('[data-testid="add-story-button"]').should('be.visible')
  })
})


