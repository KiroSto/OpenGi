import {
  CreateProspect
} from '../../../helpers/create-prospect'
import { selectRandomOption } from '../../../helpers/inputs'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import filterTests from '../../support/filterTests'
import { paymentSummary } from '../payment-summary'
import { directDebitDetails } from '../direct-debit-details'
import { initialisePermanentMTA } from '../initialise-mta'
import {
  addClientConnection,
  addClientLink,
  addSuggestedLink,
  deleteClientConnection,
  editClientHeader,
  removeClientLink,
  checkTotalActiveGWP,
  checkTotalOutstandingBalance
} from '../view-client'
import { overrideRefer, QuoteSummary_Check_Premium, selectPaymentPlan } from '../quote-summary'
require('cypress-xpath')

filterTests([], () => {
  describe('SCV', () => {
    let sessionToken
    let sessionSystemDate
    let riskDataGlobal
    let companyName
    let address
    let dateEstablished
    let policyReference1

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

    it('should be able to search for the client,navigate to SCV and perform actions, then Ovrride Refer,convert to Policy, Amend details,Initialize and Accept MTA and validate data on SCV', () => {
      SCV(riskDataGlobal)
    })

    const SCV = (riskData) => {
      // create prospect with API, populated with Business Details data that returns prostect with status Refer
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

        // Get the company name, address and date established
        cy.get('#name-row-0')
          .should('be.visible')
          .then(($text) => {
            companyName = $text.text().trim()
          })

        cy.get('#address-row-0')
          .should('be.visible')
          .then(($text) => {
            address = $text.text().trim()
          })

        cy.xpath('//*[contains(text(),"DOB")]/following-sibling::span').then(
          ($value) => {
            dateEstablished = $value.text()
          }
        )

        // Go to View Client page
        cy.get('#policy-start-date-row-0').click()
        cy.get('#ViewClient').click()

        // Validate Client Details
        cy.get('[id=client-name]')
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq(companyName))

        cy.get('[id=client-address]')
          .invoke('text')
          .should((text) =>
            expect(text.substring(0, address.length)).to.eq(address)
          )

        cy.get('[id=client-date]')
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq(dateEstablished))

        // Perform actions on SCV
        editClientHeader()
        addClientLink()
        removeClientLink()
        addClientConnection()
        deleteClientConnection()
        addSuggestedLink()

        // Search for created Prospect, Open Quote Summary and Override Refer
        cy.get('[id=client-search-txt]', { timeout: 3000 }).type('{enter}')
        // cy.get('#name-row-0').click()
        cy.waitForSpinnerToDisappear();
        cy.get('[id=policy-start-date-row-0]').click({ force: true })
        cy.get('#ViewPolicy').click()
        cy.waitForSpinnerToDisappear();
        cy.get('[id=quoteActionMenuId]').click({ force: true })
        cy.waitForSpinnerToDisappear();
        // cy.get('#quoteActionMenuId', { timeout: 30000 }).click();
        cy.get('#retrieveQuoteId').click({ force: true })
        cy.waitForSpinnerToDisappear();
        overrideRefer()
        cy.waitForSpinnerToDisappear()
        selectPaymentPlan('Annual', true)
        // ConvertToPolicy
        cy.get('#ConvertToPolicy').click()
        cy.get('[id="continue-btn"]').click()
        paymentSummary()
        //directDebitDetails(sessionSystemDate)
        
        // Amend Policy
        cy.waitForSpinnerToDisappear();
        cy.get('[id="policyActionMenuId"').click({ force: true })
        cy.get('[id="amendDetailsId"').click({ force: true })

        // Remove/Edit/Add Telephone Number, change e-mail Address
        const telephoneNumber = '00888888888'
        const email = 'test@test.com'
        cy.get('#add-telephone-btn').click({ force: true })
        cy.get('[id="root.proposer.telephone.telephoneNumber"]')
          .click({ force: true })
          .type(telephoneNumber.trim())
        selectRandomOption('[id="root.proposer.telephone.telephoneTypeId-ddl"]')
        cy.get('[id="root.proposer.telephone.exDirectory-true"]').click({ force: true })
        cy.get('#add-telephone-blade-btn').click({ force: true })
        cy.get('#close-blade').click({ force: true })
        cy.get('[id="root.proposer.emailAddress"]')
          .click({ force: true })
          .type(email)
        cy.get('#save-btn').click()

        // Initialize and Accept MTA without Business details
        initialisePermanentMTA(sessionSystemDate)
        cy.scrollTo('bottom')
        cy.get('[id="next-btn-toggle"]').scrollIntoView().click({ force: true })
        cy.get('[id="quote-btn"]').click({ force: true })
        cy.waitForSpinnerToDisappear();
        cy.get('#quotesTable_row_0_action_1').click()
        cy.get('#referBladeApplyOverrideBtn').click()
        QuoteSummary_Check_Premium()

        // Get Policy Reference
        cy.get('[id="policyReference-value"]')
          .should('be.visible')
          .then(($text) => {
            policyReference1 = $text.text()
            cy.get('[id="client-search-txt"]')
              .clear()
              .type(policyReference1)
              .type('{enter}')
          })

        // On View client, verify the Policy status,amended data is correctly mapped and that number of active policies is correct in statistics panel

        cy.get('#ViewClient').click()
        checkTotalActiveGWP()
        checkTotalOutstandingBalance()
        cy.get('#policy-status-row-0').should('have.text', ' MTA ')
        cy.get('[id="client-telephone"]')
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq(telephoneNumber.trim()))
        cy.get('[id="client-email"]')
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq(email.trim()))
        cy.xpath('//*[contains(text(),"ACTIVE POLICIES")]/preceding-sibling::div/descendant::h2').should('have.text', '1')

        cy.get('[id="business-details-tab"]').click()

        // Business Details tab
        cy.get('[id="business-details-tab"]').click()
        cy.xpath('//*[@id="containerID"]/div/div/app-single-client-view/div/div[4]/business-details/ui-panel[1]/div/div/div/app-data-list/table/tbody/tr/td[2]/span') 
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq('MTA'))
        // cy.xpath('//*[@id="containerID"]/div/div/app-single-client-view/div/div[4]/business-details/ui-panel[1]/div/div/div/app-data-list/table/tbody/tr/td[4]/span').should('have.text', startDate)
        cy.xpath('//*[@id="containerID"]/div/div/app-single-client-view/div/div[4]/business-details/ui-panel[1]/div/div/div/app-data-list/table/tbody/tr/td[1]/span')
          .invoke('text')
          .should((text) => expect(text.trim()).to.eq(policyReference1.trim()))
      }
      )
    }
  })
})
