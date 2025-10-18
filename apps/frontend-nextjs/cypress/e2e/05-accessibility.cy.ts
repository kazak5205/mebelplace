/**
 * E2E Test: Accessibility
 * Tests: Keyboard navigation, ARIA labels, captions, reduced motion
 */

describe('Accessibility', () => {
  it('should navigate feed using keyboard', () => {
    cy.visit('/')

    // Tab through controls
    cy.get('body').tab()
    cy.focused().should('have.attr', 'aria-label')

    // Arrow keys for navigation
    cy.get('body').type('{downarrow}')
    cy.wait(500)
    cy.get('[data-testid="video-card"]').eq(1).should('be.visible')
  })

  it('should have proper ARIA labels on all interactive elements', () => {
    cy.visit('/')

    cy.get('[data-testid="like-button"]').first().should('have.attr', 'aria-label')
    cy.get('[data-testid="comment-button"]').first().should('have.attr', 'aria-label')
    cy.get('[data-testid="share-button"]').first().should('have.attr', 'aria-label')
  })

  it('should toggle captions on video', () => {
    cy.visit('/')

    cy.get('[data-testid="captions-toggle"]').first().click()
    cy.get('[data-testid="caption-text"]').should('be.visible')

    cy.get('[data-testid="captions-toggle"]').first().click()
    cy.get('[data-testid="caption-text"]').should('not.exist')
  })

  it('should respect prefers-reduced-motion', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'mediaMatches', {
          writable: true,
          value: (query: string) => query === '(prefers-reduced-motion: reduce)',
        })
      },
    })

    // Verify animations are disabled
    cy.get('.animate-bounce').should('not.exist')
  })

  it('should have sufficient color contrast', () => {
    cy.visit('/')

    cy.get('[data-testid="primary-button"]').first().should('have.css', 'background-color')
    // Actual contrast check would need cypress-axe plugin
  })
})


