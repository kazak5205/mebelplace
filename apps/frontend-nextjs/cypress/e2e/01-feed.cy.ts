/**
 * E2E Test: Feed Flow
 * Tests: autoplay, interactions, infinite scroll, ad injection
 */

describe('Feed Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // Wait for initial load
  })

  it('should load feed and display videos', () => {
    cy.get('[data-testid="video-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="video-card"]').first().should('be.visible')
  })

  it('should autoplay video when 70% visible', () => {
    cy.get('[data-testid="video-player"]').first().then(($video) => {
      const video = $video[0] as HTMLVideoElement
      expect(video.paused).to.be.false
    })
  })

  it('should pause/play on tap', () => {
    cy.get('[data-testid="video-player"]').first().click()
    cy.wait(100)
    cy.get('[data-testid="video-player"]').first().then(($video) => {
      const video = $video[0] as HTMLVideoElement
      expect(video.paused).to.be.true
    })

    cy.get('[data-testid="video-player"]').first().click()
    cy.wait(100)
    cy.get('[data-testid="video-player"]').first().then(($video) => {
      const video = $video[0] as HTMLVideoElement
      expect(video.paused).to.be.false
    })
  })

  it('should show ad every 5th video', () => {
    // Scroll to 5th video
    cy.get('[data-testid="video-card"]').eq(4).scrollIntoView()
    cy.wait(500)

    // 5th video should have ad badge
    cy.get('[data-testid="video-card"]').eq(5).within(() => {
      cy.contains('Реклама').should('be.visible')
    })
  })

  it('should open bottom sheet with video details', () => {
    cy.get('[data-testid="video-info-chevron"]').first().click()
    cy.get('[data-testid="bottom-sheet"]').should('be.visible')
    cy.get('[data-testid="video-title"]').should('be.visible')
    cy.get('[data-testid="video-price"]').should('be.visible')
  })

  it('should increment like counter on double-tap', () => {
    cy.get('[data-testid="like-count"]').first().invoke('text').then((initialCount) => {
      cy.get('[data-testid="video-player"]').first().dblclick()
      cy.wait(500)
      cy.get('[data-testid="like-count"]').first().invoke('text').should('not.eq', initialCount)
    })
  })

  it('should load more videos on scroll (infinite scroll)', () => {
    cy.get('[data-testid="video-card"]').its('length').then((initialCount) => {
      // Scroll to bottom
      cy.scrollTo('bottom')
      cy.wait(2000)

      cy.get('[data-testid="video-card"]').its('length').should('be.greaterThan', initialCount)
    })
  })
})


