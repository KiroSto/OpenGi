/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { getRisk, mergeQuote } from '../../endpoints/riskData'
import { mtaQuote } from '../../endpoints/quote'
import { acceptMTARecord, initialiseMTARecord, prevalidateMTARecord } from '../../helpers/mta'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Permanent MTA Live Test', () => {
  let createPolicyResponse = null
  let mtaDate = null
  let mtaRecord = null
  let schemeTableIdFromQuote = null
  let mtaAdjustmentAmount = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create a policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should Prevalidate Permanent MTA', async function () {
    const policyRiskDataObject = JSON.parse(createPolicyResponse.riskData)
    mtaDate = policyRiskDataObject.policy.coverStartDate

    const prevalidateMTAResponse = await prevalidateMTARecord(createPolicyResponse, mtaDate)
  })

  it('Should Initialise and Quote MTA', async function () {
    mtaRecord = await initialiseMTARecord(createPolicyResponse, mtaDate)
    const mtaRiskDataObject = JSON.parse(mtaRecord.riskData)

    const mtaQuoteResponse = await mtaQuote(mtaRecord)
    schemeTableIdFromQuote = mtaRiskDataObject.policy.schemeTable
    mtaAdjustmentAmount = mtaQuoteResponse.adjustmentAmount
    const mergeQuoteResp = await mergeQuote(mtaRecord, schemeTableIdFromQuote)
  })

  it('Should Accept MTA', async function () {
    const getMtaQuotedRecord = await getRisk(mtaRecord.policyDetailsId, mtaRecord.policyDetailsHistoryId, mtaRecord.productTypeId)
    const acceptMTA = await acceptMTARecord(getMtaQuotedRecord, mtaAdjustmentAmount)
  })
})
