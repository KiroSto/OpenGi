import {
    CreateProspect
  } from '../../../helpers/create-prospect'
  import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
  import { getSystemDate } from '../../services/system-date'
  import filterTests from '../../support/filterTests'
  import { RecordSummary_RetrieveQuote_Success } from '../../pages/recordSummary'
  import { QuoteSummary_SaveAsProspect_Declined } from '../../pages/quoteSummary'
  import { RetrieveQuote_RequoteWithAmend_Success } from '../../pages/retrieveQuoteSummary'
  import { Change_DateOfBirth_Proposer, QuoteButton_Success } from '../../pages/datacaptureChange'
  require('cypress-xpath')

filterTests([], () => {
  describe('SCV', () => {
    let sessionToken
    let sessionSystemDate
    let riskDataGlobal
    before(() => {
      setupSeeder('referred').then(
        ({ token, systemDate, riskData }) => {
          sessionToken = token
          sessionSystemDate = systemDate
          riskDataGlobal = riskData
          getSystemDate(token).then((res) => (sessionSystemDate = res))
        }
      )
    })
  //  after(() => {
  //    tearDownSeeder()
  //  })
  it('should be able to create prospect, search for prospect, get status declined and check status ', () => {
    SCV(riskDataGlobal)
  })

    const SCV = (riskData) => {
    // create prospect with API, populated with Business Details data that returns prospect 
    CreateProspect(sessionToken, riskData, true, ({
      res,
      mergeQuoteResponse
    }) => {
      const riskDataObject = JSON.parse(mergeQuoteResponse.body.riskData)
      const policyReference = riskDataObject.policy.policyReference
      cy.visit('/')
      cy.get('[id=client-search-txt]').clear()
        .type(policyReference)
        .type('{enter}')
      cy.get('#name-row-0').click()
      cy.get("#policy-start-date-row-0").click()
      cy.get("#ViewPolicy").click()
      cy.waitForSpinnerToDisappear()
    });
    };
    
      RecordSummary_RetrieveQuote_Success()
      RetrieveQuote_RequoteWithAmend_Success()
      Change_DateOfBirth_Proposer()
      QuoteButton_Success()
      QuoteSummary_SaveAsProspect_Declined()
    
})
});
