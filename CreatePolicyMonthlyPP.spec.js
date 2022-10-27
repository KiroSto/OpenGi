import { CreateProspect } from '../../../helpers/create-prospect'
import { getSystemDate } from '../../services/system-date.js'
import {
  convertToPolicy
} from '../mandatory-data-capture'
import { paymentSummary } from '../payment-summary'
import { recordSummary } from '../record-summary'
import { selectPaymentPlan } from '../quote-summary'
import { directDebitDetails } from '../direct-debit-details'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'

describe('Create Policy Monthly PP', () => {
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
  //  tearDownSeeder()
  // })

  it('should save as prospect and perform a CopyRecord', () => {
    // createProspect(riskDataArray[13])
    CreatePolicyMonthlyPP(riskDataGlobal)
    // }
  })

  const CreatePolicyMonthlyPP = (riskData) => {
    // create prospect with API
    CreateProspect(sessionToken, riskData, false, ({
      res,
      mergeQuoteResponse
    }) => {
      const riskDataObject = JSON.parse(mergeQuoteResponse.body.riskData)
      const policyReference = riskDataObject.policy.policyReference
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear().type(policyReference).type('{enter}')
      cy.get('#name-row-0').click()
      cy.get('#policy-start-date-row-0').click()
      cy.get('#ViewPolicy').click()
      cy.waitForSpinnerToDisappear()
      cy.get('[id="quoteActionMenuId"').click()
      cy.get('[id="amendQuiteId"').click()
      //cy.get('#closeCoverStartDateBlade').should('be.visible')
      //cy.get('#closeCoverStartDateBlade').should('contain.text', 'Close')
      //cy.get('[id="updateStartDate"').should('be.visible')
      //cy.get('[id="updateStartDate"').should('contain.text', 'Save')
      //cy.get('[id="updateStartDate"').click({ force: true })

      // copyRecord();
      // const { name, fixture } = getBusinessLineConfig(
      //   Cypress.env("businessLine")
      // );
      // mandatoryDataCaptureCopyRecordDC({
      //   businessLine: name,
      //   fixture: fixture,
      // });

      //selectPaymentPlan('Annual', true)
      convertToPolicy()
      paymentSummary()
      directDebitDetails(sessionSystemDate)
      recordSummary()
    }, false)
  }
})
