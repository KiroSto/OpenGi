import { group } from 'k6'
import {fail, sleep} from "k6";
import http from "k6/http";
import { isRecordLocked, recordUnlock, getLobConfiguration } from '../../helpers/generalScreens/configEndpoints.js'
import { getRiskData, putRisk } from '../../helpers/dataCapture/riskDataEndpoints.js'
import { getPreValidateMTA, initializePermanentMTA } from '../../helpers/mta/initializeMta.js'
import { acceptMTA, mtaQuote } from '../../helpers/mta/mtaQuote.js'
import {CreateAndLoginUsers, DeleteUsers} from "../../../shared/utilities/userManagment.js"
import { getPaymentPlans, mergeQuote, overrideRefer } from '../../helpers/quoteScreen/newBusinessQuote.js'
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
const agentId = customData.customData.mobiusGateway.agentId
const productType = customData.customData.mobiusGateway.productType
const paymentMethodId = customData.customData.mobiusGateway.payMethodID

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

export function MidTermAdjustment(setupData) {

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

  group('Initialize Permanent MTA', function () {
    systemDate = setupData.SystemDate
    const policyReference = policy['policy_details_id']
    const actualDate = systemDate.slice(1, -1)
    const dateObject = new Date(actualDate)
    const policyId = policy['policy_details_id']

    getPreValidateMTA(params, policyReference, actualDate)
 
    const initializePermanentMTARequest = JSON.stringify({
       mtaAdjustmentTypes: [
         '3IOHN9M6'
       ],
      description: 'Test Description',
      mtaEffectiveDate: actualDate,
      profileId: profileId,
      policyDetailsId: policyId,
    })
    riskObject = initializePermanentMTA(headers, initializePermanentMTARequest)
    policyDetailsId = riskObject.policyDetailsId
    policyDetailsHistoryId = riskObject.policyDetailsHistoryId
    insuredPartyId = riskObject.insuredPartyId
    insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  })

group('MTA Quote', function () {
  const productId = policy['product_type_id']
  const policyDetailsId = policy['policy_details_id']
  profileId = user.profileId
  putRisk(headers, riskObject)
  getPaymentPlans(params, agentId, productId)
  //getLobConfiguration(params, agentId, subAgentId, productId)

  const mtaQuoteRequest = JSON.stringify({
    PolicyDetailsHistoryId: policyDetailsHistoryId,
    PolicyDetailsId: policyDetailsId,
    ProfileId: profileId
  })

  mtaQuote(headers, mtaQuoteRequest)
  riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  riskData = JSON.parse(riskObject.riskData)
  schemeTableId = riskData.policy.schemeTable
  overrideRefer (headers, policyDetailsHistoryId , policyDetailsId, profileId , schemeTableId)
  riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
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

  group('Unlock record', function () {
    isRecordLocked(params, insuredPartyId)
    const recordUnlockRequest = JSON.stringify({
      profileID: profileId,
      recordID: insuredPartyId,
      recordType: 8
    })
    recordUnlock(headers, recordUnlockRequest)
  })
}
}

export function teardown(setupData){
  DeleteUsers(setupData.Users, siteCode, vuMax);
}