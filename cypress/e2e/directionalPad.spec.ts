/// <reference types="cypress" />

describe('Directional Pad - on-screen buttons', () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport(375, 667);
    cy.visit('/');
  });

  const directions: { buttonTestId: string; expected: string }[] = [
    { buttonTestId: 'btn-up', expected: 'up' },
    { buttonTestId: 'btn-down', expected: 'down' },
    { buttonTestId: 'btn-left', expected: 'left' },
    { buttonTestId: 'btn-right', expected: 'right' },
  ];

  directions.forEach(({ buttonTestId, expected }) => {
    it(`clicking ${buttonTestId} sets direction to ${expected}`, () => {
      cy.get(`[data-testid="${buttonTestId}"]`).click();
      cy.get('[data-testid="current-direction"]').should('contain', expected);
    });
  });
});
