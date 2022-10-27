/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { getRisk, mergeQuote, postRisk, putRisk } from '../../endpoints/riskData'
import { getSystemDate } from '../../endpoints/tenant'
import { newBusiness } from '../../endpoints/quote'
import { convertToPolicy } from '../../helpers/convertToPolicy'

const riskData = require('../../fixtures/partialSaveRisks/ProposerDetailsPropOwn.json')
console.log('RISK DATA', riskData);
describe('Partial Save and Create Policy', () => {
  let riskResponse = null
  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should partial save all the data', async function () {
    const riskDataObjectForPost = JSON.parse(riskData.RiskData)
    riskDataObjectForPost.policy.coverStartDate = await getSystemDate()
    riskData.riskData = JSON.stringify(riskDataObjectForPost)

    riskResponse = await postRisk(riskData)

    const riskDataObjectAfterPostRisk = JSON.parse(riskResponse.riskData)
    const completeRiskData = require('../../fixtures/riskData/1029PropertyOwnersRisk.json')
    const completeRiskDataObject = JSON.parse(completeRiskData.riskData)

    for (const item in riskDataObjectAfterPostRisk) {
      if (item !== 'policy' && item !== 'proposer' && item !== 'targetPremium') {
        riskDataObjectAfterPostRisk[item] = completeRiskDataObject[item]
        riskResponse.riskData = JSON.stringify(riskDataObjectAfterPostRisk)

        const editRiskData = await putRisk(riskResponse)
      }
    }
  })

  it('Should quote the record', async function () {
    const getRiskAfterAddingNewQuote = await getRisk(riskResponse.policyDetailsId, riskResponse.policyDetailsHistoryId, riskResponse.productTypeId)
    const { schemeTableId, schemeName, newBusinessResponse } = await newBusiness(getRiskAfterAddingNewQuote)
    const mergeQuoteResp = await mergeQuote(getRiskAfterAddingNewQuote, schemeTableId)
  })

  it('Should Convert to Policy', async function () {
    const getRiskBeforeConvert = await getRisk(riskResponse.policyDetailsId, riskResponse.policyDetailsHistoryId, riskResponse.productTypeId)
    const convertToPolicyResponse = await convertToPolicy(getRiskBeforeConvert)
  })
})
