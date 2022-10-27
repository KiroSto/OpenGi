import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { CreatePolicy } from '../../../helpers/create-policy'
import { getSystemDate } from '../../services/system-date'
import { callAmendDates } from '../call-amend-dates'

describe('Validate Match List Side pane When matches above threshold are returned', () => {
  const newSanctionsChecksBtn = '#new-sanction-btn > span'
  let sessionToken
  let sessionSystemDate
  let riskDataGlobal
  before(() => {
    setupSeeder('quoted').then(({ token, riskData }) => {
      sessionToken = token
      riskDataGlobal = riskData

      getSystemDate(token).then((res) => (sessionSystemDate = res))
    })
  })

  // after(() => {
  //   tearDownSeeder()
  // })
  const overrideMatch = (id) =>
    cy
      .get('#' + id)
      .scrollIntoView()
      .check({ force: true })

  it('User should be able to edit the sanction check and override matches for US & UK and should have notes', () => {
    const noteDescription = 'Sample Note added at ' + Date.now().toString()
    // cy.server();
    cy.intercept('GET', '**/sanction?customerId*').as('getSanctionsHistory')
    cy.intercept('PATCH', '**/sanction/*').as('saveNote')
    cy.intercept('POST', '**/sanction?customerId*').as('postSanctionsHistory')
    cy.intercept('GET', '**/sanction/*').as('getSanctionDetails')
    CreatePolicy(sessionToken, riskDataGlobal, 1, false, ({
      res
    }) => {
      const policyId = res.body.PolicyNumber
      const policyDetailsId = res.body.PolicyDetailsId
      const user = JSON.parse(sessionStorage.getItem('USER'))
      callAmendDates({
        accessToken: user.access_token,
        policyDetailsId,
        interval: 'month',
        period: -11,
        includeClientData: true
      })
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear().type(policyId).type('{enter}')
      cy.get('datatable-body-row').click()
      cy.get('#ViewClient', { timeout: 40000 }).should('be.visible').click()
      // navigateToRecordSummary(sessionSystemDate, res.body.PolicyDetailsId);
    }
    )
    cy.get('#client-checks-tab').then((tab) => {
      cy.wrap(tab)
        .click()
        .then(() => {
          cy.get(newSanctionsChecksBtn, { timeout: 50000 })
            .click()
            .then(() => {
              cy.wait('@postSanctionsHistory', {
                timeout: Cypress.config('apiTimeout')
              }).then(() => {
                cy.wait('@getSanctionDetails', {
                  timeout: Cypress.config('apiTimeout')
                }).then((responseMatch) => {
                  const matchIdUK =
                    responseMatch.response.body.matches.GB[0].Id
                  const matchIdUS =
                    responseMatch.response.body.matches.US[0].Id
                  cy.waitForSpinnerToDisappear()
                  cy.get('#note_description')
                    .type(noteDescription)
                    .then(() => {
                      overrideMatch(matchIdUK).then(() => {
                        cy.get('#us-list')
                          .scrollIntoView()
                          .click()
                          .then(() => {
                            overrideMatch(matchIdUS).then(() => {
                              cy.contains('Save')
                                .scrollIntoView()
                                .click()
                                .then(() => {
                                  cy.wait('@saveNote', {
                                    timeout: Cypress.config('apiTimeout')
                                  })
                                  cy.wait('@getSanctionsHistory', {
                                    timeout: Cypress.config('apiTimeout')
                                  }).should(() => {
                                    cy.get('.selected > :nth-child(1) span', {
                                      timeout: 20000
                                    })
                                      .should(
                                        'contain',
                                        'Some Matches Overridden'
                                      )
                                      .click()
                                      .then(() => {
                                        cy.wait('@getSanctionDetails', {
                                          timeout: Cypress.config('apiTimeout')
                                        }).then(() => {
                                          cy.waitForSpinnerToDisappear()
                                          cy.get(
                                            'span:contains("Match overridden")'
                                          ).should('have.length', 1)
                                          cy.get('#us-list')
                                            .scrollIntoView()
                                            .click()
                                            .then(() => {
                                              cy.get(
                                                'span:contains("Match overridden")'
                                              ).should('have.length', 1)
                                              cy.contains('Cancel')
                                                .click()
                                                .then(() => {
                                                  cy.contains(
                                                    'Sanctions Checks'
                                                  ).should('be.visible')
                                                })
                                            })
                                        })
                                      })
                                  })
                                })
                              // cy.wait('@getSanctionsHistory', {
                              //   timeout: Cypress.config('apiTimeout')
                              // }).should(() => {
                              //   cy.get('.selected > :nth-child(1) span', {
                              //     timeout: 20000
                              //   })
                              //     .should(
                              //       'contain',
                              //       'Some Matches Overridden'
                              //     )
                              //     .click()
                              //     .then(() => {
                              //       cy.wait('@getSanctionDetails', {
                              //         timeout: Cypress.config('apiTimeout')
                              //       }).then(() => {
                              //         cy.wait(5000)
                              //         cy.get(
                              //           'span:contains("Match overridden")'
                              //         ).should('have.length', 1)
                              //         cy.get('#us-list')
                              //           .scrollIntoView()
                              //           .click()
                              //           .then(() => {
                              //             cy.get(
                              //               'span:contains("Match overridden")'
                              //             ).should('have.length', 1)
                              //             cy.contains('Cancel')
                              //               .click()
                              //               .then(() => {
                              //                 cy.contains(
                              //                   'Sanctions Checks'
                              //                 ).should('be.visible')
                              //               })
                              //           })
                              //       })
                              //     })
                              // })
                            })
                          })
                      })
                    })
                })
              })
            })
        })
    })
  })
})