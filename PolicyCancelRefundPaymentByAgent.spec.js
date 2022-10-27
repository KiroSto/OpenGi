import { CreatePolicy } from '../../../helpers/create-policy'
import { paymentSummaryCancellationDC } from '../payment-summary'
import { recordSummaryCancelled, recordSummaryHistoryFile } from '../record-summary'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import { incrementDate } from '../../../helpers/dates'
import { callAmendDates } from '../call-amend-dates'

describe('Policy Cancel', () => {
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

  it('Policy Cancel', () => {
    // create policy with API
    policyCancel(riskDataGlobal)
  })

  const policyCancel = (riskData) => {
    // console.log(riskData.RiskData)
    // riskData = JSON.parse(riskData.RiskData)
    CreatePolicy(sessionToken, riskData, 1, false, ({
      res,
      policyDetailsId
    }) => {
      // navigateToRecordSummary(systemDate, res.body.PolicyDetailsId);
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear()
        .type(res.body.PolicyNumber)
        .type('{enter}')

      cy.get('#name-row-0').click()
      cy.get('#policy-start-date-row-0').click()
      cy.get('#ViewPolicy').click()
      cy.get('#go-back').should('not.exist')

      const user = JSON.parse(sessionStorage.getItem('USER'))
      callAmendDates({
        accessToken: user.access_token,
        policyDetailsId,
        interval: 'day',
        period: -30,
        includeClientData: true
      })
      cy.waitForSpinnerToDisappear()
      cy.get('[id="policyActionMenuId"]', { timeout: 60000 }).click({
        force: true
      })
      cy.waitForSpinnerToDisappear()
      cy.get('[id="cancelPolicyId"]', { timeout: 60000 }).click({
        force: true
      })

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
      } = incrementDate(sessionSystemDate, -10)
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

      paymentSummaryCancellationDC()

      cy.get('#moreDetailsActionMenuId').click({ force: true })
      cy.waitForSpinnerToDisappear()
      cy.get('#hisotryId').click({ force: true })
      cy.get('#_row_1_popover').click()
      cy.get("span[id='_row_1_action_0']").click()
      recordSummaryHistoryFile()
      cy.get('#go-back').should('be.visible').click()
      cy.url().should('include', 'policy-history?timeLineView=false')
      cy.get('#_row_0_popover').click()
      cy.get("span[id='_row_0_action_0']").click()
      //cy.get('#navigate-to-record-summary-button').click()
      recordSummaryCancelled()
      //cy.get('#btn-close-warning').click()
    })
  }
})
