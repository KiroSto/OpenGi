/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { getHistory } from '../../endpoints/customer'
import { addDaysToSystemDate } from '../../helpers/dateHelpers'
import { getRisk } from '../../endpoints/riskData'
import { prevalidateMTARecord } from '../../helpers/mta'
import { prevalidateCancellation } from '../../helpers/prevalidateCancellation'
import { calculateCancellation } from '../../helpers/calculateCancellation'
import { acceptCancellationOfThePolicy } from '../../helpers/acceptCancellation'

const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Cancell a policy', () => {
  let createPolicyResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should Cancel The Policy', async function () {
    const riskData = JSON.parse(createPolicyResponse.riskData)

    const cancellationDate = await addDaysToSystemDate(1)
    const prevalidateCancellationResponse = await prevalidateCancellation(createPolicyResponse, cancellationDate)

    const calculateCancellationResponse = await calculateCancellation(createPolicyResponse, cancellationDate)

    const cancelThePolicy = await acceptCancellationOfThePolicy(createPolicyResponse, cancellationDate)
    const getRiskAfteracceptCancellation = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId + 1, createPolicyResponse.productTypeId)

    const getHistoryResponse = await getHistory(getRiskAfteracceptCancellation, getRiskAfteracceptCancellation.policyDetailsId)
    expect(getHistoryResponse[1].statusId).toEqual('Cancellation Pending')
    const cancellationPrevalidateResponseAfterCancellation = await prevalidateCancellation(getRiskAfteracceptCancellation, cancellationDate)
  })

  it('Should Prevalidate MTA', async function () {
    const getRiskAfteracceptCancellation = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId + 1, createPolicyResponse.productTypeId)
    const policyRiskDataObject = JSON.parse(getRiskAfteracceptCancellation.riskData)

    let mtaDate = new Date(policyRiskDataObject.policy.coverStartDate.substring(0, 10))
    mtaDate.setDate(mtaDate.getDate() + 2)
    mtaDate = new Date(mtaDate).toISOString().split('.')[0] + 'Z'

    const prevalidateMTAResponse = await prevalidateMTARecord(getRiskAfteracceptCancellation, mtaDate)
  })
})
