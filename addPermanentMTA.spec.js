import { userAuth } from '../helpers/UserAuth'
import { lobMapping } from '../helpers/LobMapping'
import { createPolicy } from '../helpers/create-policy'
import { getRisk, mergeQuote, putRisk } from '../endpoints/riskData'
import { addDaysToSystemDate } from '../helpers/dateHelpers'
import { addExcesses } from '../helpers/addExcesses'
import { addEndorsements } from '../helpers/addEndorsements'
import { addDriver } from '../helpers/editRiskData'
import { newBusiness, getManualAmendments, quoteMTA } from '../endpoints/quote'
import { acceptMTA1, listMtaAdjustmentTypes1, mtaInitialise, mtaPrevalidate } from '../endpoints/mta'
import { getPaymentMethods } from '../endpoints/accounts'
import { getLookupList } from '../endpoints/lookup'
import { getPaymentPlanId } from '../helpers/getPaymentPlanAndPaymentMethod'

const config = require('../config')

const riskData = require('../fixtures/riskData/' + lobMapping[config.businessLine] + '.json')

describe('Add a permanent MTA', () => {
    let createPolicyResponse = null
    let createProspectResponse = null
    let addMTAResp = null
    let schemeTableIdFromQuote = null
  

    it('Should login successfully', async function () {
        const loginResponse = await userAuth.signInUser()
        expect(loginResponse.status).toEqual(200)
    })

    it('Should create policy', async function () {
        createPolicyResponse = await createPolicy(riskData, 1, 'Cash', false)
    })
    it('Should prevalidate MTA', async function () {
        const getRiskAfterCreatingPolicy = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
        const mtaDate = await addDaysToSystemDate(1)
        const getMTAPrevalidateResponse = await mtaPrevalidate(getRiskAfterCreatingPolicy, mtaDate) 
        expect(getMTAPrevalidateResponse.backdated).toBe(false)
        expect(getMTAPrevalidateResponse.mtaPending).toBe(false)
        expect(getMTAPrevalidateResponse.renewalPending).toBe(false)
        expect(getMTAPrevalidateResponse.cancellationPending).toBe(false)
        expect(getMTAPrevalidateResponse.policyNotFound).toBe(false)
    })
    it('Should initialise and quote MTA', async function () {
        const getRiskAfterCreatingPolicy = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)
        const mtaDate = await addDaysToSystemDate(1)
        const getMTAAdjustmentTypes = await listMtaAdjustmentTypes1(getRiskAfterCreatingPolicy)
        const getMTAInitialiseResponse = await mtaInitialise(getRiskAfterCreatingPolicy, mtaDate)
        const riskData = JSON.parse(getMTAInitialiseResponse.riskData)
        expect(getMTAInitialiseResponse.policyDetailsHistoryId).toEqual(2)
        expect(riskData.policy.policyStatusId).toEqual("3AJPUL87")
        expect(riskData.policy.mtaStartDate).toEqual(mtaDate)
        expect(riskData.policy.coverStartDate).toEqual(mtaDate)
        expect(riskData.policy.coverEndDate).toEqual(riskData.policy.mtaEndDate)
        const putRiskAfterInitialiseMTA = await putRisk(getMTAInitialiseResponse)
        const policyStatuses = await getLookupList('LIST_POLICY_STATUS')
    //})
     //it('Should quote MTA', async function () {
         const getRiskAfterInitialisingMTA = await getRisk(getMTAInitialiseResponse.policyDetailsId, getMTAInitialiseResponse.policyDetailsHistoryId, getMTAInitialiseResponse.productTypeId)
         const getManualAmmendments = await getManualAmendments(getRiskAfterInitialisingMTA)
         const getMTAQuoteResponse = await quoteMTA(getRiskAfterInitialisingMTA)
     //})
   
    //it('Should Accept MTA', async function () {
        const riskData1 = JSON.parse(getRiskAfterInitialisingMTA.riskData)
        const getManualAmmendmentss = await getManualAmendments(getRiskAfterInitialisingMTA)
        //console.log(riskData1.policy.schemeTable)
        const getMergeQuoteResponse = await mergeQuote(getRiskAfterInitialisingMTA, riskData1.policy.schemeTable)
        const paymentPlanForPolicy = await getPaymentPlanId(getRiskAfterInitialisingMTA, 1, false)
        const paymentMethods = await getPaymentMethods(getRiskAfterInitialisingMTA, paymentPlanForPolicy.paymentPlanId)
        const acceptMTAResponse = await acceptMTA1(getRiskAfterInitialisingMTA,'Cash')
        //const getRiskAfterAcceptMTA = await getRisk(createPolicyResponse.policyDetailsId, createPolicyResponse.policyDetailsHistoryId, createPolicyResponse.productTypeId)

      })
})