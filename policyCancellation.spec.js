/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { prevalidateCancellation } from '../../helpers/prevalidateCancellation'
import { calculateCancellation } from '../../helpers/calculateCancellation'
import { acceptCancellationOfThePolicy } from '../../helpers/acceptCancellation'
import { addDaysToSystemDate } from '../../helpers/dateHelpers'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Cancellation Of Policy', () => {
  let createPolicyResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create a policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should Cancel The Policy', async function () {
    const riskData = JSON.parse(createPolicyResponse.riskData)

    const cancellationDate = await addDaysToSystemDate(1)
    const prevalidateCancellationResponse = await prevalidateCancellation(createPolicyResponse, cancellationDate)

    const calculateCancellationResponse = await calculateCancellation(createPolicyResponse, cancellationDate)

    const cancelThePolicy = await acceptCancellationOfThePolicy(createPolicyResponse, cancellationDate)
  })
})
