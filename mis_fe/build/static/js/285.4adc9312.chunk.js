"use strict";
(self.webpackChunkmis = self.webpackChunkmis || []).push([
	[285],
	{
		8285: function (e, n, t) {
			(t.r(n),
				t.d(n, {
					default: function () {
						return N;
					},
				}));
			var a = t(3433),
				r = t(9439),
				i = t(2791),
				o = t(9585),
				l = (t(9064), t(1975), t(9122), t(8360), t(1980), t(8785), t(749)),
				s = t(1243),
				c = t(2426),
				d = t.n(c),
				p = t(919),
				u = t(4771),
				g = t(9622),
				m = t(5550),
				h = t(5533),
				x = t(3540),
				f = t(7387),
				b = t(3428),
				v = t(498),
				y = t(4045),
				j = t(4802),
				w = t(184),
				k =
					"\n@keyframes gen-fade-up {\n  from { opacity: 0; transform: translateY(18px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n@keyframes gen-pulse-ring {\n  0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); }\n  70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }\n  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }\n}\n@keyframes gen-shimmer {\n  0%   { background-position: -400px 0; }\n  100% { background-position: 400px 0; }\n}\n@keyframes gen-spin-slow {\n  to { transform: rotate(360deg); }\n}\n\n.gen-hero {\n  position: relative;\n  overflow: hidden;\n  border-radius: 12px;\n  padding: 16px 22px;\n  margin-bottom: 20px;\n  border: 1px solid var(--border-subtle);\n  background: linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #4f46e5 100%);\n  box-shadow: 0 12px 28px -8px rgba(37,99,235,0.4);\n  animation: gen-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;\n}\n.gen-hero::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background: url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");\n  opacity: 1;\n}\n.gen-hero::after {\n  content: '';\n  position: absolute;\n  top: -40px; right: -40px;\n  width: 180px; height: 180px;\n  border-radius: 50%;\n  background: rgba(255,255,255,0.05);\n  pointer-events: none;\n}\n.gen-hero-icon {\n  width: 38px; height: 38px;\n  border-radius: 10px;\n  background: rgba(255,255,255,0.18);\n  backdrop-filter: blur(8px);\n  display: flex; align-items: center; justify-content: center;\n  font-size: 18px;\n  animation: gen-pulse-ring 2.4s ease-in-out infinite;\n  flex-shrink: 0;\n}\n.gen-hero-badge {\n  display: inline-flex; align-items: center; gap: 5px;\n  padding: 2px 10px;\n  background: rgba(255,255,255,0.15);\n  border: 1px solid rgba(255,255,255,0.25);\n  border-radius: 100px;\n  font-size: 10px; font-weight: 600;\n  color: rgba(255,255,255,0.9);\n  letter-spacing: 0.5px;\n  text-transform: uppercase;\n  margin-bottom: 6px;\n}\n/* Input wrapper styling */\n.gen-input-wrapper {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n.gen-input-group {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border: 1.5px solid var(--border-bright);\n  border-radius: 10px;\n  background: var(--bg-main);\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n.gen-input-group:focus-within {\n  border-color: #3b82f6;\n  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);\n}\n.gen-input-group .p-inputnumber { flex: 1; }\n.gen-input-group .p-inputnumber input,\n.gen-interval-row .p-inputnumber input {\n  border: none !important;\n  background: transparent !important;\n  padding: 2px 4px !important;\n  font-size: 13px !important;\n  color: var(--text-primary) !important;\n  width: 52px;\n  text-align: center;\n}\n.gen-interval-row {\n  display: flex; align-items: center; gap: 8px;\n  padding: 8px 12px;\n  border: 1.5px solid var(--border-bright);\n  border-radius: 10px;\n  background: var(--bg-main);\n  transition: border-color 0.2s;\n}\n.gen-switch-label {\n  font-size: 12px; font-weight: 600;\n  color: var(--text-muted);\n  white-space: nowrap;\n}\n.gen-stat-card {\n  border-radius: 14px;\n  padding: 20px 22px;\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-card);\n  box-shadow: var(--shadow-soft);\n  transition: all 0.25s ease;\n  animation: gen-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;\n  cursor: default;\n  position: relative;\n  overflow: hidden;\n}\n.gen-stat-card::before {\n  content: '';\n  position: absolute;\n  top: 0; left: 0; right: 0;\n  height: 3px;\n  border-radius: 14px 14px 0 0;\n}\n.gen-stat-card:hover {\n  transform: translateY(-3px);\n  box-shadow: var(--shadow-hover);\n  border-color: var(--border-bright);\n}\n.gen-stat-card.blue::before  { background: linear-gradient(90deg, #3b82f6, #2563eb); }\n.gen-stat-card.green::before { background: linear-gradient(90deg, #10b981, #059669); }\n.gen-stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #d97706); }\n.gen-stat-card.violet::before{ background: linear-gradient(90deg, #8b5cf6, #7c3aed); }\n.gen-stat-icon {\n  width: 42px; height: 42px;\n  border-radius: 10px;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 18px;\n  flex-shrink: 0;\n}\n.gen-stat-icon.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }\n.gen-stat-icon.green { background: rgba(16,185,129,0.12); color: #10b981; }\n.gen-stat-icon.amber { background: rgba(245,158,11,0.12); color: #f59e0b; }\n.gen-stat-icon.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }\n\n.gen-section {\n  border-radius: 16px;\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-card);\n  box-shadow: var(--shadow-soft);\n  overflow: hidden;\n  margin-bottom: 24px;\n  animation: gen-fade-up 0.55s cubic-bezier(.16,1,.3,1) both;\n}\n.gen-section-header {\n  padding: 18px 24px;\n  display: flex; align-items: center; justify-content: space-between;\n  border-bottom: 1px solid var(--border-subtle);\n}\n.gen-section-title {\n  display: flex; align-items: center; gap: 12px;\n}\n.gen-section-pill {\n  width: 32px; height: 32px;\n  border-radius: 8px;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 15px;\n  flex-shrink: 0;\n}\n.gen-section-pill.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }\n.gen-section-pill.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }\n.gen-section-body { padding: 24px; }\n\n.gen-field-label {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.6px;\n  text-transform: uppercase;\n  color: var(--text-muted);\n  margin-bottom: 8px;\n  display: flex; align-items: center; gap: 6px;\n}\n.gen-divider-row {\n  height: 1px;\n  background: var(--border-subtle);\n  margin: 20px 0;\n}\n.gen-overlay-group {\n  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;\n  padding: 16px 20px;\n  background: var(--bg-main);\n  border-radius: 10px;\n  border: 1px solid var(--border-subtle);\n}\n.gen-checkbox-item {\n  display: flex; align-items: center; gap: 7px;\n  font-size: 13px; font-weight: 500; color: var(--text-secondary);\n  cursor: pointer;\n  transition: color 0.15s;\n}\n.gen-checkbox-item:hover { color: var(--text-primary); }\n\n.gen-action-row {\n  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;\n  margin-top: 20px;\n}\n.gen-btn-primary {\n  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;\n  border: none !important;\n  padding: 10px 22px !important;\n  font-weight: 600 !important;\n  font-size: 13px !important;\n  border-radius: 10px !important;\n  height: 42px !important;\n  white-space: nowrap;\n  box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important;\n  transition: all 0.2s !important;\n}\n.gen-btn-primary:hover {\n  transform: translateY(-2px) !important;\n  box-shadow: 0 8px 20px rgba(37,99,235,0.45) !important;\n}\n.gen-btn-secondary {\n  background: var(--bg-main) !important;\n  border: 1px solid var(--border-bright) !important;\n  color: var(--text-secondary) !important;\n  padding: 10px 20px !important;\n  font-weight: 600 !important;\n  font-size: 13px !important;\n  border-radius: 10px !important;\n  height: 42px !important;\n  white-space: nowrap;\n  transition: all 0.2s !important;\n}\n.gen-btn-secondary:hover {\n  background: var(--bg-card) !important;\n  border-color: var(--primary) !important;\n  color: var(--primary) !important;\n  transform: translateY(-1px) !important;\n}\n.gen-chart-wrapper {\n  border-radius: 16px;\n  border: 1px solid var(--border-subtle);\n  background: var(--bg-card);\n  box-shadow: var(--shadow-soft);\n  overflow: hidden;\n  animation: gen-fade-up 0.6s cubic-bezier(.16,1,.3,1) both;\n}\n.gen-chart-header {\n  padding: 16px 24px;\n  display: flex; align-items: center; justify-content: space-between;\n  border-bottom: 1px solid var(--border-subtle);\n  background: var(--bg-main);\n}\n.gen-loading-overlay {\n  position: fixed; inset: 0; z-index: 9999;\n  display: flex; align-items: center; justify-content: center;\n  background: rgba(0,0,0,0.5);\n  backdrop-filter: blur(6px);\n}\n.gen-loading-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: 20px;\n  padding: 40px 48px;\n  display: flex; flex-direction: column; align-items: center; gap: 16px;\n  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);\n}\n.gen-spinner {\n  width: 48px; height: 48px;\n  border: 3px solid var(--border-subtle);\n  border-top-color: #2563eb;\n  border-radius: 50%;\n  animation: gen-spin-slow 0.8s linear infinite;\n}\n";
			function N() {
				(0, v.F)().isDarkMode;
				var e = (0, i.useState)([
						new Date(
							d()()
								.set("hour", 0)
								.set("minute", 0)
								.set("second", 0)
								.subtract(2, "day")._d,
						),
						new Date(
							d()()
								.set("hour", 23)
								.set("minute", 59)
								.set("second", 0)
								.subtract(2, "day")._d,
						),
					]),
					n = (0, r.Z)(e, 2),
					t = n[0],
					c = n[1],
					N = null === t || void 0 === t ? void 0 : t[0],
					D = null === t || void 0 === t ? void 0 : t[1],
					M = (0, i.useState)(),
					S = (0, r.Z)(M, 2),
					Y = S[0],
					z = S[1],
					_ = (0, i.useState)(),
					C = (0, r.Z)(_, 2),
					Z = C[0],
					T = C[1],
					W = (0, i.useState)(),
					H = (0, r.Z)(W, 2),
					I = H[0],
					O = H[1],
					G = (0, i.useState)(!0),
					F = (0, r.Z)(G, 2),
					q = F[0],
					B = F[1],
					R = (0, i.useState)(!0),
					A = (0, r.Z)(R, 2),
					V = A[0],
					E = A[1],
					L = (0, i.useState)(),
					P = (0, r.Z)(L, 2),
					J = P[0],
					X = P[1],
					Q = (0, i.useState)(),
					U = (0, r.Z)(Q, 2),
					K = U[0],
					$ = U[1],
					ee = (0, i.useState)(),
					ne = (0, r.Z)(ee, 2),
					te = ne[0],
					ae = ne[1],
					re = (0, i.useState)(),
					ie = (0, r.Z)(re, 2),
					oe = ie[0],
					le = ie[1],
					se = (0, i.useState)(!0),
					ce = (0, r.Z)(se, 2),
					de = ce[0],
					pe = ce[1],
					ue = (0, i.useState)(),
					ge = (0, r.Z)(ue, 2),
					me = ge[0],
					he = ge[1],
					xe = (0, i.useState)(!0),
					fe = (0, r.Z)(xe, 2),
					be = fe[0],
					ve = fe[1],
					ye = (0, i.useState)(!1),
					je = (0, r.Z)(ye, 2),
					we = je[0],
					ke = je[1],
					Ne = (0, i.useState)(!1),
					De = (0, r.Z)(Ne, 2),
					Me = De[0],
					Se = De[1],
					Ye = (0, i.useState)(1),
					ze = (0, r.Z)(Ye, 2),
					_e = ze[0],
					Ce = ze[1],
					Ze = (0, i.useState)(!1),
					Te = (0, r.Z)(Ze, 2),
					We = Te[0],
					He = Te[1],
					Ie = (0, i.useState)(1),
					Oe = (0, r.Z)(Ie, 2),
					Ge = Oe[0],
					Fe = Oe[1],
					qe = (0, i.useState)(),
					Be = (0, r.Z)(qe, 2),
					Re = Be[0],
					Ae = Be[1],
					Ve = (0, i.useState)(),
					Ee = (0, r.Z)(Ve, 2),
					Le = Ee[0],
					Pe = Ee[1],
					Je = (0, i.useState)([]),
					Xe = (0, r.Z)(Je, 2),
					Qe = Xe[0],
					Ue = Xe[1],
					Ke = (0, i.useState)([]),
					$e = (0, r.Z)(Ke, 2),
					en = $e[0],
					nn = $e[1],
					tn = (0, i.useState)(!1),
					an = (0, r.Z)(tn, 2),
					rn = an[0],
					on = an[1],
					ln = (0, i.useState)(!1),
					sn = (0, r.Z)(ln, 2),
					cn = sn[0],
					dn = sn[1];
				(0, i.useEffect)(
					function () {
						if (
							(N &&
								D &&
								s.Z.post(
									"/ThermalThermalGeneratorNames?startDate=" +
										d()(N).format("YYYY-MM-DD HH:mm") +
										"&endDate=" +
										d()(D).format("YYYY-MM-DD HH:mm"),
									{},
								)
									.then(function (e) {
										return z(e.data);
									})
									.catch(function () {}),
							J)
						) {
							var e = J.map(function (e) {
								return d()(e).format("YYYY-MM-DD");
							});
							e.length === J.length &&
								s.Z.post(
									"/MultiThermalThermalGeneratorNames?MultistartDate=" + e,
									{},
								)
									.then(function (e) {
										return $(e.data);
									})
									.catch(function () {});
						}
						if (me) {
							var n = me.map(function (e) {
								return d()(e).format("YYYY-MM-DD");
							});
							n.length === me.length &&
								s.Z.post(
									"/MultiThermalThermalGeneratorNames?MultistartDate=" + n,
									{},
								)
									.then(function (e) {
										return $(e.data);
									})
									.catch(function () {});
						}
					},
					[N, D, J, me],
				);
				var pn = function (e) {
						var n = (0, a.Z)(Qe);
						(e.checked ? n.push(e.value) : n.splice(n.indexOf(e.value), 1),
							Ue(n));
					},
					un = function (e) {
						var n = (0, a.Z)(en);
						(e.checked ? n.push(e.value) : n.splice(n.indexOf(e.value), 1),
							nn(n));
					},
					gn = function (e, n) {
						if (e) {
							for (
								var t = y.utils.book_new(),
									i = e[e.length - 1].Date_Time || [],
									o = {},
									l = 0;
								l < e.length - 1;
								l++
							) {
								var s = e[l],
									c = s.stationName || "Station_".concat(l);
								(o[c] || (o[c] = []), o[c].push(s));
							}
							var p = Object.values(o).every(function (e) {
									return 1 === e.length;
								}),
								u = function (e) {
									var n = d()(e, d().ISO_8601, !0);
									return e
										? n.isValid()
											? n.format("DD-MMM-YY HH:mm")
											: String(e)
										: "";
								},
								g = function (e) {
									var n = d()(e, d().ISO_8601, !0);
									return e ? (n.isValid() ? n.format("HH:mm") : String(e)) : "";
								};
							if (p) {
								var m = Object.keys(o),
									h = i.map(function (e, n) {
										var t = { "Date / Time": u(e) };
										return (
											m.forEach(function (e) {
												var a;
												t[e] =
													null !==
														(a = (o[e][0].output ||
															o[e][0].actual ||
															o[e][0].demand ||
															o[e][0].voltageBus1 ||
															o[e][0].line ||
															o[e][0].frequency ||
															o[e][0].drawal ||
															o[e][0].schedule ||
															[])[n]) && void 0 !== a
														? a
														: "";
											}),
											t
										);
									});
								if (h.length > 0) {
									var x = y.utils.json_to_sheet(h);
									((x["!cols"] = Object.keys(h[0]).map(function (e) {
										return {
											wch: Math.min(
												Math.max.apply(
													Math,
													[e.length].concat(
														(0, a.Z)(
															h.map(function (n) {
																var t;
																return String(
																	null !== (t = n[e]) && void 0 !== t ? t : "",
																).length;
															}),
														),
													),
												) + 2,
												30,
											),
										};
									})),
										y.utils.book_append_sheet(t, x, "ThermalGenerator Data"));
								}
							} else
								Object.entries(o).forEach(function (e) {
									var n = (0, r.Z)(e, 2),
										o = n[0],
										l = n[1],
										s = l.map(function (e) {
											return e.Date_Time
												? d()(e.Date_Time).format("DD-MMM-YYYY")
												: "Value";
										}),
										c = Math.max.apply(
											Math,
											(0, a.Z)(
												l.map(function (e) {
													return (
														e.output ||
														e.actual ||
														e.demand ||
														e.voltageBus1 ||
														e.line ||
														e.frequency ||
														e.drawal ||
														e.schedule ||
														[]
													).length;
												}),
											),
										),
										p = Array.from({ length: c }, function (e, n) {
											var t = { Time: g(i[n]) || "Slot ".concat(n + 1) };
											return (
												l.forEach(function (e, a) {
													var r;
													t[s[a]] =
														null !==
															(r = (e.output ||
																e.actual ||
																e.demand ||
																e.voltageBus1 ||
																e.line ||
																e.frequency ||
																e.drawal ||
																e.schedule ||
																[])[n]) && void 0 !== r
															? r
															: "";
												}),
												t
											);
										});
									if (p.length > 0) {
										var u = y.utils.json_to_sheet(p);
										((u["!cols"] = Object.keys(p[0]).map(function (e) {
											return {
												wch: Math.min(
													Math.max.apply(
														Math,
														[e.length].concat(
															(0, a.Z)(
																p.map(function (n) {
																	var t;
																	return String(
																		null !== (t = n[e]) && void 0 !== t
																			? t
																			: "",
																	).length;
																}),
															),
														),
													) + 2,
													30,
												),
											};
										})),
											y.utils.book_append_sheet(t, u, o.substring(0, 31)));
									}
								});
							var f = y.write(t, { bookType: "xlsx", type: "array" });
							(0, j.saveAs)(
								new Blob([f], { type: "application/octet-stream" }),
								"ThermalGenerator_"
									.concat(n, "_")
									.concat(d()().format("YYYYMMDD_HHmm"), ".xlsx"),
							);
						}
					},
					mn = I ? I.length - 1 : 0,
					hn = (oe && oe.length, N && D ? d()(D).diff(d()(N), "days") + 1 : 0),
					xn = Z ? Z.length : 0;
				return (0, w.jsxs)(w.Fragment, {
					children: [
						(0, w.jsx)("style", { children: k }),
						(0, w.jsx)(g.b, { blocked: rn, fullScreen: !0 }),
						cn &&
							(0, w.jsx)("div", {
								className: "gen-loading-overlay",
								children: (0, w.jsxs)("div", {
									className: "gen-loading-card",
									children: [
										(0, w.jsx)("div", { className: "gen-spinner" }),
										(0, w.jsx)("div", {
											style: {
												fontWeight: 700,
												fontSize: 15,
												color: "var(--text-primary)",
											},
											children: "Fetching ThermalGenerator Data",
										}),
										(0, w.jsx)("div", {
											style: { fontSize: 12, color: "var(--text-muted)" },
											children: "Crunching numbers from the grid\u2026",
										}),
									],
								}),
							}),
						(0, w.jsx)("div", {
							className: "main-viewport",
							style: { paddingBottom: 40 },
							children: (0, w.jsxs)("div", {
								children: [
									(0, w.jsx)("div", {
										className: "gen-hero",
										children: (0, w.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: 14,
												position: "relative",
												zIndex: 1,
											},
											children: [
												(0, w.jsx)("div", {
													className: "gen-hero-icon",
													children: "\ud83d\udd25",
												}),
												(0, w.jsxs)("div", {
													style: { flex: 1, minWidth: 0 },
													children: [
														(0, w.jsxs)("div", {
															className: "gen-hero-badge",
															children: [
																(0, w.jsx)("span", {
																	style: {
																		width: 5,
																		height: 5,
																		borderRadius: "50%",
																		background: "#4ade80",
																		display: "inline-block",
																	},
																}),
																"Live Analytics",
															],
														}),
														(0, w.jsx)("h1", {
															style: {
																color: "#fff",
																fontSize: 18,
																fontWeight: 800,
																margin: 0,
																letterSpacing: "-0.3px",
																lineHeight: 1.25,
															},
															children: "ThermalGenerator Analytics",
														}),
														(0, w.jsx)("p", {
															style: {
																color: "rgba(255,255,255,0.65)",
																margin: "3px 0 0",
																fontSize: 11.5,
																fontWeight: 400,
															},
															children: "Thermal plant generation output",
														}),
													],
												}),
												(0, w.jsx)("div", {
													style: { display: "flex", gap: 8, flexShrink: 0 },
													children: [
														{ val: mn, lbl: "Stations" },
														{ val: hn, lbl: "Days" },
														{ val: xn, lbl: "Selected" },
													].map(function (e) {
														var n = e.val,
															t = e.lbl;
														return (0, w.jsxs)(
															"div",
															{
																style: {
																	textAlign: "center",
																	padding: "6px 14px",
																	background: "rgba(255,255,255,0.12)",
																	borderRadius: 8,
																	border: "1px solid rgba(255,255,255,0.2)",
																},
																children: [
																	(0, w.jsx)("div", {
																		style: {
																			color: "#fff",
																			fontSize: 18,
																			fontWeight: 800,
																			lineHeight: 1,
																		},
																		children: n,
																	}),
																	(0, w.jsx)("div", {
																		style: {
																			color: "rgba(255,255,255,0.65)",
																			fontSize: 9,
																			fontWeight: 600,
																			textTransform: "uppercase",
																			marginTop: 2,
																		},
																		children: t,
																	}),
																],
															},
															t,
														);
													}),
												}),
											],
										}),
									}),
									(0, w.jsx)("div", {
										className: "grid mb-4",
										style: { animationDelay: "0.05s" },
										children: [
											{
												color: "blue",
												icon: "pi-calendar-plus",
												label: "Date Range",
												value: N
													? d()(N).format("DD MMM") +
														" \u2192 " +
														d()(D).format("DD MMM YYYY")
													: "Not set",
											},
											{
												color: "green",
												icon: "pi-bolt",
												label: "ThermalGenerators Selected",
												value: xn
													? "".concat(xn, " station").concat(xn > 1 ? "s" : "")
													: "None selected",
											},
											{
												color: "amber",
												icon: "pi-clock",
												label: "Resolution",
												value: Me
													? "".concat(_e, " min interval")
													: "1 min (default)",
											},
											{
												color: "violet",
												icon: "pi-chart-line",
												label: "Data Status",
												value: I
													? "\u2713 Ready to view"
													: "Pending generation",
											},
										].map(function (e, n) {
											return (0, w.jsx)(
												"div",
												{
													className: "col-12 sm:col-6 xl:col-3",
													children: (0, w.jsx)("div", {
														className: "gen-stat-card ".concat(e.color),
														style: {
															animationDelay: "".concat(0.08 + 0.06 * n, "s"),
														},
														children: (0, w.jsxs)("div", {
															style: {
																display: "flex",
																alignItems: "center",
																gap: 14,
															},
															children: [
																(0, w.jsx)("div", {
																	className: "gen-stat-icon ".concat(e.color),
																	children: (0, w.jsx)("i", {
																		className: "pi ".concat(e.icon),
																	}),
																}),
																(0, w.jsxs)("div", {
																	children: [
																		(0, w.jsx)("div", {
																			style: {
																				fontSize: 10,
																				fontWeight: 700,
																				textTransform: "uppercase",
																				letterSpacing: "0.6px",
																				color: "var(--text-muted)",
																				marginBottom: 3,
																			},
																			children: e.label,
																		}),
																		(0, w.jsx)("div", {
																			style: {
																				fontSize: 14,
																				fontWeight: 700,
																				color: "var(--text-primary)",
																			},
																			children: e.value,
																		}),
																	],
																}),
															],
														}),
													}),
												},
												e.label,
											);
										}),
									}),
									(0, w.jsxs)("div", {
										className: "gen-section",
										children: [
											(0, w.jsxs)("div", {
												className: "gen-section-header",
												children: [
													(0, w.jsxs)("div", {
														className: "gen-section-title",
														children: [
															(0, w.jsx)("div", {
																className: "gen-section-pill blue",
																children: (0, w.jsx)("i", {
																	className: "pi pi-chart-line",
																}),
															}),
															(0, w.jsxs)("div", {
																children: [
																	(0, w.jsx)("div", {
																		style: {
																			fontWeight: 700,
																			fontSize: 15,
																			color: "var(--text-primary)",
																		},
																		children: "Single Range Analysis",
																	}),
																	(0, w.jsx)("div", {
																		style: {
																			fontSize: 11,
																			color: "var(--text-muted)",
																			marginTop: 1,
																		},
																		children:
																			"Select a date range & generators to plot",
																	}),
																],
															}),
														],
													}),
													(0, w.jsx)(b.V, {
														value: "ThermalGenerator Output",
														severity: "info",
														rounded: !0,
														style: { fontSize: 11 },
													}),
												],
											}),
											(0, w.jsxs)("div", {
												className: "gen-section-body",
												children: [
													(0, w.jsxs)("div", {
														className: "grid align-items-end",
														children: [
															(0, w.jsxs)("div", {
																className: "col-12 md:col-4",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-calendar-plus",
																			}),
																			"Date Range",
																		],
																	}),
																	(0, w.jsx)(o.f, {
																		style: { width: "100%" },
																		showIcon: !0,
																		selectionMode: "range",
																		showTime: !0,
																		hourFormat: "24",
																		placeholder: "Select start \u2192 end date",
																		dateFormat: "dd-mm-yy",
																		value: t,
																		onChange: function (e) {
																			var n = e.value || [];
																			c(n);
																		},
																		monthNavigator: !0,
																		yearNavigator: !0,
																		yearRange: "2015:2030",
																		showButtonBar: !0,
																		numberOfMonths: 2,
																		className: "w-full",
																	}),
																	N &&
																		D &&
																		(0, w.jsxs)("div", {
																			style: {
																				display: "flex",
																				gap: 6,
																				marginTop: 6,
																				flexWrap: "wrap",
																			},
																			children: [
																				(0, w.jsx)("span", {
																					style: {
																						fontSize: 11,
																						padding: "2px 8px",
																						background: "rgba(59,130,246,0.10)",
																						border:
																							"1px solid rgba(59,130,246,0.25)",
																						borderRadius: 6,
																						color: "#3b82f6",
																						fontWeight: 600,
																					},
																					children:
																						d()(N).format("DD MMM YYYY HH:mm"),
																				}),
																				(0, w.jsx)("span", {
																					style: {
																						fontSize: 11,
																						color: "var(--text-muted)",
																						alignSelf: "center",
																					},
																					children: "\u2192",
																				}),
																				(0, w.jsx)("span", {
																					style: {
																						fontSize: 11,
																						padding: "2px 8px",
																						background: "rgba(59,130,246,0.10)",
																						border:
																							"1px solid rgba(59,130,246,0.25)",
																						borderRadius: 6,
																						color: "#3b82f6",
																						fontWeight: 600,
																					},
																					children:
																						d()(D).format("DD MMM YYYY HH:mm"),
																				}),
																			],
																		}),
																],
															}),
															(0, w.jsxs)("div", {
																className: "col-12 md:col-3",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-stopwatch",
																			}),
																			"Resolution Interval",
																		],
																	}),
																	(0, w.jsxs)("div", {
																		className: "gen-interval-row",
																		children: [
																			(0, w.jsx)(m.Q, {
																				checked: Me,
																				onChange: function (e) {
																					return Se(e.value);
																				},
																			}),
																			(0, w.jsx)("span", {
																				className: "gen-switch-label",
																				children: Me
																					? "".concat(_e, " min")
																					: "Default 1 min",
																			}),
																			(0, w.jsx)("div", {
																				style: { marginLeft: "auto" },
																				children: (0, w.jsx)(h.R, {
																					min: 1,
																					max: 1440,
																					disabled: !Me,
																					value: _e,
																					onValueChange: function (e) {
																						return Ce(e.value);
																					},
																					showButtons: !0,
																					buttonLayout: "horizontal",
																					decrementButtonClassName:
																						"p-button-outlined p-button-sm",
																					incrementButtonClassName:
																						"p-button-outlined p-button-sm",
																					incrementButtonIcon: "pi pi-plus",
																					decrementButtonIcon: "pi pi-minus",
																					inputStyle: {
																						width: "40px",
																						textAlign: "center",
																						fontSize: 13,
																					},
																				}),
																			}),
																		],
																	}),
																],
															}),
															(0, w.jsxs)("div", {
																className: "col-12 md:col-5",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-bolt",
																			}),
																			"Select ThermalGenerator(s)",
																		],
																	}),
																	(0, w.jsx)(l.N, {
																		filterPlaceholder:
																			"Search generators\u2026",
																		showSelectAll: !0,
																		showClear: !0,
																		resetFilterOnHide: !0,
																		maxSelectedLabels: 3,
																		selectionLimit: 5,
																		display: "chip",
																		placeholder:
																			"Pick up to 5 generators\u2026",
																		value: Z,
																		options: Y,
																		onChange: function (e) {
																			return T(e.value);
																		},
																		filter: !0,
																		className: "w-full premium-multiselect",
																	}),
																],
															}),
														],
													}),
													(0, w.jsx)("div", { className: "gen-divider-row" }),
													(0, w.jsxs)("div", {
														className: "grid gap-0",
														children: [
															(0, w.jsxs)("div", {
																className: "col-12 md:col-6",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label mb-2",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-sliders-h",
																			}),
																			"Overlay \u2014 Duration Curve",
																		],
																	}),
																	(0, w.jsx)("div", {
																		className: "gen-overlay-group",
																		children: [
																			"ThermalGenerator",
																			"Frequency",
																		].map(function (e) {
																			return (0, w.jsxs)(
																				"label",
																				{
																					className: "gen-checkbox-item",
																					children: [
																						(0, w.jsx)(x.X, {
																							value: e,
																							onChange: un,
																							checked: -1 !== en.indexOf(e),
																						}),
																						e,
																					],
																				},
																				e,
																			);
																		}),
																	}),
																],
															}),
															(0, w.jsxs)("div", {
																className: "col-12 md:col-6",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label mb-2",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-wave-pulse",
																			}),
																			"Overlay \u2014 Frequency Stations",
																		],
																	}),
																	(0, w.jsx)("div", {
																		className: "gen-overlay-group",
																		children: [
																			{ val: "Durgapur", color: "#ef4444" },
																			{ val: "Jeypore", color: "#f97316" },
																			{ val: "Sasaram", color: "#db2777" },
																		].map(function (e) {
																			var n = e.val,
																				t = e.color;
																			return (0, w.jsxs)(
																				"label",
																				{
																					className: "gen-checkbox-item",
																					children: [
																						(0, w.jsx)(x.X, {
																							value: n,
																							onChange: pn,
																							checked: -1 !== Qe.indexOf(n),
																						}),
																						(0, w.jsx)("span", {
																							style: {
																								color:
																									-1 !== Qe.indexOf(n)
																										? t
																										: void 0,
																								fontWeight:
																									-1 !== Qe.indexOf(n)
																										? 700
																										: void 0,
																							},
																							children: n,
																						}),
																					],
																				},
																				n,
																			);
																		}),
																	}),
																],
															}),
														],
													}),
													(0, w.jsxs)("div", {
														className: "gen-action-row",
														children: [
															(0, w.jsx)(p.z, {
																icon: "pi pi-chart-bar",
																label: "Generate Graph",
																className: "gen-btn-primary",
																onClick: function () {
																	(dn(!0),
																		(function () {
																			if (N && D && Z) {
																				var e = Me && _e ? _e : 1,
																					n = d()(N).format("YYYY-MM-DD HH:mm"),
																					t = d()(D).format("YYYY-MM-DD HH:mm");
																				(s.Z.post(
																					"/GetThermalGeneratorData?startDate="
																						.concat(n, "&endDate=")
																						.concat(t, "&stationName=")
																						.concat(
																							(Z || [])
																								.map(function (e) {
																									return String(e).replace(
																										/&/g,
																										"%26",
																									);
																								})
																								.join(","),
																							"&time=",
																						)
																						.concat(e),
																					{},
																				).then(function (e) {
																					(O(e.data),
																						B(!1),
																						E(!1),
																						on(!1),
																						dn(!1));
																				}),
																					s.Z.post(
																						"/GetFrequencyData?startDate="
																							.concat(n, "&endDate=")
																							.concat(
																								t,
																								"&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&time=",
																							)
																							.concat(e),
																						{},
																					).then(function (e) {
																						return Ae(e.data);
																					}));
																			}
																		})());
																},
															}),
															(0, w.jsx)(p.z, {
																icon: "pi pi-download",
																label: "Export Graph Data",
																className: "gen-btn-secondary",
																disabled: !I,
																tooltip: "Export plotted data as Excel",
																tooltipOptions: { position: "top" },
																onClick: function () {
																	return gn(
																		I,
																		""
																			.concat(d()(N).format("YYYYMMDD"), "_")
																			.concat(d()(D).format("YYYYMMDD")),
																	);
																},
															}),
															(0, w.jsx)(p.z, {
																icon: "pi pi-file-excel",
																label: "Export Raw Data",
																className: "gen-btn-secondary",
																disabled: q,
																tooltip: "Download from server",
																tooltipOptions: { position: "top" },
																onClick: function () {
																	window.location.href = ""
																		.concat(
																			"http://10.3.230.62:5010",
																			"/GetThermalGeneratorDataExcel?startDate=",
																		)
																		.concat(
																			d()(N).format("YYYY-MM-DD"),
																			"&endDate=",
																		)
																		.concat(
																			d()(D).format("YYYY-MM-DD"),
																			"&stationName=",
																		)
																		.concat(
																			(Z || [])
																				.map(function (e) {
																					return String(e).replace(/&/g, "%26");
																				})
																				.join(","),
																		);
																},
															}),
															!V &&
																I &&
																(0, w.jsx)(f.A, {
																	label: "".concat(
																		I.length - 1,
																		" trace(s) loaded",
																	),
																	icon: "pi pi-check-circle",
																	style: {
																		background: "rgba(16,185,129,0.12)",
																		color: "#10b981",
																		border: "1px solid rgba(16,185,129,0.3)",
																		fontWeight: 600,
																		fontSize: 12,
																	},
																}),
														],
													}),
												],
											}),
										],
									}),
									!V &&
										(0, w.jsxs)("div", {
											className: "gen-chart-wrapper mb-4",
											children: [
												(0, w.jsxs)("div", {
													className: "gen-chart-header",
													children: [
														(0, w.jsxs)("div", {
															style: {
																display: "flex",
																alignItems: "center",
																gap: 10,
															},
															children: [
																(0, w.jsx)("i", {
																	className: "pi pi-chart-line",
																	style: { color: "#3b82f6" },
																}),
																(0, w.jsx)("span", {
																	style: {
																		fontWeight: 700,
																		fontSize: 14,
																		color: "var(--text-primary)",
																	},
																	children: "Output Chart",
																}),
																(0, w.jsx)(b.V, {
																	value: ""
																		.concat(d()(N).format("DD MMM"), " \u2192 ")
																		.concat(d()(D).format("DD MMM YYYY")),
																	severity: "info",
																	rounded: !0,
																	style: { fontSize: 10 },
																}),
															],
														}),
														(0, w.jsx)("div", {
															style: {
																fontSize: 11,
																color: "var(--text-muted)",
															},
															children: "Scroll to zoom \xb7 Drag to pan",
														}),
													],
												}),
												(0, w.jsx)("div", {
													style: { padding: "16px 20px" },
													children: (0, w.jsx)(u.Z, {
														thermalGenerator_data: I,
														Selected_thermalGenerator_states: Z,
														frequency: Re,
														freq_region: Qe,
														freq_region1: en,
													}),
												}),
											],
										}),
									(0, w.jsxs)("div", {
										className: "gen-section",
										style: { animationDelay: "0.1s" },
										children: [
											(0, w.jsxs)("div", {
												className: "gen-section-header",
												children: [
													(0, w.jsxs)("div", {
														className: "gen-section-title",
														children: [
															(0, w.jsx)("div", {
																className: "gen-section-pill violet",
																children: (0, w.jsx)("i", {
																	className: "pi pi-objects-column",
																}),
															}),
															(0, w.jsxs)("div", {
																children: [
																	(0, w.jsx)("div", {
																		style: {
																			fontWeight: 700,
																			fontSize: 15,
																			color: "var(--text-primary)",
																		},
																		children: "Multi-Timeline Comparison",
																	}),
																	(0, w.jsx)("div", {
																		style: {
																			fontSize: 11,
																			color: "var(--text-muted)",
																			marginTop: 1,
																		},
																		children:
																			"Compare generator output across multiple days or months",
																	}),
																],
															}),
														],
													}),
													(0, w.jsx)("div", {
														style: {
															display: "flex",
															gap: 6,
															alignItems: "center",
														},
														children: (0, w.jsxs)("div", {
															style: {
																display: "flex",
																gap: 0,
																borderRadius: 8,
																overflow: "hidden",
																border: "1px solid var(--border-subtle)",
															},
															children: [
																(0, w.jsx)("button", {
																	onClick: function () {
																		(ve(!0), ke(!1));
																	},
																	style: {
																		padding: "7px 16px",
																		fontSize: 12,
																		fontWeight: 600,
																		border: "none",
																		cursor: "pointer",
																		background: be
																			? "#2563eb"
																			: "var(--bg-main)",
																		color: be ? "#fff" : "var(--text-muted)",
																		transition: "all 0.2s",
																	},
																	children: "Day-wise",
																}),
																(0, w.jsx)("button", {
																	onClick: function () {
																		(ke(!0), ve(!1));
																	},
																	style: {
																		padding: "7px 16px",
																		fontSize: 12,
																		fontWeight: 600,
																		border: "none",
																		cursor: "pointer",
																		background: we
																			? "#8b5cf6"
																			: "var(--bg-main)",
																		color: we ? "#fff" : "var(--text-muted)",
																		transition: "all 0.2s",
																	},
																	children: "Month-wise",
																}),
															],
														}),
													}),
												],
											}),
											(0, w.jsxs)("div", {
												className: "gen-section-body",
												children: [
													(0, w.jsxs)("div", {
														className: "grid align-items-end gap-0",
														children: [
															(0, w.jsx)("div", {
																className: "col-12 md:col-3",
																children: (0, w.jsxs)("div", {
																	className: "mb-3",
																	children: [
																		(0, w.jsxs)("div", {
																			className: "gen-field-label",
																			children: [
																				(0, w.jsx)("i", {
																					className: be
																						? "pi pi-calendar"
																						: "pi pi-calendar-times",
																				}),
																				be
																					? "Select Dates (Day-wise)"
																					: "Select Months",
																			],
																		}),
																		be &&
																			(0, w.jsx)(o.f, {
																				style: { width: "100%" },
																				showIcon: !0,
																				showWeek: !0,
																				selectionMode: "multiple",
																				placeholder: "Pick dates\u2026",
																				dateFormat: "dd-mm-yy",
																				value: J,
																				onChange: function (e) {
																					return X(e.value);
																				},
																				monthNavigator: !0,
																				yearNavigator: !0,
																				yearRange: "2015:2030",
																				showButtonBar: !0,
																			}),
																		we &&
																			(0, w.jsx)(o.f, {
																				style: { width: "100%" },
																				showIcon: !0,
																				showWeek: !0,
																				selectionMode: "multiple",
																				placeholder: "Pick months\u2026",
																				view: "month",
																				dateFormat: "MM-yy",
																				value: me,
																				onChange: function (e) {
																					return he(e.value);
																				},
																				monthNavigator: !0,
																				yearNavigator: !0,
																				yearRange: "2015:2030",
																				showButtonBar: !0,
																			}),
																		be &&
																			J &&
																			J.length > 0 &&
																			(0, w.jsx)("div", {
																				style: {
																					display: "flex",
																					flexWrap: "wrap",
																					gap: 4,
																					marginTop: 8,
																				},
																				children: J.map(function (e, n) {
																					return (0, w.jsx)(
																						"span",
																						{
																							style: {
																								padding: "2px 8px",
																								background:
																									"rgba(139,92,246,0.1)",
																								border:
																									"1px solid rgba(139,92,246,0.3)",
																								borderRadius: 6,
																								fontSize: 11,
																								color: "#8b5cf6",
																								fontWeight: 600,
																							},
																							children: d()(e).format("DD MMM"),
																						},
																						n,
																					);
																				}),
																			}),
																		we &&
																			me &&
																			me.length > 0 &&
																			(0, w.jsx)("div", {
																				style: {
																					display: "flex",
																					flexWrap: "wrap",
																					gap: 4,
																					marginTop: 8,
																				},
																				children: me.map(function (e, n) {
																					return (0, w.jsx)(
																						"span",
																						{
																							style: {
																								padding: "2px 8px",
																								background:
																									"rgba(139,92,246,0.1)",
																								border:
																									"1px solid rgba(139,92,246,0.3)",
																								borderRadius: 6,
																								fontSize: 11,
																								color: "#8b5cf6",
																								fontWeight: 600,
																							},
																							children:
																								d()(e).format("MMM YYYY"),
																						},
																						n,
																					);
																				}),
																			}),
																	],
																}),
															}),
															(0, w.jsx)("div", {
																className: "col-12 md:col-2",
																children: (0, w.jsxs)("div", {
																	className: "mb-3",
																	children: [
																		(0, w.jsxs)("div", {
																			className: "gen-field-label",
																			children: [
																				(0, w.jsx)("i", {
																					className: "pi pi-stopwatch",
																				}),
																				"Interval",
																			],
																		}),
																		(0, w.jsxs)("div", {
																			style: {
																				display: "flex",
																				alignItems: "center",
																				gap: 8,
																				marginBottom: 8,
																			},
																			children: [
																				(0, w.jsx)(m.Q, {
																					checked: We,
																					onChange: function (e) {
																						return He(e.value);
																					},
																				}),
																				(0, w.jsx)("span", {
																					style: {
																						fontSize: 12,
																						color: "var(--text-muted)",
																					},
																					children: We
																						? "Custom"
																						: "Default (1 min)",
																				}),
																			],
																		}),
																		(0, w.jsx)(h.R, {
																			min: 1,
																			max: 1440,
																			disabled: !We,
																			value: Ge,
																			onValueChange: function (e) {
																				return Fe(e.value);
																			},
																			showButtons: !0,
																			buttonLayout: "horizontal",
																			decrementButtonClassName:
																				"p-button-danger p-button-outlined",
																			incrementButtonClassName:
																				"p-button-success p-button-outlined",
																			incrementButtonIcon: "pi pi-plus",
																			decrementButtonIcon: "pi pi-minus",
																			inputStyle: {
																				width: "4rem",
																				textAlign: "center",
																			},
																		}),
																	],
																}),
															}),
															(0, w.jsx)("div", {
																className: "col-12 md:col-5",
																children: (0, w.jsxs)("div", {
																	className: "mb-3",
																	children: [
																		(0, w.jsxs)("div", {
																			className: "gen-field-label",
																			children: [
																				(0, w.jsx)("i", {
																					className: "pi pi-bolt",
																				}),
																				"Select ThermalGenerator(s)",
																			],
																		}),
																		(0, w.jsx)(l.N, {
																			filterPlaceholder:
																				"Search generators\u2026",
																			showSelectAll: !0,
																			showClear: !0,
																			resetFilterOnHide: !0,
																			maxSelectedLabels: 3,
																			selectionLimit: 5,
																			display: "chip",
																			placeholder: "Pick generators\u2026",
																			value: te,
																			options: K,
																			onChange: function (e) {
																				return ae(e.value);
																			},
																			filter: !0,
																			className: "w-full premium-multiselect",
																		}),
																	],
																}),
															}),
														],
													}),
													(0, w.jsx)("div", { className: "gen-divider-row" }),
													(0, w.jsxs)("div", {
														className: "grid gap-0",
														children: [
															(0, w.jsxs)("div", {
																className: "col-12 md:col-6",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label mb-2",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-sliders-h",
																			}),
																			"Overlay \u2014 Duration Curve",
																		],
																	}),
																	(0, w.jsx)("div", {
																		className: "gen-overlay-group",
																		children: [
																			"ThermalGenerator",
																			"Frequency",
																		].map(function (e) {
																			return (0, w.jsxs)(
																				"label",
																				{
																					className: "gen-checkbox-item",
																					children: [
																						(0, w.jsx)(x.X, {
																							value: e,
																							onChange: un,
																							checked: -1 !== en.indexOf(e),
																						}),
																						e,
																					],
																				},
																				e,
																			);
																		}),
																	}),
																],
															}),
															(0, w.jsxs)("div", {
																className: "col-12 md:col-6",
																children: [
																	(0, w.jsxs)("div", {
																		className: "gen-field-label mb-2",
																		children: [
																			(0, w.jsx)("i", {
																				className: "pi pi-wave-pulse",
																			}),
																			"Overlay \u2014 Frequency Stations",
																		],
																	}),
																	(0, w.jsx)("div", {
																		className: "gen-overlay-group",
																		children: [
																			{ val: "Durgapur", color: "#ef4444" },
																			{ val: "Jeypore", color: "#f97316" },
																			{ val: "Sasaram", color: "#db2777" },
																		].map(function (e) {
																			var n = e.val,
																				t = e.color;
																			return (0, w.jsxs)(
																				"label",
																				{
																					className: "gen-checkbox-item",
																					children: [
																						(0, w.jsx)(x.X, {
																							value: n,
																							onChange: pn,
																							checked: -1 !== Qe.indexOf(n),
																						}),
																						(0, w.jsx)("span", {
																							style: {
																								color:
																									-1 !== Qe.indexOf(n)
																										? t
																										: void 0,
																								fontWeight:
																									-1 !== Qe.indexOf(n)
																										? 700
																										: void 0,
																							},
																							children: n,
																						}),
																					],
																				},
																				n,
																			);
																		}),
																	}),
																],
															}),
														],
													}),
													(0, w.jsxs)("div", {
														className: "gen-action-row",
														children: [
															(0, w.jsx)(p.z, {
																icon: "pi pi-chart-bar",
																label: "Generate Comparison",
																className: "gen-btn-primary",
																style: {
																	background:
																		"linear-gradient(135deg, #7c3aed, #6d28d9) !important",
																},
																onClick: function () {
																	(dn(!0),
																		(function () {
																			if (J && be) {
																				var e = J.map(function (e) {
																						return d()(e).format("YYYY-MM-DD");
																					}),
																					n = We && Ge ? Ge : 1;
																				e.length &&
																					te &&
																					(s.Z.post(
																						"/GetMultiThermalGeneratorData?MultistartDate="
																							.concat(e, "&MultistationName=")
																							.concat(
																								(te || [])
																									.map(function (e) {
																										return String(e).replace(
																											/&/g,
																											"%26",
																										);
																									})
																									.join(","),
																								"&Type=Date&time=",
																							)
																							.concat(n),
																						{},
																					).then(function (e) {
																						(le(e.data),
																							pe(!1),
																							on(!1),
																							dn(!1));
																					}),
																					s.Z.post(
																						"/GetMultiFrequencyData?MultistartDate="
																							.concat(
																								e[0],
																								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&Type=Date&time=",
																							)
																							.concat(n),
																						{},
																					).then(function (e) {
																						return Pe(e.data);
																					}));
																			}
																			if (me && we) {
																				var t = me.map(function (e) {
																						return d()(e).format("YYYY-MM-DD");
																					}),
																					a = We && Ge ? Ge : 1;
																				t.length &&
																					te &&
																					(s.Z.post(
																						"/GetMultiThermalGeneratorData?MultistartDate="
																							.concat(t, "&MultistationName=")
																							.concat(
																								(te || [])
																									.map(function (e) {
																										return String(e).replace(
																											/&/g,
																											"%26",
																										);
																									})
																									.join(","),
																								"&Type=Month&time=",
																							)
																							.concat(a),
																						{},
																					).then(function (e) {
																						(le(e.data),
																							pe(!1),
																							on(!1),
																							dn(!1));
																					}),
																					s.Z.post(
																						"/GetMultiFrequencyData?MultistartDate="
																							.concat(
																								t,
																								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&Type=Month&time=",
																							)
																							.concat(a),
																						{},
																					).then(function (e) {
																						return Pe(e.data);
																					}));
																			}
																		})());
																},
															}),
															(0, w.jsx)(p.z, {
																icon: "pi pi-download",
																label: "Export Graph Data",
																className: "gen-btn-secondary",
																disabled: !oe,
																tooltip:
																	"Export plotted comparison data as Excel",
																tooltipOptions: { position: "top" },
																onClick: function () {
																	var e = be
																		? (null === J || void 0 === J
																				? void 0
																				: J.map(function (e) {
																						return d()(e).format("DDMMYYYY");
																					}).join("_")) || "dates"
																		: (null === me || void 0 === me
																				? void 0
																				: me
																						.map(function (e) {
																							return d()(e).format("MMYYYY");
																						})
																						.join("_")) || "months";
																	gn(oe, e);
																},
															}),
															!de &&
																oe &&
																(0, w.jsx)(f.A, {
																	label: "".concat(
																		oe.length - 1,
																		" trace(s) loaded",
																	),
																	icon: "pi pi-check-circle",
																	style: {
																		background: "rgba(139,92,246,0.12)",
																		color: "#8b5cf6",
																		border: "1px solid rgba(139,92,246,0.3)",
																		fontWeight: 600,
																		fontSize: 12,
																	},
																}),
														],
													}),
												],
											}),
										],
									}),
									!de &&
										(0, w.jsxs)("div", {
											className: "gen-chart-wrapper",
											children: [
												(0, w.jsxs)("div", {
													className: "gen-chart-header",
													children: [
														(0, w.jsxs)("div", {
															style: {
																display: "flex",
																alignItems: "center",
																gap: 10,
															},
															children: [
																(0, w.jsx)("i", {
																	className: "pi pi-objects-column",
																	style: { color: "#8b5cf6" },
																}),
																(0, w.jsx)("span", {
																	style: {
																		fontWeight: 700,
																		fontSize: 14,
																		color: "var(--text-primary)",
																	},
																	children: "Comparison Chart",
																}),
																(0, w.jsx)(b.V, {
																	value: be ? "Day-wise" : "Month-wise",
																	severity: "help",
																	rounded: !0,
																	style: { fontSize: 10 },
																}),
															],
														}),
														(0, w.jsx)("div", {
															style: {
																fontSize: 11,
																color: "var(--text-muted)",
															},
															children: "Scroll to zoom \xb7 Drag to pan",
														}),
													],
												}),
												(0, w.jsx)("div", {
													style: { padding: "16px 20px" },
													children: (0, w.jsx)(u.Z, {
														thermalGenerator_data: oe,
														Selected_thermalGenerator_states: te,
														date_time: !0,
														check1: be,
														check2: we,
														frequency: Le,
														freq_region: Qe,
														freq_region1: en,
													}),
												}),
											],
										}),
								],
							}),
						}),
					],
				});
			}
		},
		4771: function (e, n, t) {
			t.d(n, {
				Z: function () {
					return f;
				},
			});
			var a = t(1413),
				r = t(3433),
				i = t(2791),
				o = t(2426),
				l = t.n(o),
				s = t(3862),
				c = t(3644),
				d = t(429),
				p = t(498),
				u = t(184);
			c.kL.register.apply(c.kL, (0, r.Z)(c.zX).concat([d.ZP]));
			var g = [
					"#3b82f6",
					"#f59e0b",
					"#10b981",
					"#8b5cf6",
					"#ec4899",
					"#06b6d4",
					"#f97316",
					"#84cc16",
					"#6366f1",
					"#14b8a6",
				],
				m = { Durgapur: "#ef4444", Jeypore: "#f97316", Sasaram: "#db2777" },
				h = function (e, n) {
					var t = parseInt(e.slice(1, 3), 16),
						a = parseInt(e.slice(3, 5), 16),
						r = parseInt(e.slice(5, 7), 16);
					return "rgba("
						.concat(t, ",")
						.concat(a, ",")
						.concat(r, ",")
						.concat(n, ")");
				},
				x = function (e, n) {
					var t =
							arguments.length > 2 && void 0 !== arguments[2]
								? arguments[2]
								: 400,
						a = e.createLinearGradient(0, 0, 0, t);
					return (
						a.addColorStop(0, h(n, 0.35)),
						a.addColorStop(0.5, h(n, 0.12)),
						a.addColorStop(1, h(n, 0)),
						a
					);
				};
			function f(e) {
				var n = (0, p.F)().isDarkMode,
					t = (0, i.useRef)(null),
					r = n ? "#cbd5e1" : "#334155",
					o = n ? "#94a3b8" : "#64748b",
					d = n ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.08)",
					f = n ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.96)",
					b = n ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
					v = (0, i.useMemo)(
						function () {
							if (!e.generator_data) return { chartData: {}, chartOptions: {} };
							for (
								var n = [],
									t = (
										e.generator_data[e.generator_data.length - 1].Date_Time ||
										[]
									).map(function (e) {
										var n = l()(e, l().ISO_8601, !0);
										return n.isValid() ? n.format("DD-MMM HH:mm") : String(e);
									}),
									i = 0,
									s = !1,
									p = (e.freq_region && e.freq_region.length, 0);
								p < e.generator_data.length - 1;
								p++
							) {
								var u,
									x,
									v = e.generator_data[p],
									y = v.stationName || "",
									j = v.max,
									w = v.min,
									k = v.avg,
									N = "MW" === y.split(" ").pop(),
									D = g[i % g.length],
									M = "";
								(e.date_time &&
									e.check1 &&
									((M = " \xb7 " + l()(v.Date_Time).format("DD MMM YY")),
									" \u2014 Day-wise"),
									e.date_time &&
										e.check2 &&
										((M = " \xb7 " + l()(v.Date_Time).format("MMM YYYY")),
										" \u2014 Month-wise"));
								var S =
										null !=
										(null === j ||
										void 0 === j ||
										null === (u = j[0]) ||
										void 0 === u
											? void 0
											: u[0])
											? Number(j[0][0]).toFixed(1)
											: "N/A",
									Y =
										null !=
										(null === w ||
										void 0 === w ||
										null === (x = w[0]) ||
										void 0 === x
											? void 0
											: x[0])
											? Number(w[0][0]).toFixed(1)
											: "N/A",
									z = null != k ? Number(k).toFixed(1) : "N/A",
									_ = ""
										.concat(y)
										.concat(M, "  \u25b2")
										.concat(S, " \u25bc")
										.concat(Y, " \u2300")
										.concat(z, " MW");
								(n.push({
									label: _,
									data: v.output || [],
									borderColor: D,
									backgroundColor: h(D, 0.1),
									borderWidth: N ? 2 : 1.6,
									borderDash: N ? [] : [6, 3],
									tension: 0.35,
									fill: N,
									pointRadius: 0,
									pointHoverRadius: 5,
									pointHoverBackgroundColor: D,
									pointHoverBorderColor: "#fff",
									pointHoverBorderWidth: 2,
									yAxisID: "y",
									_hex: D,
									_isMW: N,
								}),
									i++);
							}
							return (
								e.freq_region &&
									e.frequency &&
									[
										{ key: "Durgapur", idx: 0 },
										{ key: "Jeypore", idx: 1 },
										{ key: "Sasaram", idx: 2 },
									].forEach(function (t) {
										var a,
											r,
											i,
											o,
											l = t.key,
											c = t.idx;
										if (-1 !== e.freq_region.indexOf(l)) {
											var d = e.frequency[c];
											if (d) {
												var p = m[l],
													u = Number(
														(null === (a = d.max) ||
														void 0 === a ||
														null === (r = a[0]) ||
														void 0 === r
															? void 0
															: r[0]) || 0,
													).toFixed(3),
													g = Number(
														(null === (i = d.min) ||
														void 0 === i ||
														null === (o = i[0]) ||
														void 0 === o
															? void 0
															: o[0]) || 0,
													).toFixed(3),
													x = Number(d.avg || 0).toFixed(3);
												(n.push({
													label: ""
														.concat(d.stationName || l, " Freq  \u25b2")
														.concat(u, " \u25bc")
														.concat(g, " \u2300")
														.concat(x, " Hz"),
													data: d.frequency || [],
													borderColor: p,
													backgroundColor: h(p, 0),
													borderWidth: 1.6,
													tension: 0.3,
													fill: !1,
													pointRadius: 0,
													pointHoverRadius: 4,
													pointHoverBackgroundColor: p,
													yAxisID: "yFreq",
													_hex: p,
													_isMW: !1,
												}),
													(s = !0));
											}
										}
									}),
								{
									chartData: { labels: t, datasets: n },
									chartOptions: {
										responsive: !0,
										maintainAspectRatio: !1,
										interaction: { mode: "index", intersect: !1 },
										animation: { duration: 600, easing: "easeInOutQuart" },
										plugins: {
											legend: {
												display: !0,
												position: "bottom",
												labels: {
													color: r,
													usePointStyle: !0,
													pointStyle: "circle",
													padding: 20,
													font: {
														family: "Inter, sans-serif",
														size: 11,
														weight: "600",
													},
													generateLabels: function (e) {
														return c.kL.defaults.plugins.legend.labels
															.generateLabels(e)
															.map(function (e) {
																return (0, a.Z)(
																	(0, a.Z)({}, e),
																	{},
																	{
																		text:
																			e.text.length > 60
																				? e.text.slice(0, 57) + "\u2026"
																				: e.text,
																	},
																);
															});
													},
												},
											},
											tooltip: {
												mode: "index",
												intersect: !1,
												backgroundColor: f,
												titleColor: r,
												bodyColor: o,
												borderColor: b,
												borderWidth: 1,
												padding: 14,
												cornerRadius: 8,
												titleFont: {
													family: "Inter, sans-serif",
													size: 12,
													weight: "700",
												},
												bodyFont: { family: "Inter, sans-serif", size: 11 },
												callbacks: {
													label: function (e) {
														var n = e.parsed.y;
														if (null == n) return null;
														var t = "yFreq" === e.dataset.yAxisID;
														return " "
															.concat(e.dataset.label.split("  ")[0], ": ")
															.concat(Number(n).toFixed(t ? 4 : 2), " ")
															.concat(t ? "Hz" : "MW");
													},
												},
											},
											zoom: {
												zoom: {
													wheel: { enabled: !0 },
													pinch: { enabled: !0 },
													mode: "xy",
												},
												pan: { enabled: !0, mode: "xy" },
											},
										},
										scales: (0, a.Z)(
											{
												x: {
													ticks: {
														color: o,
														font: { family: "Inter, sans-serif", size: 10 },
														maxTicksLimit: 24,
														maxRotation: 30,
														minRotation: 0,
													},
													grid: { color: d, lineWidth: 1 },
													border: { color: "transparent" },
													title: {
														display: !0,
														text: "Date / Time",
														color: o,
														font: { family: "Inter, sans-serif", size: 11 },
													},
												},
												y: {
													type: "linear",
													position: "left",
													ticks: {
														color: o,
														font: { family: "Inter, sans-serif", size: 10 },
														callback: function (e) {
															return "".concat(e, " MW");
														},
													},
													grid: { color: d, lineWidth: 1 },
													border: { color: "transparent" },
													title: {
														display: !0,
														text: "Active Power (MW)",
														color: o,
														font: { family: "Inter, sans-serif", size: 11 },
													},
												},
											},
											s
												? {
														yFreq: {
															type: "linear",
															position: "right",
															ticks: {
																color: m.Durgapur,
																font: { family: "Inter, sans-serif", size: 10 },
																callback: function (e) {
																	return "".concat(e, " Hz");
																},
															},
															grid: { drawOnChartArea: !1 },
															border: { color: "transparent" },
															title: {
																display: !0,
																text: "Frequency (Hz)",
																color: m.Durgapur,
																font: { family: "Inter, sans-serif", size: 11 },
															},
														},
													}
												: {},
										),
									},
								}
							);
						},
						[
							e.generator_data,
							e.freq_region,
							e.frequency,
							e.check1,
							e.check2,
							n,
						],
					),
					y = v.chartData,
					j = v.chartOptions,
					w = (0, i.useMemo)(function () {
						return {
							id: "generatorGradientFill",
							beforeDatasetsUpdate: function (e) {
								var n = e.ctx,
									t = (e.chartArea || {}).height;
								t &&
									e.data.datasets.forEach(function (e) {
										e._isMW && e._hex && (e.backgroundColor = x(n, e._hex, t));
									});
							},
						};
					}, []);
				return e.generator_data
					? (0, u.jsxs)("div", {
							style: {
								position: "relative",
								width: "100%",
								height: "680px",
								padding: "8px 0",
							},
							children: [
								(0, u.jsx)(s.k, {
									ref: t,
									type: "line",
									data: y,
									options: j,
									plugins: [w],
									style: { width: "100%", height: "100%" },
								}),
								(0, u.jsx)("div", {
									style: {
										position: "absolute",
										bottom: 8,
										right: 12,
										fontSize: "10px",
										color: n ? "#475569" : "#94a3b8",
										userSelect: "none",
									},
									children:
										"Scroll wheel to zoom \xb7 Drag to pan \xb7 Double-click to reset",
								}),
							],
						})
					: null;
			}
		},
		8785: function () {},
		9064: function () {},
	},
]);
//# sourceMappingURL=285.4adc9312.chunk.js.map
