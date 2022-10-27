/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { getAllLockedRecords, isRecordLocked, lockRecord, unlockRecord } from '../../endpoints/security'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Record Locking Test', () => {
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

  it('Should Lock And Unlock Record', async function () {
    let recordFound = null
    let lockedRecordFromList = null

    // Unlock the record and verify that is unlocked
    const unlockRecordResponse = await unlockRecord(createProspectResponse)
    expect(unlockRecordResponse.success).toEqual(true)

    const isTheGivenRecordUnlocked = await isRecordLocked(createProspectResponse)
    expect(isTheGivenRecordUnlocked.isLocked).toEqual(false)

    // Lock the record and verify that is locked
    const lockRecordResponse = await lockRecord(createProspectResponse)
    expect(lockRecordResponse.success).toEqual(true)

    const isTheGivenRecordLocked = await isRecordLocked(createProspectResponse)
    expect(isTheGivenRecordLocked.isLocked).toEqual(true)

    // Get the list of all locked records and verify that the locked record is in that list
    const listOfLockedRecords = await getAllLockedRecords()
    listOfLockedRecords.forEach(lockedRecord => {
      if (lockedRecord.insuredPartyID === createProspectResponse.insuredPartyId) {
        recordFound = true
        lockedRecordFromList = lockedRecord
      }
    })

    expect(recordFound).toEqual(true)
    if (recordFound) {
      expect(lockedRecordFromList.profileID).toEqual(riskDataObject.policy.createdBy)
      expect(lockedRecordFromList.accountID).toEqual(createProspectResponse.insuredPartyId)
      recordFound = false
    }

    // Get the list of all locked records and verify that the locked record is not in that list after unlocking
    const unlockTheLockedRecord = await unlockRecord(createProspectResponse)
    expect(unlockTheLockedRecord.success).toEqual(true)

    const listOfLockedRecordsAfterUnlocking = await getAllLockedRecords()
    listOfLockedRecordsAfterUnlocking.forEach(lockedRecord => {
      if (lockedRecord.insuredPartyID === createProspectResponse.insuredPartyId) {
        recordFound = true
      }
    })
    expect(recordFound).toEqual(false)
  })
})
