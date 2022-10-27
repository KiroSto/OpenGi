using System;
using System.Collections.Generic;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2Framework.Pages.Test_Pages;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;
using TicPortalV2SeleniumFramework.Pages.Polaris;


namespace TicPortalV2SeleniumTests.Tests
{
    [TestClass]
    public class DictionaryTests : TestSetUp
    {
        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
        public void ShouldUserCanCerateCheckAndRemoveDictionary()
        {
            UITest(() =>
            {
                string dictionaryName = RandomString();
                var loginPage = new LoginPage(Driver);

                loginPage.LoginToPortalAdmin()
                .GoToDictionariesPage()
                .RemoveDictionaryIfExists(dictionaryName)


                .GoToCreateDictionaryPage()
                .CreateNewDictionary()
                .GoToMainDictionaryPage()
                .SearchForTheDictionary(dictionaryName)
                .CheckIfDictionaryExists()

                //check details
                .SelectDictionary()
                .CheckIfDictionaryDetailsCorrect()
              
                .CheckDictionaryVersion()
                //
                 
                //remove dict
                .RemoveDictionary()
                .GoToMainDictionaryPage()
                .CheckIfDictionaryRemoved(dictionaryName);
               
            });
        }



        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
        public void ShouldUserCanCreateAndCheckSchemeSet()
        {
            UITest(() =>
            {
                var schemeSetName = RandomString();
                var loginPage = new LoginPage(Driver);
                var schemeSetPages = new SchemeSetPages(Driver);
                var schemeSetDetailPage = new SchemeSetDetailsPage(Driver);
                var dictVersion = "";

                loginPage.LoginToPortalAdmin()
                .GoToSchemeSetPage()
                .GoToCreateSchemeSetPage()
                .CreateNewSchemeSet(schemeSetName, out dictVersion)
                .CheckIfSchemeSetDetailsCorrect(dictVersion)
                .CheckIfDownloadSchemeSetFileWorks()
                .GoToMainSchemeSetPages()
                .SearchForTheSchemeSet(schemeSetName)
                .CheckIfSchemeSetExists(schemeSetName)
                .SelectSchemeSet(schemeSetName); 
               
            });
        }


        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
        public void ShouldUserCanRemoveSchemeSet()
        {
            UITest(() =>
            {
                string schemeSetName = RandomString();
                var loginPage = new LoginPage(Driver);
                var schemeSetPages = new SchemeSetPages(Driver);
                var dictVersion = "";
                loginPage.LoginToPortalAdmin()
                .GoToSchemeSetPage()
                .GoToCreateSchemeSetPage()
                .CreateNewSchemeSet(schemeSetName,out dictVersion)
                .GoToMainSchemeSetPages()
                .SearchForTheSchemeSet(schemeSetName)
                .CheckIfSchemeSetExists(schemeSetName)
                .RemoveSchemeSet(schemeSetName)
                .GoToMainSchemeSetPages()
                .CheckIfSchemeSetRemoved(schemeSetName);

            });
        }

    
        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
        public void UserShoudlNotCreateSchemeSetWithoutRequiredFile()
        {
            UITest(() =>
            {
                string schemeSetName = RandomString();
                var loginPage = new LoginPage(Driver);
                var schemeSetPages = new SchemeSetPages(Driver);
                var schemeSetDetailPage = new SchemeSetDetailsPage(Driver);
                var dictVersion = "";

                loginPage.LoginToPortalAdmin()
                .GoToSchemeSetPage()
                .GoToCreateSchemeSetPage()
                .CreateNewSchemeSetWithMissingFile(schemeSetName, out dictVersion)
                .GoToMainSchemeSetPages()
                .CheckIfSchemeSetRemoved(schemeSetName);
            });
        }
    }
}
