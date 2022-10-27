import { group } from 'k6'
import { getAdvisors, getIntroducers, getProductSelection, getUsers } from '../../helpers/generalScreens/productSelection.js'
import { getRiskData, postRiskData, putRisk } from '../../helpers/dataCapture/riskDataEndpoints.js'
import { getFeatures, getShowRenewal, searchClient } from '../../helpers/generalScreens/homePage.js'
import { amendDates, checkPermission, getLobConfiguration, getLookupQuestions, getParamsAndHeaders, getSystemDate, validateBackdate } from '../../helpers/generalScreens/configEndpoints.js'
import { editPremiumPreValidate, getAddons, getEditPremium, getEndorsements, getEndorsementsWithoutScheme, getExcesses, getExcessesWithoutScheme, getManualAmendments, getTotalExcessAmount, postEditPremium, postEndorsements, postExcess } from '../../helpers/quoteScreen/manualAmmendments.js'
import { convertToPolicy, getPaymentPlans, mergeQuote, newBusiness, quotePaymentPlan, retreiveQuote } from '../../helpers/quoteScreen/newBusinessQuote.js'
import { copyRecord } from '../../helpers/dataCapture/recordSummary.js'
import { getConsent } from '../../helpers/dataCapture/consentScreen.js'
import { getPreValidateMTA, initializeTemporaryMTA } from '../../helpers/mta/initializeMta.js'
import { acceptMTA, mtaQuote } from '../../helpers/mta/mtaQuote.js'
import { getPreValidateRenewal, initializeRenewal } from '../../helpers/renewal/initializeRenewal.js'
import { acceptAlternative, alternativeQuote, postAlternative, renewalInvite, renewalQuote } from '../../helpers/renewal/renewalQuote.js'

// Load custom parameters from config file
const customData = JSON.parse(open('../../../custom.json'))

// declare variables
let riskObject
let policyDetailsId
let policyDetailsHistoryId
let insuredPartyId
let insuredPartyHistoryId
let systemDate
let schemeTableId
let riskData
let surname

// Overwrite parameters with environment values
const searchData = customData.mobiusGateway.searchData
const agentId = customData.mobiusGateway.agentId
const subAgentId = customData.mobiusGateway.subAgentId
const productId = customData.mobiusGateway.productId
const productTypeId = customData.mobiusGateway.productType
const profileId = customData.mobiusGateway.profileId
const productType = customData.mobiusGateway.productType
const paymentPlanId = customData.mobiusGateway.paymentPlanId
const schemeId = customData.mobiusGateway.schemeId
const financeMonthlyPaymentPlanId = customData.mobiusGateway.financeMonthlyPaymentPlanId
const paymentMethodId = customData.mobiusGateway.payMethodID
const financePayMethodID = customData.mobiusGateway.financePayMethodID
const sortCodeAQ = customData.mobiusGateway.sortCodeAQ
const sortCode = customData.mobiusGateway.sortCode
const accountNo = customData.mobiusGateway.accountNo

const data = new SharedArray("policies", function () {
  return JSON.parse(open("./policies/policies.json"));
});

const policiesLob24 = data.filter(d => d['product_type_id'] === 24);

export function setup() {
  const users = CreateAndLoginUsers(siteCode, vuMax);
 

  function paramsForGet(name) {
      return {
          headers: {'Authorization': `Bearer ${users[0].access_token}`},
          tags: {type: "MobiusAPI", name: name},
          timeout: '120s'
      };
  }

  systemDateResponse = http.get(`${apiHost}/api/tenantConfiguration/tenant/SystemDate`, paramsForGet("GET-customer/systemDate"));
  return {
      Users: users,
      SystemDate: systemDateResponse.body
  };
}

