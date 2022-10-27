import { claimsFormFieldsMotor } from '../../../helpers/claimsFormField'
import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { CreatePolicy } from '../../../helpers/create-policy'
import { getSystemDate } from '../../services/system-date'
import { callAmendDates } from '../call-amend-dates'

describe('PAS Claims - ADD and EDIT PAS Claims', () => {
  let sessionToken
  let sessionSystemDate
  let policyId
  const goToPolicyPage = (policyId) => {
    cy.get('#client-search-txt').clear()
      .type(policyId)
      .then(() => {
        cy.get('#search-btn').click()
      })
    cy.get('datatable-body-row')
      .click()
      .then(() => {
        cy.get('#policy-results-table-cmp datatable-body-row')
          .click()
          .then(() => {
            cy.get('#ViewPolicy').click()
          })
      })
  }
  const goToHomePage = () => {
    return cy
      .get('.ogi-logo')
      .click()
      .then(() => {
        cy.get('.ogi-profile__initials')
          .click()
          .then(() => {
            cy.get('#user-profile-logout').click()
          })
      })
  }
  const goToClaimsHistoryPage = () => {
    return cy
      .contains('Policy', { timeout: 30000 })
      .click({ force: true })
      .then(() => {
        cy.get('#viewClaimsId', { timeout: 30000 }).click({ force: true })
      })
  }
  const validateAddFormField = (field, $el) => {
    if (field.addValidations) {
      field.addValidations.forEach((v) => {
        v.setInvalidValue(field.element(cy.wrap($el)))
        cy.get('#add-claim-save').click()
        v.verifyError()
        cy.get('.validationErrorPanel a').first().click()
        field.element(cy.wrap($el)).first().should('have.focus')
      })
    }
  }
  const validateEditFormField = (field, $el) => {
    if (field.editValidations) {
      field.editValidations.forEach((v) => {
        v.setInvalidValue(field.element(cy.wrap($el)))
        cy.get('#add-claim-save').click()
        v.verifyError()
        cy.get('.validationErrorPanel a').first().click()
        field.element(cy.wrap($el)).first().should('have.focus')
      })
    }
  }

  let riskDataGlobal
  before(() => {
    setupSeeder('quoted').then(({ token, riskData }) => {
      sessionToken = token
      riskDataGlobal = riskData
      getSystemDate(token).then((res) => (sessionSystemDate = res))
    })
  })

 //after(() => {
 //  tearDownSeeder()
 //})

  context('Integrated End User Tests E2E :Open Market Motor', () => {
    before(() => {
      CreatePolicy(sessionToken, riskDataGlobal, 1, false, ({
        res,
        policyDetailsId
      }) => {
        policyId = res.body.PolicyNumber
        const user = JSON.parse(sessionStorage.getItem('USER'))
        callAmendDates({
          accessToken: user.access_token,
          policyDetailsId,
          interval: 'month',
          period: -11,
          includeClientData: true
        })
        cy.visit('/')
        cy.get('[id=client-search-txt]')
          .clear()
          .type(policyId)
          .type('{enter}')
        cy.get('#name-row-0').click()
        cy.get('#policy-start-date-row-0').click()
        cy.get('#ViewPolicy').click()
      }
      )
    })

    beforeEach(() => {
      cy.waitForSpinnerToDisappear()
      cy.contains('Policy', { timeout: 30000 })
        .click({ force: true })
        .then(() => {
          cy.get('#viewClaimsId', { timeout: 30000 })
            .click({ force: true })
            .then(() => {
              cy.get('#new-claim-btn', { timeout: 50000 }).click()
            })
        })
    })

    it('Validate the Add and Edit PAS Claim functionality', () => {
      let generatedClaim
      cy.get('#add-claims-header', { timeout: 10000 }).should('be.visible')
      cy.get('.ogi-form-row-inline').each(($el, i) => {
        const field = claimsFormFieldsMotor[i]
        cy.wrap($el).find('label').first().should('have.text', field.label)
        if (field.verifyValue) field.verifyValue(cy.wrap($el))
        validateAddFormField(field, $el)
        if (field.setValue) field.setValue(field.element(cy.wrap($el)))
      })
      cy.get('#add-claim-save').click()
      cy.get('.toast-success', { timeout: 10000 }).within(() => {
        cy.get('div span')
          .invoke('text')
          .then((claimId) => {
            generatedClaim = claimId
          })
        cy.contains('Claim added. Reference:')
      })

      // Select record from History table and edit the same
      cy.get('tr:nth-child(1)', { timeout: 50000 }).then((row) => {
        cy.wrap(row)
          .contains(generatedClaim)
          .click()
          .then(() => {
            cy.get('#add-claims-header', { timeout: 50000 }).should(
              'have.text',
              'Edit Claim'
            )
            cy.get('.ogi-form-row-inline').each(($el, i) => {
              const field = claimsFormFieldsMotor[i]
              cy.wrap($el)
                .find('label')
                .first()
                .should('have.text', field.label)
              if (field.verifyEditValue) field.verifyEditValue(cy.wrap($el))
              validateEditFormField(field, $el)
              if (field.setEditValue) {
                field.setEditValue(field.element(cy.wrap($el)))
              }
            })
            cy.get('#add-claim-save').click()
            cy.get('.toast-success', { timeout: 25000 }).within(() => {
              cy.get('div span')
                .invoke('text')
                .should('be.equal', generatedClaim)
              cy.contains('Claim updated. Reference:')
            })
            cy.get('tr:nth-child(1)').within(() => {
              cy.contains(generatedClaim).should('be.visible')
            })
          })
      })
    })
  })
})
