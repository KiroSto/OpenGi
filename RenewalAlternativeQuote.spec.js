import { CreatePolicy } from '../../../helpers/create-policy'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date.js'
import { callAmendDates } from '../call-amend-dates'
import { paymentSummary,paymentSummaryBD } from '../payment-summary'
import { recordSummary } from '../record-summary'
import { FromPolicy_NavigateToTransactions_PageLoads } from '../../pages/recordSummary'
import { directDebitDetails } from '../direct-debit-details'
import {
  selectRandomPaymentPlan,
  addingAlternativeQuoteDiscount,selectPaymentPlan
} from '../quote-summary'
describe('Renewal and alternative quote', () => {
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

//after(() => {
//  tearDownSeeder()
//})

  it('should be able to search for the client, land on the record summary and see that the policy status is policy and initialize and accept Renewals AQ', () => {
    // create policy with API
    renewalsAQ(riskDataGlobal)
  })

  const renewalsAQ = (riskData) => {
    // create policy with API
    // navigate to record summary with id
    // createPolicy() returns a cy.request which we chain off
    // we could change createPolicy() to return a Promise and then we could use async await
    // Cypress does complain about this sort of thing though
    // "Cypress Warning: Cypress detected that you returned a promise in a test, but also invoked one or more cy commands inside of that promise."
    CreatePolicy(sessionToken, riskData, 1, true, ({
      res,
      policyDetailsId
    }) => {
      // search and view created policy
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear()
        .type(res.body.PolicyNumber)
        .type('{enter}')
      cy.get('#name-row-0').click()
      cy.get('#policy-start-date-row-0').click()
      cy.get('#ViewPolicy').click()

      // cy.getLocalStorage("dataCaptureConfiguration").then((config) => {
      cy.waitForSpinnerToDisappear()
      cy.get('#renewalActionMenuId').click({
        force: true
      })
      cy.get('#inviteRenewalId').click({ force: true })
      const user = JSON.parse(sessionStorage.getItem('USER'))
      callAmendDates({
        accessToken: user.access_token,
        policyDetailsId,
        interval: 'month',
        period: -11,
        includeClientData: true
      })
      addingAlternativeQuoteDiscount()
      //selectPaymentPlan('Annual', true)
      cy.waitForSpinnerToDisappear()
      //selectRandomPaymentPlan('Annual', false)
      // cy.get("#manualAmendmentsBladeSavebtn").click({ force: true });
      cy.get('#AcceptAQ').click({ force: true })
      cy.get('[id="continue-btn"]').click({ force: true })
      //cy.get('app-warning-dialog.ng-tns-c5-0 > .ogi-modal > .ogi-content-box__body > .action-btns > #error-popup-btn').click({ force: true })
      paymentSummary()
      //paymentSummaryBD()
      //directDebitDetails(sessionSystemDate)
      recordSummary()
      FromPolicy_NavigateToTransactions_PageLoads()
      // FromTransactions_CheckTransactions_SumToZero();
    })
  }
})
