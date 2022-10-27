import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import { getBusinessLineConfig } from '../../../helpers/businessLinesConfig'
import {
  QuoteSummary_SelectProduct_Success,
  QuoteSummary_QuoteRefers_Success,
  QuoteSummary_OverrideRefer_Success,
  QuoteSummary_EditPremium_Success,
  QuoteSummary_AddExcess_Success,
  QuoteSummary_AddEndorsement_Success,
  QuoteSummary_SelectAddon_Success,
  ConvertToPolicy_ContinueToPaymentSummary_Success
} from '../../pages/quoteSummary'

import {
  FromPolicy_NavigateToTransactions_PageLoads,
  RecordSummary_LandOnRecordSummary_Success,
  RecordSummary_ViewClientActionMenuItem_Success
} from '../../pages/recordSummary'

import {
  PaymentSummary_SelectCashPaymentMethodAndPaymentNotReceived_Success,
  PaymentSummary_SelectPolicyholderAsPayer_Success
} from '../../pages/paymentSummary'

import { AccountEnquiry_CheckTransactions_OneNonZeroNotMatchedOpenTransaction } from '../../pages/accountEnquiry'
import { clientSearch, mandatoryDataCapture } from '../mandatory-data-capture'
import { checkClientVisibilityHeader } from '../client-visibility'
import { RecordSummary_AmendPolicyDetailsAndBack_Success } from '../back-navigation'
import 'cypress-xpath'
const moment = require('moment-timezone')

describe('Mobius', () => {
  let sessionToken
  let sessionSystemDate
  let sessionBrandName
  let tenantTimeZone
  let tenantTime
  let tenantDate
  let systemDate

  before(() => {
    cy.intercept('GET', '**/api/tenantConfiguration/tenant/timezone').as('timezoneCall')
    cy.intercept('GET', '**/api/tenantConfiguration/tenant/SystemDate').as('systemDateCall')
    setupSeeder('quoted', 'scenario3').then(({ token, systemDate, brandName }) => {
      sessionToken = token
      sessionSystemDate = systemDate
      sessionBrandName = brandName

      getSystemDate(token).then((res) => {
        sessionSystemDate = res
      })
    })
  })

// after(() => {
//   tearDownSeeder()
// })

  it('should be able progress through data capture by populating all mandatory fields including postcode and vehicle search', () => {
    const { name, fixtureRefer } = getBusinessLineConfig(
      Cypress.env('businessLine')
    )

    clientSearch()

    // Get Tenant Date and Time
    cy.wait('@timezoneCall').then((interception) => {
      tenantTimeZone = interception.response.body
      console.log(tenantTimeZone)
    })
      .wait('@systemDateCall').then((interception) => {
        systemDate = interception.response.body
        const start = moment.tz(systemDate, 'UTC') // original timezone
        tenantTime = start.tz(tenantTimeZone).utcOffset(0, true).format('HH')
        tenantDate = start.tz(tenantTimeZone).utcOffset(0, true).format('DD/MM/YYYY')
      })

    //checkClientVisibilityHeader(false)

    mandatoryDataCapture({
      brandName: sessionBrandName,
      businessLine: name,
      fixture: fixtureRefer
    })
  })

  QuoteSummary_SelectProduct_Success('KGM - Motor Caravan Scheme EDI')

  QuoteSummary_QuoteRefers_Success()

  QuoteSummary_OverrideRefer_Success('KGM - Motor Caravan Scheme EDI')

  QuoteSummary_SelectAddon_Success()

  QuoteSummary_OverrideRefer_Success('KGM - Motor Caravan Scheme EDI')

  QuoteSummary_EditPremium_Success()

  QuoteSummary_AddExcess_Success(
    'Personal Money',
    '500',
    'Critical Test Pack Excess',
    'POLICY'
  )

  QuoteSummary_EditPremium_Success()

  QuoteSummary_AddEndorsement_Success('Damage Excess', 'Policy', 'E2emotor Test1vanilla')

  // Comvert to Policy and validate that Tenant Date and Time are same with the coverStartDate/coverStartTime
  function QuoteSummary_ClickConvertToPolicyButton_Success () {
    it('should be able to progress to convert to policy page', () => {
      cy.get('#ConvertToPolicy').click({ force: true })
      cy.waitForSpinnerToDisappear()

      // get Cover start time and assert is the same with Tenant time
      cy.xpath("//td[contains(text(),'Cover start time')]/following::span[1]")
        .invoke('text')
        .should((text) => expect(text.substring(0, 2)).to.eq(tenantTime))

      // get Cover start date and assert is the same with Tenant date
      cy.xpath("//td[contains(text(),'Cover start date')]/following::span[1]")
        .invoke('text')
        .should((text) => expect(text.trim()).to.eq(tenantDate))
    })
  }

  QuoteSummary_ClickConvertToPolicyButton_Success()

  ConvertToPolicy_ContinueToPaymentSummary_Success()

  PaymentSummary_SelectCashPaymentMethodAndPaymentNotReceived_Success()

  PaymentSummary_SelectPolicyholderAsPayer_Success()

  RecordSummary_LandOnRecordSummary_Success()

  RecordSummary_ViewClientActionMenuItem_Success()

  RecordSummary_AmendPolicyDetailsAndBack_Success()

  FromPolicy_NavigateToTransactions_PageLoads()

  AccountEnquiry_CheckTransactions_OneNonZeroNotMatchedOpenTransaction()
})
