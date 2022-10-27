/* eslint-disable no-unused-vars */
import { userAuth } from '../../helpers/UserAuth'
import { lobMapping } from '../../helpers/LobMapping'
import { createProspect } from '../../helpers/create-prospect'
import { addDiaryEntry, editDiaryEntry, searchDiary } from '../../endpoints/diary'
const config = require('../../config')

const riskData = require('../../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Diary Test', () => {
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

  it('Should Add and Edit Diary Entries', async function () {
    // Get the existing Diary Entries
    const listOfDiaryEntries = await searchDiary(createProspectResponse)
    expect(listOfDiaryEntries.length).toEqual(0)

    // Add Diary Entry and Verify That Is Added
    const addDiary = await addDiaryEntry(createProspectResponse)
    expect(addDiary.success).toEqual(true)

    const listOfDiaryEntriesAfterAdding = await searchDiary(createProspectResponse)
    expect(listOfDiaryEntriesAfterAdding.length).toEqual(1)

    // Edit Diary Entry and Verify That is Edited
    const editDiary = await editDiaryEntry(createProspectResponse, addDiary.diaryId)
    expect(editDiary.success).toEqual(true)

    const listOfDiaryEntriesAfterEditing = await searchDiary(createProspectResponse)
    expect(listOfDiaryEntriesAfterEditing[0].notes).toEqual('Edited Test Entry')
    expect(listOfDiaryEntriesAfterEditing[0].createdById).toEqual(riskDataObject.policy.createdBy)
  })
})
