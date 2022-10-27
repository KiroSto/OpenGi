import { setupSeeder, tearDownSeeder } from '../../services/setup-seeder'
import { getSystemDate } from '../../services/system-date'
import { getBusinessLineConfig } from '../../../helpers/businessLinesConfig'
import {
  QuoteSummary_SelectProduct_Success,
  QuoteSummary_QuoteClear_Success,
  QuoteSummary_AddExcess_Success,
  QuoteSummary_AddEndorsement_Success,
  QuoteSummary_SaveAsProspect_Success,
  QuoteSummary_ClickConvertToPolicyButton_Success,
  ConvertToPolicy_ContinueToPaymentSummary_Success,
  QuoteSummary_EditPremium_Success,
  QuoteSummary_EditCommission_Success
} from '../../pages/quoteSummary'
import {
  FromPolicy_NavigateToTransactions_PageLoads,
  Transaction_CreditCard_Details,
  RecordSummary_RetrieveQuote_Success,
  RecordSummary_LandOnRecordSummary_Success
} from '../../pages/recordSummary'
import { RetrieveQuote_RequoteWithManualAmendments_Success } from '../../pages/retrieveQuoteSummary'
import {
  PaymentSummary_SelectCreditCardPaymentMethod_Success,
  continuousAuthorityYesCredentialsOnFileYes,
  PaymentSummary_SelectPolicyholderAsPayer_Success,
  CardDetails_PayViaRealex_Success
} from '../../pages/paymentSummary'
import { AccountEnquiry_CheckTransactions_SumToZero } from '../../pages/accountEnquiry'
import { clientSearch, mandatoryDataCapture } from '../mandatory-data-capture'
import { lozalStorageSizeCheck } from '../local-storage-validation'
import "cypress-localstorage-commands";

describe('Mobius', () => {
  let sessionToken
  let sessionSystemDate
  let sessionBrandName

  before(() => {
    setupSeeder('', 'scenario1')
      .then(({ token, systemDate, brandName }) => {
        sessionToken = token
        sessionSystemDate = systemDate
        sessionBrandName = brandName
        getSystemDate(token).then((res) => (sessionSystemDate = res))
      })
  })

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

 // after(() => {
 //   tearDownSeeder('scenario1')
 // })

  it('should be able progress through data capture by populating all mandatory fields including postcode and vehicle search', () => {
    const { name, fixture } = getBusinessLineConfig(
      Cypress.env('businessLine')
    )

    clientSearch()
    mandatoryDataCapture({
      brandName: sessionBrandName,
      businessLine: name,
      fixture: fixture
    })
  })

  // 'QA Motor' used for ZZ09, 'Critical Test Pack Private Car' for ZZ04
  QuoteSummary_SelectProduct_Success('Critical Test Pack Private Car')

  lozalStorageSizeCheck()

  QuoteSummary_QuoteClear_Success()

  QuoteSummary_EditPremium_Success()

  QuoteSummary_EditCommission_Success()

  QuoteSummary_AddExcess_Success(
    'Accidental Damage',
    '250',
    'This is a test excess.',
    'POLICY'
  )

  // Commented out for ZZ09
  QuoteSummary_AddEndorsement_Success('Car Garaging', 'Policy', 'E2emotor Test1vanilla')

  QuoteSummary_SaveAsProspect_Success()

  RecordSummary_RetrieveQuote_Success()

  // If this step and the excess step are commented out the test fails on the convert to policy page because of a console error
  RetrieveQuote_RequoteWithManualAmendments_Success()

  QuoteSummary_ClickConvertToPolicyButton_Success()

  ConvertToPolicy_ContinueToPaymentSummary_Success()

  PaymentSummary_SelectCreditCardPaymentMethod_Success()

  continuousAuthorityYesCredentialsOnFileYes()

  PaymentSummary_SelectPolicyholderAsPayer_Success()

  CardDetails_PayViaRealex_Success()

  RecordSummary_LandOnRecordSummary_Success()

  lozalStorageSizeCheck()

  FromPolicy_NavigateToTransactions_PageLoads()

  AccountEnquiry_CheckTransactions_SumToZero()

  Transaction_CreditCard_Details()
})
