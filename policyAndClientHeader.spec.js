/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { addClientHeaderText, addPolicyHeaderText, deleteClientHeaderText, deletePolicyHeaderText, editClientHeaderText, editPolicyHeaderText, getClientHeaderText, getPolicyHeaderText } from '../../endpoints/diary'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Policy And Client Header Test', () => {
  let createProspectResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should Add Policy Header Text', async function () {
    const policyHeader = await addPolicyHeaderText(createProspectResponse, 'Header Created')
    expect(policyHeader.headerText).toEqual('Header Created')

    const getHeaderText = await getPolicyHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('Header Created')
  })

  it('Should Edit Policy Header Text', async function () {
    const editPolicyHeader = await editPolicyHeaderText(createProspectResponse, 'Header Updated')
    expect(editPolicyHeader.headerText).toEqual('Header Updated')

    const getHeaderText = await getPolicyHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('Header Updated')
  })

  it('Should Delete Policy Header Text', async function () {
    const deletePolicyHeader = await deletePolicyHeaderText(createProspectResponse)
    expect(deletePolicyHeader.success).toEqual(true)

    const getHeaderText = await getPolicyHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('')
  })

  // Client Header

  it('Should Add Client Header Text', async function () {
    const policyHeader = await addClientHeaderText(createProspectResponse, 'Client Header Created')
    expect(policyHeader.headerText).toEqual('Client Header Created')

    const getHeaderText = await getClientHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('Client Header Created')
  })

  it('Should Edit Client Header Text', async function () {
    const editPolicyHeader = await editClientHeaderText(createProspectResponse, 'Client Header Updated')
    expect(editPolicyHeader.headerText).toEqual('Client Header Updated')

    const getHeaderText = await getClientHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('Client Header Updated')
  })

  it('Should Delete Client Header Text', async function () {
    const deletePolicyHeader = await deleteClientHeaderText(createProspectResponse)
    expect(deletePolicyHeader.success).toEqual(true)

    const getHeaderText = await getClientHeaderText(createProspectResponse)
    expect(getHeaderText.headerText).toEqual('')
  })
})
