/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { deleteConsent, editConsent, getConsent } from '../../endpoints/customer'
import { addConsents } from '../../helpers/addConsents'
import { getPolicy } from '../../endpoints/riskData'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Clone policy and increment insured party ID', () => {
  let createProspectResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should test consent', async function () {
    // Add consents from all the three possible groups
    const addAllThreeConsents = await addConsents(createProspectResponse)
    const getConsents = await getConsent(createProspectResponse)

    // Edit each of the added consents
    let retractedDate = new Date(getConsents[0].dateConsented.substring(0, 10))
    retractedDate.setDate(retractedDate.getDate() + 2)
    retractedDate = new Date(retractedDate).toISOString().split('.')[0] + 'Z'

    for (let i = 0; i < getConsents.length; i++) {
      const amendConsent = await editConsent(createProspectResponse, retractedDate, getConsents[i].consentDetailsId)
      expect(amendConsent.success).toEqual(true)
      expect(amendConsent.dateRetracted).not.toEqual('')
      expect(amendConsent.dateRetracted).not.toEqual(null)
    }

    const getPropertyOwnersPolicy = await getPolicy(createProspectResponse.policyDetailsId, createProspectResponse.policyDetailsHistoryId)

    // Delete one of the consents
    const deleteOneConsent = await deleteConsent(createProspectResponse, getPropertyOwnersPolicy.id, getConsents[0].consentDetailsId)
    const getConsentsAfterDeleting = await getConsent(createProspectResponse)
    expect(getConsentsAfterDeleting.length).toEqual(getConsents.length - 1)
  })
})
