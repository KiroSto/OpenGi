/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { addNewQuote } from '../../endpoints/customer'
import { getPolicy, getRisk, mergeQuote, putRisk, saveQuoteForExistingClient } from '../../endpoints/riskData'
import { newBusiness } from '../../endpoints/quote'
import { convertToPolicy } from '../../helpers/convertToPolicy'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('AddQuote test on prospect', () => {
  let createProspectResponse = null
  let addNewQuoteResp = null
  let schemeTableIdFromQuote = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should Add New Quote', async function () {
    // Get Risk before adding new quote
    const getRiskRespBeforeAddNewQuote = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const prospectRiskDataObject = JSON.parse(getRiskRespBeforeAddNewQuote.riskData)
    schemeTableIdFromQuote = prospectRiskDataObject.policy.schemeTable
    const riskDataObjectBeforeAddNewQuote = JSON.parse(getRiskRespBeforeAddNewQuote.riskData)

    // Add New Quote
    addNewQuoteResp = await addNewQuote(getRiskRespBeforeAddNewQuote, riskDataObjectBeforeAddNewQuote.policy.agentId, riskDataObjectBeforeAddNewQuote.policy.productId, riskDataObjectBeforeAddNewQuote.policy.paymentPlanId)
    const saveQuote = await saveQuoteForExistingClient(addNewQuoteResp)

    const riskDataObjectAfterAddNewQuote = JSON.parse(addNewQuoteResp.riskData)
    const emptyRiskDataObject = JSON.parse(riskData.riskData)

    // Complete the Risk Data of the newly created record
    Object.entries(riskDataObjectAfterAddNewQuote).map(item => {
      if (item[0] !== 'policy' && item[0] !== 'proposer' && item[0] !== 'marketing' && item[0] !== 'drivers' && item[0] !== 'riders' && item[0] !== 'targetPremium') {
        riskDataObjectAfterAddNewQuote[item[0]] = emptyRiskDataObject[item[0]]
      }
    })
    riskDataObjectAfterAddNewQuote.busDetailsYN = false
    addNewQuoteResp.riskData = JSON.stringify(riskDataObjectAfterAddNewQuote)
    const getPropertyOwnersPolicy = await getPolicy(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId)

    addNewQuoteResp.DwPolicyDetailsID = getPropertyOwnersPolicy.id

    const editRiskData = await putRisk(addNewQuoteResp)
  })

  it('Should quote the record', async function () {
    const getRiskAfterAddingNewQuote = await getRisk(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId, addNewQuoteResp.productTypeId)
    const { schemeTableId, schemeName, newBusinessResponse } = await newBusiness(getRiskAfterAddingNewQuote)
    schemeTableIdFromQuote = schemeTableId
    const mergeQuoteResp = await mergeQuote(getRiskAfterAddingNewQuote, schemeTableId)
  })

  it('Should Convert to Policy', async function () {
    const getRiskBeforeConvert = await getRisk(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId, addNewQuoteResp.productTypeId)
    const convertToPolicyResponse = await convertToPolicy(getRiskBeforeConvert)
  })
})
