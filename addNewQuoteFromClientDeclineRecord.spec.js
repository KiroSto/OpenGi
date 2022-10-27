/* eslint-disable no-unused-vars */
import { userAuth } from '../helpers/UserAuth'
import { createProspect } from '../helpers/create-prospect'
import { addNewQuote, clientDecline } from '../endpoints/customer'
import { getRisk, mergeQuote, putRisk } from '../endpoints/riskData'
import { getLookupList } from '../endpoints/lookup'
import { lobMapping } from '../helpers/LobMapping'
import { editPremiumOnAllSections } from '../helpers/editPremium'
import { editCommissionOnAllSections } from '../helpers/editCommission'
import { addExcesses } from '../helpers/addExcesses'
import { addEndorsements } from '../helpers/addEndorsements'
import { addDriver } from '../helpers/editRiskData'
import { newBusiness } from '../endpoints/quote'
import { convertToPolicy } from '../helpers/convertToPolicy'
const config = require('../config')

const riskData = require('../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Add New Quote with additional driver from existing client decline record', () => {
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

  it('Should edit premium on all the sections that can be edited', async function () {
    const getRiskAfterCreatingProspect = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const prospectRiskDataObject = JSON.parse(getRiskAfterCreatingProspect.riskData)
    schemeTableIdFromQuote = prospectRiskDataObject.policy.schemeTable
    const editPremium = await editPremiumOnAllSections(getRiskAfterCreatingProspect, schemeTableIdFromQuote)
  })

  it('Should Edit Commission', async function () {
    const getRiskAfterEditingPremium = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const editCommissionToThePolicy = await editCommissionOnAllSections(getRiskAfterEditingPremium)
  })

  it('Should Add Excesses', async function () {
    const getRiskAfterEditingCommission = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const addExcessesToThePolicy = await addExcesses(getRiskAfterEditingCommission, schemeTableIdFromQuote)
  })

  it('Should Add Endorsements', async function () {
    const getRiskRespWithAppliedDiscount = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const addEndorsementsToThePolicy = await addEndorsements(getRiskRespWithAppliedDiscount, schemeTableIdFromQuote)
  })

  it('Should Save as Client Decline', async function () {
    const getRiskRespBeforeClientDecline = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const riskDataObjectBeforeClientDecline = JSON.parse(getRiskRespBeforeClientDecline.riskData)
    const postClientDecline = await clientDecline(getRiskRespBeforeClientDecline)
    const policyStatuses = await getLookupList('LIST_POLICY_STATUS')
    const getRiskRespAfterClientDecline = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const riskDataObjectAfterClientDecline = JSON.parse(getRiskRespAfterClientDecline.riskData)

    const policyStatus = policyStatuses.filter(function (res) {
      return res.id === riskDataObjectAfterClientDecline.policy.policyStatusId
    })

    expect(riskDataObjectBeforeClientDecline.policy.policyStatusId).not.toBe(riskDataObjectAfterClientDecline.policy.policyStatusId)
    expect(policyStatus[0].text).toEqual('Client Decline')
  })

  it('Should Add New Quote', async function () {
    const getRiskRespBeforeAddNewQuote = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const riskDataObjectBeforeAddNewQuote = JSON.parse(getRiskRespBeforeAddNewQuote.riskData)
    addNewQuoteResp = await addNewQuote(getRiskRespBeforeAddNewQuote, riskDataObjectBeforeAddNewQuote.policy.agentId, riskDataObjectBeforeAddNewQuote.policy.productId, riskDataObjectBeforeAddNewQuote.policy.paymentPlanId)
    const riskDataObjectAfterAddNewQuote = JSON.parse(addNewQuoteResp.riskData)
    const emptyRiskDataObject = JSON.parse(riskData.riskData)

    // Complete the Risk Data of the newly created record
    Object.entries(riskDataObjectAfterAddNewQuote).map(item => {
      if (item[0] !== 'policy' && item[0] !== 'proposer' && item[0] !== 'marketing' && item[0] !== 'drivers' && item[0] !== 'riders' && item[0] !== 'targetPremium') {
        riskDataObjectAfterAddNewQuote[item[0]] = emptyRiskDataObject[item[0]]
      }
    })
    addNewQuoteResp.riskData = JSON.stringify(riskDataObjectAfterAddNewQuote)

    const editRiskData = await putRisk(addNewQuoteResp)
  })

  it('Should add driver to the Add New Quote record', async function () {
    const getRiskResponse = await getRisk(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId, addNewQuoteResp.productTypeId)
    if (getRiskResponse.productTypeId === 24 || getRiskResponse.productTypeId === 26) {
      const addedDriverResponse = await addDriver(getRiskResponse)
      const addedDriverRiskDataObject = JSON.parse(addedDriverResponse.riskData)
      expect((addedDriverRiskDataObject.drivers).length).toEqual(2)
    } else if (getRiskResponse.productTypeId === 25) {
      const addedDriverResponse = await addDriver(getRiskResponse)
      const addedDriverRiskDataObject = JSON.parse(addedDriverResponse.riskData)
      expect((addedDriverRiskDataObject.riders).length).toEqual(2)
    } else {
      console.log('It is not possible to add drivers/riders to the current LOB')
    }
  })

  it('Should quote the record with added driver', async function () {
    const getRiskAfterAddingDriver = await getRisk(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId, addNewQuoteResp.productTypeId)
    const { schemeTableId, schemeName, newBusinessResponse } = await newBusiness(getRiskAfterAddingDriver)
    schemeTableIdFromQuote = schemeTableId
    const mergeQuoteResp = await mergeQuote(getRiskAfterAddingDriver, schemeTableId)
  })

  // Deposit Payment Plan is currently not available on Integration
  it('Should Convert to Policy using Deposit pp and Cheque(no) pm', async function () {
    const getRiskBeforeConvert = await getRisk(addNewQuoteResp.policyDetailsId, addNewQuoteResp.policyDetailsHistoryId, addNewQuoteResp.productTypeId)
    const convertToPolicyResponse = await convertToPolicy(getRiskBeforeConvert, 1, 'Cheque', false)
  })
})
