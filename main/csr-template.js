        (function () {
            const TEMPLATE_PAYLOAD_KEY = "csr_template_payload_v1";
            const EXPORT_READY_ATTR = "data-csr-export-ready";
            const PAGE_PARAMS = new URLSearchParams(window.location.search);
            const IS_PRINT_MODE = PAGE_PARAMS.get("printMode") === "1";
            window.__CSR_EXPORT_READY__ = false;
            window.__CSR_EXPORT_RENDER_SEQ__ = 0;
            window.__CSR_PRINT_MODE__ = IS_PRINT_MODE;
            if (document && document.documentElement) {
                document.documentElement.setAttribute(EXPORT_READY_ATTR, "0");
                if (IS_PRINT_MODE) {
                    document.documentElement.setAttribute("data-print-mode", "1");
                }
            }

            function setExportRenderReady(isReady) {
                const ready = !!isReady;
                window.__CSR_EXPORT_READY__ = ready;
                if (document && document.documentElement) {
                    document.documentElement.setAttribute(EXPORT_READY_ATTR, ready ? "1" : "0");
                }
            }

            function nextFrame() {
                return new Promise((resolve) => {
                    window.requestAnimationFrame(() => resolve());
                });
            }

            async function markRenderSettled(renderSeq) {
                await nextFrame();
                await nextFrame();
                if (renderSeq !== window.__CSR_EXPORT_RENDER_SEQ__) {
                    return;
                }
                setExportRenderReady(true);
            }

            function text(value, fallback) {
                const normalized = String(value == null ? "" : value).trim();
                const candidate = normalized || String(fallback == null ? "" : fallback).trim();
                if (!candidate) {
                    return "";
                }
                const upper = candidate.toUpperCase();
                if (upper === "NONE" || upper === "N/A" || upper === "NA") {
                    return "None";
                }
                return candidate;
            }

            function toTitleCaseDisplay(value) {
                const source = String(value == null ? "" : value).trim();
                if (!source) {
                    return "";
                }
                return source
                    .toLowerCase()
                    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
            }

            function escapeHtml(value) {
                return String(value == null ? "" : value)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }

            function formatIsoDate(value) {
                const iso = text(value);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                    return iso;
                }
                const parsed = new Date(iso + "T00:00:00");
                if (Number.isNaN(parsed.getTime())) {
                    return iso;
                }
                return parsed.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Manila",
                });
            }

            async function readPayload() {
                try {
                    const params = new URLSearchParams(window.location.search);
                    const exportToken = params.get("exportToken");
                    if (exportToken) {
                        const response = await fetch("/api/export/payload?token=" + encodeURIComponent(exportToken), {
                            method: "GET",
                            headers: { "Accept": "application/json" },
                        });
                        if (response.ok) {
                            const result = await response.json();
                            const payload = result && result.payload;
                            if (payload && typeof payload === "object") {
                                return payload;
                            }
                        }
                    }
                } catch (_) {
                    // Fall back to storage payload.
                }
                const rawSession = window.sessionStorage.getItem(TEMPLATE_PAYLOAD_KEY);
                const rawLocal = window.localStorage.getItem(TEMPLATE_PAYLOAD_KEY);
                const raw = rawSession || rawLocal;
                if (!raw) {
                    return null;
                }
                try {
                    const parsed = JSON.parse(raw);
                    return parsed && typeof parsed === "object" ? parsed : null;
                } catch (_) {
                    return null;
                }
            }

            function setField(fieldName, value) {
                const nodes = document.querySelectorAll("[data-csr-field=\"" + fieldName + "\"]");
                nodes.forEach((node) => {
                    node.textContent = text(value, node.textContent);
                });
            }

            const pageRoot = document.querySelector("body > .flex-grow");
            const basePages = pageRoot ? Array.from(pageRoot.querySelectorAll(".page-container")) : [];
            const pageOne = basePages[0] || null;
            const pageTwoTemplate = basePages[1] ? basePages[1].cloneNode(true) : null;
            const pageThreeTemplate = basePages[2] ? basePages[2].cloneNode(true) : null;
            const pageFourTemplate = basePages[3] ? basePages[3].cloneNode(true) : null;
            [pageTwoTemplate, pageThreeTemplate, pageFourTemplate].forEach((page) => {
                if (page) {
                    page.classList.add("template-page", "hidden");
                }
            });
            basePages.slice(1).forEach((page) => {
                if (page && page.parentNode) {
                    page.parentNode.removeChild(page);
                }
            });

            function buildFamilyRowHtml(row) {
                const monitoredYes = text(row && row.monitoredChild).toUpperCase() === "YES";
                const nameDisplay = toTitleCaseDisplay(text(row && row.name, "N/A"));
                const sexDisplay = toTitleCaseDisplay(text(row && row.sex, "N/A"));
                const educationalAttainmentDisplay = toTitleCaseDisplay(text(row && row.educationalAttainment, "N/A"));
                const monthlyIncome = text(row && row.monthlyIncome, "N/A");
                const disabilityType = text(row && row.disabilityType, "N/A");
                const monthlyIncomeDisplay = monthlyIncome.toUpperCase() === "NONE" ? "N/A" : monthlyIncome;
                const disabilityTypeDisplay = disabilityType.toUpperCase() === "NONE" ? "N/A" : disabilityType;
                return "<tr>" +
                    "<td class=\"border border-black\">" + escapeHtml(nameDisplay) + "</td>" +
                    "<td class=\"border border-black text-center\">" + escapeHtml(sexDisplay) + "</td>" +
                    "<td class=\"border border-black text-center\">" + escapeHtml(text(row && row.age, "N/A")) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(text(row && row.civilStatus, "N/A")) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(text(row && row.relationship, "N/A")) + "</td>" +
                    "<td class=\"border border-black text-center font-bold\">" + (monitoredYes ? "&#10003;" : "") + "</td>" +
                    "<td class=\"border border-black text-center\">" + (!monitoredYes ? "&#10003;" : "") + "</td>" +
                    "<td class=\"border border-black text-[10pt]\">" + escapeHtml(educationalAttainmentDisplay) + "</td>" +
                    "<td class=\"border border-black text-[10pt]\">" + escapeHtml(text(row && row.occupation, "N/A")) + "</td>" +
                    "<td class=\"border border-black text-right\">" + escapeHtml(monthlyIncomeDisplay) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(disabilityTypeDisplay) + "</td>" +
                    "</tr>";
            }

            function createFamilySection(rows, isContinuation, rowsOnly) {
                const section = document.createElement("div");
                section.className = "mb-2 pl-0 w-full";
                section.setAttribute("data-flow-kind", "family");
                const title = isContinuation
                    ? "II. Family Composition (cont.)"
                    : "II. Family Composition";
                section.innerHTML =
                    (rowsOnly
                        ? ""
                        : "<h2 class=\"font-bold text-[12pt] mb-2 uppercase\">" + title + "</h2>") +
                    "<div class=\"w-full\">" +
                    "<table class=\"report-table family-composition-table text-left border-black\">" +
                    "<colgroup>" +
                    "<col class=\"col-name\" /><col class=\"col-sex\" /><col class=\"col-age\" /><col class=\"col-civil\" /><col class=\"col-rel\" />" +
                    "<col class=\"col-check\" /><col class=\"col-check\" />" +
                    "<col class=\"col-educ\" /><col class=\"col-occup\" /><col class=\"col-income\" /><col class=\"col-disability\" />" +
                    "</colgroup>" +
                    (rowsOnly
                        ? ""
                        : "<thead><tr>" +
                        "<th class=\"border border-black\">Name</th><th class=\"border border-black\">Sex</th><th class=\"border border-black\">Age</th>" +
                        "<th class=\"border border-black\">Civil Status</th><th class=\"border border-black\">Relationship to the HH Grantee</th>" +
                        "<th class=\"border border-black p-0\" colspan=\"2\"><div class=\"w-full h-full flex flex-col\"><div class=\"border-b border-black p-1 text-[9pt]\">Monitored Child</div><div class=\"flex h-full\"><div class=\"w-1/2 border-r border-black p-0.5\">Yes</div><div class=\"w-1/2 p-0.5\">No</div></div></div></th>" +
                        "<th class=\"border border-black\">Educ. Attainment</th><th class=\"border border-black\">Occupation</th><th class=\"border border-black\">Monthly Income</th><th class=\"border border-black\">Type of Disability(if applicable)</th>" +
                        "</tr></thead>") +
                    "<tbody></tbody></table></div>";
                const tbody = section.querySelector("tbody");
                (rows || []).forEach((row) => {
                    tbody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(row));
                });
                return section;
            }

            function isPageOverflowing(page) {
                const wrapper = page && page.querySelector(".content-wrapper");
                if (!wrapper) {
                    return false;
                }
                // Footer is fixed and consistent, so we only check content-box overflow.
                // Keep tolerance minimal; row-fit checks handle the final decision.
                const tolerancePx = 2;
                return wrapper.scrollHeight > (wrapper.clientHeight + tolerancePx);
            }

            function isLastRowOverFooter(page, tbody) {
                const footer = page && page.querySelector(".footer-section");
                const lastRow = tbody && tbody.lastElementChild;
                if (!footer || !lastRow) {
                    return false;
                }
                const footerTop = footer.getBoundingClientRect().top;
                const rowBottom = lastRow.getBoundingClientRect().bottom;
                return rowBottom > (footerTop - 2);
            }

            function isNodeOverFooter(page, node, paddingPx) {
                const footer = page && page.querySelector(".footer-section");
                if (!footer || !node) {
                    return false;
                }
                const pad = typeof paddingPx === "number" ? paddingPx : 2;
                const footerTop = footer.getBoundingClientRect().top;
                const nodeBottom = node.getBoundingClientRect().bottom;
                return nodeBottom > (footerTop - pad);
            }

            function removeGeneratedDynamicPages() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".generated-dynamic-page")).forEach((node) => {
                    node.remove();
                });
            }

            function clearPageOneDynamicFlowSections() {
                if (!pageOne) {
                    return;
                }
                const host = getFlowHost(pageOne);
                if (!host) {
                    return;
                }
                const selectors = [
                    "[data-flow-kind=\"case\"]",
                    "[data-flow-kind=\"interventions\"]",
                    "[data-flow-kind=\"plan\"]",
                    "[data-flow-kind=\"recommendation\"]",
                ];
                Array.from(host.querySelectorAll(selectors.join(","))).forEach((node) => {
                    node.remove();
                });
            }

            function syncPageContentHeight(page) {
                const wrapper = page && page.querySelector(".content-wrapper");
                const footer = page && page.querySelector(".footer-section");
                if (!wrapper || !footer) {
                    return;
                }
                const available = Math.max(0, footer.offsetTop - wrapper.offsetTop - 2);
                wrapper.style.height = available + "px";
            }

            function syncAllPageContentHeights() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".page-container")).forEach((page) => {
                    syncPageContentHeight(page);
                });
            }

            function createDynamicContentPage(templatePage) {
                if (!templatePage) {
                    return null;
                }
                const page = templatePage.cloneNode(true);
                page.classList.remove("hidden");
                page.classList.remove("template-page");
                page.classList.add("generated-dynamic-page");
                pageRoot.appendChild(page);
                syncPageContentHeight(page);
                return page;
            }

            function getCaseDevelopmentBlocks(payload) {
                const html = text(payload && payload.caseDevelopment && payload.caseDevelopment.html);
                const container = document.createElement("div");
                container.innerHTML = html;

                function splitParagraphLikeNode(node) {
                    const raw = text(node && node.textContent).replace(/\s+/g, " ").trim();
                    if (!raw) {
                        return [];
                    }
                    const cloned = document.createElement("p");
                    cloned.textContent = raw;
                    cloned.classList.add("case-dev-paragraph");
                    cloned.style.margin = "0 0 0.35rem 0";
                    cloned.style.textIndent = "1.27cm";
                    return [cloned];
                }

                function collectAtomicBlocks(node, out) {
                    if (!node) {
                        return;
                    }
                    if (node.nodeType === 3) {
                        const value = text(node.textContent).replace(/\s+/g, " ").trim();
                        if (!value) {
                            return;
                        }
                        const p = document.createElement("p");
                        p.textContent = value;
                        p.classList.add("case-dev-paragraph");
                        p.style.margin = "0 0 0.35rem 0";
                        p.style.textIndent = "1.27cm";
                        out.push(p);
                        return;
                    }
                    if (node.nodeType !== 1) {
                        return;
                    }
                    const tag = (node.tagName || "").toUpperCase();
                    const isWrapper = tag === "DIV" || tag === "SECTION" || tag === "ARTICLE";
                    if (isWrapper && node.children.length) {
                        Array.from(node.childNodes).forEach((child) => {
                            collectAtomicBlocks(child, out);
                        });
                        return;
                    }
                    if (tag === "P") {
                        const cloned = node.cloneNode(true);
                        cloned.classList.add("case-dev-paragraph");
                        cloned.style.textIndent = "1.27cm";
                        cloned.style.margin = "0 0 0.35rem 0";
                        out.push(cloned);
                        return;
                    }
                    if (node.children.length === 0 && text(node.textContent).trim().length > 0) {
                        const chunks = splitParagraphLikeNode(node);
                        chunks.forEach((chunkNode) => out.push(chunkNode));
                        return;
                    }
                    if (text(node.textContent).trim().length === 0) {
                        return;
                    }
                    const cloned = node.cloneNode(true);
                    if (cloned && cloned.nodeType === 1 && String(cloned.tagName || "").toUpperCase() === "P") {
                        cloned.classList.add("case-dev-paragraph");
                        cloned.style.textIndent = "1.27cm";
                        if (!cloned.style.margin) {
                            cloned.style.margin = "0 0 0.35rem 0";
                        }
                    }
                    out.push(cloned);
                }

                const blocks = [];
                Array.from(container.childNodes).forEach((node) => {
                    collectAtomicBlocks(node, blocks);
                });
                return blocks;
            }

            function splitCaseParagraphToFitPage(page, caseBody, paragraphNode) {
                if (!page || !caseBody || !paragraphNode) {
                    return null;
                }
                const tag = String(paragraphNode.tagName || "").toUpperCase();
                if (tag !== "P") {
                    return null;
                }
                const fullText = text(paragraphNode.textContent).replace(/\s+/g, " ").trim();
                if (!fullText) {
                    return null;
                }
                const words = fullText.split(/\s+/).filter(Boolean);
                if (words.length < 2) {
                    return null;
                }

                const probe = paragraphNode.cloneNode(true);
                caseBody.appendChild(probe);
                let low = 1;
                let high = words.length - 1;
                let best = 0;

                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    probe.textContent = words.slice(0, mid).join(" ");
                    if (isNodeOverFooter(page, probe)) {
                        high = mid - 1;
                    } else {
                        best = mid;
                        low = mid + 1;
                    }
                }
                probe.remove();

                if (best <= 0 || best >= words.length) {
                    return null;
                }

                const firstText = words.slice(0, best).join(" ");
                const remainingText = words.slice(best).join(" ");
                if (!firstText || !remainingText) {
                    return null;
                }

                paragraphNode.textContent = firstText;
                caseBody.appendChild(paragraphNode);
                if (isNodeOverFooter(page, paragraphNode)) {
                    paragraphNode.remove();
                    return null;
                }

                const remainder = paragraphNode.cloneNode(true);
                remainder.textContent = remainingText;
                return remainder;
            }

            function updateDynamicFooterPageNumbers() {
                if (!pageRoot) {
                    return;
                }
                const pages = Array.from(pageRoot.querySelectorAll(".page-container")).filter((page) => {
                    return !page.classList.contains("hidden") && !page.classList.contains("template-page");
                });
                const total = pages.length;
                pages.forEach((page, index) => {
                    const label = page.querySelector(".footer-section p");
                    if (label) {
                        label.textContent = "PAGE " + (index + 1) + " of " + total;
                    }
                });
            }

            function createFlowPage() {
                const page = createDynamicContentPage(pageTwoTemplate);
                if (!page) {
                    return null;
                }
                const column = page.querySelector(".flex-1.flex.flex-col");
                if (column) {
                    column.classList.remove("flex-1");
                    column.setAttribute("data-flow-host", "1");
                    column.innerHTML = "";
                }
                return page;
            }

            function getFlowHost(page) {
                if (!page) {
                    return null;
                }
                if (page === pageOne) {
                    return page.querySelector(".content-wrapper");
                }
                return page.querySelector("[data-flow-host=\"1\"]") || page.querySelector(".flex.flex-col");
            }

            function createInterventionsSection(isContinuation) {
                const section = document.createElement("section");
                section.className = isContinuation ? "mb-2" : "mb-4";
                section.setAttribute("data-flow-kind", "interventions");
                section.innerHTML =
                    (isContinuation
                        ? ""
                        : "<h2 class=\"doc-text font-bold mb-2\">IV. INTERVENTIONS PROVIDED</h2>") +
                    "<table class=\"report-table doc-text w-full\">" +
                    "<colgroup><col style=\"width: 45%;\" /><col style=\"width: 20%;\" /><col style=\"width: 35%;\" /></colgroup>" +
                    (isContinuation
                        ? ""
                        : "<thead><tr><th>Interventions Provided</th><th>Date Completed/<br />Accomplished</th><th>Involved Parties</th></tr></thead>") +
                    "<tbody></tbody></table>";
                return section;
            }

            function createPlanSection(isContinuation) {
                const section = document.createElement("section");
                section.className = isContinuation ? "mb-2" : "mb-4";
                section.setAttribute("data-flow-kind", "plan");
                section.innerHTML =
                    (isContinuation
                        ? ""
                        : "<h2 class=\"doc-text font-bold mb-2\">V. TRANSITION/EXIT PLAN</h2>") +
                    "<table class=\"report-table doc-text w-full\">" +
                    "<colgroup><col style=\"width: 20%;\" /><col style=\"width: 23%;\" /><col style=\"width: 20%;\" /><col style=\"width: 12%;\" /><col style=\"width: 25%;\" /></colgroup>" +
                    (isContinuation
                        ? ""
                        : "<thead><tr><th>Objectives</th><th>Suggested Intervention/<br />Activities</th><th>Responsible Person/<br />Agency</th><th>Timeline</th><th>Expected<br />Outcome</th></tr></thead>") +
                    "<tbody></tbody></table>";
                return section;
            }

            function createRecommendationBody(payload) {
                const block = document.createElement("div");
                const recommendationText = text(
                    payload && payload.recommendation && payload.recommendation.recommendationText
                );
                block.className = "space-y-8";
                block.innerHTML =
                    "<section>" +
                    "<h2 class=\"text-[12pt] font-bold text-black mb-3 font-calibri\">VI. RECOMMENDATION</h2>" +
                    "<div class=\"prose prose-slate max-w-none\"><p class=\"text-justify indent-[1.27cm] text-[12pt] leading-snug font-calibri text-black\"></p></div>" +
                    "</section>";
                const p = block.querySelector("p");
                if (p) {
                    p.textContent = recommendationText;
                }
                return block;
            }

            function createRecommendationSignatures() {
                const block = document.createElement("div");
                block.innerHTML =
                    "<section class=\"mt-8 w-full\">" +
                    "<div class=\"grid grid-cols-2 gap-x-12 gap-y-12\">" +
                    "<div class=\"flex flex-col\"><span class=\"text-[12pt] font-normal text-black mb-12 font-calibri\">Prepared by:</span><div class=\"relative\"><p class=\"font-bold text-[12pt] text-black uppercase font-calibri relative z-10 mb-2\"><span data-csr-field=\"preparedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">PDO II-Municipal Link</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "<div class=\"flex flex-col\"><span class=\"text-[12pt] font-normal text-black mb-12 font-calibri\">Reviewed by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-2\"><span data-csr-field=\"reviewedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">Social Welfare Officer III</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "<div class=\"flex flex-col pt-4\"><span class=\"text-[12pt] font-normal text-black mb-12 font-calibri\">Noted by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-2\"><span data-csr-field=\"notedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">Provincial Link</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "<div class=\"flex flex-col pt-4\"><span class=\"text-[12pt] font-normal text-black mb-12 font-calibri\">Approved by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-2\"><span data-csr-field=\"approvedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">Regional Program Coordinator</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "</div></section>" +
                    "<section class=\"mt-4 pt-4\">" +
                    "<h3 class=\"text-center text-[12pt] font-normal text-black mb-8 font-calibri\">Exit Plan concurred by:</h3>" +
                    "<div class=\"grid grid-cols-2 gap-x-12\">" +
                    "<div class=\"flex flex-col\"><p class=\"font-bold text-[12pt] uppercase text-black font-calibri mb-2\"><span data-csr-field=\"hhGrantee\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">HH Grantee</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div>" +
                    "<div class=\"flex flex-col\"><p class=\"font-bold text-[12pt] uppercase text-black font-calibri mb-2\"><span data-csr-field=\"mswdOfficer\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri mb-4\">MSWD Officer</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div>" +
                    "</div></section>";
                return block;
            }

            function createRecommendationCombinedSection(payload) {
                const wrapper = document.createElement("section");
                wrapper.className = "mb-2";
                wrapper.setAttribute("data-flow-kind", "recommendation");
                const recBody = createRecommendationBody(payload);
                const recSign = createRecommendationSignatures();
                wrapper.appendChild(recBody);
                wrapper.appendChild(recSign);
                return wrapper;
            }

            function getVisiblePages() {
                if (!pageRoot) {
                    return [];
                }
                return Array.from(pageRoot.querySelectorAll(".page-container")).filter((page) => {
                    return !page.classList.contains("hidden") && !page.classList.contains("template-page");
                });
            }

            function getFirstSectionByKind(page, kind) {
                if (!page) {
                    return null;
                }
                return page.querySelector("[data-flow-kind=\"" + kind + "\"]");
            }

            function getLastSectionByKind(page, kind) {
                if (!page) {
                    return null;
                }
                const sections = page.querySelectorAll("[data-flow-kind=\"" + kind + "\"]");
                return sections.length ? sections[sections.length - 1] : null;
            }

            function getSectionFlowContainer(section) {
                if (!section) {
                    return null;
                }
                const tbody = section.querySelector("tbody");
                if (tbody) {
                    return tbody;
                }
                return section.querySelector("[data-flow-body=\"1\"]");
            }

            function createContinuationSectionByKind(kind) {
                if (kind === "family") {
                    return createFamilySection([], true, true);
                }
                if (kind === "case") {
                    const section = document.createElement("section");
                    section.className = "mb-2";
                    section.setAttribute("data-flow-kind", "case");
                    section.innerHTML =
                        "<div class=\"calibri-font text-[12pt] leading-none text-justify space-y-4\" data-flow-body=\"1\"></div>";
                    return section;
                }
                if (kind === "interventions") {
                    return createInterventionsSection(true);
                }
                if (kind === "plan") {
                    return createPlanSection(true);
                }
                return null;
            }

            function rebalanceNodesBetweenSections(prevPage, prevSection, nextSection) {
                const prevContainer = getSectionFlowContainer(prevSection);
                const nextContainer = getSectionFlowContainer(nextSection);
                if (!prevContainer || !nextContainer) {
                    return false;
                }
                let movedAny = false;
                while (nextContainer.firstElementChild) {
                    const moved = nextContainer.firstElementChild;
                    prevContainer.appendChild(moved);
                    const overFooter = prevContainer.tagName === "TBODY"
                        ? isLastRowOverFooter(prevPage, prevContainer)
                        : isNodeOverFooter(prevPage, moved);
                    if (overFooter) {
                        nextContainer.insertBefore(moved, nextContainer.firstElementChild);
                        break;
                    }
                    movedAny = true;
                }
                if (!nextContainer.childElementCount && nextSection.parentElement) {
                    nextSection.remove();
                    movedAny = true;
                }
                return movedAny;
            }

            function rebalanceFlowKind(kind) {
                let changed = false;
                const pages = getVisiblePages();
                for (let i = 0; i < pages.length - 1; i += 1) {
                    const prevPage = pages[i];
                    const nextPage = pages[i + 1];
                    let prevSection = getLastSectionByKind(prevPage, kind);
                    const nextSection = getFirstSectionByKind(nextPage, kind);
                    if (!nextSection) {
                        continue;
                    }
                    if (!prevSection) {
                        if (kind !== "case") {
                            continue;
                        }
                        const prevHost = getFlowHost(prevPage);
                        const continuation = createContinuationSectionByKind(kind);
                        if (!prevHost || !continuation) {
                            continue;
                        }
                        prevHost.appendChild(continuation);
                        if (isNodeOverFooter(prevPage, continuation)) {
                            continuation.remove();
                            continue;
                        }
                        prevSection = continuation;
                        changed = true;
                    }
                    if (rebalanceNodesBetweenSections(prevPage, prevSection, nextSection)) {
                        changed = true;
                    }
                }
                return changed;
            }

            function pruneEmptyGeneratedPages() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".generated-dynamic-page")).forEach((page) => {
                    const host = getFlowHost(page);
                    if (!host) {
                        return;
                    }
                    const hasContent = Array.from(host.children).some((node) => {
                        return node.nodeType === 1;
                    });
                    if (!hasContent) {
                        page.remove();
                    }
                });
            }

            function runFlowRebalancePass() {
                const kinds = ["family", "case", "interventions", "plan"];
                for (let pass = 0; pass < 4; pass += 1) {
                    let changed = false;
                    kinds.forEach((kind) => {
                        if (rebalanceFlowKind(kind)) {
                            changed = true;
                        }
                    });
                    pruneEmptyGeneratedPages();
                    if (!changed) {
                        break;
                    }
                }
            }

            function paginateAllSections(payload) {
                if (!pageOne) {
                    return;
                }
                clearPageOneDynamicFlowSections();
                removeGeneratedDynamicPages();
                syncAllPageContentHeights();

                let currentPage = pageOne;
                let currentHost = getFlowHost(currentPage);

                const familyRows = Array.isArray(payload && payload.familyComposition)
                    ? payload.familyComposition.slice()
                    : [];
                let familyIndex = 0;
                const pageOneBody = document.getElementById("csr-family-composition-body");
                if (pageOneBody) {
                    pageOneBody.innerHTML = "";
                    while (familyIndex < familyRows.length) {
                        pageOneBody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(familyRows[familyIndex]));
                        if (isPageOverflowing(pageOne) || isLastRowOverFooter(pageOne, pageOneBody)) {
                            if (pageOneBody.lastElementChild) {
                                pageOneBody.lastElementChild.remove();
                            }
                            break;
                        }
                        familyIndex += 1;
                    }
                }

                while (familyIndex < familyRows.length) {
                    if (currentPage === pageOne || !currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentPage || !currentHost) {
                            break;
                        }
                    }
                    const familySection = createFamilySection([], true, true);
                    currentHost.appendChild(familySection);
                    if (isNodeOverFooter(currentPage, familySection)) {
                        familySection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentPage || !currentHost) {
                            break;
                        }
                        currentHost.appendChild(familySection);
                    }
                    const tbody = familySection.querySelector("tbody");
                    while (familyIndex < familyRows.length) {
                        tbody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(familyRows[familyIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            break;
                        }
                        familyIndex += 1;
                    }
                    if (familyIndex < familyRows.length) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                }

                const caseBlocks = getCaseDevelopmentBlocks(payload);
                if (caseBlocks.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    const caseSection = document.createElement("section");
                    caseSection.className = "mb-2";
                    caseSection.setAttribute("data-flow-kind", "case");
                    caseSection.innerHTML =
                        "<div class=\"flex gap-4 mb-2 calibri-font\"><h3 class=\"font-bold text-[12pt]\">III. CASE DEVELOPMENT</h3></div>" +
                        "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                    currentHost.appendChild(caseSection);
                    if (isNodeOverFooter(currentPage, caseSection)) {
                        caseSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            currentHost.appendChild(caseSection);
                        }
                    }
                    const caseBody = caseSection.querySelector("div:last-child");
                    let caseIndex = 0;
                    while (caseIndex < caseBlocks.length) {
                        const node = caseBlocks[caseIndex].cloneNode(true);
                        caseBody.appendChild(node);
                        if (isNodeOverFooter(currentPage, node)) {
                            node.remove();
                            if (!caseBody.childNodes.length) {
                                const firstRemainder = splitCaseParagraphToFitPage(currentPage, caseBody, node);
                                if (firstRemainder) {
                                    currentPage = createFlowPage();
                                    currentHost = getFlowHost(currentPage);
                                    if (!currentHost) {
                                        break;
                                    }
                                    const firstContSection = document.createElement("section");
                                    firstContSection.className = "mb-2";
                                    firstContSection.setAttribute("data-flow-kind", "case");
                                    firstContSection.innerHTML = "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                                    currentHost.appendChild(firstContSection);
                                    const firstContBody = firstContSection.querySelector("div");
                                    firstContBody.appendChild(firstRemainder);
                                    if (isNodeOverFooter(currentPage, firstRemainder)) {
                                        firstRemainder.remove();
                                        break;
                                    }
                                    caseIndex += 1;
                                    while (caseIndex < caseBlocks.length) {
                                        const moreNode = caseBlocks[caseIndex].cloneNode(true);
                                        firstContBody.appendChild(moreNode);
                                        if (isNodeOverFooter(currentPage, moreNode)) {
                                            moreNode.remove();
                                            break;
                                        }
                                        caseIndex += 1;
                                    }
                                    continue;
                                }
                                caseSection.remove();
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                currentHost.appendChild(caseSection);
                                caseBody.appendChild(node);
                                if (isNodeOverFooter(currentPage, node)) {
                                    node.remove();
                                    break;
                                }
                                caseIndex += 1;
                                continue;
                            }
                            const remainder = splitCaseParagraphToFitPage(currentPage, caseBody, node);
                            if (remainder) {
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                const contSection = document.createElement("section");
                                contSection.className = "mb-2";
                                contSection.setAttribute("data-flow-kind", "case");
                                contSection.innerHTML = "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                                currentHost.appendChild(contSection);
                                const contBody = contSection.querySelector("div");
                                contBody.appendChild(remainder);
                                if (isNodeOverFooter(currentPage, remainder)) {
                                    remainder.remove();
                                    break;
                                }
                                caseIndex += 1;
                                while (caseIndex < caseBlocks.length) {
                                    const moreNode = caseBlocks[caseIndex].cloneNode(true);
                                    contBody.appendChild(moreNode);
                                    if (isNodeOverFooter(currentPage, moreNode)) {
                                        moreNode.remove();
                                        break;
                                    }
                                    caseIndex += 1;
                                }
                                continue;
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            const contSection = document.createElement("section");
                            contSection.className = "mb-2";
                            contSection.setAttribute("data-flow-kind", "case");
                            contSection.innerHTML = "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                            currentHost.appendChild(contSection);
                            const contBody = contSection.querySelector("div");
                            contBody.appendChild(node);
                            if (isNodeOverFooter(currentPage, node)) {
                                node.remove();
                                break;
                            }
                            caseIndex += 1;
                            while (caseIndex < caseBlocks.length) {
                                const moreNode = caseBlocks[caseIndex].cloneNode(true);
                                contBody.appendChild(moreNode);
                                if (isNodeOverFooter(currentPage, moreNode)) {
                                    moreNode.remove();
                                    break;
                                }
                                caseIndex += 1;
                            }
                            continue;
                        }
                        caseIndex += 1;
                    }
                }

                const interventions = Array.isArray(payload && payload.interventionsProvided)
                    ? payload.interventionsProvided.slice()
                    : [];
                let interventionIndex = 0;
                let interventionsHeadingDone = false;
                while (interventionIndex < interventions.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    const section = createInterventionsSection(interventionsHeadingDone);
                    currentHost.appendChild(section);
                    if (isNodeOverFooter(currentPage, section)) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentHost) {
                            break;
                        }
                        currentHost.appendChild(section);
                    }
                    const tbody = section.querySelector("tbody");
                    let interventionRowsAdded = 0;

                    // Keep section start together: heading + first row must fit on the same page.
                    if (interventionIndex < interventions.length) {
                        tbody.insertAdjacentHTML("beforeend", buildInterventionRowHtml(interventions[interventionIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            section.remove();
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            currentHost.appendChild(section);
                            tbody.insertAdjacentHTML("beforeend", buildInterventionRowHtml(interventions[interventionIndex]));
                            if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                                if (tbody.lastElementChild) {
                                    tbody.lastElementChild.remove();
                                }
                                break;
                            }
                        }
                        interventionRowsAdded += 1;
                        interventionIndex += 1;
                    }

                    while (interventionIndex < interventions.length) {
                        tbody.insertAdjacentHTML("beforeend", buildInterventionRowHtml(interventions[interventionIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            break;
                        }
                        interventionRowsAdded += 1;
                        interventionIndex += 1;
                    }
                    if (interventionRowsAdded === 0 && interventionIndex < interventions.length) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        continue;
                    }
                    if (interventionRowsAdded > 0) {
                        interventionsHeadingDone = true;
                    }
                    if (interventionIndex < interventions.length) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                }

                const plans = Array.isArray(payload && payload.householdInterventionPlan)
                    ? payload.householdInterventionPlan.slice()
                    : [];
                let planIndex = 0;
                let planHeadingDone = false;
                while (planIndex < plans.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    const section = createPlanSection(planHeadingDone);
                    currentHost.appendChild(section);
                    if (isNodeOverFooter(currentPage, section)) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentHost) {
                            break;
                        }
                        currentHost.appendChild(section);
                    }
                    const tbody = section.querySelector("tbody");
                    let planRowsAdded = 0;

                    // Keep section start together: heading + first row must fit on the same page.
                    if (planIndex < plans.length) {
                        tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            section.remove();
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            currentHost.appendChild(section);
                            tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                            if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                                if (tbody.lastElementChild) {
                                    tbody.lastElementChild.remove();
                                }
                                break;
                            }
                        }
                        planRowsAdded += 1;
                        planIndex += 1;
                    }

                    while (planIndex < plans.length) {
                        tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            break;
                        }
                        planRowsAdded += 1;
                        planIndex += 1;
                    }
                    if (planRowsAdded === 0 && planIndex < plans.length) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        continue;
                    }
                    if (planRowsAdded > 0) {
                        planHeadingDone = true;
                    }
                    if (planIndex < plans.length) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                }

                runFlowRebalancePass();
                const visiblePages = getVisiblePages();
                currentPage = visiblePages.length ? visiblePages[visiblePages.length - 1] : currentPage;
                currentHost = getFlowHost(currentPage);

                const recSection = createRecommendationCombinedSection(payload);
                if (!currentHost) {
                    currentPage = createFlowPage();
                    currentHost = getFlowHost(currentPage);
                }
                if (currentHost) {
                    currentHost.appendChild(recSection);
                    if (isNodeOverFooter(currentPage, recSection)) {
                        recSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            currentHost.appendChild(recSection);
                        }
                    }
                }
            }

            function buildInterventionRowHtml(row) {
                return "<tr>" +
                    "<td>" + escapeHtml(text(row && row.intervention, "N/A")) + "</td>" +
                    "<td class=\"col-center\">" + escapeHtml(text(row && row.dateCompleted, "N/A")) + "</td>" +
                    "<td class=\"col-center\">" + escapeHtml(text(row && row.involvedParties, "N/A")) + "</td>" +
                    "</tr>";
            }

            function buildPlanRowHtml(row) {
                return "<tr>" +
                    "<td>" + escapeHtml(text(row && row.objectives, "N/A")) + "</td>" +
                    "<td>" + escapeHtml(text(row && row.activities, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "<td class=\"col-center\">" + escapeHtml(text(row && row.responsible, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "<td>" + escapeHtml(text(row && row.timeline, "N/A")) + "</td>" +
                    "<td>" + escapeHtml(text(row && row.outcome, "N/A")) + "</td>" +
                    "</tr>";
            }

            function shouldUsePagedJsEngine() {
                try {
                    if (IS_PRINT_MODE) {
                        return false;
                    }
                    return PAGE_PARAMS.get("engine") === "pagedjs";
                } catch (_) {
                    return false;
                }
            }

            function buildInfoRow(label, fieldName) {
                return "<div class=\"info-label\">" + escapeHtml(label) + "</div>" +
                    "<div class=\"info-value\"><span class=\"info-colon\">:</span><span data-csr-field=\"" + escapeHtml(fieldName) + "\"></span></div>";
            }

            function buildPagedJsFlowHtml(payload) {
                const caseHtml = text(payload && payload.caseDevelopment && payload.caseDevelopment.html);
                const familyRows = Array.isArray(payload && payload.familyComposition) ? payload.familyComposition : [];
                const interventions = Array.isArray(payload && payload.interventionsProvided) ? payload.interventionsProvided : [];
                const plans = Array.isArray(payload && payload.householdInterventionPlan) ? payload.householdInterventionPlan : [];
                const recommendationText = text(payload && payload.recommendation && payload.recommendation.recommendationText);

                const familyRowsHtml = familyRows.map((row) => buildFamilyRowHtml(row)).join("");
                const interventionRowsHtml = interventions.map((row) => buildInterventionRowHtml(row)).join("");
                const planRowsHtml = plans.map((row) => buildPlanRowHtml(row)).join("");

                return "" +
                    "<div class=\"running-header\">" +
                    "<div class=\"flex justify-between items-start\">" +
                    "<div class=\"flex flex-col\"><span class=\"annex-b-badge font-bold text-[13pt] leading-none\">ANNEX B</span>" +
                    "<div class=\"flex items-center gap-3 mt-1\"><img src=\"../assets/dswd_logo.png\" alt=\"DSWD logo\" class=\"h-10 w-auto object-contain\" />" +
                    "<img src=\"../assets/bagong_pilipinas.png\" alt=\"Bagong Pilipinas logo\" class=\"h-10 w-auto object-contain\" /></div></div>" +
                    "<span class=\"font-bold text-[9pt] leading-none mt-3\">DSWD-GF-010 | REV 02 | 22 SEP 2023</span>" +
                    "</div><div class=\"flow-header-line\"></div></div>" +
                    "<div class=\"running-footer\">" +
                    "<div class=\"flex flex-col items-center\"><p class=\"page-counter\"></p><div class=\"w-full border-t border-black my-1\"></div>" +
                    "<p class=\"text-[9pt] text-center\">DSWD Field Office VII, M.J. Cuenco Avenue Corner Gen. Maxilom Avenue, Brgy. Carreta, Cebu City (6000)</p>" +
                    "<p class=\"text-[9pt] text-center\">Website: http://www.dswd.gov.ph Tel Nos.: (032) 412-9908 / (032) 232-9505 Telefax: (032) 231-2172</p></div></div>" +
                    "<section class=\"section-gap\">" +
                    "<h1 class=\"text-[20pt] font-bold text-center mb-1\">CASE SUMMARY REPORT</h1>" +
                    "<p class=\"text-right text-[12pt] font-bold\">Date: <span data-csr-field=\"date\"></span></p>" +
                    "</section>" +
                    "<section class=\"section-gap\">" +
                    "<h2 class=\"font-bold text-[12pt] mb-2\">I. Identifying Information:</h2>" +
                    "<div class=\"info-grid\">" +
                    buildInfoRow("Grantee's Name", "granteeName") +
                    buildInfoRow("Household ID Number", "householdId") +
                    buildInfoRow("HH Set Group", "hhSet") +
                    buildInfoRow("Date of Registration", "yearOfRegistration") +
                    buildInfoRow("Years in the Program", "yearsInProgram") +
                    buildInfoRow("National ID", "nationalId") +
                    buildInfoRow("Sex", "sex") +
                    buildInfoRow("Birthday", "birthday") +
                    buildInfoRow("Age", "age") +
                    buildInfoRow("Place of Birth", "placeOfBirth") +
                    buildInfoRow("Civil Status", "civilStatus") +
                    buildInfoRow("Present Address", "presentAddress") +
                    buildInfoRow("Educational Attainment", "educationalAttainment") +
                    buildInfoRow("Contact Information", "contactInfo") +
                    buildInfoRow("Religion", "religion") +
                    buildInfoRow("IP Affiliation", "ipAffiliation") +
                    buildInfoRow("Source of Information", "sourceOfInfo") +
                    buildInfoRow("Previous Well-being Level", "previousWellBeingLevel") +
                    buildInfoRow("Client Status On Exit", "clientStatusOnExit") +
                    "</div></section>" +
                    "<section class=\"section-gap\">" +
                    "<h2 class=\"font-bold text-[12pt] mb-2 uppercase\">II. Family Composition</h2>" +
                    "<table class=\"report-table family-composition-table text-left border-black\">" +
                    "<colgroup><col class=\"col-name\" /><col class=\"col-sex\" /><col class=\"col-age\" /><col class=\"col-civil\" /><col class=\"col-rel\" />" +
                    "<col class=\"col-check\" /><col class=\"col-check\" />" +
                    "<col class=\"col-educ\" /><col class=\"col-occup\" /><col class=\"col-income\" /><col class=\"col-disability\" /></colgroup>" +
                    "<thead><tr><th>Name</th><th>Sex</th><th>Age</th><th>Civil Status</th><th>Relationship to the HH Grantee</th>" +
                    "<th colspan=\"2\">Monitored Child</th><th>Educ. Attainment</th><th>Occupation</th><th>Monthly Income</th><th>Type of Disability(if applicable)</th></tr></thead>" +
                    "<tbody>" + familyRowsHtml + "</tbody></table></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">III. CASE DEVELOPMENT</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" + caseHtml + "</div></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">IV. INTERVENTIONS PROVIDED</h2>" +
                    "<table class=\"report-table doc-text w-full\"><colgroup><col style=\"width:45%\" /><col style=\"width:20%\" /><col style=\"width:35%\" /></colgroup>" +
                    "<thead><tr><th>Interventions Provided</th><th>Date Completed/<br />Accomplished</th><th>Involved Parties</th></tr></thead>" +
                    "<tbody>" + interventionRowsHtml + "</tbody></table></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">V. TRANSITION/EXIT PLAN</h2>" +
                    "<table class=\"report-table doc-text w-full\"><colgroup><col style=\"width:20%\" /><col style=\"width:23%\" /><col style=\"width:20%\" /><col style=\"width:12%\" /><col style=\"width:25%\" /></colgroup>" +
                    "<thead><tr><th>Objectives</th><th>Suggested Intervention/<br />Activities</th><th>Responsible Person/<br />Agency</th><th>Timeline</th><th>Expected<br />Outcome</th></tr></thead>" +
                    "<tbody>" + planRowsHtml + "</tbody></table></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">VI. RECOMMENDATION</h2>" +
                    "<p class=\"text-justify indent-[1.27cm] text-[12pt]\">" + escapeHtml(recommendationText) + "</p></section>" +
                    "<section class=\"section-gap\"><div class=\"grid grid-cols-2 gap-x-12 gap-y-10\">" +
                    "<div><p class=\"mb-10\">Prepared by:</p><p class=\"font-bold uppercase\" data-csr-field=\"preparedBy\"></p><p>PDO II-Municipal Link</p></div>" +
                    "<div><p class=\"mb-10\">Reviewed by:</p><p class=\"font-bold uppercase\" data-csr-field=\"reviewedBy\"></p><p>Social Welfare Officer III</p></div>" +
                    "<div><p class=\"mb-10\">Noted by:</p><p class=\"font-bold uppercase\" data-csr-field=\"notedBy\"></p><p>Provincial Link</p></div>" +
                    "<div><p class=\"mb-10\">Approved by:</p><p class=\"font-bold uppercase\" data-csr-field=\"approvedBy\"></p><p>Regional Program Coordinator</p></div>" +
                    "</div><div class=\"mt-10 grid grid-cols-2 gap-x-12\">" +
                    "<div><p class=\"font-bold uppercase\" data-csr-field=\"hhGrantee\"></p><p>HH Grantee</p></div>" +
                    "<div><p class=\"font-bold uppercase\" data-csr-field=\"mswdOfficer\"></p><p>MSWD Officer</p></div>" +
                    "</div></section>";
            }

            async function renderWithPagedJs(payload, fields) {
                if (!window.PagedPolyfill || typeof window.PagedPolyfill.preview !== "function" || !pageRoot) {
                    return false;
                }
                document.body.classList.add("pagedjs-engine");
                pageRoot.innerHTML = "";
                const flow = document.createElement("div");
                flow.id = "csr-flow-doc";
                flow.className = "csr-flow-doc";
                flow.innerHTML = buildPagedJsFlowHtml(payload);
                pageRoot.appendChild(flow);
                Object.keys(fields).forEach((key) => setField(key, fields[key]));
                try {
                    await window.PagedPolyfill.preview(flow, [], pageRoot);
                    return true;
                } catch (_) {
                    return false;
                }
            }

            async function renderPayload(payload, renderSeq) {
                if (!payload) {
                    setExportRenderReady(false);
                    return;
                }
                const basicInfo = payload.basicInfo || {};
                const recommendation = payload.recommendation || {};
                const mapNotShared = (value) => {
                    const normalized = String(value == null ? "" : value).trim();
                    if (!normalized) {
                        return "Not shared";
                    }
                    const upper = normalized.toUpperCase();
                    if (upper === "NONE" || upper === "N/A" || upper === "NA") {
                        return "Not shared";
                    }
                    return normalized;
                };
                const fields = {
                    date: formatIsoDate(basicInfo.date),
                    granteeName: basicInfo.granteeName,
                    householdId: basicInfo.householdId,
                    hhSet: basicInfo.hhSet,
                    yearOfRegistration: basicInfo.yearOfRegistration,
                    yearsInProgram: basicInfo.yearsInProgram,
                    nationalId: mapNotShared(basicInfo.nationalId),
                    sex: toTitleCaseDisplay(basicInfo.sex),
                    birthday: basicInfo.birthday,
                    age: basicInfo.age,
                    placeOfBirth: basicInfo.placeOfBirth,
                    civilStatus: basicInfo.civilStatus,
                    presentAddress: basicInfo.presentAddress,
                    educationalAttainment: basicInfo.educationalAttainment,
                    contactInfo: mapNotShared(basicInfo.contactInfo),
                    religion: basicInfo.religion,
                    ipAffiliation: basicInfo.ipAffiliation,
                    sourceOfInfo: basicInfo.sourceOfInfo,
                    previousWellBeingLevel: basicInfo.previousWellBeingLevel,
                    clientStatusOnExit: basicInfo.clientStatusOnExit,
                    preparedBy: recommendation.preparedBy,
                    reviewedBy: recommendation.reviewedBy,
                    notedBy: recommendation.notedBy,
                    approvedBy: recommendation.approvedBy,
                    hhGrantee: recommendation.hhGrantee || basicInfo.granteeName,
                    mswdOfficer: recommendation.mswdOfficer,
                };
                if (shouldUsePagedJsEngine()) {
                    const ok = await renderWithPagedJs(payload, fields);
                    if (!ok) {
                        document.body.classList.remove("pagedjs-engine");
                        paginateAllSections(payload);
                        Object.keys(fields).forEach((key) => setField(key, fields[key]));
                        updateDynamicFooterPageNumbers();
                    }
                    await markRenderSettled(renderSeq);
                    return;
                }
                paginateAllSections(payload);
                Object.keys(fields).forEach((key) => setField(key, fields[key]));
                updateDynamicFooterPageNumbers();
                await markRenderSettled(renderSeq);
            }

            async function scheduleRender(payload) {
                window.__CSR_EXPORT_RENDER_SEQ__ += 1;
                const renderSeq = window.__CSR_EXPORT_RENDER_SEQ__;
                setExportRenderReady(false);
                try {
                    await renderPayload(payload, renderSeq);
                } catch (error) {
                    // Fail open so export/print does not hang forever on unexpected render errors.
                    console.error("CSR render failed:", error);
                    if (renderSeq === window.__CSR_EXPORT_RENDER_SEQ__) {
                        setExportRenderReady(true);
                    }
                }
            }

            let initialPayload = null;
            let postLoadRenderScheduled = false;

            function schedulePostLoadStabilizationRender() {
                if (postLoadRenderScheduled) {
                    return;
                }
                postLoadRenderScheduled = true;
                // Run one delayed pass after initial paint/fonts settle to avoid clipped content.
                setTimeout(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }, 320);
            }

            readPayload().then((payload) => {
                initialPayload = payload;
                void scheduleRender(initialPayload);
                schedulePostLoadStabilizationRender();
            }).catch((error) => {
                console.error("CSR payload read failed:", error);
                setExportRenderReady(true);
            });

            if (document && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
                document.fonts.ready.then(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }).catch(() => {
                    // Ignore font API failures and keep render flow running.
                });
            }

            let resizeTimer = null;
            window.addEventListener("resize", () => {
                if (IS_PRINT_MODE) {
                    return;
                }
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }, 140);
            });
        })();
