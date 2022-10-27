/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { getRisk } from '../../endpoints/riskData'
import { amendPolicyPropertyOwners } from '../../endpoints/customer'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Amend Policy Test', () => {
  let createPolicyResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create a policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should amend policy', async function () {
    const getRiskBeforeAmendPolicy = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)

    const amendClientRequest = await amendPolicyPropertyOwners(getRiskBeforeAmendPolicy)

    const getRiskAfterAmendPolicy = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
    const amededRiskData = JSON.parse(getRiskAfterAmendPolicy.riskData)
    const amendPolicyBodyRequest = require('../../fixtures/partialSaveRisks/amendPolicyPropertyOwners.json')

    // Verify that all the data is successfully amended
    for (const item in amededRiskData.marketing) {
      if (item !== 'objectId') {
        expect(amededRiskData.marketing[item]).toEqual(amendPolicyBodyRequest.policy.marketing[item])
      }
    }
  })
})
