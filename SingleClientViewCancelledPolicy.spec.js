import { CreatePolicy } from '../../../helpers/create-policy'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import { incrementDate } from '../../../helpers/dates'
import {
  checkTotalActiveGWP,
  checkTotalOutstandingBalance
} from '../view-client'
require('cypress-xpath')

describe('Search for a policy and cancel it', () => {
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

  it('should be able to create and search for the policy, and then cancel it', () => {
    // create policy with API
    // TODO: Uncomment the for cycle and change in between the brackets to "temporaryMTA(riskDataArray[i])" when we have schemes for all lobs
    // for (let i = 0; i < riskDataArray.length; i++) {
    cancelPolicy(riskDataGlobal)
    // }
  })

  const cancelPolicy = (riskData) => {
    // create policy with API
    // navigate to record summary with id
    // createPolicy() returns a cy.request which we chain off
    // we could change createPolicy() to return a Promise and then we could use async await
    // Cypress does complain about this sort of thing though
    // "Cypress Warning: Cypress detected that you returned a promise in a test, but also invoked one or more cy commands inside of that promise."
    CreatePolicy(sessionToken, riskData, 1, false, ({
      res
    }) => {
      // search and view created policy
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear()
        .type(res.body.PolicyNumber)
        .type('{enter}')

      cy.get('#name-row-0').click()
      cy.get('#policy-start-date-row-0').click()
      cy.get('#ViewPolicy').click()
      cy.waitForSpinnerToDisappear()
      cy.get('[id="policyActionMenuId"]', { timeout: 60000 }).click({
        force: true
      })
      cy.waitForSpinnerToDisappear()
      cy.get('[id="cancelPolicyId"]', { timeout: 60000 }).click({
        force: true
      })
      cy.waitForSpinnerToDisappear()
      cy.get('[id="cancelButton"]', { timeout: 60000 }).click({
        force: true
      })
      cy.get('[id="render-list-CANCEL_REASON-ddl"]').select(
        'Auto Cancellation - Outstanding Balance'
      )
      cy.get('[id="note-type-dropdown-ddl"]').select('Automatic')

      const {
        date: cancelDate,
        month: cancelMonth,
        year: cancelYear
      } = incrementDate(sessionSystemDate, 10)
      cy.get('[id="cancelation-DD-txt"]').type(cancelDate)
      cy.get('[id="cancelation-MM-txt"]').type(cancelMonth)
      cy.get('[id="cancelation-YYYY-txt"]').type(cancelYear)
      cy.get('[id="cancelationTime-HH-txt"]').type('23')
      cy.get('[id="cancelationTime-MM-txt"]').type('59')
      cy.get('[id="calculateButton"]').click({ force: true })

      cy.get('[id="adjustButton"]').click({ force: true })
      cy.get('[id="_row_0_popover"]').click({ force: true })
      cy.get('[id="_row_0_action_0"]').click({ force: true })
      cy.get('[id="amount"]').type('-1000')
      cy.get('[id="reason-ddl"]').select('Free insurance')
      cy.get('[id="premiumSectionsBladeCloseBtn"]').click({
        force: true
      })
      cy.get('[id="premiumSectionsCancelationBladeCloseBtn"]').click({
        force: true
      })
      cy.get('[id="continue-btn"]').click({ force: true })

      cy.get('[id="listPayMethodIdPaymentType-ddl"]').select('Other') // selects debit card
      cy.get('[id="continueBtnPaymentSummary"]').click({ force: true })
      //cy.get('[id="btn-close-warning"]').click()

      cy.get('[id=client-search-txt]')
        .clear()
        .type(res.body.PolicyNumber)
        .type('{enter}')

      cy.get('#name-row-0').click()
      cy.get('#ViewClient').click()
      checkTotalActiveGWP()
      checkTotalOutstandingBalance()
      cy.contains(' Cancellation Pending ')
      cy.contains(' Policy ')
      cy.get('#policy-status-row-2').should('not.exist')
      // cy.xpath("//div[contains(text(),'ACTIVE POLICIES')]/preceding-sibling::div/descendant::h2").should('have.text', '1')
      // cy.xpath("//div[contains(text(),'TOTAL ACTIVE GWP')]/preceding-sibling::div/descendant::h2").then(($btn) => {
      //   const txt = $btn.text()
      //   cy.xpath("//div[contains(text(),'TOTAL OUTSTANDING BALANCE')]/preceding-sibling::div/descendant::h2").should('have.text', '-' + txt)
      // })
    })
  }
})
