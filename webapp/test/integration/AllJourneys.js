/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"com/airdit/app/re_PurchasingGroupDashboard/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/airdit/app/re_PurchasingGroupDashboard/test/integration/pages/App",
	"com/airdit/app/re_PurchasingGroupDashboard/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.airdit.app.re_PurchasingGroupDashboard.view.",
		autoWait: true
	});
});