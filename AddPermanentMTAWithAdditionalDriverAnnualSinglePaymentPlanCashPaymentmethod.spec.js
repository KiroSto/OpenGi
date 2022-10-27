import { CreatePolicy } from '../../../helpers/create-policy'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date.js'
import {
  addExcessesForAllApliesTo,
  addFreeTextEndorsementsForAllApliesTo,
  QuoteSummary_Check_Premium
} from '../quote-summary'
import { initialisePermanentMTA, savePermanentMTA } from '../initialise-mta'

import { recordSummaryMTA } from '../record-summary'
import { addAdditionalDriver } from '../mandatory-data-capture'

describe('Permanent MTA', () => {
  let sessionToken
  let sessionSystemDate
  let riskDataGlobal

  before(() => {
    setupSeeder('quoted').then(({ token, systemDate, riskData }) => {
      sessionToken = token
      sessionSystemDate = systemDate
      riskDataGlobal = riskData
      getSystemDate(token).then((res) => (sessionSystemDate = res))
    })
  })

 // after(() => {
 //   tearDownSeeder()
 // })

  it('should retrieve a policy and perform a permanent MTA', () => {
    // create policy with API
    permanentMTA(riskDataGlobal)
  })

  const permanentMTA = (riskData) => {
    // create policy with API
    CreatePolicy(sessionToken, riskData, 1, false, ({
      res
    }) => {
      // cy.intercept();
      // search and view created policy
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear()
        .type(res.body.PolicyNumber)
        .type('{enter}')
      cy.get('#name-row-0').click()
      cy.get('#policy-start-date-row-0').click()
      cy.get('#ViewPolicy').click()

      // Initialize Permanent MTA
      initialisePermanentMTA(sessionSystemDate)

      // Add additional driver
      cy.get('[id="DriverDetails"]').click({ force: true })
      cy.get('[id="add-additional-record-question"]').click({
        force: true
      })

      addAdditionalDriver()

      // cy.get('[id="save-subscreen-btn"]').click({ force: true })
      cy.waitForSpinnerToDisappear(); // NOOooooooOOOO!!!!!!!!!!!
      cy.get('[id="Next-toggle"]', { timeout: 10000 }).should('be.visible')
      cy.get('[id="Next-toggle"]').click({ force: true })
      cy.waitForSpinnerToDisappear();
      cy.get('[id="Quote"]', { timeout: 10000 }).should('be.visible')
      cy.get('[id="Quote"]').click()

      addExcessesForAllApliesTo()
      addFreeTextEndorsementsForAllApliesTo()
      savePermanentMTA(sessionSystemDate)
      cy.waitForSpinnerToDisappear()
      cy.scrollTo('bottom')
      cy.get('[id="next-btn-toggle"]', { timeout: 10000 }).should('be.visible')
      cy.get('[id="next-btn-toggle"]').click({ force: true })
      cy.get('[id="quote-btn"]', { timeout: 10000 }).should('be.visible')
      cy.get('[id="quote-btn"]').click()

      cy.get('[id="manualAmendmentsBladeSavebtn"]').click()
      QuoteSummary_Check_Premium()
      cy.waitForSpinnerToDisappear()
      recordSummaryMTA()
    })
  }
})
