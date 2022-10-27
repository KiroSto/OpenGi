/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { invalidPostCodeSearch, postCodeSearch } from '../../endpoints/lookup'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Postcode Search Test', () => {
  let createProspectResponse = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
  })

  it('Should Search For Existing And Non-Existing Postcodes', async function () {
    const postcodeSearchList = await postCodeSearch(createProspectResponse, 'SO21 1TH')

    postcodeSearchList.forEach(address => {
      expect(address.Postcode).toEqual('SO21 1TH')
      expect(address.City).toEqual('Winchester')
      expect(address.Locality).toEqual('Colden Common')
      expect(address.House).not.toBe('')
      expect(address.Street).not.toBe('')
    })

    const unxistingPostcodeSearch = await invalidPostCodeSearch(createProspectResponse, 'Soo123test')
    expect(unxistingPostcodeSearch.message).toEqual('Postcode not found. Postcode Soo123test')
  })
})
