/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { calculateUndoMTA } from '../../endpoints/mta'
import { getRisk, mergeQuote } from '../../endpoints/riskData'
import { mtaQuote } from '../../endpoints/quote'
import { getPaymentMethodsByAmount } from '../../endpoints/accounts'
import { acceptMTARecord, acceptUndoMTARecord, initialiseMTARecord, prevalidateMTARecord } from '../../helpers/mta'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Permanent MTA Test', () => {
  let createPolicyResponse = null
  let mtaDate = null
  let mtaRecord = null
  let schemeTableIdFromQuote = null
  const paymentMethod = null
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

  it('Should Calculate Undo MTA', async function () {
    const calculateUndoMTAResponse = await calculateUndoMTA(mtaRecord)
    if (calculateUndoMTAResponse.amount !== 0) {
      const paymentMethodsByAmount = await getPaymentMethodsByAmount(mtaRecord, calculateUndoMTAResponse.amount)

      const paymentMethod = paymentMethodsByAmount.filter(function (res) {
        return res.description === 'Cheque'
      })

      const listOfPaymentMethods = []
      paymentMethodsByAmount.forEach(paymentMethod => {
        listOfPaymentMethods.push(paymentMethod.description)
      })

      if (paymentMethod === 'Direct Debit') {
        expect(listOfPaymentMethods.length).toEqual(3)
        expect(listOfPaymentMethods).toContain('Direct Debit')
        expect(listOfPaymentMethods).toContain('Other')
        expect(listOfPaymentMethods).toContain('Cheque')
      } else {
        expect(listOfPaymentMethods.length).toEqual(2)
        expect(listOfPaymentMethods).toContain('Other')
        expect(listOfPaymentMethods).toContain('Cheque')
      }
    }
  })

  it('Should Accept Undo MTA and Check Policy History', async function () {
    const acceptUndoMTAResponse = await acceptUndoMTARecord(mtaRecord, mtaAdjustmentAmount)
  })
})
