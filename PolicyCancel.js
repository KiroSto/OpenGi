import { group, sleep } from 'k6'
import http from "k6/http";
import {isRecordLocked, recordUnlock } from '../../helpers/generalScreens/configEndpoints.js'
import { prevalidateCancellation, getListAdjustmentReason, getCancelReason, getNoteType, cancelValidateBackdate, cancellationCalculate } from '../../helpers/cancellation/cancelPolicy.js'
import {CreateAndLoginUsers, DeleteUsers} from "../../../shared/utilities/userManagment.js"
import {SharedArray} from "k6/data";
import {vuMax} from './scenarios.js'
export { options } from './scenarios.js';

// Load custom parameters from config file
const customData = JSON.parse(open('../../shared/custom.json'))

// Load config data
// const configData = JSON.parse(open('../../shared/config.json'));

// declare variables
let systemDate, user, systemDateResponse, policy, profileId

// Overwrite parameters with environment values
const apiHost = __ENV.API_HOST || customData.apiHost;
const siteCode = __ENV.SITECODE || customData.siteCode;
const agentId = customData.customData.mobiusGateway.agentId
const productId = customData.customData.mobiusGateway.productId

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

export function PolicyCancellation(setupData) {

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

 const policyDetailsId = policy['policy_details_id']
 const policyDetailsHistoryId = policy['history_id']

  group('Cancel Policy', function () {
    systemDate = setupData.SystemDate
    const actualDate = systemDate.slice(1, -1)
    const dateObject = new Date(actualDate)
    const policyId = policyDetailsId
    
    prevalidateCancellation(params,policyId,actualDate)
    getListAdjustmentReason(params)
    getNoteType(params)
    getCancelReason(params,agentId,productId)
    cancelValidateBackdate(params,policyId,policyDetailsHistoryId,actualDate,productId,agentId)

   const calculate = JSON.stringify({
     calculationMethod: '1',
     cancellationDescription: '',
     policyDetailsId: `${policyId}`,
     cancellationDate: `${actualDate}`,
     cancellationReasonId: 'AUTOCAN1',
     noteType: '0'
   })
   cancellationCalculate(headers,calculate)
  })

  group('Unlock record', function () {
    const insuredPartyId = policy['insured_party_id']
    profileId = user.profileId
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
 DeleteUsers(setupData.Users, siteCode, vuMax)
}
