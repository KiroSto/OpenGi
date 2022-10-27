using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework.Pages;

namespace TicPortalV2SeleniumTests.Tests
{
    [TestClass]
    public class DocumentTests : TestSetUp
    {
        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
        public void ShouldUserUploadDocument()
        {
            UITest(() =>
            {
                string documentName = RandomString();
                string documentType = "2";
                string documentLob = "3";
                var loginPage = new LoginPage(this.Driver);
                loginPage.LoginToPortalAdmin()
                            .GoToDocumentsPage()
                            .GoToCreateDocumentPage()
                            .CreateDocument(documentName, documentType, documentLob)
                            .ConfrimDocumentCreation(documentName);
            });
        }

        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
        public void ShouldUserUploadAndModifyDocument()
        {
            UITest(() =>
            {
                string documentName = RandomString();
                string documentName2 = $"{documentName}ver2";
                string documentType = "2";
                string documentLob = "3";
                var loginPage = new LoginPage(this.Driver);
                loginPage.LoginToPortalAdmin()
                            .GoToDocumentsPage()
                            .GoToCreateDocumentPage()
                            .CreateDocument(documentName, documentType, documentLob)
                            .ConfrimDocumentCreation(documentName)
                            .ClickEditBtn()
                            .ModifyDocumentName()
                            .ConfrimDocumentsNewVersion(documentName2);
            });
        }
    }
}