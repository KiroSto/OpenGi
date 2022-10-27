/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createPolicy } from '../../helpers/create-policy'
import { getRisk } from '../../endpoints/riskData'
import { amendClientPropertyOwners } from '../../endpoints/customer'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Amend Client on policy', () => {
  let createPolicyResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create a policy', async function () {
    createPolicyResponse = await createPolicy(riskData, 1)
  })

  it('Should amend client', async function () {
    const getRiskBeforeAmendClient = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)

    const amendClientRequest = await amendClientPropertyOwners(getRiskBeforeAmendClient)

    const getRiskAfterAmendClient = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
    const amededRiskData = JSON.parse(getRiskAfterAmendClient.riskData)
    const amendClientBodyRequest = require('../../fixtures/partialSaveRisks/amendClientPropertyOwners.json')

    // Verify that all the data is successfully amended
    for (const item in amededRiskData.proposer) {
      if (item !== 'objectId' && item !== 'telephone') {
        expect(amededRiskData.proposer[item]).toEqual(amendClientBodyRequest.proposer[item])
      }
    }

    for (let i = 0; i < amededRiskData.proposer.telephone.length; i++) {
      for (const item in amededRiskData.proposer.telephone[i]) {
        if (item !== 'objectId') {
          expect(amededRiskData.proposer.telephone[i][item]).toEqual(amendClientBodyRequest.proposer.telephone[i][item])
        }
      }
    }
  })
})
