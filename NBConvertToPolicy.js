import { group } from 'k6'
import { Rate } from 'k6/metrics'
import http from "k6/http";
import { checkPermission, getLobConfiguration, getLookupQuestions, isRecordLocked, recordLock, recordUnlock, validateBackdate } from '../../helpers/generalScreens/configEndpoints.js'
import { getFeatures, getShowRenewal, searchClient } from '../../helpers/generalScreens/homePage.js'
import { getAdvisors, getIntroducers, getProductSelection, getUsers } from '../../helpers/generalScreens/productSelection.js'
import { convertToPolicy, getPaymentPlans, mergeQuote, newBusiness, quotePaymentPlan } from '../../helpers/quoteScreen/newBusinessQuote.js'
import { getRiskData, makeModelSearch, postRiskData, putRisk } from '../../helpers/dataCapture/riskDataEndpoints.js'
import { getConsent, postConsent } from '../../helpers/dataCapture/consentScreen.js'
import { editPremiumPreValidate, getAddons, getEndorsements, getExcesses, getManualAmendments, getTotalExcessAmount } from '../../helpers/quoteScreen/manualAmmendments.js'
import {vuMax} from './scenarios.js'
import {CreateAndLoginUsers, DeleteUsers} from "../../../shared/utilities/userManagment.js";

export {options} from './scenarios.js'
// Load custom parameters from config file
const customData = JSON.parse(open('../../shared/custom.json'))

// declare variables
let riskObject, policyDetailsId, policyDetailsHistoryId, insuredPartyId,insuredPartyHistoryId, schemeTableId, riskData, surname, systemDate, user, systemDateResponse, userProfile

// Overwrite parameters with environment values
const apiHost =  customData.apiHost;
const siteCode =  customData.siteCode;
const searchData = customData.customData.mobiusGateway.searchData
const agentId = customData.customData.mobiusGateway.agentId
const subAgentId = customData.customData.mobiusGateway.subAgentId
const productId = customData.customData.mobiusGateway.productId
const productTypeId = customData.customData.mobiusGateway.productType
const profileId = customData.customData.mobiusGateway.profileId
const productType = customData.customData.mobiusGateway.productType
const paymentPlanId = customData.customData.mobiusGateway.paymentPlanId
const paymentMethodId = customData.customData.mobiusGateway.payMethodID
const sortCode = customData.customData.mobiusGateway.sortCode
const accountNumber = customData.customData.mobiusGateway.accountNo
const accountHolder = customData.customData.mobiusGateway.accountHolder
const preferredPaymentDay = customData.customData.mobiusGateway.preferredPaymentDay

export function setup() {
  const users = CreateAndLoginUsers(siteCode, vuMax);
 

  function paramsForGet(name) {
      return {
          headers: {'Authorization': `Bearer ${users[0].access_token}`},
          tags: {type: "MobiusAPI", name: name},
          timeout: '120s'
      };
  }

  systemDateResponse = http.get(`${apiHost}/api/tenantConfiguration/tenant/SystemDate`, paramsForGet("GET-customer/systemDate"));
  return {
      Users: users,
      SystemDate: systemDateResponse.body
  };
  
}

