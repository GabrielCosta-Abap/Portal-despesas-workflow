sap.ui.define(["sap/ui/core/mvc/Controller", 
"sap/ui/model/json/JSONModel",
 "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
   "sap/m/ColumnListItem", 
   "sap/m/MessageBox"],
 function (o, e, t, i, h, MessageBox) {
	"use strict";
	var oServiceModel;
	return o.extend("queroquerons.workflow.controller.Workflow", {

		matricula: "",
		solicitacaoSelecionada: "",
		usuario: "",

		onInit: function () {

			// var vRoute = this.getRouter().getRoute("RouteWorkflow");
			// vRoute.attachPatternMatched(this.onPatternMatched, this);

			this.getDespesas();			
			this.onPatternMatched()

		},

		onPatternMatched: function(){
			var oView = this.getView()

			var oFilter = new sap.ui.model.Filter("Pernr",
			sap.ui.model.FilterOperator.EQ,
			this.usuario);

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
				useBatch: false
			});

		var url = "/sh_pernrSet"
		
		oModel.read(url, {
			filters: [oFilter],
			success: function (odata, response) {

				this.dadosMatricula = odata
				this.unidade = odata.results[0].CD || odata.results[0].MATRIZ || odata.results[0].FILIAL
				this.tipoUnidade = odata.results[0].CD || odata.results[0].MATRIZ ? "M" : "F"

				// if(this.unidade >= '0003'){
				// 	oView.byId("aprovarEmMassa").setVisible(false)
				// }else{
				// 	oView.byId("aprovarEmMassa").setVisible(true)
				// }


			}.bind(this),
			error: function (error) {
				debugger
				oView.byId("codAprov").setBusy(false)
			}.bind(this)
		})
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		oRoute: function () {
			this.getDespesas();
		},

		formatCurrency: function (e) {
			return Intl.NumberFormat("pt-br", {
				style: "currency",
				currency: "BRL"
			}).format(e).replace("R$", "").replace(" ", "")
		},

		getDespesas: function () {
			var url_string = window.location.href.replace("user=#", "user=");
			var url = new URL(url_string);
			var userCur = url.searchParams.get("user");

			var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
				useBatch: false
			});

			var oFilter = new sap.ui.model.Filter("User",
				sap.ui.model.FilterOperator.EQ,
				userCur);
			var aFilters = [];
			aFilters.push(oFilter);

			this.usuario = userCur

			oServiceModel.read("/AprovacaoSet", {
				async: true,
				filters: aFilters,
				success: function (oData) {

					this.WorkflowModel = new sap.ui.model.json.JSONModel({
						WorkflowSet: oData.results
					});
					this.WorkflowModel.setDefaultBindingMode("TwoWay");
					this.WorkflowModel.updateBindings();
					this.getView().setModel(this.WorkflowModel, "WorkflowModel");
					sap.ui.getCore().setModel(this.WorkflowModel, "WorkflowModel");

				}.bind(this),
				error: function (evt) {
				}
			});
		},

		formatDate: function (e) {
			if (e != null) {
				var t = e.substring(6, 8);
				var a = e.substring(4, 6);
				var r = e.substring(0, 4);
				var s = t + "/" + a + "/" + r;
				return s
			}
		},

		resetScreenDetail: function () {
			this.oDetailModel = new sap.ui.model.json.JSONModel({});
			this.oDetailModel.setDefaultBindingMode("TwoWay");
			this.oDetailModel.updateBindings();
			this.getView().setModel(this.oDetailModel, "oDetailModel");
			sap.ui.getCore().setModel(this.oDetailModel, "oDetailModel");
			var i = this.getView().byId("NFTable");
			i.removeAllItems();
			this.getView().byId("txtFPgto").setProperty("text", "");
			this.getView().byId("txtZterm").setProperty("text", "");
			this.getView().byId("txtBukrs").setProperty("text", "");
			this.getView().byId("txtCodAprov").setProperty("text", "");
		},

		onItemClick: function (o) {
			var e = o.getSource();
			var t = this;
			var that = this;
			var a = {};
			a.Zpdsol = e.mProperties.title.replace("/", "%2F");
			// that.matricula = o.getParameters().arguments.Usnam
			// that.matricula = window.location.hash.replace('#','')

			var r = e.mProperties.title
			this.getView().bindElement({
				path: "/DespesaFornecedorHeaderSet(Zpdsol='" + a.Zpdsol + "')/?$expand=DespesaFornecedorItens"
			});
			var s = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
				useBatch: false
			});
			var i = this.getView().byId("NFTable");

			var oDetalhesReembolso = this.getView().byId('detDespesasTable')
			var oItinerarioTab = this.getView().byId('itinerarioTab')
			var reqTab = this.getView().byId('reqTable')

			this.getView().byId('NFTable').destroyItems()
			this.getView().byId('dadosViagem').destroyItems()
			this.getView().byId('itinerarioTab').destroyItems()
			this.getView().byId('detDespesasTable').destroyItems()

			// reqTab.destroyItems()

			// if (oTable.getItems().length > 0
			// 	|| anexoTab.getItems().length > 0
			// 	|| reqTab.getItems().length > 0
			// 	|| aprovTab.getItems().length > 0) {
			// 	window.location.reload()
			// }

			s.read("/DespesaFornecedorHeaderSet(Zpdsol='" + a.Zpdsol + "')", {
				urlParameters: {
					$expand: "DespesaFornecedorItens"
				},
				success: function (e, a) {
					let r = new sap.m.Table;
					i.removeAllItems();
					e.DespesaFornecedorItens.results.forEach(function (e) {
						var t = new h({
							type: sap.m.ListType.Inactive,
							unread: false,
							vAlign: "Middle",
							cells: [new sap.m.Input({
								type: "Text",
								value: e.Buzei,
								width: "70%",
								editable: false
							}), new sap.m.Input({
								type: "Text",
								value: e.Hkont,
								editable: false
							}), new sap.m.Input({
								type: "Text",
								value: e.Sgtext,
								width: "112%",
								editable: false
							}), new sap.m.Input({
								type: "Text",
								value: e.Aufnr,
								width: "112%",
								editable: false
							}), new sap.m.Input({
								type: "Text",
								value: e.Kostl,
								editable: false
							}), new sap.m.Input({
								type: "Number",
								value: e.Dmbtr,
								width: "70%",
								editable: false
							}), new sap.m.Input({
								type: "Number",
								value: e.Zportorc,
								editable: false
							}), new sap.m.Input({
								type: "Number",
								value: e.Zportdisp,
								editable: false
							})/*, new sap.ui.core.Icon({
                                src: "sap-icon://add"
                            })*/]
						});
						i.addItem(t)

						var dataDet = e.Bldat.substring(0, 2) + '/' + e.Bldat.substring(2, 4) + '/' + e.Bldat.substring(4, 8)
						var zdescFilter = new sap.ui.model.Filter("ZdescDesp",
							sap.ui.model.FilterOperator.EQ,
							e.Zcdesp);

						var titleSolic = 'Documento SAP: ' + e.Belnr || e.Banfn
						that.getView().byId('solic').setTitle(titleSolic)

						that.solicitacaoSelecionada = e.Zpdsol

						s.read('/DespesaViagemSet', {
							filters: [zdescFilter],
							success: function (data, response) {
								e.Zcdesp = e.Zcdesp + ' - ' + data.results[0].ZdescDesp

								var detDespItem = new h({
									type: sap.m.ListType.Inactive,
									unread: false,
									vAlign: "Middle",
									cells:
										[
											new sap.m.Input({ type: "Text", value: dataDet, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Zcdesp, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Hkont, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Zpanexo, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Sgtext, editable: false }),
											new sap.m.Input({
												type: "Text", value: Intl.NumberFormat("pt-br", {
													style: "currency",
													currency: "BRL"
												}).format(e.Zpvlrpg).replace("R$", "").replace(" ", ""), editable: false
											}),
											new sap.m.Input({
												type: "Text", value: Intl.NumberFormat("pt-br", {
													style: "currency",
													currency: "BRL"
												}).format(e.Zpvlrrem).replace("R$", "").replace(" ", ""), editable: false
											}),
											new sap.m.Input({ type: "Text", value: e.Docref, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Kostl, editable: false }),
											new sap.m.Input({ type: "Text", value: e.Aufnr, editable: false }),
											new sap.m.Input({
												type: "Text", value: Intl.NumberFormat("pt-br", {
													style: "currency",
													currency: "BRL"
												}).format(e.Zportorc).replace("R$", "").replace(" ", ""), editable: false, visible: false
											}),
											new sap.m.Input({
												type: "Text", value: Intl.NumberFormat("pt-br", {
													style: "currency",
													currency: "BRL"
												}).format(e.Zportdisp).replace("R$", "").replace(" ", ""), editable: false, visible: false
											}),
										]
								});
								oDetalhesReembolso.addItem(detDespItem)

							},
							error: function (error) {
							}
						})

					});

					t.headerSolic = e;
					that.headerSolic = e;


					var dadosViagem = new h({
						cells:
							[
								new sap.m.Text({ text: e.Datv1.replaceAll('.', '/'), }),
								new sap.m.Text({ text: e.Uhrv1, }),
								new sap.m.Text({ text: e.Datb1.replaceAll('.', '/'), }),
								new sap.m.Text({ text: e.Uhrb1, }),
								new sap.m.Text({ text: e.Kmges, }),
							]
					});

					that.getView().byId('dadosViagem').addItem(dadosViagem)

					// that.headerSolic.Zldesp = '3'

					if (that.headerSolic.Zldesp.includes('1')) {
						that.setVisibleContent(1)
					} else if (that.headerSolic.Zldesp.includes('2')) {
						that.setVisibleContent(2)
					} else {
						that.setVisibleContent(3)

						var zpdsol = e.Zpdsol.replace('/', '%2F')

						var docsap = e.Belnr || e.Banfn

						var titleSolic = 'Documento SAP: ' + docsap
						that.getView().byId('solic').setTitle(titleSolic)

						that.solicitacaoSelecionada = e.Zpdsol


						var ReqUrl = "/RequisicaoCompraSet(Zpdsol='" + zpdsol + "')"

						reqTab.destroyItems()

						s.read(ReqUrl, {
							urlParameters: {
								"$expand": "RequisicaoCompraItens"
							},
							success: function (data, response) {

								data.RequisicaoCompraItens.results.forEach(function (item) {

									var dataRemessa = item.Eeind.substring(6, 8) + '/' + item.Eeind.substring(4, 6) + '/' + item.Eeind.substring(0, 4)

									var itemReq = new h({
										type: sap.m.ListType.Inactive,
										unread: false,
										vAlign: "Middle",
										cells:
											[
												new sap.m.Input({ type: "Text", value: item.Zitem, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Matnr, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Maktx, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Menge, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Meins, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Werks, editable: false }),

												new sap.m.Input({
													type: "Text",
													value: Intl.NumberFormat("pt-br", {
														style: "currency",
														currency: "BRL"
													}).format(item.Wrbtr).replace("R$", "").replace(" ", ""),

													editable: false
												}),
												new sap.m.Input({ type: "Text", value: item.Matkl, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Lgort, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Aufnr, editable: false }),
												new sap.m.Input({ type: "Text", value: dataRemessa, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Knttp, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Saknr, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Kostl, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Anln1, editable: false }),
												new sap.m.Input({ type: "Text", value: item.Anln2, editable: false }),

												new sap.m.Input({
													type: "Text",
													value: Intl.NumberFormat("pt-br", {
														style: "currency",
														currency: "BRL"
													}).format(item.Preco).replace("R$", "").replace(" ", ""),
													editable: false
												}),

												new sap.m.Input({ type: "Text", value: item.Ekgrp, editable: false }),
												// new sap.ui.core.Icon({
												// 	src: "sap-icon://add",
												// }),
												// new sap.ui.core.Icon({
												// 	src: "sap-icon://delete",
												// })
											]
									});
									reqTab.addItem(itemReq)
								})

								this.oDetailModel = new sap.ui.model.json.JSONModel(t.headerSolic);
								this.oDetailModel.setDefaultBindingMode("TwoWay");
								this.oDetailModel.updateBindings();
								t.getView().setModel(this.oDetailModel, "oDetailModel");
								sap.ui.getCore().setModel(this.oDetailModel, "oDetailModel");

							},
							error: function (error) {
							}
						})
					}

					this.oDetailModel = new sap.ui.model.json.JSONModel(t.headerSolic);
					this.oDetailModel.setDefaultBindingMode("TwoWay");
					this.oDetailModel.updateBindings();
					t.getView().setModel(this.oDetailModel, "oDetailModel");
					sap.ui.getCore().setModel(this.oDetailModel, "oDetailModel");

					var oFilterItinerario = new sap.ui.model.Filter("Zpdsol",
						sap.ui.model.FilterOperator.EQ,
						that.headerSolic.Zpdsol);

					oItinerarioTab.setBusy(true)
					s.read('/ItinerarioSet', {
						filters: [oFilterItinerario],
						success: function (data, response) {

							oItinerarioTab.setBusy(false)
							data.results.forEach(function (item) {

								item.DepDate = item.DepDate.replaceAll('.', '/')

								var itinerarioItem = new h({
									cells:
										[
											new sap.m.Text({ text: item.Zitem, }),
											new sap.m.Text({ text: item.LocFrom, }),
											new sap.m.Text({ text: item.LocTo, }),
											new sap.m.Text({ text: item.DepDate, }),
											new sap.m.Text({ text: item.Kmges, }),
										]
								});

								oItinerarioTab.addItem(itinerarioItem)

							})

						}.bind(that),
						error: function (oError) {
							debugger
						}.bind(that)
					})

					t.matricula = t.headerSolic.Usnam;
					var o = new sap.ui.model.Filter("Zlsch", sap.ui.model.FilterOperator.EQ, t.headerSolic.Zlsch);
					s.read("/sh_zlschSet", {
						filters: [o],
						success: function (e, t) {
							this.getView().byId("txtFPgto").setProperty("text", e.results[0].Text1)
						}.bind(t),
						error: function (e) {
							debugger
						}.bind(t)
					});
					var o = new sap.ui.model.Filter("Zterm", sap.ui.model.FilterOperator.EQ, t.headerSolic.Zterm);
					s.read("/SH_ZTERMSet", {
						filters: [o],
						success: function (e, t) {
							this.getView().byId("txtZterm").setProperty("text", e.results[0].Text1)
						}.bind(t),
						error: function (e) {
							debugger
						}.bind(t)
					});
					var o = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, t.headerSolic.Bukrs);
					s.read("/sh_bukrsSet", {
						filters: [o],
						success: function (e, t) {
							this.getView().byId("txtBukrs").setProperty("text", e.results[0].Butxt)
						}.bind(t),
						error: function (e) {
							debugger
						}.bind(t)
					});
					var l = new sap.ui.model.Filter("Gsber", sap.ui.model.FilterOperator.EQ, t.headerSolic.Pargb);
					s.read("/sh_pargbSet", {
						filters: [l],
						success: function (e, t) {
							this.getView().byId("txtCodAprov").setProperty("text", e.results[0].Gtext)
							this.getView().byId("codAprovTipo2").setValue(e.results[0].Gsber)
						}.bind(t),
						error: function (e) {
							debugger
						}.bind(t)
					});

					var filterPernr = new sap.ui.model.Filter("Pernr",
						sap.ui.model.FilterOperator.EQ,
						that.headerSolic.Lifnr.substring(2, 10));

					var area = that.getView().byId("area")
					var cpf = that.getView().byId("cpf")
					var banco = that.getView().byId("banco")
					var agencia = that.getView().byId("agencia")
					var bkont = that.getView().byId("bkont")
					var alelo = that.getView().byId("alelo")
					var celula = that.getView().byId("celula")

					area.setBusy(true)
					cpf.setBusy(true)
					banco.setBusy(true)
					agencia.setBusy(true)
					bkont.setBusy(true)
					alelo.setBusy(true)

					s.read("/sh_pernrSet", {
						filters: [filterPernr],
						success: function (odata, response) {

							area.setBusy(false)
							cpf.setBusy(false)
							banco.setBusy(false)
							agencia.setBusy(false)
							bkont.setBusy(false)
							alelo.setBusy(false)

							area.setValue(odata.results[0].ZPAREA)
							cpf.setValue(odata.results[0].CPF)
							banco.setValue(odata.results[0].BANCO)
							agencia.setValue(odata.results[0].AGENCIA)
							bkont.setValue(odata.results[0].CONTA)
							alelo.setValue(odata.results[0].ZCHECKB)
							celula.setValue(odata.results[0].ZPCELULA)
						}.bind(that),
						error: function (oError) {
							debugger
						}.bind(that)
					})

					var u = [];
					var o = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, t.headerSolic.Bukrs);
					u.push(o);
					var o = new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, t.headerSolic.Gjahr);
					u.push(o);
					let d = t.headerSolic.Budat.substring(6, 8) + t.headerSolic.Budat.substring(4, 6) + t.headerSolic.Budat.substring(0, 4);
					var o = new sap.ui.model.Filter("BudatIni", sap.ui.model.FilterOperator.EQ, d);
					u.push(o);
					var o = new sap.ui.model.Filter("BudatFim", sap.ui.model.FilterOperator.EQ, d);
					u.push(o);
					var o = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.EQ, t.headerSolic.Belnr);
					u.push(o);



				},
				error: function (e) {
					debugger
				}
			});
		},

		processarLiberacao(oEvent, oText, dialog) {

			if (oText == undefined) {
				oText = "";
			}
			var url_string = window.location.href.replace("user=#", "user=");
			var url = new URL(url_string);
			var userCur = url.searchParams.get("user");

			var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
				useBatch: false
			});

			if (this.getView().getModel("oDetailModel") != undefined && this.getView().getModel("oDetailModel").getData().Zpdsol != undefined) {

				var LiberacoesSet = {
					"Acao": oEvent,
					"Zpdsol": this.getView().getModel("oDetailModel").getData().Zpdsol,
					"User": userCur,
					"Justificativa": oText
				};
				oServiceModel.setHeaders({
					"X-Requested-With": "X"
				})

				oServiceModel.create("/LiberarDespesaSet", LiberacoesSet, {
					success: function (oData, oResponse) {
						if (oData.Message != undefined && oData.Message != '') {
							sap.m.MessageToast.show(oData.Message + '.Liberação não efetuada.')
						}
						else {
							sap.m.MessageToast.show(`Operação efetuada com sucesso`);
							this.getDespesas();
							this.resetScreenDetail();
							if (dialog != undefined) {
								dialog.close();

							}
						}
						this.getView().setBusy(false)
					}.bind(this),
				});
			}
			else {
				sap.m.MessageToast.show(`Nenhum registro selecionado`);
				this.getView().setBusy(false)
			}

		},
		onAprovar: function (o) {
			this.getView().setBusy(true)
			this.processarLiberacao("APROVAR");
		},
		onRejeitar: function (o) {

			var textLiberacao = "";
			var dialog = new sap.m.Dialog({
				title: "Rejeitar",
				type: 'Message',
				content: [
					new sap.m.Label({ text: 'Deseja rejeitar as despesas selecionadas?', labelFor: 'approveDialogTextarea' }),
					new sap.m.TextArea('approveDialogTextarea', {
						width: '100%',
						maxLength: 50,
						placeholder: "Justificativa (Até 50 caracteres)",
						value: textLiberacao
					})
				],

				beginButton: new sap.m.Button({
					text: "Rejeitar",
					press: function () {
						var sText = sap.ui.getCore().byId('approveDialogTextarea').getValue();
						if (sText.length < 10) {
							sap.m.MessageToast.show(`Obrigatório inserir justifica com mínimo de 10 caracteres`);
						}
						else {
							this.processarLiberacao("REJEITAR", sText, dialog);
						}
					}.bind(this)
				}),

				endButton: new sap.m.Button({
					text: 'Cancelar',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onVoltar: function (o) {
			window.history.go(-1)
		},
		onLiveChange: function (o) {
			var e = o.getSource();
			var r = o.getParameters();
			var n = r.newValue;
			var a = this.getView().byId("list");
			n = n.toString();
			var l = [];
			if (n) {
				var s = new t({
					path: "Zpdsol",
					operator: i.Contains,
					value1: n
				});
				l.push(s)
			}
			var c = a.getBinding("items");
			c.filter([l])
		},
		onIdPress: function (o) {
			var zpdsol = this.solicitacaoSelecionada.replace('/', '%252F')
			var e = window.location.protocol + "//" + window.location.host + "/sap/bc/bsp/sap/zportal_conlan/index.html#/RouteDetail" + '/' + zpdsol + '/' + this.usuario;
			window.location.assign(e)
		},
		formataTipoDespesa: function (e) {
			if (e != undefined) {
				if (e.includes("1")) {
					return "Despesa Fornecedor"
				} else if (e.includes("2")) {
					return "Reembolso de viagem"
				} else if (e.includes("3")) {
					return "Requisição de compra"
				}
			}
		},

		setVisibleContent: function (oTipo) {
			if (oTipo == '1') {
				this.getView().byId('NFTable').setVisible(true)
				this.getView().byId('tltleNFTab').setVisible(true)
				this.getView().byId('headerTipo1').setVisible(true)

				//tipo 2 = false
				this.getView().byId('headerTipo2').setVisible(false)
				this.getView().byId('dadosViagem').setVisible(false)
				this.getView().byId('ItinetarioTitle').setVisible(false)
				this.getView().byId('itinerarioTab').setVisible(false)
				this.getView().byId('detDespTitle').setVisible(false)
				this.getView().byId('detDespesasTable').setVisible(false)
				// tipo 3 = false
				this.getView().byId('reqTable').setVisible(false)
				this.getView().byId('reqTabTitle').setVisible(false)
				this.getView().byId('headerTipo3').setVisible(false)

			} else if (oTipo == '2') {
				this.getView().byId('headerTipo2').setVisible(true)
				this.getView().byId('dadosViagem').setVisible(true)
				this.getView().byId('ItinetarioTitle').setVisible(true)
				this.getView().byId('itinerarioTab').setVisible(true)
				this.getView().byId('detDespTitle').setVisible(true)
				this.getView().byId('detDespesasTable').setVisible(true)

				//tipo1 = false
				this.getView().byId('NFTable').setVisible(false)
				this.getView().byId('tltleNFTab').setVisible(false)
				this.getView().byId('headerTipo1').setVisible(false)

				//tipo 3 = false
				this.getView().byId('reqTable').setVisible(false)
				this.getView().byId('headerTipo3').setVisible(false)
				this.getView().byId('reqTabTitle').setVisible(false)

			} else if (oTipo == '3') {
				this.getView().byId('reqTable').setVisible(true)
				this.getView().byId('reqTabTitle').setVisible(true)
				this.getView().byId('headerTipo3').setVisible(true)

				//tipo 2 = false
				this.getView().byId('headerTipo2').setVisible(false)
				this.getView().byId('dadosViagem').setVisible(false)
				this.getView().byId('ItinetarioTitle').setVisible(false)
				this.getView().byId('itinerarioTab').setVisible(false)
				this.getView().byId('detDespTitle').setVisible(false)
				this.getView().byId('detDespesasTable').setVisible(false)

				//tipo 1 = false
				this.getView().byId('NFTable').setVisible(false)
				this.getView().byId('tltleNFTab').setVisible(false)
				this.getView().byId('headerTipo1').setVisible(false)
			}
		},

		onAprovarEmMassa: function (){

			var solicitacoes = this.getView().byId('list').getSelectedItems()

			if (solicitacoes.length < 2){
				sap.m.MessageToast.show('Selecionar pelo menos duas solicitações!')
				return
			}

			MessageBox.show(
				"Confirmar aprovação em masssa?", {
					icon: MessageBox.Icon.INFORMATION,
					title: "Aprovar em massa!",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction == 'NO'){
							return
						}

						sap.m.MessageToast.show('Liberação em massa executada em background.')

						var aSolicLiberacao = [];
			
						var url_string = window.location.href.replace("user=#", "user=");
						var url = new URL(url_string);
						var userCur = url.searchParams.get("user");
			
						solicitacoes.forEach(function(item){
			
							aSolicLiberacao.push({
								Acao: 	'APROVAR',
								Zpdsol: item.getProperty('title'), 
								User: 	userCur,
								Justificativa: ''
							});
						})
			
						var LiberacoesSet = {
							Acao: 'APROVAREMMASSA',
							Zpdsol: '000000', 
							User: userCur,
							Justificativa: '',
							LiberarEmMassaItemSet: aSolicLiberacao
						};		
					
						var oServiceModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", {
							useBatch: false
						});
			
							oServiceModel.setHeaders({
								"X-Requested-With": "X"
							})
			
							oServiceModel.create("/LiberarEmMassaSet", LiberacoesSet, {
								success: function (oData, oResponse) {
									if (oData.Message != undefined && oData.Message != '') {
										sap.m.MessageToast.show(oData.Message + '.Liberação não efetuada.')
									}
									else {
										MessageBox.show(
											"Aprovação finalizada!", {
												icon: MessageBox.Icon.INFORMATION,
												title: "Aprovação em massa!",
												actions: [MessageBox.Action.OK],
												emphasizedAction: MessageBox.Action.OK})

										this.getDespesas();
										this.resetScreenDetail();
										if (dialog != undefined) {
											dialog.close();
			
										}
									}
									this.getView().setBusy(false)
								}.bind(this),
							});						

					 }.bind(this)
				})
		},

		onSelectAll: function(){
			var oList = this.byId('list')

			oList.getItems().forEach(function(item){
				oList.setSelectedItem(item)
			})
		},

		onDeselectAll: function(){
			var oList = this.byId('list')

			oList.getItems().forEach(function(item){
				item.setSelected(false)
			})
		}

	})
});