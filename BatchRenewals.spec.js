import { searchFormFields } from '../../pages/searchFormFields'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'

describe('Renewals', () => {
  let sessionToken, riskDataArray, sessionSystemDate
  before(() => {
    setupSeeder('quoted').then(({ token, riskData }) => {
      sessionToken = token
      riskDataArray = riskData
      getSystemDate(token).then((res) => (sessionSystemDate = res))
    })
  })

 // after(() => {
 //   tearDownSeeder()
 // })

  context('End User Journey Test : Home Page', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    afterEach(() => {
      cy.get('.ogi-logo', { timeout: 40000 }).click()
    })

    const validateAddFormField = (field, $el) => {
      if (field.addValidations) {
        field.addValidations.forEach(v => {
          v.setInvalidValue(field.element(cy.wrap($el)))
          cy.get('#search-renewals-save').click()
          v.verifyError()
          cy.get('.validationErrorPanel a').first().click()
          field.element(cy.wrap($el)).first().should('have.focus')
        })
      }
    }

    it('Search for new batch renewal invite', () => {
      cy.get('app-dropdown-menu #Dashboard-toggle .icon-ogi-caret-down', { timeout: 50000 }).should('be.visible')
        .click({ force: true }).then(() => {
          cy.get('#Renewals', { timeout: 30000 }).click().then(() => {
            cy.waitForSpinnerToDisappear()
            cy.contains('Renewals', { timeout: 30000 }).should('be.visible')
            cy.contains('New Batch Renewal Invite', { timeout: 30000 }).should('be.visible')
            cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
            cy.contains('This is a list of batch renewal searches based on search criteria. ' +
                        'You can batch renewal invite the policies once the search is completed',
            { timeout: 30000 }).should('be.visible')
            cy.contains('Batch Renewal Invites').should('be.visible')
            cy.contains('This is a list of all batch renewal invites ', { timeout: 30000 }).should('be.visible')
            cy.get('#new-renewal-btn', { timeout: 10000 }).click()
            cy.waitForSpinnerToDisappear()
            cy.contains('New Batch Renewal Invite').should('be.visible')
            cy.contains('Batch Renewal Invite Criteria').should('be.visible')
          })
        })
      cy.get('.ogi-form-row-inline').each(($el, i) => {
        const field = searchFormFields[i]
        cy.wrap($el).find('label').first().should('have.text', field.label)
        if (field.verifyValue) { field.verifyValue(cy.wrap($el)) }
        validateAddFormField(field, $el)
        if (field.setValue) { field.setValue(field.element(cy.wrap($el))) }
      })
      cy.get('#search-renewals-cancel', { timeout: 30000 }).click()
      cy.contains('Exit without saving? All information will be lost').should('be.visible')
      cy.get('#warning-popup-btn-no').click()
      cy.get('#search-renewals-save', { timeout: 30000 }).click()
      cy.waitForSpinnerToDisappear()
      cy.contains('The Batch Renewal Search Process is queued. It will start in the background after all processes in the queue finish.')
      cy.get('#warning-popup-btn-no').click()
      cy.waitForSpinnerToDisappear()
      cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
      cy.contains('Batch Renewal Invites').should('be.visible')
    })

    it('Navigate to search criteria page > Click Cancel without any change > Redirect to history page', () => {
      cy.get('app-dropdown-menu #Dashboard-toggle .icon-ogi-caret-down', { timeout: 50000 }).should('be.visible')
        .click({ force: true }).then(() => {
          cy.get('#Renewals').click().then(() => {
            cy.waitForSpinnerToDisappear()
            cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
            cy.contains('Batch Renewal Invites').should('be.visible')
            cy.contains('New Batch Renewal Invite', { timeout: 30000 }).should('be.visible')
            cy.get('#new-renewal-btn', { timeout: 10000 }).click()
            cy.waitForSpinnerToDisappear()
            cy.contains('New Batch Renewal Invite').should('be.visible')
            cy.contains('Batch Renewal Invite Criteria').should('be.visible')
          })
        })
      cy.get('#search-renewals-cancel', { timeout: 30000 }).click()
      cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
      cy.contains('Batch Renewal Invites').should('be.visible')
    })

    it('Navigate to search criteria page > Click Cancel after change > Redirect to history page if click on Yes', () => {
      cy.get('app-dropdown-menu #Dashboard-toggle .icon-ogi-caret-down', { timeout: 50000 }).should('be.visible')
        .click({ force: true }).then(() => {
          cy.get('#Renewals').click().then(() => {
            cy.waitForSpinnerToDisappear()
            cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
            cy.contains('Batch Renewal Invites').should('be.visible')
            cy.contains('New Batch Renewal Invite', { timeout: 30000 }).should('be.visible')
            cy.get('#new-renewal-btn', { timeout: 10000 }).click()
            cy.waitForSpinnerToDisappear()
            cy.contains('New Batch Renewal Invite').should('be.visible')
            cy.contains('Batch Renewal Invite Criteria').should('be.visible')
          })
        })
      cy.get('.ogi-form-row-inline').each(($el, i) => {
        const field = searchFormFields[i]
        cy.wrap($el).find('label').first().should('have.text', field.label)
        if (field.setValue) { field.setValue(field.element(cy.wrap($el))) }
      })
      cy.get('#search-renewals-cancel', { timeout: 30000 }).click()
      cy.contains('Exit without saving? All information will be lost').should('be.visible')
      cy.get('#warning-popup-btn-yes').click().then(() => {
        cy.waitForSpinnerToDisappear()
        cy.contains('Batch Renewal Searches', { timeout: 30000 }).should('be.visible')
        cy.contains('Batch Renewal Invites').should('be.visible')
      })
    })
  })
})
