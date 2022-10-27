/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { getLookupList } from '../../endpoints/lookup'
import { getRisk } from '../../endpoints/riskData'
import { clientDecline } from '../../endpoints/customer'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('AddQuote test on prospect', () => {
  let createProspectResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should Save as Client Decline', async function () {
    // Get Risk before Client Decline
    const getRiskRespBeforeClientDecline = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const riskDataObjectBeforeClientDecline = JSON.parse(getRiskRespBeforeClientDecline.riskData)

    // Client Decline and check the policy status after declining
    const postClientDecline = await clientDecline(getRiskRespBeforeClientDecline)
    const policyStatuses = await getLookupList('LIST_POLICY_STATUS')
    const getRiskRespAfterClientDecline = await getRisk(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId, createProspectResponse.productTypeId)
    const riskDataObjectAfterClientDecline = JSON.parse(getRiskRespAfterClientDecline.riskData)

    const policyStatus = policyStatuses.filter(function (res) {
      return res.id === riskDataObjectAfterClientDecline.policy.policyStatusId
    })

    expect(riskDataObjectBeforeClientDecline.policy.policyStatusId).not.toBe(riskDataObjectAfterClientDecline.policy.policyStatusId)
    expect(policyStatus[0].text).toEqual('Client Decline')
  })
})
