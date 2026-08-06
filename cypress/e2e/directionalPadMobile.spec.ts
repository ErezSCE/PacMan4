/// <reference types="cypress" />

describe('Directional Pad - mobile viewport', () => {
  beforeEach(() => {
    // Mobile viewport dimensions
    cy.viewport(375, 667);
    cy.visit('/');
  });

  const directions = [
    { testId: 'btn-up', expected: 'up' },
    { testId: 'btn-down', expected: 'down' },
    { testId: 'btn-left', expected: 'left' },
    { testId: 'btn-right', expected: 'right' },
  ];

  directions.forEach(({ testId, expected }) => {
    it(`pressing ${testId} updates direction to ${expected}`, () => {
      cy.get(`[data-testid="${testId}"]`).click();
      cy.get('[data-testid="current-direction"]').should('contain', expected);
    });
  });
});
