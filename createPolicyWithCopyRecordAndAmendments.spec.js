/* eslint-disable no-unused-vars */
import { userAuth } from '../helpers/UserAuth'
import { createProspect } from '../helpers/create-prospect'
import { clonePolicy } from '../endpoints/customer'
import { getRisk, mergeQuote } from '../endpoints/riskData'
import { addDriver } from '../helpers/editRiskData'
import { newBusiness } from '../endpoints/quote'
import { lobMapping } from '../helpers/LobMapping'
import { addDiscountByAmount } from '../helpers/addDiscount'
import { addEndorsements } from '../helpers/addEndorsements'
import { addAddons } from '../helpers/addAddons'
import { editPremiumOnAllSections } from '../helpers/editPremium'
import { convertToPolicy } from '../helpers/convertToPolicy'
const config = require('../config')

const riskData = require('../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Create Policy from existing Prospect (Copy Record)', () => {
  let createProspectResponse = null
  let clonePolicyResp = null
  let schemeTableIdFromQuote = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should clone the already create prospect', async function () {
    clonePolicyResp = await clonePolicy(createProspectResponse)
    const createProspectRiskDataObject = JSON.parse(createProspectResponse.riskData)
    const getRiskResponse = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const clonedPolicyRiskDataObject = JSON.parse(getRiskResponse.riskData)
    expect(createProspectResponse.insuredPartyId).toEqual(getRiskResponse.insuredPartyId)
    expect(createProspectRiskDataObject.policy.premium).toEqual(clonedPolicyRiskDataObject.policy.premium)
  })

  it('Should add driver to the cloned record', async function () {
    const getRiskResponse = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
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
    const getRiskAfterAddingDriver = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const { schemeTableId, schemeName, newBusinessResponse } = await newBusiness(getRiskAfterAddingDriver)
    schemeTableIdFromQuote = schemeTableId
    const mergeQuoteResp = await mergeQuote(getRiskAfterAddingDriver, schemeTableId)
  })

  it('Should edit premium on all the sections that can be edited', async function () {
    const getRiskAfterQuotingWithTwoDrivers = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const editPremium = await editPremiumOnAllSections(getRiskAfterQuotingWithTwoDrivers, schemeTableIdFromQuote)
  })

  it('Should Add Discount', async function () {
    const discountAmount = 3
    const getRiskRespWithEditPremium = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const addDiscount = await addDiscountByAmount(getRiskRespWithEditPremium, schemeTableIdFromQuote, discountAmount)
  })

  it('Should Add Endorsements', async function () {
    const getRiskRespWithAppliedDiscount = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const addEndorsementsToThePolicy = await addEndorsements(getRiskRespWithAppliedDiscount, schemeTableIdFromQuote)
  })

  it('Should Add Addons', async function () {
    const getRiskRespWithAddedEndorsements = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const addAddonsToThePolicy = await addAddons(getRiskRespWithAddedEndorsements)
  })

  it('Should Convert to Policy', async function () {
    const getRiskBeforeConvert = await getRisk(clonePolicyResp.policyDetailsId, clonePolicyResp.historyId, createProspectResponse.productTypeId)
    const convertToPolicyResponse = await convertToPolicy(getRiskBeforeConvert, 1, 'Cash', false)
  })
})
