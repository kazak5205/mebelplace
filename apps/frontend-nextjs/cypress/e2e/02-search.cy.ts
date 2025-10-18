/**
 * E2E Test: Search Flow
 * Tests: search input, autocomplete, filters, results
 */

describe('Search Flow', () => {
  beforeEach(() => {
    cy.visit('/search')
  })

  it('should display search input', () => {
    cy.get('[data-testid="search-input"]').should('be.visible')
  })

  it('should show autocomplete suggestions', () => {
    cy.get('[data-testid="search-input"]').type('мебель')
    cy.wait(500) // Debounce
    cy.get('[data-testid="search-suggestions"]').should('be.visible')
    cy.get('[data-testid="suggestion-item"]').should('have.length.greaterThan', 0)
  })

  it('should filter results by chips', () => {
    cy.get('[data-testid="search-input"]').type('стол{enter}')
    cy.wait(1000)

    // Click filter chip
    cy.get('[data-testid="filter-chip-category"]').click()
    cy.get('[data-testid="category-option-мебель"]').click()

    cy.get('[data-testid="search-results"]').should('be.visible')
  })

  it('should display results in grid layout', () => {
    cy.get('[data-testid="search-input"]').type('кухня{enter}')
    cy.wait(1000)

    cy.get('[data-testid="results-grid"]').should('exist')
    cy.get('[data-testid="video-thumbnail"]').should('have.length.greaterThan', 0)
  })

  it('should navigate to video on click', () => {
    cy.get('[data-testid="search-input"]').type('шкаф{enter}')
    cy.wait(1000)

    cy.get('[data-testid="video-thumbnail"]').first().click()
    cy.url().should('include', '/video/')
  })
})


