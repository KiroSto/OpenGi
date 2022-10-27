/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { clonePolicy } from '../../endpoints/customer'
import { getPolicy, getRisk, mergeQuote } from '../../endpoints/riskData'
import { incrementInsuredPartyId } from '../../helpers/incrementInsuredPartyId'
import { newBusiness } from '../../endpoints/quote'
import { convertToPolicy } from '../../helpers/convertToPolicy'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Clone policy and increment insured party ID', () => {
  let createPolicyResponse = null
  let clonePolicyResp = null
  let incrementedInsuredPartyIdProspect = null
  let schemeTableIdFromQuote = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create a policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should clone the already created policy', async function () {
    clonePolicyResp = await clonePolicy(createPolicyResponse)
    const createPolicyRiskDataObject = JSON.parse(createPolicyResponse.riskData)
    schemeTableIdFromQuote = createPolicyRiskDataObject.policy.schemeTable
    const getRiskResponse = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createPolicyResponse.productTypeId)
    const clonedPolicyRiskDataObject = JSON.parse(getRiskResponse.riskData)
    expect(createPolicyResponse.insuredPartyId).toEqual(getRiskResponse.insuredPartyId)
    expect(createPolicyRiskDataObject.policy.premium).toEqual(clonedPolicyRiskDataObject.policy.premium)
  })

  it('Should increment Insurer History ID', async function () {
    const getRiskResponse = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createPolicyResponse.productTypeId)
    const riskData = JSON.parse(getRiskResponse.riskData)
    const getPropertyOwnersPolicy = await getPolicy(getRiskResponse.policyDetailsId, getRiskResponse.policyDetailsHistoryId)

    getRiskResponse.DwPolicyDetailsID = getPropertyOwnersPolicy.id
    riskData.busDetailsYN = false
    getRiskResponse.riskData = JSON.stringify(riskData)
    incrementedInsuredPartyIdProspect = await incrementInsuredPartyId(getRiskResponse)
  })

  it('Should quote the record', async function () {
    const getRiskAfterIncrementId = await getRisk(incrementedInsuredPartyIdProspect.policyDetailsId, incrementedInsuredPartyIdProspect.policyDetailsHistoryId, incrementedInsuredPartyIdProspect.productTypeId)
    const { schemeTableId, schemeName, newBusinessResponse } = await newBusiness(getRiskAfterIncrementId)
    schemeTableIdFromQuote = schemeTableId
    const mergeQuoteResp = await mergeQuote(getRiskAfterIncrementId, schemeTableId)
  })

  it('Should Convert to Policy', async function () {
    const getRiskBeforeConvert = await getRisk(incrementedInsuredPartyIdProspect.policyDetailsId, incrementedInsuredPartyIdProspect.policyDetailsHistoryId, incrementedInsuredPartyIdProspect.productTypeId)
    const convertToPolicyResponse = await convertToPolicy(getRiskBeforeConvert)
  })
})
