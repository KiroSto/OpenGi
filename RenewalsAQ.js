import { group } from 'k6'
import http from "k6/http";
import { getRiskData, putRisk } from '../../helpers/dataCapture/riskDataEndpoints.js'
import { amendDates  } from '../../helpers/generalScreens/configEndpoints.js'
import {  getEndorsements, getEndorsementsWithoutScheme, getExcesses, getTotalExcessAmount, postEndorsements, postExcess } from '../../helpers/quoteScreen/manualAmmendments.js'
import { mergeQuote,  quotePaymentPlan, overrideRefer } from '../../helpers/quoteScreen/newBusinessQuote.js'
import { getPreValidateRenewal, initializeRenewal } from '../../helpers/renewal/initializeRenewal.js'
import { acceptAlternative, alternativeQuote, postAlternative, renewalInvite, renewalQuote } from '../../helpers/renewal/renewalQuote.js'
import {CreateAndLoginUsers, DeleteUsers} from "../../../shared/utilities/userManagment.js"
import {SharedArray} from "k6/data";
import {vuMax} from './scenarios.js'
export { options } from './scenarios.js';

// Load custom parameters from config file
const customData = JSON.parse(open('../../shared/custom.json'))

// declare variables
let riskObject, policyDetailsId, policyDetailsHistoryId, insuredPartyId,insuredPartyHistoryId, schemeTableId, riskData, surname, systemDate, user, systemDateResponse, policy, profileId

// Overwrite parameters with environment values
const apiHost = customData.apiHost;
const siteCode = customData.siteCode;
const productId = customData.customData.mobiusGateway.productId
const productType = customData.customData.mobiusGateway.productType
const paymentPlanId = customData.customData.mobiusGateway.paymentPlanId
const financeMonthlyPaymentPlanId = customData.customData.mobiusGateway.financeMonthlyPaymentPlanId
const financePayMethodID = customData.customData.mobiusGateway.financePayMethodID
const sortCodeAQ = customData.customData.mobiusGateway.sortCodeAQ
const accountNo = customData.customData.mobiusGateway.accountNo
const agentId = customData.customData.mobiusGateway.agentId
const subAgentId = customData.customData.mobiusGateway.subAgentId
const productTypeId = customData.customData.mobiusGateway.productType
const paymentMethodId = customData.customData.mobiusGateway.payMethodID
const sortCode = customData.customData.mobiusGateway.sortCode
const accountNumber = customData.customData.mobiusGateway.accountNo
const accountHolder = customData.customData.mobiusGateway.accountHolder
const preferredPaymentDay = customData.customData.mobiusGateway.preferredPaymentDay

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
  
    systemDateResponse = http.get(`${apiHost}/api/customer/SystemDate`, paramsForGet("GET-customer/systemDate"));
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
  
  export function RenewalsAQ(setupData) {
  
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
  
   const policyReference = policy['policy_reference']
   const policyDetailsId = policy['policy_details_id']
   //const policyDetailsHistoryId = policy['history_id']
   const productType = policy['product_type_id']
   const insuredPartyId = policy['insured_party_id']


group('Amend policy dates', function () {
    const amendDateRequest = JSON.stringify({
      policyDetailsId: policyDetailsId,
      interval: 'month',
      period: -11,
      includeClientData: true
    })

    amendDates(headers, amendDateRequest)
  })

  group('Initialize Renewal', function () {
    getPreValidateRenewal(params, policyDetailsId)
    policyDetailsHistoryId = initializeRenewal(headers, policyDetailsId)
    riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
   // policyDetailsId = riskObject.policyDetailsId
    //policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    //insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  })

 group('Renewal Quote', function () {
   const getEndorsementsResponse = getEndorsementsWithoutScheme(params, policyDetailsId, policyDetailsHistoryId)
   //const freeTextEndorsementsIds = [getEndorsementsResponse.json()[0].id]

   const renewalQuoteRequest = JSON.stringify({
     internetAvailable: false,
     manualAmendments: {
       freeTextEndorsementsIds: [],
       endorsementsIds: [],
       excessesIds: [],
       discount: false,
       annualPremiumAdjustment: false,
     depositRequested: false
     },
     policyDetailsId: policyDetailsId
   })
   renewalInvite(headers, policyDetailsId)
   renewalQuote(headers, renewalQuoteRequest)
   profileId = user.profileId
   overrideRefer (headers, policyDetailsHistoryId , policyDetailsId, profileId , schemeTableId)
   quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)
   riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
   riskData = JSON.parse(riskObject.riskData)
   schemeTableId = riskData.policy.schemeTable
   riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
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
  profileId = user.profileId
  overrideRefer (headers, policyDetailsHistoryId , policyDetailsId, profileId , schemeTableId)
  policyDetailsHistoryId = parseInt(policyDetailsHistoryId) + 1
  alternativeQuote(headers, alternativeQuoteRequest)
  riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  riskData = JSON.parse(riskObject.riskData)
  schemeTableId = riskData.policy.schemeTable
  insuredPartyHistoryId = riskObject.insuredPartyHistoryId

  const alternativeRequest = JSON.stringify({
    policyDetailsId: policyDetailsId,
    schemeTableId: schemeTableId
  })

  postAlternative(headers, alternativeRequest)
  quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)
  quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, financeMonthlyPaymentPlanId)
})

//group('Add Excesses to Alternative Quote', function () {
//  const postExcessRequest = JSON.stringify({
//    policyDetailsId: policyDetailsId,
//    historyId: policyDetailsHistoryId,
//    schemeTableId: schemeTableId,
//    amount: 100,
//    sectionId: '1',
//    description: 'Test Description',
//    appliesTo: {
//      id: insuredPartyId,
//      object: 'INSPTYXS'
//    },
//    typeId: '4',
//    coverCode: ''
//  })
//
//  postExcess(headers, postExcessRequest)
//  getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
//  getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
//  riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
//})

//group('Add Manual and Free text Endorsements on Alternative Quote', function () {
//  getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
//
//  // Manual Endorsements are not cofigured for Motor
//
//  // Add Free Text Endorsements
//  const freeTextEndorsement = JSON.stringify({
//    variables: [],
//    appliesTo: {
//      object: 'INSPTYENDORS',
//      id: insuredPartyId
//    },
//    title: 'Test Title',
//    wording: 'Test Description',
//    policyDetailsId: policyDetailsId,
//    historyId: policyDetailsHistoryId,
//    schemeTableId: schemeTableId,
//    listId: '0',
//    id: '0'
//  })
//
//  postEndorsements(headers, freeTextEndorsement)
//  riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
//})

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
}

export function teardown(setupData){
     DeleteUsers(setupData.Users, siteCode, vuMax);
}