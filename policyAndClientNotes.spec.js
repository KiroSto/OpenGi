/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { addClientNote, addPolicyNote, getClientNotes, getPolicyNotes } from '../../endpoints/notes'
import { getListByAgentAndProduct } from '../../endpoints/lookup'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Policy And Client Notes', () => {
  let createProspectResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should Add Policy And Client Notes', async function () {
    const noteTypeId = await getListByAgentAndProduct(createProspectResponse, 'CLIENT_NOTE_TYPE')

    // Get already added notes
    const policyNotes = await getPolicyNotes(createProspectResponse)
    expect(policyNotes.length).toEqual(0)

    const clientNotes = await getClientNotes(createProspectResponse)
    expect(clientNotes.length).toEqual(0)

    // Add one client and one policy note
    const policyNote = await addPolicyNote(createProspectResponse, 'test policy note', noteTypeId[0].id)
    expect(policyNote[0].description).toEqual('test policy note')
    expect(policyNote[0].noteTypeId).toEqual(noteTypeId[0].id)
    expect(policyNote[0].noteTypeDebug).toEqual(noteTypeId[0].text)

    const clientNote = await addClientNote(createProspectResponse, 'test client note', noteTypeId[0].id)
    expect(clientNote[0].description).toEqual('test client note')
    expect(clientNote[0].noteTypeId).toEqual(noteTypeId[0].id)
    expect(clientNote[0].noteTypeDebug).toEqual(noteTypeId[0].text)

    // Get the added notes
    const policyNotesAfterAdding = await getPolicyNotes(createProspectResponse)
    expect(policyNotesAfterAdding.length).toEqual(1)

    const clientNotesAfterAdding = await getClientNotes(createProspectResponse)
    expect(clientNotesAfterAdding.length).toEqual(1)
  })
})
