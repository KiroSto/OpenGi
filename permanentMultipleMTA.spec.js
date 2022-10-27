/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { getRisk } from '../../endpoints/riskData'
import { mtaQuote } from '../../endpoints/quote'
import { initialiseMTARecord } from '../../helpers/mta'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Permanent Multiple MTAs Test', () => {
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

    mtaDate = new Date(policyRiskDataObject.policy.coverStartDate.substring(0, 10))
    mtaDate.setDate(mtaDate.getDate() + 2)
    mtaDate = new Date(mtaDate).toISOString().split('.')[0] + 'Z'
  })

  it('Should Initialise and Quote MTA', async function () {
    mtaRecord = await initialiseMTARecord(createPolicyResponse, mtaDate)
    const mtaRiskDataObject = JSON.parse(mtaRecord.riskData)

    const mtaQuoteResponse = await mtaQuote(mtaRecord)
    schemeTableIdFromQuote = mtaRiskDataObject.policy.schemeTable
    mtaAdjustmentAmount = mtaQuoteResponse.adjustmentAmount
  })

  it('Should Accept MTA', async function () {
    const getMtaQuotedRecord = await getRisk(mtaRecord.policyDetailsId, mtaRecord.policyDetailsHistoryId, mtaRecord.productTypeId)
  })

  it('Should Prevalidate The Second Permanent MTA', async function () {
    const policyRiskDataObject = JSON.parse(createPolicyResponse.riskData)

    mtaDate = new Date(policyRiskDataObject.policy.coverStartDate.substring(0, 10))
    mtaDate.setDate(mtaDate.getDate() + 10)
    mtaDate = new Date(mtaDate).toISOString().split('.')[0] + 'Z'
  })

  it('Should Initialise and Quote The Second MTA', async function () {
    mtaRecord = await initialiseMTARecord(createPolicyResponse, mtaDate)
    const mtaRiskDataObject = JSON.parse(mtaRecord.riskData)

    const mtaQuoteResponse = await mtaQuote(mtaRecord)
    schemeTableIdFromQuote = mtaRiskDataObject.policy.schemeTable
    mtaAdjustmentAmount = mtaQuoteResponse.adjustmentAmount
  })

  it('Should Accept The Second MTA', async function () {
    const getMtaQuotedRecord = await getRisk(mtaRecord.policyDetailsId, mtaRecord.policyDetailsHistoryId, mtaRecord.productTypeId)
  })
})
