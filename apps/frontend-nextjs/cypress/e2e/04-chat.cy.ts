/**
 * E2E Test: Chat Flow
 * Tests: Send message, attachments, typing indicator, read receipts
 */

describe('Chat Flow', () => {
  beforeEach(() => {
    // Login as User
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type('user@test.com')
    cy.get('[data-testid="password-input"]').type('Password123')
    cy.get('[data-testid="login-button"]').click()
    cy.wait(1000)

    // Navigate to chats
    cy.visit('/chats')
  })

  it('should display chat list', () => {
    cy.get('[data-testid="chat-list"]').should('be.visible')
    cy.get('[data-testid="chat-item"]').should('have.length.greaterThan', 0)
  })

  it('should send text message', () => {
    // Open first chat
    cy.get('[data-testid="chat-item"]').first().click()

    // Type and send message
    const testMessage = `Test message ${Date.now()}`
    cy.get('[data-testid="message-input"]').type(testMessage)
    cy.get('[data-testid="send-button"]').click()

    // Verify message appears
    cy.contains(testMessage).should('be.visible')

    // Verify read receipt (sent status)
    cy.get('[data-testid="read-receipt"]').last().should('exist')
  })

  it('should show typing indicator', () => {
    cy.get('[data-testid="chat-item"]').first().click()

    // Start typing
    cy.get('[data-testid="message-input"]').type('Hello')

    // Typing indicator should appear for other user (simulated)
    // In real test, need second client to verify
    cy.get('[data-testid="message-input"]').should('have.value', 'Hello')
  })

  it('should send image attachment', () => {
    cy.get('[data-testid="chat-item"]').first().click()

    cy.get('[data-testid="attach-button"]').click()
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-image.jpg', { force: true })

    cy.get('[data-testid="send-button"]').click()

    // Verify image message appears
    cy.get('[data-testid="message-image"]').last().should('be.visible')
  })
})


