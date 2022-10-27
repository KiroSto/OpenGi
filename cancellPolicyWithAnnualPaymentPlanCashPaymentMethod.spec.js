/* eslint-disable no-unused-vars */
import { userAuth } from '../helpers/UserAuth'
import { lobMapping } from '../helpers/LobMapping'
import { createPolicy } from '../helpers/create-policy'
import { calculate, cancellationPrevalidate } from '../endpoints/cancellation'
import { getHistory } from '../endpoints/customer'
import { addDaysToSystemDate } from '../helpers/dateHelpers'
import { getRisk } from '../endpoints/riskData'
import { getRetrieveQuote } from '../endpoints/quote'
import { getListByAgentAndProduct, getNoteType } from '../endpoints/lookup'
import { acceptCancellationOfThePolicy } from '../helpers/acceptCancellation'

const config = require('../config')

const riskData = require('../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Cancell a policy', () => {
  let createPolicyResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1, 'Cash', false)
  })

  it('Should cancell policy Annual and payment method Cash', async function () {
    const cancellationDate = await addDaysToSystemDate(1)
    const getRiskAfterCreatingPolicy = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
    const cancellationPrevalidateResponse = await cancellationPrevalidate(getRiskAfterCreatingPolicy, cancellationDate)
    const getRiskAfterCancellationPrevalidate = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
    expect(cancellationPrevalidateResponse.claimDetected).toBe(false)
    expect(cancellationPrevalidateResponse.mtaPending).toBe(false)
    expect(cancellationPrevalidateResponse.renewalPending).toBe(false)
    expect(cancellationPrevalidateResponse.cancellationPending).toBe(false)
    expect(cancellationPrevalidateResponse.policyNotFound).toBe(false)

    const cancellationReasonResponse = await getListByAgentAndProduct(getRiskAfterCancellationPrevalidate, 'CANCEL_REASON')
    const noteTypeResponse = await getNoteType(getRiskAfterCancellationPrevalidate)

    const calculateResponse = await calculate(getRiskAfterCancellationPrevalidate, cancellationDate, cancellationReasonResponse[0].id, noteTypeResponse[0].id)
    const clientValue = parseFloat(calculateResponse.client)

    const getRetrieveQuoteResponse = await getRetrieveQuote(getRiskAfterCancellationPrevalidate, cancellationDate, cancellationReasonResponse[0].id, noteTypeResponse[0].id)
    const grossPremiumRetrieveQuote = getRetrieveQuoteResponse[0].GrossPremium
    const adminFeeRetrieveQuote = getRetrieveQuoteResponse[0].AdminFee
    // const insurerValue = grossPremiumRetrieveQuote-adminFeeRetrieveQuote
    // expect(clientValue).toEqual(insurerValue)

    const acceptCancellationResponse = await acceptCancellationOfThePolicy(getRiskAfterCancellationPrevalidate, cancellationDate)

    const getRiskAfteracceptCancellation = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)

    const getHistoryResponse = await getHistory(getRiskAfteracceptCancellation)
    expect(getHistoryResponse[1].statusId).toEqual('Cancellation Pending')
    const cancellationPrevalidateResponseAfterCancellation = await cancellationPrevalidate(getRiskAfteracceptCancellation, cancellationDate)
    expect(cancellationPrevalidateResponseAfterCancellation.cancellationPending).toBe(true)
  })
})
