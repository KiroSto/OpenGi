/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { searchRecord } from '../../endpoints/customer'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Search Prospect Record By Different Criteria', () => {
  let createProspectResponse = null
  let riskDataObject = null

  it('Should login successfully', async function () {
    const loginResponse = await userAuth.signInUser()
    expect(loginResponse.status).toEqual(200)
  })

  it('Should create prospect', async function () {
    createProspectResponse = await createProspect(riskData, 1)
    riskDataObject = JSON.parse(createProspectResponse.riskData)
  })

  it('Should Search By Policy Reference', async function () {
    const policyRefSearch = await searchRecord(riskDataObject.policy.policyReference)
    expect(policyRefSearch.data[0].policyData[0].policyNumber).toEqual(riskDataObject.policy.policyReference)
  })

  it('Should Search By Forename', async function () {
    const forenameSearch = await searchRecord(riskDataObject.proposer.forename)
    expect(forenameSearch.data[0].forename).toEqual(riskDataObject.proposer.forename)
  })

  it('Should Search By Surname', async function () {
    const surnameSearch = await searchRecord(riskDataObject.proposer.surname)
    expect(surnameSearch.data[0].surname).toEqual(riskDataObject.proposer.surname)
  })

  it('Should Search By Full Name', async function () {
    const fullNameSearch = await searchRecord(riskDataObject.proposer.forename + ' ' + riskDataObject.proposer.surname)
    expect(fullNameSearch.data[0].forename).toEqual(riskDataObject.proposer.forename)
    expect(fullNameSearch.data[0].surname).toEqual(riskDataObject.proposer.surname)
  })

  it('Should Search By Postcode', async function () {
    const postcodeSearch = await searchRecord(riskDataObject.proposer.address.postcode)
    expect(postcodeSearch.data[0].postcode).toEqual(riskDataObject.proposer.address.postcode)
  })

  it('Should Search By Non-Existing Term', async function () {
    const nonExistingSearch = await searchRecord('NNNNNNNNNNENENENENENENENENEENENENENENENE')
    expect(nonExistingSearch.data.length).toEqual(0)
  })
})