export function getParamsAndHeadersForUser (token) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
    tags: { type: 'MobiusAPI' }
  }

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${token}`
  }

  return { params: params, headers: headers }
}

export function NewBussiness(setupData) {

  if (__ITER === 0 && setupData.Users[__VU - 1].access_token) {
    user = setupData.Users[__VU - 1];
}

if (!user) {
    sleep(5)
    fail(`User is missing. Current VU: ${__VU}`);
}
const { params, headers } = getParamsAndHeadersForUser(user.access_token)

 group('Search for unexisting user', function () {
   searchClient(params, searchData)
   getFeatures(params)
   getShowRenewal(params)
 })

 group('Choose product selection', function () {
   getProductSelection(params)
  // getUsers(params)
 // getIntroducers(params, agentId)
 // getAdvisors(params)
 })

 group('Navigate to Proposer Details', function () {
  // getLobConfiguration(params, agentId, subAgentId, productId)
 //  getPaymentPlans(params, agentId, productId)
 //  checkPermission(params, agentId)
  // getLookupQuestions(params, productTypeId)
   validateBackdate(params, productId, agentId)
   systemDate = setupData.SystemDate
 })

 group('Page: Proposer Details', function () {
   systemDate = setupData.SystemDate
   surname = JSON.stringify('Performance' + systemDate.slice(1, -1))
   userProfile = JSON.stringify(user.profileId)
   console.log("USEEER", userProfile)
   const proposerDetails = JSON.stringify({
     productTypeId: 24,
     insuredPartyId: null,
     insuredPartyHistoryId: 1,
     policyDetailsId: '',
     policyDetailsHistoryId: 1,
     modelSection: '',
     modelSectionParentObjectId: '',
     ignoreUpdate: false,
     riskData:
    '{"policy":{"policyReference":"999/002/Y042/QUO","policyStatusId":"3AU9IQ25","paymentPlanId":"2E5BD605D4C340A1AD4404593BC0161F","portfoliokey":999,"agentId":"F511CCCF55DB455F88F0473A5821A159","productId":"1B21D334F6134B63A94E20907040DA91","subAgentId":null,"branchId":null,"schemeTable":246,"premium":1.0000,"stopRenewal":false,"insurerPolicyReference":"null","createdBy": ' + userProfile + ',"coverStartDate":' + systemDate + ',"coverEndDate":"2022-10-21T23:59:00Z","inceptionDate":' + systemDate + ',"originalInceptionDate":' + systemDate + ',"cancellationDate":null,"mtaStartDate":null,"mtaEndDate":null,"yearsOnCover":0,"lastYearAnuPrem":0.0000,"prevPolLenMon":0,"eventDescription":null,"migrated":false,"objectId":""},"proposer":{"clientReference":"ALI/A/08081990/0001","company":false,"companyName":null,"companyContactName":null,"dateEstablished":null,"titleId":"003","forename":"Amin","initials":null,"surname":'+surname+',"emailAddress":null,"honours":null,"dateOfBirth":"1990-08-08T00:00:00Z","gender":"Male","deceased":false,"creditCheckConsent":"CRCK0003","commonRenewalDate":null,"concurrentClientSince":"2021-10-21T18:48:26Z","address":{"house":"Sweet Pea Cottage","postcode":"GY1 1XA","street":"La Butte","locality":"St. Peter Port","city":"Guernsey","county":null,"country":"0","dwellingTypeId":"02","dwellingStatusId":"3DSDOGA6","objectId":""},"telephone":null,"businessDetails":null,"clientSecurity":null,"objectId":""},"drivers":[{"proposer":true,"titleId":"003","forename":"Amin","initials":null,"surname":'+surname+',"dateOfBirth":"1990-08-08T00:00:00Z","gender":"Male","maritalStatusId":"D","relationshipId":"P","addressResidenceMonths":0,"addressResidenceYears":0,"uKResidenceYears":31,"uKResidenceMonths":5,"uKResidenceFromBirth":1,"mainUser":true,"motoringOrganisationId":"0","vehicleUseId":"04","clubMembershipId":"0","memberSince":null,"licenceNumber":null,"licenceTypeId":"F","datePassedTest":"2011-01-01T00:00:00Z","licenceRestrictionsId":"8","accessToOtherVehicles":false,"vehiclesOwned":0,"vehiclesDriven":0,"vehiclesAvailableToFamily":1,"primeUse":false,"make":null,"model":null,"engineSize":null,"yearOfManufacture":null,"companyCarNcdYears":0,"companyCarDateCeased":null,"companyCarUsageId":0,"countyCourtJudgements":false,"criminalConvictions":false,"insurancePreviouslyRefused":false,"insuranceTermsApplied":false,"smoker":false,"teetotal":false,"creditCardHolder":false,"childrenUnder18":false,"clubMember":false,"claims":null,"convictions":null,"qualifications":null,"medicalConditions":null,"occupations":[{"occupationId":"D78","employersBusinessId":"201","employmentStatusId":"C","partTime":false,"primaryOccupation":false,"objectId":""}],"licence":{"licenceTypeId":"F","originOfIssueId":"023","licenceNumber":null,"dlnAuthorised":"AUTHNA","datePassed":"2011-01-01T00:00:00Z","licenceRestrictionsId":"8","clientPostCodeYN":false,"taxiExperienceId":"0","objectId":""},"objectId":""}],"vehicles":[{"registrationNumber":"atv 563","chassisNumber":null,"make":"HONDA","model":"JAZZ","engineSize":"1339","doors":5,"type":"SE","noOfSeats":0,"yearOfManufacture":"2001-01-01T00:00:00Z","fuelTypeId":"002","abiCode":"21017301","gearboxId":"002","manualGroup":null,"group":"","colourId":"0","immobiliser":"T2","bodyTypeId":"0","leftHandDrive":false,"pricePaid":12344,"estimatedValue":12344,"valueAgreed":true,"dateAgreed":"1899-12-30T00:00:00Z","valueReasonId":"0","registeredDate":"2016-01-01T00:00:00Z","purchaseDate":"2016-01-01T00:00:00Z","annualMileage":12334,"businessMileage":0,"currentMileage":123455,"vehicleUseId":"0","qPlated":false,"selfBuilt":null,"qPlatedReasonId":"0","imported":false,"countryOfRegistrationId":"0","ownerId":"1","keeperId":"1","overnightParkingId":"D","garageConstructionId":"0","modificationsYN":false,"timedEvents":null,"previousExperience":null,"modBhp":null,"permanentReferenceNumber":1,"garageAddress":{"house":"Sweet Pea Cottage","postcode":"GY1 1XA","street":"La Butte","locality":"St. Peter Port","city":"Guernsey","county":null,"countryId":"0","residentialProperty":false,"objectId":""},"experienceDetails":null,"accessories":null,"modifications":null,"securityDevices":null,"security":null,"objectId":""}],"marketing":{"preferredContactMethodId":"0","originalContactSourceId":"0","originatorId":"0","stopCorrespondence":false,"correspondanceToBranch":false,"campaignId":"0","sourceBusinessId":"0","activityId":"0","reference":null,"referredBy":null,"mailFromAdmin":false,"mailFromAffinity":false,"mailFromThirdParty":false,"telephoneFromAdmin":false,"telephoneFromAffinity":false,"telephoneFromThirdParty":false,"businessSourceCodeId":"0","dataSourceCodeId":"0","optOutDayOneInflationIncrease":false,"optOutAutomaticRenewal":false,"saleAdvised":false,"objectId":""},"cover":{"coverTypeId":"01","drivingRestrictionId":"4","ncd":{"years":0,"reasonId":"0","voluntaryExcess":null,"countryEarnedId":"0","entitlementReasonId":"0","protectedNcd":false,"otherNcd":0,"otherTypeId":"0","otherYearsClaimFree":0,"otherInsurerId":"0","otherPolicyCurrent":false,"otherVehicleNcd":false,"vehicleNcdTypeId":"2","otherMotorDriverOptionsId":"0","previousInsurance":{"previousExpiryDate":null,"previousPolicyNumber":null,"previousInsurerId":"0","objectId":""},"objectId":""},"objectId":""},"targetPremium":{"previousQuotedPremium":0.0000,"bestQuoteGivenById":"0","currentRenewalDate":"1899-12-30T00:00:00Z","online":false,"telephone":false,"renewal":false,"newInsurer":false,"lastYear":0.0000,"bestQuoteThisYear":0.0000,"coverId":"0","totalExcess":0.0000,"objectId":""},"addons":null,"preferredGarage":null,"previousInsurance":{"previousExpiryDate":null,"previousPolicyNumber":null,"previousInsurerId":"0","objectId":""}}',
     quoted: false,
     syncDataSection: true
   })
   riskObject = postRiskData(headers, proposerDetails)
   policyDetailsId = riskObject.policyDetailsId
   policyDetailsHistoryId = riskObject.policyDetailsHistoryId
   insuredPartyId = riskObject.insuredPartyId
   insuredPartyHistoryId = riskObject.insuredPartyHistoryId

   const recordLockRequest = JSON.stringify({
     profileID: profileId,
     recordID: insuredPartyId,
     recordType: 8
   })
   recordLock(headers, recordLockRequest)
 })

 group('Page: Consent Details', function () {
   getConsent(params, policyDetailsId)

   const postConsentRequest = JSON.stringify({
     MethodOfContactId: '0',
     DateRetracted: '',
     ConsentDetailsId: '',
     PolicyDetailsId: policyDetailsId,
     ConsentGroupId: 'DATAPROC',
     ConsentTypeId: 'TESTTYPE',
     ConsentChannelTypeId: 'LCCT0001',
     DateConsented: '2019-04-04T00:00:00Z'
   })

   postConsent(headers, postConsentRequest)
   //getSystemDate(params)
 })

 group('Page: Driver Details', function () {
   riskData = JSON.parse(riskObject.riskData)
   const occupationData = [
    {
      occupationId: 'A04',
      employersBusinessId: '001',
      employmentStatusId: 'E',
      partTime: false,
      primaryOccupation: false
    }
  ]
  riskData.drivers[0].occupations = occupationData

 //const licenceData = { licenceTypeId: 'B', originOfIssueId: '023', licenceNumber: '623456', dlnAuthorised: 'AUTHNA', datePassed: '2018-08-15T00:00:00', licenceRestrictionsId: '10' }
 //riskData.drivers[0].licence = licenceData

  riskData.drivers[0].companyCarNcdYears = 4
  riskData.drivers[0].maritalStatusId = 'M'
  riskData.drivers[0].uKResidenceFromBirth = 1
  riskData.drivers[0].mainUser = true
  riskData.drivers[0].vehicleUseId = '04'
  riskData.drivers[0].relationshipId = 'P'
  riskData.drivers[0].vehiclesAvailableToFamily = '1'

  riskObject.riskData = JSON.stringify(riskData)
  putRisk(headers, riskObject)

   makeModelSearch(params, productType)

  // getSystemDate(params)
 })

group('Page: Vehicle Details', function () {
  riskData = JSON.parse(riskObject.riskData)
  const vehicleData = [
    {
      registrationNumber: 'TBA1',
      chassisNumber: 'WDD2120022B036530',
      make: 'MERCEDES',
      model: 'E220 AMG SPORT CDI AUTO',
      engineSize: '2143',
      doors: 4,
      type: 'AMG SPORT CDI',
      noOfSeats: 5,
      yearOfManufacture: '2014-01-01T00:00:00Z',
      fuelTypeId: '001',
      abiCode: '32130769',
      gearboxId: '001',
      manualGroup: '',
      group: '35',
      colourId: '011',
      immobiliser: 'T1',
      bodyTypeId: '01',
      leftHandDrive: false,
      pricePaid: 25000,
      estimatedValue: 19000,
      valueAgreed: false,
      dateAgreed: '1900-01-01T00:00:00Z',
      valueReasonId: '0',
      registeredDate: '2014-06-11T00:00:00Z',
      purchaseDate: '2015-01-01T00:00:00Z',
      annualMileage: 15000,
      businessMileage: null,
      currentMileage: 45000,
      vehicleUseId: '04',
      qPlated: false,
      selfBuilt: false,
      qPlatedReasonId: '0',
      imported: false,
      countryOfRegistrationId: null,
      ownerId: '1',
      keeperId: '1',
      overnightParkingId: '1',
      garageConstructionId: '02',
      modificationsYN: false,
      timedEvents: null,
      previousExperience: null,
      modBhp: null,
      permanentReferenceNumber: 1,
     garageAddress: {
       house: '2 Fernbank',
       postcode: 'GY1 1XA',
       street: 'La Butte',
       locality: 'St. Peter Port',
       city: 'Guernsey',
       county: '',
       countryId: null,
       residentialProperty: false,
       experienceDetails: null,
       accessories: null,
       modifications: null,
       securityDevices: null,
       security: {
         parkingId: '1',
         garageAlarmed: null,
        alarmId: null,
        cctv: null,
        visibleFromRoad: null,
        electricGates: null,
        fireProtection: null,
        securityGuards: null,
        vehicleCheckedId: null,
        vehicleUsageId: null,
        workPostcode: null,
          whereKeptId: null,
          yearsWorkedAtPremises: null,
          yearsAtMainAddress: null
        }
      }
    }
  ]

  riskData.vehicles[0][vehicleData] = vehicleData
  riskObject.riskData = JSON.stringify(riskData)

  putRisk(headers, riskObject)
})

group('Page: Vehicle Cover', function () {
  systemDate = setupData.SystemDate

  riskData = JSON.parse(riskObject.riskData)
  const vehicleCoverData = {
    coverTypeId: '01',
    drivingRestrictionId: '1',
    ncd: {
      voluntaryExcess: '0',
      years: '5',
      reasonId: null,
      countryEarnedId: 'GB',
      entitlementReasonId: null,
      vehicleNcdTypeId: '2',
      protectedNcd: false,
      otherNcd: '',
     otherTypeId: 'PC',
     otherYearsClaimFree: '',
     otherInsurerId: null,
     otherPolicyCurrent: false,
     otherMotorDriverOptionsId: null,
     previousInsurance: {
       previousExpiryDate: '2018-05-29T00:00:00Z',
       previousPolicyNumber: null,
       previousInsurerId: '998'
     }
    }
  }
  riskData.cover = vehicleCoverData
  riskObject.riskData = JSON.stringify(riskData)

  putRisk(headers, riskObject)
})

group('Page: Contact & Marketing', function () {
  policyDetailsId = riskObject.policyDetailsId
  policyDetailsHistoryId = riskObject.policyDetailsHistoryId

  riskData = JSON.parse(riskObject.riskData)
  const marketingData = {
    preferredContactMethodId: '3EHPHID7',
    originalContactSourceId: '0',
    originatorId: '0',
    stopCorrespondence: false,
    correspondanceToBranch: false,
    campaignId: '0',
    sourceBusinessId: '0',
    activityId: '3LIS9C48',
    reference: null,
    referredBy: null,
   mailFromAdmin: false,
   mailFromAffinity: false,
   mailFromThirdParty: false,
   telephoneFromAdmin: false,
   telephoneFromAffinity: false,
   telephoneFromThirdParty: false,
   businessSourceCodeId: '001',
   dataSourceCodeId: '001',
   optOutDayOneInflationIncrease: null,
   optOutAutomaticRenewal: null,
    saleAdvised: null,
    objectId: '85A5D8BF0CC04C529F6A73F05A30BAB1'
  }

  riskData.marketing = marketingData
  putRisk(headers, riskObject)
})

group('Page: Quote Summary', function () {
  riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)

  getManualAmendments(params, policyDetailsId)
 getPaymentPlans(params, agentId, productId)
 getAddons(params, agentId, productId)
 editPremiumPreValidate(params)
 //getLobConfiguration(params, agentId, subAgentId, productId)

 const newBusinessRequest = JSON.stringify({
   showBreakdown: true,
   internetAvailable: false,
   save: false,
    manualAmendments: {
      discount: false,
      annualPremiumAdjustment: false,
      depositRequested: false,
      freeTextEndorsementsIds: [],
      endorsementsIds: [],
      excessesIds: []
    },
    risk: riskObject
  })

  newBusiness(headers, newBusinessRequest)

  riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  riskData = JSON.parse(riskObject.riskData)
  schemeTableId = riskData.policy.schemeTable
  riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)

 getEndorsements(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
 getExcesses(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
 getTotalExcessAmount(params, policyDetailsId, policyDetailsHistoryId, schemeTableId)
 quotePaymentPlan(headers, productId, policyDetailsId, policyDetailsHistoryId, paymentPlanId)

 riskData = mergeQuote(headers, policyDetailsId, policyDetailsHistoryId, schemeTableId)
 riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)

  putRisk(headers, riskObject)
})

group('Convert to Policy', function () {
  riskObject = getRiskData(params, policyDetailsId, policyDetailsHistoryId, productType)
  policyDetailsId = riskObject.policyDetailsId
  policyDetailsHistoryId = riskObject.policyDetailsHistoryId
  insuredPartyId = riskObject.insuredPartyId
  insuredPartyHistoryId = riskObject.insuredPartyHistoryId
  const convertRequest = JSON.stringify({
    productTypeId: `${productType}`,
    policyDetailsId: policyDetailsId,
   policyDetailsHistoryId: policyDetailsHistoryId,
   insuredPartyId: insuredPartyId,
   insuredPartyHistoryId: insuredPartyHistoryId,
   paymentPlanId: paymentPlanId,
   payMethodID: paymentMethodId,
   takePayment: true,
   reference: '123123',
   saleAdvised: false,
   optOutOfAutomaticRenewal: false,
   optOutDayOneIncrease: false,
   directDebit: {
      sortCode: sortCode,
      accountNo: accountNumber,
      accountHolder: accountHolder,
      preferredPaymentDay: preferredPaymentDay,
      house: 'OpenGI',
      street: 'NobsCrook',
      locality: 'Colden',
      city: 'Winchester',
     county: 'County',
     country: null,
     postcode: 'SO211TH'
   },
   creditCard: null,
   hash: null
 })

 convertToPolicy(headers, convertRequest)
})

group('Unlock record', function () {
  isRecordLocked(params, insuredPartyId)
  const recordUnlockRequest = JSON.stringify({
    profileID: profileId,
    recordID: insuredPartyId,
    recordType: 8
  })
  recordUnlock(headers, recordUnlockRequest)
})
}

export function teardown(setupData) {
  DeleteUsers(setupData.Users, siteCode, vuMax);
}