export function getParamsAndHeadersForUser (token) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
    tags: { type: 'MobiusAPI' }
  }

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${token}`
  }

  return { params: params, headers: headers }
}

export function RenewalsAgainstCopyRecord(setupData) {

  if (__ITER === 0 && setupData.Users[__VU - 1].access_token) {
    user = setupData.Users[__VU - 1];
}

if (!user) {
    sleep(5)
    fail(`User is missing. Current VU: ${__VU}`);
}
const { params, headers } = getParamsAndHeadersForUser(user.access_token)

let i = parseInt(__ITER / 3) * vuMax + (__VU - 1);

    if ((__ITER % 3) === 0) {
        if (i >= policiesLob24.length) {
            console.log(`No more data available - currently at position ${i} for productTypeId 24`);
            sleep(5);
            return;
        }
        policy = policiesLob24[i];
      }

 const policyReference = policy['policy_reference']
    }

export default function () {
  const { params, headers } = getParamsAndHeaders()

  group('Copy Record', function () {
    const actualDate = systemDate.slice(1, -1)

    const copyRecordRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      newAffinity: {
        agentId: agentId,
        productId: productId,
        paymentPlanId: paymentPlanId
      },
      newSourceBusinessId: '',
      effectiveDate: actualDate,
      copyIntroducers: false
    })

    const copyRecordResponse = copyRecord(headers, copyRecordRequest)

    policyDetailsId = copyRecordResponse.policyDetailsId
    policyDetailsHistoryId = copyRecordResponse.historyId

    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
    getEndorsementsWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
    getExcessesWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
  })

  group('PUT Risk, Proposer Details Page', function () {
    putRisk(headers, riskObject)
  })

  group('GET Consent', function () {
    getConsent(params, policyDetailsId)
  })

  group('PUT Risk, Add additional driver', function () {
    // PUT Risk, when the driver details screen is opened
    putRisk(headers, riskObject)
    riskData = JSON.parse(riskObject.riskData)

    const secondDriver = {
      undefined: '',
      proposer: 'false',
      titleId: '040',
      forename: 'Driver 2',
      initials: 'DD',
      surname: 'Dr 2',
      gender: 'Male',
      dateOfBirth: '1980-12-12T00:00:00',
      maritalStatusId: 'D',
      relationshipId: 'S',
      uKResidenceFromBirth: '1',
      uKResidenceYears: 41,
      uKResidenceMonths: 8,
      mainUser: 'false',
      vehicleUseId: '04',
      occupations: [
        {
          occupationId: 'A01',
          employersBusinessId: '001',
          employmentStatusId: 'E',
          partTime: 'false'
        }
      ],
      licence: {
        licenceTypeId: 'F',
        originOfIssueId: '023',
        licenceNumber: '123',
        dlnAuthorised: 'AUTHYES',
        datePassed: '2000-12-12T00:00:00',
        licenceRestrictionsId: '8'
      },
      accessToOtherVehicles: 'false',
      vehiclesOwned: '',
      vehiclesDriven: '',
      vehiclesAvailableToFamily: '1',
      companyCarUsageId: null,
      companyCarNcdYears: '',
      companyCarDateCeased: '',
      countyCourtJudgements: 'false',
      criminalConvictions: 'false',
      insurancePreviouslyRefused: 'false',
      insuranceTermsApplied: 'false',
      claims: [],
      convictions: [],
      medicalConditions: [],
      qualifications: [],
      datePassedTest: '2000-12-12T00:00:00'
    }

    riskData.drivers[1] = secondDriver
    riskObject.riskData = JSON.stringify(riskData)

    putRisk(headers, riskObject)
  })

  group('PUT Risk, Vehicle Details Page', function () {
    putRisk(headers, riskObject)
  })

  group('PUT Risk, Vehicle Cover Page', function () {
    putRisk(headers, riskObject)
  })

  group('Page: Quote Summary - Quote the copied record', function () {
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)

    getManualAmendments(params, policyDetailsId)
    getPaymentPlans(params, agentId, productId)
    getAddons(params, agentId, productId)
    editPremiumPreValidate(params)
    getLobConfiguration(params, agentId, subAgentId, productId)

    const newBusinessRequest = JSON.stringify({
      showBreakdown: true,
      internetAvailable: false,
      save: false,
      manualAmendments: {
        discount: false,
        annualPremiumAdjustment: false,
        depositRequested: false,
        freeTextEndorsementsIds: [],
        endorsementsIds: [],
        excessesIds: []
      },
      risk: riskObject
    })

    newBusiness(headers, newBusinessRequest)

    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    riskData = JSON.parse(riskObject.riskData)
    schemeTableId = riskData.policy.schemeTable
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)

    getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)

    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)

    putRisk(headers, riskObject)
  })

  group('Add Manual and Free text Endorsements', function () {
    getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)

    // Manual Endorsements are not cofigured for Motor

    // Add Free Text Endorsements
    const freeTextEndorsement = JSON.stringify({
      variables: [],
      appliesTo: {
        object: 'INSPTYENDORS',
        id: insuredPartyId
      },
      title: 'Test Title',
      wording: 'Test Description',
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      schemeTableId: schemeTableId,
      listId: '0',
      id: '0'
    })

    postEndorsements(headers, freeTextEndorsement)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
  })

  group('Add Addons', function () {
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    // Addons are not configured for the selected insurer scheme
  })

  group('Edit premium', function () {
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    putRisk(headers, riskObject)

    // Two times merge when the user opens the Edit Premium blade
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)

    getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)
    getEditPremium(params, policyDetailsId, policyDetailsHistoryId)

    const editPremium = JSON.stringify({
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      profileId: profileId,
      mtaAdjustment: false,
      sectionPremiums: {
        insurerId: '700',
        premium: '1000',
        premiumTypeId: 'NET',
        productAddonId: '0',
        policySectionId: '0',
        reasonId: 'ADJRSN04',
        freeTextInsurer: '12345',
        schemeId: schemeId,
        sectionId: '1',
        entityDesc: null,
        entityId: null,
        entityTable: null,
        note: {
          description: 'Test Description'
        }
      }
    })

    postEditPremium(headers, editPremium)
    retreiveQuote(params, policyDetailsId, policyDetailsHistoryId)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  })

  group('Add Discount', function () {
    // Currently the operator can not add discount
  })

  group('Change payment plan to monthly', function () {
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)

    riskData = riskObject.riskData

    riskData = riskData.replace('"paymentPlanId":"' + paymentPlanId + '"', '"paymentPlanId":"' + financeMonthlyPaymentPlanId + '"')
    riskObject.riskData = riskData

    putRisk(headers, riskObject)
    getManualAmendments(params, policyDetailsId)
    const getEndorsementsResponse = getEndorsementsWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
    const freeTextEndorsementsIds = [getEndorsementsResponse.json()[0].id]

    const newBusinessRequest = JSON.stringify({
      showBreakdown: true,
      internetAvailable: false,
      save: false,
      manualAmendments: {
        discount: false,
        annualPremiumAdjustment: true,
        depositRequested: false,
        freeTextEndorsementsIds: freeTextEndorsementsIds,
        endorsementsIds: [],
        excessesIds: []
      },
      risk: riskObject
    })
    newBusiness(headers, newBusinessRequest)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)

    getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)
  })

  group('Convert to policy using Direct Debit Payment Method', function () {
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
    putRisk(headers, riskObject)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)

    const convertRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      policyDetailsHistoryId: policyDetailsHistoryId,
      insuredPartyId: insuredPartyId,
      insuredPartyHistoryId: insuredPartyHistoryId,
      paymentPlanId: financeMonthlyPaymentPlanId,
      payMethodID: paymentMethodId,
      creditCard: null,
      takePayment: true,
      reference: '',
      saleAdvised: false,
      optOutOfAutomaticRenewal: false,
      optOutDayOneIncrease: false,
      directDebit: {
        sortCode: sortCode,
        accountNo: accountNo,
        accountHolder: 'Test',
        preferredPaymentDay: 5
      }
    })

    convertToPolicy(headers, convertRequest)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  })

  group('Initialize Temporary MTA', function () {
    const actualDate = systemDate.slice(1, -1)
    const dateObject = new Date(actualDate)
    let mtaEndData = dateObject.setMonth(dateObject.getMonth() + 1)

    // Get the date and time, without the miliseconds
    mtaEndData = new Date(mtaEndData).toISOString().split('.')[0]

    getPreValidateMTA(params, policyDetailsId, actualDate)

    const initializeTemporaryMTARequest = JSON.stringify({
      mtaAdjustmentTypes: [
        '3KOR4LP1'
      ],
      description: 'Test Description',
      mtaEffectiveDate: actualDate,
      profileId: profileId,
      policyDetailsId: policyDetailsId,
      tempMtaEndDate: mtaEndData
    })
    riskObject = initializeTemporaryMTA(headers, initializeTemporaryMTARequest)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  })

  group('MTA Quote and save the previously added manual amendmends', function () {
    putRisk(headers, riskObject)
    getManualAmendments(params, policyDetailsId)
    getPaymentPlans(params, agentId, productId)
    getAddons(params, agentId, productId)
    editPremiumPreValidate(params)
    getLobConfiguration(params, agentId, subAgentId, productId)

    const getEndorsementsResponse = getEndorsementsWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
    const freeTextEndorsementsIds = [getEndorsementsResponse.json()[0].id]

    const mtaQuoteRequest = JSON.stringify({
      ManualAmendments: {
        Discount: false,
        PremiumAdjustment: true,
        MtaAmendments: {
          Discount: false,
          AnnualPremiumAdjustment: false,
          Adjustment: false
        },
        FreeTextEndorsementsIds: freeTextEndorsementsIds,
        EndorsementIds: [],
        ExcessesIds: []
      },
      PolicyDetailsHistoryId: policyDetailsHistoryId,
      PolicyDetailsId: policyDetailsId,
      ProfileId: profileId
    })

    mtaQuote(headers, mtaQuoteRequest)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    riskData = JSON.parse(riskObject.riskData)
    schemeTableId = riskData.policy.schemeTable
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
  })

  group('Edit Premium on MTA', function () {
    const editPremium = JSON.stringify({
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      profileId: profileId,
      mtaAdjustment: true,
      sectionPremiums: {
        insurerId: '700',
        premium: '500',
        premiumTypeId: 'NET',
        productAddonId: '0',
        policySectionId: '0',
        reasonId: 'AVIVAHUB',
        freeTextInsurer: '12345',
        schemeId: schemeId,
        sectionId: '1',
        entityDesc: null,
        entityId: null,
        entityTable: null,
        note: {
          description: 'Test Description'
        }
      }
    })

    postEditPremium(headers, editPremium)
    retreiveQuote(params, policyDetailsId, policyDetailsHistoryId)
  })

  group('Edit Commission on MTA', function () {

    // No permission to edit the commission by more than 0% of the original amount
  })

  group('Add Addons on MTA', function () {
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    // Addons are not configured for the selected insurer scheme
  })

  group('Accept MTA', function () {
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
    putRisk(headers, riskObject)

    const acceptMTARequest = JSON.stringify({
      PayMethodId: paymentMethodId,
      Reference: '',
      Card: null,
      BankDetails: null,
      PremiumSections: null,
      PremiumAdjustmentSections: null,
      PolicyDetailsId: policyDetailsId,
      PolicyDetailsHistoryId: policyDetailsHistoryId,
      PaymentCriteria: 1
    })

    acceptMTA(headers, acceptMTARequest)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  })

  group('Amend policy dates', function () {
    const amendDateRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      interval: 'day',
      period: -355,
      includeClientData: true
    })

    amendDates(headers, amendDateRequest)
  })

  group('Initialize Renewal', function () {
    getPreValidateRenewal(params, policyDetailsId)
    policyDetailsHistoryId = initializeRenewal(headers, policyDetailsId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  })

  group('Renewal Quote', function () {
    const getEndorsementsResponse = getEndorsementsWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
    const freeTextEndorsementsIds = [getEndorsementsResponse.json()[0].id]

    const renewalQuoteRequest = JSON.stringify({
      internetAvailable: false,
      manualAmendments: {
        freeTextEndorsementsIds: freeTextEndorsementsIds,
        endorsementsIds: [],
        excessesIds: [],
        discount: false,
        annualPremiumAdjustment: false,
        depositRequested: false
      },
      policyDetailsId: policyDetailsId
    })

    renewalQuote(headers, renewalQuoteRequest)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)
    renewalInvite(headers, policyDetailsId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    riskData = JSON.parse(riskObject.riskData)
    schemeTableId = riskData.policy.schemeTable
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  })

  group('Alternative Quote', function () {
    const alternativeQuoteRequest = JSON.stringify({
      internetAvailable: false,
      manualAmendments: {
        freeTextEndorsementsIds: [],
        endorsementsIds: [],
        excessesIds: []
      },
      policyDetailsId: policyDetailsId,
      useRiskData: true
    })

    alternativeQuote(headers, alternativeQuoteRequest)
    policyDetailsHistoryId = parseInt(policyDetailsHistoryId) + 1
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    riskData = JSON.parse(riskObject.riskData)
    schemeTableId = riskData.policy.schemeTable
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId

    const alternativeRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      schemeTableId: schemeTableId
    })

    postAlternative(headers, alternativeRequest)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)
  })

  group('Add Excesses to Alternative Quote', function () {
    const postExcessRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      schemeTableId: schemeTableId,
      amount: 100,
      sectionId: '1',
      description: 'Test Description',
      appliesTo: {
        id: insuredPartyId,
        object: 'INSPTYXS'
      },
      typeId: '4',
      coverCode: ''
    })

    postExcess(headers, postExcessRequest)
    getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
  })

  group('Add Manual and Free text Endorsements on Alternative Quote', function () {
    getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)

    // Manual Endorsements are not cofigured for Motor

    // Add Free Text Endorsements
    const freeTextEndorsement = JSON.stringify({
      variables: [],
      appliesTo: {
        object: 'INSPTYENDORS',
        id: insuredPartyId
      },
      title: 'Test Title',
      wording: 'Test Description',
      policyDetailsId: policyDetailsId,
      historyId: policyDetailsHistoryId,
      schemeTableId: schemeTableId,
      listId: '0',
      id: '0'
    })

    postEndorsements(headers, freeTextEndorsement)
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
  })

  group('Accept Alternative Quote', function () {
    riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
    quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
    riskData = riskObject.riskData

    riskData = riskData.replace('"paymentPlanId":"' + paymentPlanId + '"', '"paymentPlanId":"' + financeMonthlyPaymentPlanId + '"')
    riskObject.riskData = riskData
    putRisk(headers, riskObject)

    const acceptAlternativeRequest = JSON.stringify({
      acceptAlternative: true,
      policyDetailsId: policyDetailsId,
      payMethodId: financePayMethodID,
      paymentProviderReference: '',
      takePayment: false,
      card: {},
      directDebit: {
        sortCode: sortCodeAQ,
        accountNo: accountNo,
        accountHolder: 'Test',
        preferredPaymentDay: 5
      }
    })

    acceptAlternative(headers, acceptAlternativeRequest)
  })
}
  
