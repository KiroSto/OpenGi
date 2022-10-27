import { CreatePolicy } from '../../../helpers/create-policy'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import {
  convertToPolicy,
  mandatoryDataCaptureCopyRecordDC
} from '../mandatory-data-capture'
import { paymentSummary } from '../payment-summary'
import {
  recordSummary,
  recordSummaryMTA,
  checkInsurerPolicyNumber
} from '../record-summary'
import { initialiseTemporarytMTA } from '../initialise-mta'
import { addNewQuote } from '../add-new-quote'
import { QuoteSummary_Check_Premium } from '../quote-summary'
import { checkClientVisibilityHeader } from '../client-visibility'
import { getBusinessLineConfig } from '../../../helpers/businessLinesConfig'

describe('Initialise Temporary MTA and Add New Quote', () => {
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

  it('should be able to perform temporary MTA and then add new quote', () => {
    // create policy with API
    temporaryMTA(riskDataGlobal)
  })

  const temporaryMTA = (riskData) => {
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

      // Initialize Permanent MTA
      initialiseTemporarytMTA(sessionSystemDate)
      checkClientVisibilityHeader(true, true, true)
      cy.get('[id="next-btn-toggle"]').click({ force: true })
      cy.get('[id="quote-btn"]').click({ force: true })
      checkClientVisibilityHeader(true, true, true)
      QuoteSummary_Check_Premium()
      recordSummaryMTA()
      checkClientVisibilityHeader(true, true, false)

      // add new quote
      //  addNewQuote();
      // checkClientVisibilityHeader(true, false, false);
      // const { name, fixture } = getBusinessLineConfig(
      //  Cypress.env("businessLine")
      // );
      // mandatoryDataCaptureCopyRecordDC({
      //  businessLine: name,
      //  fixture: fixture,
      // });
      // cy.get("#quotesTable").contains(schemeName).click();
      // convertToPolicy();
      // checkClientVisibilityHeader(true, false, false);
      // paymentSummary();
      // recordSummary();
      // checkClientVisibilityHeader(true, true, false);

      checkInsurerPolicyNumber()
    })
  }
})
