sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	'sap/ui/export/Spreadsheet',
	'sap/ui/export/library',
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
], function (Controller, JSONModel, Fragment, Spreadsheet, library, ChartFormatter, Format) {
	"use strict";

	return Controller.extend("com.airdit.app.re_PurchasingGroupDashboard.controller.Dashboard", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.airdit.app.re_PurchasingGroupDashboard.view.Dashboard
		 */

		MonthText: {
			"01": "Jan",
			"02": "Feb",
			"03": "Mar",
			"04": "Apr",
			"05": "May",
			"06": "Jun",
			"07": "Jul",
			"08": "Aug",
			"09": "Sep",
			"10": "Oct",
			"11": "Nov",
			"12": "Dec",
		},
		onInit: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.attachRoutePatternMatched(this._handleRouteMatched, this);
		},

		_handleRouteMatched: function (oEvent) {
			// this.paymentYear = new Date().getFullYear();
			// this.spareYear = new Date().getFullYear();
			var today = new Date()
			this.paymentYear = ((today.getMonth() + 1) <= 3) ? today.getFullYear() : today.getFullYear() + 1;
			this.spareYear = ((today.getMonth() + 1) <= 3) ? today.getFullYear() : today.getFullYear() + 1;

			this.getView().getModel("dashboardModel").setProperty("/purchasingGrpData", this.PurchasingGroup);
			// if (!this._purchasingGrpValueHelpDialog) {
			// 	this._purchasingGrpValueHelpDialog = sap.ui.xmlfragment(
			// 		"com.airdit.app.re_PurchasingGroupDashboard.fragment.PurchasingGroupValueHelp",
			// 		this);
			// 	this.getView().addDependent(this._purchasingGrpValueHelpDialog)
			// }
			// this._purchasingGrpValueHelpDialog.open()
			//v2
			this.paymentBuild()
			this.rgpnrgpBuild()
			this.spareBuild()
			this.posaBuild()
				//v2

		},
		onPurchasingGrpValueHelp: function (oEvent) {
			this.getView().getModel("dashboardModel").setProperty("/purchasingGrpData", this.PurchasingGroup);
			if (!this._purchasingGrpValueHelpDialog) {
				this._purchasingGrpValueHelpDialog = sap.ui.xmlfragment(
					"com.airdit.app.re_PurchasingGroupDashboard.fragment.PurchasingGroupValueHelp",
					this);
				this.getView().addDependent(this._purchasingGrpValueHelpDialog)
			}
			this._purchasingGrpValueHelpDialog.open()
		},
		onPurchasingGroupSelect: function (oEvent) {
			var title = oEvent.getParameter("selectedItem").getBindingContext("dashboardModel").getObject().desc
			this.getView().byId("dashboardPage").setTitle(title)
			this.getView().byId("allChartBox").setVisible(true)
			this.getView().byId("sparePlantChartBox").setVisible(false)
			this.getView().byId("sparePlantTableBox").setVisible(false)
			this.getView().byId("rgpnrgpTableBox").setVisible(false)
			this.getView().byId("paymentChartBox").setVisible(false)
			this.getView().byId("posaTableBox").setVisible(false)
			this.paymentBuild()
			this.rgpnrgpBuild()
			this.spareBuild()
			this.posaBuild()
		},
		rgpnrgpBuild: function () {
			// this.getView().getModel("dashboardModel").setProperty("/rgpnrgpData", this.RGPNRGPDetails);
			this.getView().byId("vizRGP").setBusy(true)
			this.getOwnerComponent().getModel().read("/RGPNRGP_CountSet", {
				success: function (odata, response) {
					this.getView().byId("vizRGP").setBusy(false)
					this.RGPNRGPDetails = odata.results.filter(d => d.Count != 0)
					this.RGPNRGPDetails = this.RGPNRGPDetails.map(d => {
						return {
							...d,
							PlantText: `${d.Name1}-${d.Werks}`
						}
					})
					this.getView().getModel("dashboardModel").setProperty("/rgpnrgpData", this.RGPNRGPDetails);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("vizRGP").setBusy(false)
				}.bind(this)
			})
			this.getView().byId("vizRGP").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae']
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					visible: false
				},

			});
		},
		spareBuild: function () {
			// this.SpareDetails = this.SpareDetails.map(d => {
			// 	var count = d.plants.length;
			// 	return {
			// 		...d,count
			// 	}
			// })
			var title = `FY ${this.spareYear-1}-${this.spareYear.toString().substr(-2)}`;
			// this.getView().getModel("dashboardModel").setProperty("/spareData", this.SpareDetails);
			this.getView().byId("vizSpare").setBusy(true)
			var yearFilter = new sap.ui.model.Filter("Zyear", sap.ui.model.FilterOperator.EQ, this.spareYear);
			this.getOwnerComponent().getModel().read("/Spares_AdherenceSet", {
				filters: [yearFilter],
				success: function (odata, response) {
					this.getView().byId("vizSpare").setBusy(false)
					this.SpareDetails = odata.results
					this.SpareDetails = this.SpareDetails.map(d => {
						return {
							...d,
							MonthText: this.MonthText[d.Zmonth],
							AdheranceVal: +d.Adherence
						}
					})
					this.getView().getModel("dashboardModel").setProperty("/spareData", this.SpareDetails);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("vizSpare").setBusy(false)
				}.bind(this)
			})

			Format.numericFormatter(ChartFormatter.getInstance());
			// var formatPattern = ChartFormatter.DefaultPattern;
			var FIORI_PERCENTAGE_FORMAT_6 = "__UI5__PercentageMaxFraction6";
			var chartFormatter = ChartFormatter.getInstance();
			chartFormatter.registerCustomFormatter(FIORI_PERCENTAGE_FORMAT_6, function (value) {
				// var val = value / 100000;
				// val = val.toFixed(1);
				// var val1 = Math.round(val);
				//val = val + " " + "Lakhs";
				return value;
			});

			this.getView().byId("vizSpare").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value',
						formatString: FIORI_PERCENTAGE_FORMAT_6
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae', '#fcff99', '#b7fa98', '#98faef', '#96b4fa',
					// 	'#a47aff', '#ff78a9'
					// ]
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					text: title,
					visible: true
				},

			});
		},
		paymentBuild: function () {
			this.VendorsRegion = [{
				region: "SOUTH",
				regionText: "South Region"
			}, {
				region: "NORTH",
				regionText: "North Region"
			}, {
				region: "EAST",
				regionText: "East Region"
			}, {
				region: "WEST",
				regionText: "West Region"
			}, {
				region: "IMPORTS",
				regionText: "Imports"
			}]
			var allPromise = [];
			var readAllVendor = function (path, filter, that) {
				return new Promise(
					function (resolve, reject) {
						that.getOwnerComponent().getModel().read(path, {
							filters: filter,
							success: function (oData) {
								debugger;

								resolve(oData);
							}.bind(that),
							error: function (oResult) {
								debugger;
								reject(oResult);
							}.bind(that),
						});
					});
			}

			for (let i = 0; i < this.VendorsRegion.length; i++) {
				var filter = []
				filter.push(new sap.ui.model.Filter("Zzone", sap.ui.model.FilterOperator.EQ, this.VendorsRegion[i].region))
				allPromise.push(readAllVendor("/Vendor_ListSet", filter, this))
			}
			this.getView().byId("vizPayment").setBusy(true)
			Promise.all(allPromise)
				.then((data) => {
					debugger
					this.getView().byId("vizPayment").setBusy(false);
					this.PaymentDetails = data.map((d, i) => {
						var region = this.VendorsRegion[i].region;
						var regionText = this.VendorsRegion[i].regionText;
						return {
							count: d.results.length,
							data: d,
							region,
							regionText
						}
					})

					this.getView().getModel("dashboardModel").setProperty("/paymentData", this.PaymentDetails);

				})
				.catch(error => {
					this.getView().byId("vizPayment").setBusy(false);
				});

			this.getView().byId("vizPayment").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae', '#fcff99', '#b7fa98', '#98faef', '#96b4fa',
					// 	'#a47aff', '#ff78a9'
					// ]
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					visible: false
				}
			});
		},
		posaBuild: function () {
			this.getView().byId("vizPosa").setBusy(true)
			this.getOwnerComponent().getModel().read("/PO_SO_CountSet", {
					success: function (odata, oresponse) {
						this.getView().byId("vizPosa").setBusy(false)
						var data = odata.results[0]
						this.PosaDetails = [{
							level: "First Level",
							value: data["Firstlevel"],
							type: " "

						}, {
							level: "Second Level",
							value: data["Secondlevel"],
							type: "X"

						}, {
							level: "Third Level",
							value: data["Thirdlevel"],
							type: "XX"

						}]
						this.getView().getModel("dashboardModel").setProperty("/posaData", this.PosaDetails);
					}.bind(this),
					error: function (err) {
						this.getView().byId("vizPosa").setBusy(false)

					}.bind(this)
				})
				// this.getView().getModel("dashboardModel").setProperty("/posaData", this.PosaDetails);
			this.getView().byId("vizPosa").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae']
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					visible: false
				},

			});
		},
		onSelectSpare: function (oEvent) {
			// var selectedData = oEvent.getParameter("data")[0].data.Posting;
			// var plants = this.SpareDetails.find(d => d.posting == selectedData)
			// this.getView().getModel("dashboardModel").setProperty("/sparePlantDetails", plants);
			// if (!this._sparePlantPopover) {
			// 	this._sparePlantPopover = sap.ui.xmlfragment(
			// 		"com.airdit.app.re_PurchasingGroupDashboard.fragment.SparePlants",
			// 		this);
			// 	this.getView().addDependent(this._sparePlantPopover)
			// }
			// this._sparePlantPopover.open();

			this.buildSpareDetail()
			this.getView().byId("spareChart").setFullScreen(false)
				// var spareTableData = this.PlantSpareTableDetail.map((d, i) => {
				// 	return {
				// 		...d,
				// 		slno: i + 1
				// 	}
				// })
				// this.getView().getModel("dashboardModel").setProperty("/sparePlantVendorTableData", spareTableData);

		},
		buildSpareDetail: function () {
			var title = `FY (${this.spareYear-1}-${this.spareYear.toString().substr(-2)})`;
			// this.getView().byId("sparePlantChartBox").setVisible(true)
			// this.getView().byId("allChartBox").setVisible(false)
			this.getView().byId("dashboard").to(this.createId("sparePlantChartBox"));
			this.getView().byId("vizSparePlantQty").setBusy(true)
			var yearFilter = new sap.ui.model.Filter("Zyear", sap.ui.model.FilterOperator.EQ, this.spareYear);
			this.getOwnerComponent().getModel().read("/Spares_Adhe_DetailsSet", {
				filters: [yearFilter],
				success: function (odata, response) {
					this.getView().byId("vizSparePlantQty").setBusy(false)
					this.PAVPAQ = odata.results
					this.PAVPAQ = this.PAVPAQ.map(d => {
						return {
							...d,
							MonthText: this.MonthText[d.Zmonth]
						}
					})
					this.getView().getModel("dashboardModel").setProperty("/pavpaq", this.PAVPAQ);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("vizSparePlantQty").setBusy(false)
				}.bind(this)
			})
			this.getView().byId("vizSparePlantValue").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae']
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					text: `Plan vs Actual Value, ${title}`,
					visible: true
				}
			});
			this.getView().byId("vizSparePlantQty").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae']
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					text: `Plan vs Actual Quantity, ${title}`,
					visible: true
				}
			});

		},
		onSparePlantSelect: function (oEvent) {
			this.sparePlantMonth = oEvent.getParameter("data")[0].data.Month
			this._sparePlantPopover.close();
			this.getView().byId("sparePlantChartBox").setVisible(true)
			this.getView().byId("allChartBox").setVisible(false)
			this.getView().byId("vizSparePlant").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy'
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					visible: false
				}
			});
			var planvsactualvalueData = this.PlanvsactualValueDetail.filter(d => d.month == this.sparePlantMonth)
			this.getView().getModel("dashboardModel").setProperty("/planvsactualvalueData", planvsactualvalueData);

		},
		onSpareYearOk: function (oEvent) {
			this.spareYear = sap.ui.getCore().byId("spareDate").getDateValue().getFullYear();
			this._spareYear.close();
			this.spareBuild()
		},
		onSpareYearCancel: function (oEvent) {
			this._spareYear.close();
		},
		onSparePlantChartback: function (oEvent) {

			// this.getView().byId("sparePlantChartBox").setVisible(false)
			// this.getView().byId("allChartBox").setVisible(true)
			this.getView().byId("dashboard").back();

		},
		onSelectSparePlantBar: function (oEvent) {
			this.getView().byId("sparePlantChart").setFullScreen(false);
			this.getView().byId("dashboard").to(this.createId("sparePlantTableBox"));
			this.spareMonth = oEvent.getParameter("data")[0].data.Month
			var month = Object.keys(this.MonthText).find(key => this.MonthText[key] === this.spareMonth);
			// this.getView().byId("sparePlantChartBox").setVisible(false)
			// this.getView().byId("sparePlantTableBox").setVisible(true)

			var title = `${this.spareMonth}-${this.spareYear}`;
			this.getView().byId("sparePlantTableBox").setTitle(title);
			this.getView().byId("sparePlantVendorTable").setBusy(true)
			this.getView().getModel("dashboardModel").setProperty("/sparePlantVendorTableData", []);
			var yearFilter = new sap.ui.model.Filter("Zyear", sap.ui.model.FilterOperator.EQ, this.spareYear);
			var monthFilter = new sap.ui.model.Filter("Zmonth", sap.ui.model.FilterOperator.EQ, month);
			this.getOwnerComponent().getModel().read("/Spares_Adhe_DetailsSet", {
				filters: [yearFilter, monthFilter],
				success: function (odata, response) {
					this.getView().byId("sparePlantVendorTable").setBusy(false)
					var spareTableData = odata.results
					var count = odata.results.length > 20 ? 20 : odata.results.length;
					this.getView().byId("sparePlantVendorTable").setVisibleRowCount(count)
					this.getView().getModel("dashboardModel").setProperty("/sparePlantVendorTableData", spareTableData);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("sparePlantVendorTable").setBusy(false)
				}.bind(this)
			})

		},
		onSparePlantTableback: function (oEvent) {

			this.getView().byId("dashboard").back();
		},
		// PaymentDetailsBar
		onSelectPayment: function (oEvent) {
			this.getView().byId("paymentChart").setFullScreen(false);
			this.region = oEvent.getParameter("data")[0].data.Region;
			// this.getView().byId("allChartBox").setVisible(false);
			// this.getView().byId("paymentTableBox").setVisible(true);
			this.getView().byId("dashboard").to(this.createId("paymentTableBox"));

			var paymentVendorDetails = this.PaymentDetails.find(d => d.regionText == this.region).data.results.map((d, i) => {
				return {
					...d,
					Slno: i + 1
				}
			})
			var count = paymentVendorDetails.length > 20 ? 20 : paymentVendorDetails.length;
			this.getView().byId("paymentTable").setVisibleRowCount(count);
			this.getView().byId("paymentTableBox").setTitle(this.region)
			this.getView().getModel("dashboardModel").setProperty("/paymentTableData", paymentVendorDetails);
			// this.buildPaymentDetail()
		},
		onVendorSearch: function (oEvent) {
			debugger
			var sQuery = oEvent.getParameter("query");
			var oBindings = this.getView().byId("paymentTable").getBinding("rows");
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter([
				new sap.ui.model.Filter("Vendor", "Contains", sQuery),
				new sap.ui.model.Filter("Name1", "Contains", sQuery),
				new sap.ui.model.Filter("Ekgrp", "Contains", sQuery)
			], false));

			oBindings.filter(oFilters);

		},
		onVendorDeatilSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oBindings = this.getView().byId("vendorTable").getBinding("rows");
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter([
				new sap.ui.model.Filter("Docid", "Contains", sQuery),
				new sap.ui.model.Filter("Lifnr", "Contains", sQuery),
				new sap.ui.model.Filter("VendName", "Contains", sQuery),
				new sap.ui.model.Filter("BelnrFi", "Contains", sQuery)
			], false));

			oBindings.filter(oFilters);
		},
		onVendorSelect: function (oEvent) {
			// this.getView().byId("paymentTableBox").setVisible(false);
			this.getView().byId("dashboard").to(this.createId("paymentChartBox"));
			this.VendorCode = oEvent.getParameter("rowContext").getObject().Vendor;
			this.buildPaymentDetail();
		},
		buildPaymentDetail: function () {
			//Table Detail
			var title = `${this.region} - ${this.VendorCode} - FY(${this.paymentYear-1}-${this.paymentYear.toString().substr(-2)})`;
			this.getView().byId("vendorTableTitle").setText(title);
			this.getView().byId("vendorTable").setBusy(true);
			var yearFilter = new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, this.paymentYear);
			var vendorFilter = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, this.VendorCode);
			this.getOwnerComponent().getModel().read("/Supp_Payment_DetailsSet", {
				filters: [vendorFilter, yearFilter],
				success: function (odata, response) {

					var vendorData = odata.results.map((d, i) => {
						return {
							...d,
							Slno: i + 1
						}
					});
					var count = vendorData.length > 15 ? 15 : vendorData.length;
					this.getView().byId("vendorTable").setVisibleRowCount(count);
					this.getView().getModel("dashboardModel").setProperty("/vendorTableData", vendorData);
					this.getView().byId("vendorTable").setBusy(false);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("vendorTable").setBusy(false);
				}.bind(this)
			})

			//Graph Detail
			this.getView().byId("vizPaymentDetail").setBusy(true);
			var yearGraphFilter = new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, this.paymentYear);
			var vendorGraphFilter = new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, this.VendorCode);
			this.getOwnerComponent().getModel().read("/Supp_Pay_AnalyticsSet", {
				filters: [vendorGraphFilter, yearGraphFilter],
				success: function (odata, response) {
					var vendorGraphData = odata.results;
					vendorGraphData = vendorGraphData.map(d => {
						var MonthText = this.MonthText[d.Month];
						return {
							...d,
							MonthText
						}
					})
					this.getView().getModel("dashboardModel").setProperty("/paymentRegionDetail", vendorGraphData);
					this.getView().byId("vizPaymentDetail").setBusy(false);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("vizPaymentDetail").setBusy(false);
				}.bind(this)
			})

			// this.getView().byId("paymentChartBox").setVisible(true)
			// this.getView().byId("allChartBox").setVisible(false)

			this.getView().byId("vizPaymentDetail").setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'value'
					},
					drawingEffect: 'glossy',
					// colorPalette: ['#ff9999', '#fcf092', '#b2f78f', '#8da8f7', '#f187f5', '#fc79ae']
				},
				interaction: {
					selectability: {
						mode: 'single'
					}
				},
				title: {
					text: title,
					visible: true
				}
			});

		},
		onVendorback: function (oEvent) {
			// this.getView().byId("allChartBox").setVisible(true)
			// this.getView().byId("paymentTableBox").setVisible(false)
			this.getView().byId("dashboard").back();
		},
		onPaymentChartback: function (oEvent) {
			// this.getView().byId("paymentChartBox").setVisible(false)
			// this.getView().byId("paymentTableBox").setVisible(true)
			this.getView().byId("dashboard").back();
		},
		onPayemntYearSelect: function (oEvent) {
			if (!this._paymentYear) {
				this._paymentYear = sap.ui.xmlfragment(
					"com.airdit.app.re_PurchasingGroupDashboard.fragment.PaymentYear",
					this);
				this.getView().addDependent(this._paymentYear)
			}
			this._paymentYear.open();
		},
		onPaymentYearOk: function (oEvent) {
			this.paymentYear = sap.ui.getCore().byId("payDate").getDateValue().getFullYear();
			this._paymentYear.close();
			this.buildPaymentDetail()

		},
		onPaymentYearCancel: function (oEvent) {
			this._paymentYear.close();
		},
		onsparePlantYearSelect: function (oEvent) {

			if (!this._spareYear) {
				this._spareYear = sap.ui.xmlfragment(
					"com.airdit.app.re_PurchasingGroupDashboard.fragment.SpareYear",
					this);
				this.getView().addDependent(this._spareYear)
			}
			this._spareYear.open();
		},

		onSelectRGP: function (oEvent) {
			this.getView().byId("rgpChart").setFullScreen(false)
			var title = `RGP Process Through the Gate Entry - ${oEvent.getParameter("data")[0].data.Plant}`;
			var plant = oEvent.getParameter("data")[0].data.Plant.split("-").pop()
			this.getView().getModel("dashboardModel").setProperty("/rgpnrgpTableData", []);
			this.getView().byId("rgpnrgpTable").setBusy(true)
			var plantFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, plant);
			this.getOwnerComponent().getModel().read("/RGPNRGP_DetailsSet", {
				filters: [plantFilter],
				success: function (odata, response) {
					this.getView().byId("rgpnrgpTable").setBusy(false)
					this.RGPNRGPPlantDetails = odata.results
					var count = odata.results.length > 20 ? 20 : odata.results.length
					this.getView().byId("rgpnrgpTable").setVisibleRowCount(count)
					this.getView().getModel("dashboardModel").setProperty("/rgpnrgpTableData", this.RGPNRGPPlantDetails);
				}.bind(this),
				error: function (oerror) {
					this.getView().byId("rgpnrgpTable").setBusy(false)
				}.bind(this)
			})

			// this.getView().byId("allChartBox").setVisible(false)
			// this.getView().byId("rgpnrgpTableBox").setVisible(true)
			this.getView().byId("dashboard").to(this.createId("rgpnrgpTableBox"));
			this.getView().byId("rgpnrgpTableBox").setTitle(title);

		},
		onRGPNRGPSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oBindings = this.getView().byId("rgpnrgpTable").getBinding("rows");
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter([
				new sap.ui.model.Filter("Ebeln", "Contains", sQuery),
				new sap.ui.model.Filter("Matnr", "Contains", sQuery),
				new sap.ui.model.Filter("Matnr", "Contains", sQuery)
			], false));

			oBindings.filter(oFilters);
		},
		onRgpNrgpTableback: function (oEvent) {
			this.getView().byId("dashboard").back();
		},
		onSelectPosa: function (oEvent) {
			this.getView().byId("posaChart").setFullScreen(false);
			this.getView().byId("dashboard").to(this.createId("posaTableBox"));
			this.getView().getModel("dashboardModel").setProperty("/posaTableData", [])
			var level = oEvent.getParameter("data")[0].data.Type
			var type = this.getView().getModel("dashboardModel").getProperty("/posaData").find(d => d.level == level).type
			var levelFilter = new sap.ui.model.Filter("Level", sap.ui.model.FilterOperator.EQ, type);
			this.getView().byId("posaTable").setBusy(true)
			this.getOwnerComponent().getModel().read("/PO_SO_DetailsSet", {
					filters: [levelFilter],
					success: function (odata, oresponse) {
						this.getView().byId("posaTable").setBusy(false)
						this.PosaReleaseDetails = odata.results.map((d, i) => {
							return {
								...d,
								Slno: i + 1
							}
						})
						var count = odata.results.length > 20 ? 20 : odata.results.length
						this.getView().byId("posaTable").setVisibleRowCount(count)
						this.getView().getModel("dashboardModel").setProperty("/posaTableData", this.PosaReleaseDetails);
					}.bind(this),
					error: function (err) {
						this.getView().byId("posaTable").setBusy(false)

					}.bind(this)
				})
				// this.getView().getModel("dashboardModel").setProperty("/posaTableData", this.PosaReleaseDetails);
				// this.getView().byId("allChartBox").setVisible(false)
				// this.getView().byId("posaTableBox").setVisible(true)
				// this.getView().byId("posaTableTitle").setText(level)
			var title = `PO/SA ${level} Release Details`;
			this.getView().byId("posaTableBox").setTitle(title);
		},
		onPosaSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oBindings = this.getView().byId("posaTable").getBinding("rows");
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter([
				new sap.ui.model.Filter("Ebeln", "Contains", sQuery),
				new sap.ui.model.Filter("Bstyp", "Contains", sQuery),
				new sap.ui.model.Filter("Lifnr", "Contains", sQuery),
				new sap.ui.model.Filter("Bukrs", "Contains", sQuery),
				new sap.ui.model.Filter("Ekgrp", "Contains", sQuery),
				new sap.ui.model.Filter("Ekorg", "Contains", sQuery),
			], false));

			oBindings.filter(oFilters);
		},
		onPosaTableback: function (oEvent) {
			// this.getView().byId("allChartBox").setVisible(true)
			// this.getView().byId("posaTableBox").setVisible(false)
			this.getView().byId("dashboard").back();
		},

		// Download
		spareDownload: function (oEvent) {
			var aCols, oSettings, oSheet;
			// aCols = this.createColumnConfig();
			var aCols = [];

			aCols.push({
				label: 'Part No',
				property: 'Partno',
				type: 'string'
			});

			aCols.push({
				label: 'Plan Qty',
				property: 'Indntqty',
				type: 'string'
			});

			aCols.push({
				label: 'Received Qty',
				property: 'Menge',
				type: 'string'
			});
			aCols.push({
				label: 'Plan Value',
				property: 'Planvalue',
				type: 'string'
			});
			aCols.push({
				label: 'Received Value',
				property: 'Receivedvalue',
				type: 'string'
			});
			aCols.push({
				label: 'Percentage Adherance(%)',
				property: 'Adherence',
				type: 'string'
			});
			var oData = this.getView().getModel("dashboardModel").getProperty("/sparePlantVendorTableData");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oData,
				fileName: 'Spare Details.xlsx',
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					sap.m.MessageToast.show('Downloaded');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		rgpnrgpDownload: function (oEvent) {
			var aCols, oSettings, oSheet;
			// aCols = this.createColumnConfig();
			var aCols = [];

			aCols.push({
				label: 'Sl.No.',
				property: 'SlNo',
				type: 'string'
			});

			aCols.push({
				label: 'PO Date',
				property: 'Aedat',
				type: 'date'
			});

			aCols.push({
				label: 'PO Number',
				property: 'Ebeln',
				type: 'string'
			});

			aCols.push({
				label: 'Material No.',
				property: 'Matnr',
				type: 'string'
			});
			aCols.push({
				label: 'Material Description',
				property: 'Maktx',
				type: 'string'
			});
			var oData = this.getView().getModel("dashboardModel").getProperty("/rgpnrgpTableData");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oData,
				fileName: 'RGP/NRGP Details.xlsx',
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					sap.m.MessageToast.show('Downloaded');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		regionVendorDownload: function (oEvent) {
			var aCols, oSettings, oSheet;
			// aCols = this.createColumnConfig();
			var aCols = [];

			aCols.push({
				label: 'Sl.No.',
				property: 'Slno',
				type: 'string'
			});

			aCols.push({
				label: 'Vendor Code',
				property: 'Vendor',
				type: 'string'
			});

			aCols.push({
				label: 'Vendor name',
				property: 'Name1',
				type: 'string'
			});

			aCols.push({
				label: 'Purchase Group',
				property: 'Ekgrp',
				type: 'string'
			});
			var oData = this.getView().getModel("dashboardModel").getProperty("/paymentTableData");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oData,
				fileName: 'Vendor.xlsx',
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					sap.m.MessageToast.show('Template downloaded. Please fill the sheet and upload');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		vendorMaterialDownload: function (oEvent) {
			var aCols, oSettings, oSheet;
			// aCols = this.createColumnConfig();
			var aCols = [];

			aCols.push({
				label: 'Doc Id',
				property: 'Docid',
				type: 'string'
			});

			aCols.push({
				label: 'Vendor Code',
				property: 'Lifnr',
				type: 'string'
			});

			aCols.push({
				label: 'Vendor name',
				property: 'VendName',
				type: 'string'
			});

			aCols.push({
				label: 'Excption Reason',
				property: 'Objtxt',
				type: 'string'
			});
			aCols.push({
				label: 'Status',
				property: 'Status',
				type: 'string'
			});
			aCols.push({
				label: 'Reference',
				property: 'Xblnr',
				type: 'string'
			});
			aCols.push({
				label: 'Net Amount',
				property: 'NetAmount',
				type: 'string'
			});
			aCols.push({
				label: 'Gross Amount',
				property: 'GrossAmount',
				type: 'string'
			});
			aCols.push({
				label: 'Accounting Doc No.',
				property: 'BelnrFi',
				type: 'string'
			});
			aCols.push({
				label: 'Fiscal Year',
				property: 'Gjahr',
				type: 'string'
			});
			aCols.push({
				label: 'Document Currency',
				property: 'Waers',
				type: 'string'
			});
			aCols.push({
				label: 'Due Date',
				property: 'DueDate',
				type: 'date'
			});
			aCols.push({
				label: 'Description',
				property: 'Eknam',
				type: 'string'
			});
			var oData = this.getView().getModel("dashboardModel").getProperty("/vendorTableData");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oData,
				fileName: 'Vendor_Material.xlsx',
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					sap.m.MessageToast.show('Downloaded');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		posaDownload: function (oEvent) {
			var aCols, oSettings, oSheet;
			// aCols = this.createColumnConfig();
			var aCols = [];

			aCols.push({
				label: 'PO Number',
				property: 'Ebeln',
				type: 'string'
			});

			aCols.push({
				label: 'Created Date',
				property: 'Bedat',
				type: 'date'
			});

			aCols.push({
				label: 'Category',
				property: 'Bstyp',
				type: 'string'
			});

			aCols.push({
				label: 'Company Code',
				property: 'Bukrs',
				type: 'string'
			});

			aCols.push({
				label: 'Purchase Group',
				property: 'Ekgrp',
				type: 'string'
			});

			aCols.push({
				label: 'Organization',
				property: 'Ekorg',
				type: 'string'
			});

			aCols.push({
				label: 'Release Group',
				property: 'Frggr',
				type: 'string'
			});

			aCols.push({
				label: 'Release Statergy',
				property: 'Frgsx',
				type: 'string'
			});

			aCols.push({
				label: 'Status',
				property: 'Frgzu',
				type: 'string'
			});

			aCols.push({
				label: 'Validity Start',
				property: 'Kdatb',
				type: 'date'
			});

			aCols.push({
				label: 'Validity End',
				property: 'Kdate',
				type: 'date'
			});

			aCols.push({
				label: 'Vendor',
				property: 'Lifnr',
				type: 'string'
			});

			var oData = this.getView().getModel("dashboardModel").getProperty("/posaTableData");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oData,
				fileName: 'PO_SA_Details.xlsx',
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					sap.m.MessageToast.show('Downloaded');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		// Download
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.airdit.app.re_PurchasingGroupDashboard.view.Dashboard
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.airdit.app.re_PurchasingGroupDashboard.view.Dashboard
		 */
		onAfterRendering: function () {
			var shellBarHeight = $(".sapUshellShellCntnt").height(); //46 is header's height
			var splitterheight = ((window.screen.height - 46) / 2) - (100); //170 is a random value on test basis
			// this.getView().byId("dashboard").setHeight(`${window.screen.height - 100}px`);
			// var graphHeight = (window.screen.height - 100)/2;
			// this.getView().byId("vizPayment").setHeight(`${graphHeight}px`);
			// this.getView().byId("vizRGP").setHeight(`${graphHeight}px`);
			// this.getView().byId("vizSpare").setHeight(`${graphHeight}px`);
			// this.getView().byId("vizPosa").setHeight(`${graphHeight}px`);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.airdit.app.re_PurchasingGroupDashboard.view.Dashboard
		 */
		//	onExit: function() {
		//
		//	}

	});

});